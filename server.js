import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3077;

app.use(cors());
app.use(express.json());

// ── PostgreSQL Pool ──
const pool = new pg.Pool({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 10,
  min: 2,
  idleTimeoutMillis: 120000,
  connectionTimeoutMillis: 15000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

pool.on('error', (err) => console.error('[DB] Pool error:', err.message));

// Pre-warm the pool so the first request doesn't wait for connection setup
(async () => {
  const start = Date.now();
  try {
    const client = await pool.connect();
    const elapsed = Date.now() - start;
    console.log(`[DB] Pool pre-warmed — connected in ${elapsed}ms`);
    client.release();
  } catch (err) {
    const elapsed = Date.now() - start;
    console.error(`[DB] Pre-warm failed after ${elapsed}ms:`, err.code || err.message || err);
  }
})();

// ── Last trigger date range (so dashboard can filter by it) ──
let lastTriggerDateFrom = null;
let lastTriggerDateTo = null;

// ── Short-lived response cache to avoid redundant DB round-trips on refresh ──
const dashboardCache = { key: null, data: null, ts: 0 };
const CACHE_TTL_MS = 5000;

// ── Helper: score color tier ──
function scoreTier(score) {
  if (score >= 70) return 'green';
  if (score >= 45) return 'yellow';
  return 'red';
}

function roleName(role) {
  const r = (role || 'contributor').toLowerCase();
  if (r === 'facilitator') return 'Facilitator';
  if (r === 'dominator') return 'Dominator';
  if (r === 'observer') return 'Observer';
  return 'Contributor';
}

// ── GET /api/dashboard ──
// Optional query params: dateFrom, dateTo (YYYY-MM-DD). If omitted, uses last trigger range when set.
app.get('/api/dashboard', async (req, res) => {
  try {
    const dateFrom = req.query.dateFrom || lastTriggerDateFrom;
    const dateTo = req.query.dateTo || lastTriggerDateTo;
    let fromTs = null;
    let toTs = null;
    if (dateFrom && dateTo) {
      fromTs = new Date(dateFrom + 'T00:00:00').toISOString();
      toTs = new Date(dateTo + 'T23:59:59.999').toISOString();
    }
    const dateParams = fromTs && toTs ? [fromTs, toTs] : [];

    const cacheKey = `${dateFrom || ''}|${dateTo || ''}`;
    if (dashboardCache.key === cacheKey && (Date.now() - dashboardCache.ts) < CACHE_TTL_MS) {
      return res.json(dashboardCache.data);
    }

    const meetingsQuery = `
      SELECT meeting_id, summary, start_time, end_time, duration_minutes,
             meeting_type, is_recurring, is_back_to_back, attendee_count,
             has_transcript, fathom_call_id,
             decision_minutes, discussion_minutes, effective_minutes, idle_minutes,
             decision_discussion_ratio, effective_time_percent,
             meeting_score, meeting_necessity_score, meeting_necessity_reason,
             sentiment, key_decisions, action_items, unresolved_items,
             improvement_suggestions, quality_summary, created_at,
             owner_email, owner_contribution_score, owner_role, owner_feedback,
             attendance_recommendation, attendance_recommendation_reason,
             meeting_value_for_owner, could_be_replaced_with, historical_avg_score
      FROM meeting_metrics
      ${dateParams.length ? 'WHERE start_time >= $1 AND start_time <= $2' : ''}
      ORDER BY start_time DESC
    `;

    const participantsQuery = dateParams.length
      ? `
      SELECT COALESCE(pm.participant_email, pm.participant_name) as identity,
             pm.participant_name,
             COUNT(DISTINCT pm.meeting_id) as meetings_attended,
             ROUND(AVG(pm.contribution_score)::numeric, 1) as avg_score,
             ROUND(SUM(pm.speaking_time_minutes)::numeric, 1) as total_speaking,
             SUM(pm.decision_contributions) as total_decisions,
             SUM(pm.discussion_contributions) as total_discussions,
             MODE() WITHIN GROUP (ORDER BY pm.role) as most_common_role
      FROM participant_metrics pm
      JOIN meeting_metrics mm ON pm.meeting_id = mm.meeting_id
      WHERE mm.start_time >= $1 AND mm.start_time <= $2
      GROUP BY COALESCE(pm.participant_email, pm.participant_name), pm.participant_name
      ORDER BY avg_score DESC
    `
      : `
      SELECT COALESCE(participant_email, participant_name) as identity,
             participant_name,
             COUNT(DISTINCT meeting_id) as meetings_attended,
             ROUND(AVG(contribution_score)::numeric, 1) as avg_score,
             ROUND(SUM(speaking_time_minutes)::numeric, 1) as total_speaking,
             SUM(decision_contributions) as total_decisions,
             SUM(discussion_contributions) as total_discussions,
             MODE() WITHIN GROUP (ORDER BY role) as most_common_role
      FROM participant_metrics
      GROUP BY COALESCE(participant_email, participant_name), participant_name
      ORDER BY avg_score DESC
    `;

    const weekSummaryQuery = `
      SELECT
        COUNT(*) as total_meetings,
        ROUND(SUM(duration_minutes) / 60.0, 1) as total_hours,
        ROUND(AVG(meeting_score)::numeric, 1) as avg_score,
        ROUND(AVG(effective_time_percent)::numeric, 1) as avg_effective,
        ROUND(AVG(decision_discussion_ratio)::numeric, 1) as avg_decision_ratio,
        ROUND(AVG(meeting_necessity_score)::numeric, 1) as avg_necessity,
        COUNT(*) FILTER (WHERE has_transcript) as transcribed_count,
        COUNT(*) FILTER (WHERE is_back_to_back) as back_to_back_count,
        MIN(start_time) as earliest,
        MAX(start_time) as latest,
        MAX(created_at) as last_updated
      FROM meeting_metrics
      ${dateParams.length ? 'WHERE start_time >= $1 AND start_time <= $2' : ''}
    `;

    const prevWeekQuery = dateParams.length
      ? `
      SELECT
        COUNT(*) as total_meetings,
        ROUND(SUM(duration_minutes) / 60.0, 1) as total_hours,
        ROUND(AVG(meeting_score)::numeric, 1) as avg_score,
        ROUND(AVG(effective_time_percent)::numeric, 1) as avg_effective
      FROM meeting_metrics
      WHERE start_time >= $1::timestamptz - ($2::timestamptz - $1::timestamptz)
        AND start_time < $1
    `
      : `
      SELECT
        COUNT(*) as total_meetings,
        ROUND(SUM(duration_minutes) / 60.0, 1) as total_hours,
        ROUND(AVG(meeting_score)::numeric, 1) as avg_score,
        ROUND(AVG(effective_time_percent)::numeric, 1) as avg_effective
      FROM meeting_metrics
      WHERE start_time < (SELECT MIN(start_time) FROM meeting_metrics)
    `;

    const typeBreakdownQuery = `
      SELECT meeting_type,
             COUNT(*) as count,
             ROUND(SUM(duration_minutes) / 60.0, 1) as total_hours,
             ROUND(AVG(meeting_score)::numeric, 1) as avg_score,
             ROUND(AVG(attendee_count)::numeric, 1) as avg_attendees
      FROM meeting_metrics
      ${dateParams.length ? 'WHERE start_time >= $1 AND start_time <= $2' : ''}
      GROUP BY meeting_type
      ORDER BY count DESC
    `;

    const perMeetingParticipantsQuery = `
      SELECT pm.meeting_id, mm.summary as meeting_summary, mm.start_time,
             mm.meeting_type, mm.meeting_score, mm.duration_minutes, mm.attendee_count,
             mm.quality_summary, mm.key_decisions, mm.sentiment,
             pm.participant_name, pm.contribution_score, pm.speaking_time_minutes,
             pm.decision_contributions, pm.discussion_contributions, pm.role,
             pm.feedback
      FROM participant_metrics pm
      JOIN meeting_metrics mm ON pm.meeting_id = mm.meeting_id
      ${dateParams.length ? 'WHERE mm.start_time >= $1 AND mm.start_time <= $2' : ''}
      ORDER BY mm.start_time DESC, pm.contribution_score DESC
    `;

    const ownerParticipantQuery = `
      SELECT pm.meeting_id, pm.participant_name, pm.participant_email,
             pm.contribution_score, pm.speaking_time_minutes,
             pm.decision_contributions, pm.discussion_contributions,
             pm.role, pm.feedback, pm.meeting_date,
             mm.summary as meeting_summary, mm.duration_minutes,
             mm.attendee_count, mm.meeting_type,
             mm.owner_email, mm.owner_feedback
      FROM participant_metrics pm
      JOIN meeting_metrics mm ON pm.meeting_id = mm.meeting_id
      WHERE mm.owner_email IS NOT NULL
        AND mm.owner_email != ''
        AND (pm.participant_email = mm.owner_email
             OR pm.participant_email ILIKE '%' || SPLIT_PART(mm.owner_email, '@', 1) || '%')
      ${dateParams.length ? 'AND mm.start_time >= $1 AND mm.start_time <= $2' : ''}
      ORDER BY mm.start_time DESC
    `;

    const [meetingsRes, participantsRes, summaryRes, prevRes, typesRes, perMeetingRes, ownerPartRes] = await Promise.all([
      pool.query(meetingsQuery, dateParams),
      pool.query(participantsQuery, dateParams),
      pool.query(weekSummaryQuery, dateParams),
      pool.query(prevWeekQuery, dateParams),
      pool.query(typeBreakdownQuery, dateParams),
      pool.query(perMeetingParticipantsQuery, dateParams),
      pool.query(ownerParticipantQuery, dateParams),
    ]);

    const meetings = meetingsRes.rows;
    const participants = participantsRes.rows;
    const summary = summaryRes.rows[0] || {};
    const prev = prevRes.rows[0] || {};
    const meetingTypes = typesRes.rows;

    const teamInsightsMap = new Map();
    perMeetingRes.rows.forEach(row => {
      const mid = row.meeting_id;
      if (!teamInsightsMap.has(mid)) {
        teamInsightsMap.set(mid, {
          meetingId: mid,
          summary: row.meeting_summary,
          startTime: row.start_time,
          type: row.meeting_type,
          score: parseFloat(row.meeting_score) || 0,
          duration: parseFloat(row.duration_minutes) || 0,
          attendeeCount: parseInt(row.attendee_count) || 0,
          qualitySummary: row.quality_summary || '',
          keyDecisions: row.key_decisions || [],
          sentiment: row.sentiment || 'neutral',
          participants: [],
        });
      }
      teamInsightsMap.get(mid).participants.push({
        name: row.participant_name,
        score: parseFloat(row.contribution_score) || 0,
        role: roleName(row.role),
        roleKey: (row.role || 'contributor').toLowerCase(),
        speaking: parseFloat(row.speaking_time_minutes) || 0,
        decisions: parseInt(row.decision_contributions) || 0,
        discussions: parseInt(row.discussion_contributions) || 0,
        tier: scoreTier(parseFloat(row.contribution_score) || 0),
        feedback: row.feedback || '',
      });
    });
    const teamInsights = [...teamInsightsMap.values()];

    const totalMeetings = parseInt(summary.total_meetings) || 0;
    const totalHours = parseFloat(summary.total_hours) || 0;
    const avgScore = parseFloat(summary.avg_score) || 0;
    const avgEffective = parseFloat(summary.avg_effective) || 0;
    const avgDecisionRatio = parseFloat(summary.avg_decision_ratio) || 0;
    const avgNecessity = parseFloat(summary.avg_necessity) || 0;
    const transcribedCount = parseInt(summary.transcribed_count) || 0;
    const backToBackCount = parseInt(summary.back_to_back_count) || 0;

    const totalMinutes = meetings.reduce((s, m) => s + (parseFloat(m.duration_minutes) || 0), 0);
    const workMinutesPerWeek = 8 * 5 * 60;
    const calendarDensity = totalMinutes > 0 ? Math.round((totalMinutes / workMinutesPerWeek) * 100) : 0;

    const prevMeetings = parseInt(prev.total_meetings) || 0;
    const prevHours = parseFloat(prev.total_hours) || 0;
    const prevScore = parseFloat(prev.avg_score) || 0;
    const prevEffective = parseFloat(prev.avg_effective) || 0;

    const topPerformers = meetings
      .filter(m => parseFloat(m.meeting_score) >= 60)
      .sort((a, b) => parseFloat(b.meeting_score) - parseFloat(a.meeting_score))
      .slice(0, 5)
      .map(m => ({
        summary: m.summary,
        score: parseFloat(m.meeting_score),
        type: m.meeting_type,
        tier: scoreTier(parseFloat(m.meeting_score)),
      }));

    const needsImprovement = meetings
      .filter(m => parseFloat(m.meeting_score) < 50)
      .sort((a, b) => parseFloat(a.meeting_score) - parseFloat(b.meeting_score))
      .slice(0, 5)
      .map(m => ({
        summary: m.summary,
        score: parseFloat(m.meeting_score),
        isAsync: parseFloat(m.meeting_necessity_score) < 40,
        tier: scoreTier(parseFloat(m.meeting_score)),
      }));

    const asyncCandidates = meetings
      .filter(m => parseFloat(m.meeting_necessity_score) < 40)
      .sort((a, b) => parseFloat(a.meeting_necessity_score) - parseFloat(b.meeting_necessity_score))
      .slice(0, 5)
      .map(m => ({
        summary: m.summary,
        necessityScore: parseFloat(m.meeting_necessity_score),
        reason: m.meeting_necessity_reason || 'Low necessity — could be async',
      }));

    const allUnresolved = [];
    meetings.forEach(m => {
      const items = Array.isArray(m.unresolved_items) ? m.unresolved_items : [];
      items.forEach(item => {
        allUnresolved.push({
          meeting: m.summary,
          item: typeof item === 'string' ? item : JSON.stringify(item),
          startTime: m.start_time,
        });
      });
    });

    const suggestionMap = new Map();
    meetings.forEach(m => {
      const items = Array.isArray(m.improvement_suggestions) ? m.improvement_suggestions : [];
      items.forEach(s => {
        if (typeof s !== 'string' || !s.trim()) return;
        const text = s.trim();
        if (!suggestionMap.has(text)) {
          suggestionMap.set(text, { text, meetings: [] });
        }
        const entry = suggestionMap.get(text);
        if (!entry.meetings.find(x => x.id === m.meeting_id)) {
          entry.meetings.push({ id: m.meeting_id, name: m.summary, type: m.meeting_type });
        }
      });
    });
    const uniqueSuggestions = [...suggestionMap.values()].slice(0, 8);

    const totalDecision = meetings.reduce((s, m) => s + (parseFloat(m.decision_minutes) || 0), 0);
    const totalDiscussion = meetings.reduce((s, m) => s + (parseFloat(m.discussion_minutes) || 0), 0);
    const totalIdle = meetings.reduce((s, m) => s + (parseFloat(m.idle_minutes) || 0), 0);
    const totalTime = totalDecision + totalDiscussion + totalIdle || 1;

    const timeBreakdown = {
      decision: Math.round((totalDecision / totalTime) * 100),
      discussion: Math.round((totalDiscussion / totalTime) * 100),
      idle: Math.round((totalIdle / totalTime) * 100),
    };

    const formattedParticipants = participants.map((p, i) => ({
      rank: i + 1,
      name: p.participant_name,
      identity: p.identity,
      score: parseFloat(p.avg_score) || 0,
      role: roleName(p.most_common_role),
      roleKey: (p.most_common_role || 'contributor').toLowerCase(),
      decisions: parseInt(p.total_decisions) || 0,
      speakingMinutes: parseFloat(p.total_speaking) || 0,
      meetings: parseInt(p.meetings_attended) || 0,
      tier: scoreTier(parseFloat(p.avg_score) || 0),
    }));

    const allActions = [];
    meetings.forEach(m => {
      const items = Array.isArray(m.action_items) ? m.action_items : [];
      items.forEach(ai => {
        if (typeof ai === 'object' && ai.task) {
          allActions.push({
            task: ai.task,
            owner: ai.owner || 'Unassigned',
            deadline: ai.deadline || null,
            meeting: m.summary,
          });
        }
      });
    });

    // Owner insights aggregation
    const ownerMeetings = meetings.filter(m => m.owner_email);
    const ownerScores = ownerMeetings.map(m => parseFloat(m.owner_contribution_score) || 0);
    const avgOwnerScore = ownerScores.length > 0
      ? Math.round(ownerScores.reduce((a, b) => a + b, 0) / ownerScores.length) : 0;

    const attendanceBreakdown = { attend: 0, skip: 0, delegate: 0, summary_only: 0 };
    ownerMeetings.forEach(m => {
      const rec = (m.attendance_recommendation || 'attend').toLowerCase();
      if (attendanceBreakdown[rec] !== undefined) attendanceBreakdown[rec]++;
      else attendanceBreakdown.attend++;
    });

    const skipMeetings = ownerMeetings.filter(m =>
      ['skip', 'delegate', 'summary_only'].includes((m.attendance_recommendation || '').toLowerCase())
    );
    const hoursRecoverable = skipMeetings.reduce((s, m) => s + (parseFloat(m.duration_minutes) || 0), 0) / 60;

    // Owner self-evaluation from participant_metrics
    let ownerParts = ownerPartRes.rows;

    // If the email-based query didn't find the owner in participant_metrics,
    // try matching by name prefix derived from the owner_email
    if (ownerParts.length === 0 && ownerMeetings.length > 0) {
      const detectedEmail = ownerMeetings[0]?.owner_email || '';
      const emailPrefix = detectedEmail.split('@')[0]?.toLowerCase() || '';
      if (emailPrefix) {
        const nameMatchQuery = `
          SELECT pm.meeting_id, pm.participant_name, pm.participant_email,
                 pm.contribution_score, pm.speaking_time_minutes,
                 pm.decision_contributions, pm.discussion_contributions,
                 pm.role, pm.feedback, pm.meeting_date,
                 mm.summary as meeting_summary, mm.duration_minutes,
                 mm.attendee_count, mm.meeting_type,
                 mm.owner_email, mm.owner_feedback
          FROM participant_metrics pm
          JOIN meeting_metrics mm ON pm.meeting_id = mm.meeting_id
          WHERE LOWER(pm.participant_name) ILIKE $1
          ${dateParams.length ? 'AND mm.start_time >= $2 AND mm.start_time <= $3' : ''}
          ORDER BY mm.start_time DESC
        `;
        const nameRes = await pool.query(nameMatchQuery, dateParams.length ? [`%${emailPrefix}%`, fromTs, toTs] : [`%${emailPrefix}%`]);
        ownerParts = nameRes.rows;
      }
    }
    const ownerTotalSpeaking = ownerParts.reduce((s, r) => s + (parseFloat(r.speaking_time_minutes) || 0), 0);
    const ownerTotalDecisions = ownerParts.reduce((s, r) => s + (parseInt(r.decision_contributions) || 0), 0);
    const ownerTotalDiscussions = ownerParts.reduce((s, r) => s + (parseInt(r.discussion_contributions) || 0), 0);
    const ownerMeetingMinutes = ownerParts.reduce((s, r) => s + (parseFloat(r.duration_minutes) || 0), 0);
    const ownerSpeakingRatio = ownerMeetingMinutes > 0
      ? +((ownerTotalSpeaking / ownerMeetingMinutes) * 100).toFixed(1) : 0;

    const ownerRoles = {};
    ownerParts.forEach(r => {
      const role = (r.role || 'contributor').toLowerCase();
      ownerRoles[role] = (ownerRoles[role] || 0) + 1;
    });
    const primaryRole = Object.entries(ownerRoles).sort((a, b) => b[1] - a[1])[0]?.[0] || 'contributor';

    // Resolve owner identity — keep name/email consistent from the SAME source
    const ownerEmail = ownerMeetings[0]?.owner_email || ownerParts[0]?.participant_email || '';
    const emailPrefix = ownerEmail ? ownerEmail.split('@')[0]?.toLowerCase() : '';

    // Find the owner in the leaderboard by matching email or name prefix from the SAME email
    const ownerInLeaderboard = ownerEmail
      ? formattedParticipants.find(p =>
          p.identity === ownerEmail
          || (emailPrefix && p.name.toLowerCase().includes(emailPrefix))
        )
      : null;

    // If we found the owner in participant data, use that name; otherwise derive from email
    const ownerDisplayName = ownerParts.length > 0
      ? ownerParts[0].participant_name
      : (ownerInLeaderboard?.name || (emailPrefix ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) : 'Owner'));

    const ownerRank = ownerInLeaderboard?.rank || 0;
    const totalParticipants = formattedParticipants.length;

    // Skill assessment derived from data
    const facilitatorPct = ownerParts.length > 0
      ? Math.round(((ownerRoles.facilitator || 0) / ownerParts.length) * 100) : 0;
    const avgDecisionsPerMeeting = ownerParts.length > 0
      ? +(ownerTotalDecisions / ownerParts.length).toFixed(1) : 0;
    const avgDiscussionsPerMeeting = ownerParts.length > 0
      ? +(ownerTotalDiscussions / ownerParts.length).toFixed(1) : 0;

    const commScore = Math.min(100, Math.round(
      ownerSpeakingRatio >= 15 && ownerSpeakingRatio <= 45
        ? 80 + (20 * (1 - Math.abs(ownerSpeakingRatio - 30) / 30))
        : Math.max(20, 100 - Math.abs(ownerSpeakingRatio - 30) * 2)
    ));
    const leadershipScore = Math.min(100, Math.round(facilitatorPct * 0.6 + avgOwnerScore * 0.4));
    const decisionScore = Math.min(100, Math.round(avgDecisionsPerMeeting * 15));
    const collabScore = Math.min(100, Math.round(
      (avgDiscussionsPerMeeting * 10) + (ownerParts.length > 0 ? 30 : 0)
    ));
    const efficiencyScore = Math.round(
      parseFloat(summary.avg_effective) || 0
    );

    const skills = [
      { name: 'Communication', score: commScore, icon: '🗣' },
      { name: 'Leadership', score: leadershipScore, icon: '👑' },
      { name: 'Decision Making', score: decisionScore, icon: '⚡' },
      { name: 'Collaboration', score: collabScore, icon: '🤝' },
      { name: 'Efficiency', score: efficiencyScore, icon: '⏱' },
    ];

    // Strengths and improvements from owner feedback across meetings
    const strengths = [];
    const improvements = [];
    if (avgOwnerScore >= 70) strengths.push({ title: 'High Impact Contributor', detail: `Score ${avgOwnerScore}/100 — you consistently drive value in meetings.` });
    if (facilitatorPct >= 40) strengths.push({ title: 'Leadership', detail: `You facilitate ${facilitatorPct}% of meetings — strong organizational and initiative skills.` });
    if (ownerTotalDecisions >= 3) strengths.push({ title: 'Decision Driver', detail: `${ownerTotalDecisions} decision contributions across ${ownerParts.length} meetings.` });
    if (avgDiscussionsPerMeeting >= 2) strengths.push({ title: 'Active Collaborator', detail: `Avg ${avgDiscussionsPerMeeting} discussion contributions per meeting.` });

    if (ownerSpeakingRatio > 45) improvements.push({ title: 'Communication Balance', detail: `You spoke ${ownerSpeakingRatio}% of total time. Create space for others — practice active listening.` });
    if (ownerSpeakingRatio < 10 && ownerParts.length > 0) improvements.push({ title: 'Speak Up More', detail: `Only ${ownerSpeakingRatio}% speaking ratio. Share your perspectives to add more value.` });
    if (avgDecisionsPerMeeting < 1 && ownerParts.length > 1) improvements.push({ title: 'Drive More Decisions', detail: `Avg ${avgDecisionsPerMeeting} decisions/meeting. Push for concrete outcomes.` });
    if (avgOwnerScore < 40 && ownerParts.length > 0) improvements.push({ title: 'Increase Contribution Quality', detail: `Score ${avgOwnerScore}/100. Prepare talking points before meetings.` });

    // Per-meeting owner feedback for the "meeting-wise" section
    const ownerMeetingFeedback = ownerParts
      .filter(r => r.feedback || r.owner_feedback)
      .map(r => ({
        meeting: r.meeting_summary,
        type: r.meeting_type,
        feedback: r.feedback || '',
        ownerAdvice: r.owner_feedback || '',
        score: parseFloat(r.contribution_score) || 0,
        speaking: parseFloat(r.speaking_time_minutes) || 0,
        role: roleName(r.role),
      }));

    // Next meeting prep: group by meeting type with tips
    const typeGroups = {};
    ownerParts.forEach(r => {
      const t = r.meeting_type || 'general';
      if (!typeGroups[t]) typeGroups[t] = { type: t, count: 0, tips: [] };
      typeGroups[t].count++;
    });
    const focusArea = improvements[0] || (strengths.length > 0
      ? { title: strengths[0].title, detail: `Continue building on: ${strengths[0].detail}` }
      : { title: 'Keep Contributing', detail: 'Maintain your current engagement level.' });

    const ownerInsights = {
      email: ownerEmail,
      name: ownerDisplayName,
      avgContributionScore: avgOwnerScore,
      totalMeetings: ownerMeetings.length,
      meetingsToSkip: attendanceBreakdown.skip + attendanceBreakdown.delegate + attendanceBreakdown.summary_only,
      meetingsToAttend: attendanceBreakdown.attend,
      hoursRecoverable: +hoursRecoverable.toFixed(1),
      attendanceBreakdown,
      totalSpeaking: +ownerTotalSpeaking.toFixed(1),
      speakingRatio: ownerSpeakingRatio,
      totalDecisions: ownerTotalDecisions,
      totalDiscussions: ownerTotalDiscussions,
      decisionRatio: ownerMeetingMinutes > 0 ? +((ownerTotalDecisions / (ownerTotalDecisions + ownerTotalDiscussions || 1)) * 100).toFixed(0) : 0,
      primaryRole: roleName(primaryRole),
      rank: ownerRank,
      totalParticipants,
      skills,
      strengths,
      improvements,
      ownerMeetingFeedback,
      focusArea,
    };

    const attendanceRecs = ownerMeetings
      .filter(m => m.attendance_recommendation)
      .map(m => ({
        meeting: m.summary,
        meetingId: m.meeting_id,
        recommendation: m.attendance_recommendation || 'attend',
        reason: m.attendance_recommendation_reason || '',
        ownerScore: parseFloat(m.owner_contribution_score) || 0,
        meetingScore: parseFloat(m.meeting_score) || 0,
        meetingValueForOwner: parseFloat(m.meeting_value_for_owner) || 50,
        couldBeReplacedWith: m.could_be_replaced_with || 'nothing',
        isRecurring: m.is_recurring,
        ownerRole: m.owner_role || 'contributor',
        ownerFeedback: m.owner_feedback || '',
        startTime: m.start_time,
        duration: parseFloat(m.duration_minutes) || 0,
      }))
      .sort((a, b) => a.meetingValueForOwner - b.meetingValueForOwner);

    let weekLabel = 'All meetings';
    if (summary.earliest) {
      const start = new Date(summary.earliest);
      const end = new Date(summary.latest || summary.earliest);
      const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      weekLabel = `${fmt(start)} – ${fmt(end)}`;
    }

    const responseData = {
      summary: {
        totalMeetings,
        totalHours,
        avgScore,
        avgEffective,
        calendarDensity,
        avgDecisionRatio,
        avgNecessity,
        transcribedCount,
        backToBackCount,
        weekLabel,
        lastUpdated: summary.last_updated || null,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
      },
      trends: {
        meetingsDelta: totalMeetings - prevMeetings,
        hoursDelta: +(totalHours - prevHours).toFixed(1),
        scoreDelta: +(avgScore - prevScore).toFixed(1),
        effectiveDelta: +(avgEffective - prevEffective).toFixed(1),
      },
      topPerformers,
      needsImprovement,
      asyncCandidates,
      unresolvedItems: allUnresolved.slice(0, 8),
      suggestions: uniqueSuggestions,
      timeBreakdown,
      meetingTypes: meetingTypes.map(t => ({
        type: t.meeting_type,
        count: parseInt(t.count),
        hours: parseFloat(t.total_hours),
        avgScore: parseFloat(t.avg_score),
        avgAttendees: parseFloat(t.avg_attendees),
        tier: scoreTier(parseFloat(t.avg_score)),
      })),
      participants: formattedParticipants,
      teamInsights,
      actionItems: allActions.slice(0, 15),
      ownerInsights,
      attendanceRecs,
      meetings: meetings.map(m => ({
        id: m.meeting_id,
        summary: m.summary,
        score: parseFloat(m.meeting_score),
        type: m.meeting_type,
        duration: parseFloat(m.duration_minutes),
        attendees: parseInt(m.attendee_count),
        sentiment: m.sentiment,
        startTime: m.start_time,
        tier: scoreTier(parseFloat(m.meeting_score)),
        isRecurring: m.is_recurring,
        keyDecisions: m.key_decisions || [],
        qualitySummary: m.quality_summary || '',
        ownerScore: parseFloat(m.owner_contribution_score) || 0,
        ownerRole: m.owner_role || 'contributor',
        ownerFeedback: m.owner_feedback || '',
        attendanceRecommendation: m.attendance_recommendation || 'attend',
        attendanceReason: m.attendance_recommendation_reason || '',
        meetingValueForOwner: parseFloat(m.meeting_value_for_owner) || 50,
        couldBeReplacedWith: m.could_be_replaced_with || 'nothing',
      })),
    };

    dashboardCache.key = cacheKey;
    dashboardCache.data = responseData;
    dashboardCache.ts = Date.now();

    res.json(responseData);
  } catch (err) {
    console.error('[API] Dashboard error:', err.code || '', err.message || err);
    res.status(500).json({ error: 'Failed to load dashboard data', detail: err.message || String(err) });
  }
});

// ── POST /api/trigger ──
app.post('/api/trigger', async (req, res) => {
  const webhookUrl = `${process.env.N8N_WEBHOOK_BASE}${process.env.N8N_TRIGGER_PATH}`;
  const payload = req.body || {};
  console.log('[TRIGGER] Payload →', JSON.stringify(payload));
  console.log('[TRIGGER] Webhook URL →', webhookUrl);

  dashboardCache.ts = 0;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: 'n8n webhook failed', detail: text });
    }

    const data = await response.json().catch(() => ({ status: 'started' }));
    res.json({ status: 'started', message: data.message || 'Analysis running in background', n8nResponse: data });
  } catch (err) {
    if (err.name === 'AbortError') {
      // Timeout is expected — n8n accepted the request and is processing
      return res.json({ status: 'started', message: 'Analysis triggered — n8n is processing. Dashboard will update automatically.' });
    }
    console.error('[API] Trigger error:', err.message);
    res.status(502).json({ error: 'Cannot reach n8n webhook', detail: err.message, webhookUrl });
  }
});

// ── GET /api/health ──
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as now, COUNT(*) as meeting_count FROM meeting_metrics');
    res.json({
      status: 'ok',
      db: 'connected',
      serverTime: result.rows[0].now,
      meetingCount: parseInt(result.rows[0].meeting_count),
    });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected', detail: err.message });
  }
});

// ── Serve static build in production ──
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'dist')));
  app.get('*', (req, res) => res.sendFile(join(__dirname, 'dist', 'index.html')));
}

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n  🍊 Meeting Dashboard API running on http://localhost:${PORT}`);
    console.log(`  📊 Dashboard UI: http://localhost:5173 (dev) or http://localhost:${PORT} (prod)\n`);
  });
}

export default app;
