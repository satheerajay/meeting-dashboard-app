import { useState } from 'react';

const TYPE_COLORS = {
  standup: '#3B82F6', '1:1': '#00C48C', planning: '#EC4899',
  review: '#7C3AED', retrospective: '#14B8A6', 'all-hands': '#FF3B5C',
  sync: '#3B82F6', interview: '#00C48C', workshop: '#FFB800',
  brainstorm: '#FF6600', general: '#6B7280', strategy: '#FF6600',
  status: '#14B8A6', external: '#F97316', compliance: '#6B7280',
};

const REC_STYLES = {
  attend:       { bg: '#00C48C22', border: '#00C48C', color: '#00C48C', icon: '✅', label: 'ATTEND' },
  skip:         { bg: '#FF3B5C22', border: '#FF3B5C', color: '#FF3B5C', icon: '🚫', label: 'SKIP' },
  delegate:     { bg: '#FF660022', border: '#FF6600', color: '#FF6600', icon: '🔄', label: 'DELEGATE' },
  summary_only: { bg: '#3B82F622', border: '#3B82F6', color: '#3B82F6', icon: '📄', label: 'SUMMARY ONLY' },
};

const REPLACE_LABELS = {
  nothing: null,
  email: '✉️ Email update',
  slack_summary: '💬 Slack summary',
  async_doc: '📝 Async doc',
  shorter_meeting: '⏱️ Shorter meeting',
};

function getTypeColor(type) {
  return TYPE_COLORS[type?.toLowerCase()] || '#6B7280';
}

function scoreColor(score) {
  if (score >= 70) return '#00C48C';
  if (score >= 45) return '#FFB800';
  return '#FF3B5C';
}

function scoreLabel(score) {
  if (score >= 80) return 'EXCELLENT';
  if (score >= 70) return 'GOOD';
  if (score >= 50) return 'FAIR';
  if (score >= 30) return 'LOW';
  return 'NEEDS WORK';
}

function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function SkillBar({ skill }) {
  const color = scoreColor(skill.score);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>
          {skill.icon} {skill.name}
        </span>
        <span style={{
          fontSize: 12, fontWeight: 700, color,
          fontFamily: "'DM Mono', monospace",
        }}>{skill.score}<span style={{ color: 'rgba(255,255,255,0.25)' }}>/100</span></span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
        <div style={{
          width: `${Math.min(skill.score, 100)}%`, height: '100%',
          background: color, borderRadius: 3,
          transition: 'width 1s ease',
        }} />
      </div>
    </div>
  );
}

function SelfEvaluation({ ownerInsights }) {
  if (!ownerInsights || !ownerInsights.totalMeetings) return null;

  const o = ownerInsights;
  const sc = scoreColor(o.avgContributionScore);

  return (
    <>
      {/* Hero card with gradient */}
      <div className="self-eval-hero">
        <div style={{ fontSize: 16, fontWeight: 800 }}>Personal Meeting Self-Evaluation</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
          Insights based on your recent meeting performance
        </div>
      </div>

      {/* Overall score + stats */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          {/* Score circle */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
            background: `conic-gradient(${sc} ${o.avgContributionScore * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 58, height: 58, borderRadius: '50%',
              background: 'var(--card-bg)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: sc, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>
                {o.avgContributionScore}
              </div>
              <div style={{ fontSize: 8, fontWeight: 700, color: sc, letterSpacing: '0.08em' }}>
                {scoreLabel(o.avgContributionScore)}
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Overall Meeting Performance</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>
              {o.rank > 0 && <>Rank <strong style={{ color: 'var(--orange)' }}>#{o.rank}</strong> of {o.totalParticipants} participants · </>}
              {o.totalMeetings} meetings attended · {o.totalSpeaking}min speaking
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="owner-stats-grid">
          <div className="owner-stat">
            <div className="owner-stat-value">{o.totalMeetings}</div>
            <div className="owner-stat-label">Meetings<br />attended</div>
          </div>
          <div className="owner-stat">
            <div className="owner-stat-value">{o.totalSpeaking}<span style={{ fontSize: 12 }}>min</span></div>
            <div className="owner-stat-label">Speaking<br />{o.speakingRatio}% of time</div>
          </div>
          <div className="owner-stat">
            <div className="owner-stat-value">{o.totalDecisions}</div>
            <div className="owner-stat-label">Decisions<br />{o.decisionRatio}% ratio</div>
          </div>
          <div className="owner-stat">
            <div className="owner-stat-value" style={{ color: sc, fontSize: 18 }}>{o.avgContributionScore}<span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>/100</span></div>
            <div className="owner-stat-label">Avg Score<br />{o.primaryRole}</div>
          </div>
        </div>
      </div>

      {/* Skill assessment + strengths/improvements */}
      <div className="dash-grid" style={{ marginBottom: 16 }}>
        {/* Skills */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Skill Assessment</div>
          {(o.skills || []).map((sk, i) => <SkillBar key={i} skill={sk} />)}
        </div>

        {/* Strengths + Improvements */}
        <div className="card">
          {/* Strengths */}
          {o.strengths && o.strengths.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#00C48C', marginBottom: 10 }}>
                Your Strengths
              </div>
              {o.strengths.map((s, i) => (
                <div key={i} style={{
                  padding: '10px 14px', borderRadius: 8, marginBottom: 6,
                  background: 'rgba(0,196,140,0.06)', borderLeft: '3px solid #00C48C',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{s.detail}</div>
                </div>
              ))}
            </div>
          )}

          {/* Improvements */}
          {o.improvements && o.improvements.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#FFB800', marginBottom: 10 }}>
                Areas to Improve
              </div>
              {o.improvements.map((im, i) => (
                <div key={i} style={{
                  padding: '10px 14px', borderRadius: 8, marginBottom: 6,
                  background: 'rgba(255,184,0,0.06)', borderLeft: '3px solid #FFB800',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{im.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{im.detail}</div>
                </div>
              ))}
            </div>
          )}

          {/* Focus for next week */}
          {o.focusArea && (
            <div style={{
              padding: '12px 14px', borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(255,102,0,0.1), rgba(255,102,0,0.04))',
              border: '1px solid rgba(255,102,0,0.15)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--orange)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                #1 Focus for Next Week
              </div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{o.focusArea.title}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{o.focusArea.detail}</div>
            </div>
          )}
        </div>
      </div>

      {/* Per-meeting feedback */}
      {o.ownerMeetingFeedback && o.ownerMeetingFeedback.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title" style={{ marginBottom: 14 }}>Meeting-wise Feedback</div>
          {o.ownerMeetingFeedback.map((mf, i) => (
            <div key={i} style={{
              padding: '10px 12px', borderRadius: 8, marginBottom: 6,
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{mf.meeting}</div>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                  background: `${getTypeColor(mf.type)}20`, color: getTypeColor(mf.type),
                }}>{mf.type}</span>
              </div>
              {mf.feedback && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, marginBottom: 3 }}>
                  💬 {mf.feedback}
                </div>
              )}
              {mf.ownerAdvice && mf.ownerAdvice !== mf.feedback && (
                <div style={{ fontSize: 11, color: 'rgba(255,102,0,0.7)', lineHeight: 1.5 }}>
                  🎯 {mf.ownerAdvice}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Attendance overview */}
      {o.meetingsToSkip > 0 && (
        <div style={{
          padding: '14px 16px', borderRadius: 10, marginBottom: 20,
          background: 'linear-gradient(135deg, rgba(255,59,92,0.08), rgba(255,102,0,0.05))',
          border: '1px solid rgba(255,59,92,0.15)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: '#FF3B5C' }}>
            You could skip {o.meetingsToSkip} meeting{o.meetingsToSkip > 1 ? 's' : ''} and recover ~{o.hoursRecoverable}h
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            Based on your contribution patterns, these meetings add little value for you specifically.
          </div>
        </div>
      )}
    </>
  );
}

function AttendanceBadge({ recommendation }) {
  const style = REC_STYLES[recommendation] || REC_STYLES.attend;
  return (
    <span className="attendance-badge" style={{
      background: style.bg,
      border: `1px solid ${style.border}55`,
      color: style.color,
    }}>
      {style.icon} {style.label}
    </span>
  );
}

function MeetingDetailCard({ meeting, initialExpanded = false }) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const typeColor = getTypeColor(meeting.type);
  const ownerSc = scoreColor(meeting.ownerScore || 0);
  const meetingSc = scoreColor(meeting.score || 0);
  const rec = (meeting.attendanceRecommendation || 'attend').toLowerCase();
  const replaceLabel = REPLACE_LABELS[(meeting.couldBeReplacedWith || 'nothing').toLowerCase()];

  return (
    <div className="card meeting-detail-card" style={{ marginBottom: 14 }}>
      <div
        onClick={() => setExpanded(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: `${typeColor}20`, border: `1px solid ${typeColor}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>📋</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {meeting.summary}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              {formatDateTime(meeting.startTime)}
              <span style={{
                padding: '1px 6px', borderRadius: 4,
                background: `${typeColor}20`, color: typeColor,
                fontSize: 9, fontWeight: 700,
              }}>{meeting.type}</span>
              <span>{meeting.duration}min</span>
              {meeting.isRecurring && <span style={{ color: '#3B82F6' }}>🔁 Recurring</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <AttendanceBadge recommendation={rec} />
          <span style={{
            fontSize: 12, color: 'var(--orange)', fontWeight: 800,
            transition: 'transform 0.3s',
            transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
          }}>▼</span>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="meeting-detail-grid">
            <div className="detail-metric">
              <span className="detail-metric-label">Meeting Score</span>
              <span className="detail-metric-value" style={{ color: meetingSc }}>{Math.round(meeting.score || 0)}</span>
            </div>
            <div className="detail-metric">
              <span className="detail-metric-label">Your Score</span>
              <span className="detail-metric-value" style={{ color: ownerSc }}>{Math.round(meeting.ownerScore || 0)}</span>
            </div>
            <div className="detail-metric">
              <span className="detail-metric-label">Value for You</span>
              <span className="detail-metric-value" style={{ color: scoreColor(meeting.meetingValueForOwner || 0) }}>
                {Math.round(meeting.meetingValueForOwner || 0)}
              </span>
            </div>
            <div className="detail-metric">
              <span className="detail-metric-label">Your Role</span>
              <span className="detail-metric-value" style={{ fontSize: 12, textTransform: 'capitalize' }}>
                {meeting.ownerRole || 'contributor'}
              </span>
            </div>
          </div>

          {meeting.attendanceReason && (
            <div className="detail-reason">
              <strong>Recommendation:</strong> {meeting.attendanceReason}
            </div>
          )}

          {replaceLabel && (
            <div className="detail-replace-tag">
              Could be replaced with: <strong>{replaceLabel}</strong>
            </div>
          )}

          {meeting.ownerFeedback && (
            <div className="detail-feedback">
              <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: 'var(--orange)' }}>
                Personalized Advice
              </div>
              {meeting.ownerFeedback}
            </div>
          )}

          {meeting.qualitySummary && (
            <div className="detail-quality">
              <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: 'rgba(255,255,255,0.5)' }}>
                Meeting Quality
              </div>
              {meeting.qualitySummary}
            </div>
          )}

          {meeting.keyDecisions && meeting.keyDecisions.length > 0 && (
            <div className="detail-decisions">
              <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 6, color: '#00C48C' }}>
                Key Decisions ({meeting.keyDecisions.length})
              </div>
              {meeting.keyDecisions.map((d, i) => (
                <div key={i} style={{ fontSize: 12, padding: '3px 0', color: 'rgba(255,255,255,0.6)' }}>
                  • {typeof d === 'string' ? d : JSON.stringify(d)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { SelfEvaluation, MeetingDetailCard };

export default function MeetingSummary({ meetings, ownerInsights, attendanceRecs }) {
  if (!meetings || meetings.length === 0) return null;

  const sorted = [...meetings].sort((a, b) => (b.ownerScore || b.score || 0) - (a.ownerScore || a.score || 0));
  const attendMeetings = sorted.filter(m => (m.attendanceRecommendation || 'attend') === 'attend');
  const skipMeetings = sorted.filter(m => ['skip', 'delegate', 'summary_only'].includes(m.attendanceRecommendation));

  return (
    <div>
      <div className="card-title" style={{ marginBottom: 6, fontSize: 14 }}>
        🔍 Individual Insights
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 24 }}>
        Personal self-evaluation across {meetings.length} meetings — skills, strengths, and actionable advice
      </div>

      {/* Self-evaluation section */}
      <SelfEvaluation ownerInsights={ownerInsights} />

      {/* Attendance breakdown by meeting */}
      {skipMeetings.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: '#FF3B5C', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{
              width: 28, height: 28, borderRadius: 8,
              background: '#FF3B5C18', border: '1px solid #FF3B5C33',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}>🚫</span>
            Meetings You Can Skip ({skipMeetings.length})
          </div>
          {skipMeetings.map(m => <MeetingDetailCard key={m.id} meeting={m} />)}
        </div>
      )}

      {attendMeetings.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: '#00C48C', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{
              width: 28, height: 28, borderRadius: 8,
              background: '#00C48C18', border: '1px solid #00C48C33',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}>✅</span>
            Meetings Worth Attending ({attendMeetings.length})
          </div>
          {attendMeetings.map(m => <MeetingDetailCard key={m.id} meeting={m} />)}
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 20, marginTop: 20,
        padding: '12px 14px', borderRadius: 8,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
        fontSize: 11, color: 'rgba(255,255,255,0.4)',
      }}>
        <span>📅 <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{meetings.length}</strong> meetings</span>
        <span>✅ <strong style={{ color: '#00C48C' }}>{attendMeetings.length}</strong> attend</span>
        <span>🚫 <strong style={{ color: '#FF3B5C' }}>{skipMeetings.length}</strong> skip/delegate</span>
        {ownerInsights && ownerInsights.hoursRecoverable > 0 && (
          <span>⏱ <strong style={{ color: '#FFB800' }}>{ownerInsights.hoursRecoverable}h</strong> recoverable</span>
        )}
      </div>
    </div>
  );
}
