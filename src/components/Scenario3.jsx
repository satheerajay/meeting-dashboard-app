import { useState, useEffect } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell,
} from 'recharts';

const T = {
  orange: 'var(--orange)',
  green: 'var(--green)',
  red: 'var(--red)',
  blue: 'var(--blue)',
  yellow: 'var(--yellow)',
  purple: 'var(--purple)',
  text: 'var(--text)',
  sub: 'var(--text2)',
  muted: 'var(--muted)',
  border: 'var(--border)',
  surface: 'var(--surface)',
};

const TEAM_MEMBERS = [
  {
    id: 1, name: 'Sarah Chen', role: 'Senior PM', avatar: 'SC',
    score: 87, trend: 4, meetings: 18, avgDuration: 42,
    sentiment: 0.74, talkRatio: 38, actionCompletion: 91,
    strengths: ['Stakeholder alignment', 'Clear requirements', 'Risk identification'],
    weaknesses: ['Technical depth', 'Time management', 'Conflict resolution'],
    recentMeetings: [
      { date: 'Mar 5', title: 'Sprint Planning Q1', score: 91, sentiment: 'positive', duration: 55, flags: [] },
      { date: 'Mar 4', title: 'Client Discovery – Nexus Corp', score: 84, sentiment: 'neutral', duration: 38, flags: ['Over-talking'] },
      { date: 'Mar 3', title: 'Backlog Grooming', score: 88, sentiment: 'positive', duration: 45, flags: [] },
      { date: 'Feb 28', title: 'Stakeholder Review', score: 79, sentiment: 'neutral', duration: 62, flags: ['Ran over time'] },
    ],
    radarData: [
      { skill: 'Communication', val: 88 }, { skill: 'Facilitation', val: 82 },
      { skill: 'Technical', val: 61 }, { skill: 'Stakeholder Mgmt', val: 92 },
      { skill: 'Follow-up', val: 79 }, { skill: 'Time Mgmt', val: 68 },
    ],
    improvementPlan: [
      { area: 'Technical Depth', action: 'Attend 2 engineering syncs/week to build product-tech vocabulary', priority: 'high', due: '2 weeks' },
      { area: 'Time Management', action: 'Set hard stop timers; use parking lot for off-agenda topics', priority: 'medium', due: 'Immediate' },
      { area: 'Conflict Resolution', action: 'Role-play difficult stakeholder scenarios with CPO monthly', priority: 'medium', due: '1 month' },
    ],
    keywords: ['roadmap', 'sprint', 'stakeholders', 'requirements', 'backlog', 'delivery', 'scope'],
  },
  {
    id: 2, name: 'Marcus Reid', role: 'BA Lead', avatar: 'MR',
    score: 79, trend: 1, meetings: 22, avgDuration: 37,
    sentiment: 0.61, talkRatio: 52, actionCompletion: 74,
    strengths: ['Requirements elicitation', 'Process mapping', 'Documentation'],
    weaknesses: ['Talk-time balance', 'Action follow-through', 'Executive presence'],
    recentMeetings: [
      { date: 'Mar 6', title: 'Requirements Workshop – Alpha', score: 75, sentiment: 'neutral', duration: 90, flags: ['Over-talking', 'Missed action items'] },
      { date: 'Mar 5', title: 'Process Review Session', score: 83, sentiment: 'positive', duration: 30, flags: [] },
      { date: 'Mar 3', title: 'UAT Planning', score: 77, sentiment: 'neutral', duration: 45, flags: ['Ran over time'] },
      { date: 'Feb 27', title: 'Data Flow Mapping', score: 81, sentiment: 'positive', duration: 40, flags: [] },
    ],
    radarData: [
      { skill: 'Communication', val: 72 }, { skill: 'Facilitation', val: 70 },
      { skill: 'Technical', val: 84 }, { skill: 'Stakeholder Mgmt', val: 65 },
      { skill: 'Follow-up', val: 60 }, { skill: 'Time Mgmt', val: 71 },
    ],
    improvementPlan: [
      { area: 'Talk-Time Balance', action: 'Practice 60/40 listen-to-speak ratio; use structured turn-taking', priority: 'high', due: 'Immediate' },
      { area: 'Action Follow-through', action: 'Send meeting recaps within 2h with clear owners and due dates', priority: 'high', due: 'Immediate' },
      { area: 'Executive Presence', action: 'Prepare concise 2-min summaries before each meeting close', priority: 'medium', due: '2 weeks' },
    ],
    keywords: ['requirements', 'process', 'UAT', 'data', 'workflow', 'documentation', 'users'],
  },
  {
    id: 3, name: 'Priya Nair', role: 'PM', avatar: 'PN',
    score: 93, trend: 7, meetings: 15, avgDuration: 35,
    sentiment: 0.88, talkRatio: 33, actionCompletion: 97,
    strengths: ['Active listening', 'Decision facilitation', 'Action tracking'],
    weaknesses: ['Assertiveness in conflict', 'Escalation timing', 'Big-picture framing'],
    recentMeetings: [
      { date: 'Mar 6', title: 'Quarterly OKR Review', score: 96, sentiment: 'positive', duration: 45, flags: [] },
      { date: 'Mar 4', title: 'Design Critique', score: 91, sentiment: 'positive', duration: 30, flags: [] },
      { date: 'Mar 2', title: 'Vendor Negotiation – Flux', score: 88, sentiment: 'neutral', duration: 50, flags: [] },
      { date: 'Feb 26', title: 'Risk Assessment', score: 94, sentiment: 'positive', duration: 25, flags: [] },
    ],
    radarData: [
      { skill: 'Communication', val: 94 }, { skill: 'Facilitation', val: 91 },
      { skill: 'Technical', val: 76 }, { skill: 'Stakeholder Mgmt', val: 88 },
      { skill: 'Follow-up', val: 97 }, { skill: 'Time Mgmt', val: 93 },
    ],
    improvementPlan: [
      { area: 'Assertiveness', action: 'Lead at least one difficult conversation per week without deferring', priority: 'medium', due: 'Ongoing' },
      { area: 'Escalation Timing', action: 'Define personal escalation triggers; review with CPO bi-weekly', priority: 'medium', due: '2 weeks' },
      { area: 'Big-Picture Framing', action: 'Open each meeting with a 1-sentence strategic context statement', priority: 'low', due: '1 month' },
    ],
    keywords: ['OKRs', 'design', 'vendor', 'risk', 'decisions', 'timeline', 'alignment'],
  },
  {
    id: 4, name: 'James Okafor', role: 'BA', avatar: 'JO',
    score: 68, trend: -3, meetings: 19, avgDuration: 51,
    sentiment: 0.45, talkRatio: 61, actionCompletion: 58,
    strengths: ['Domain expertise', 'Detailed analysis', 'Thoroughness'],
    weaknesses: ['Meeting efficiency', 'Stakeholder engagement', 'Clarity of communication'],
    recentMeetings: [
      { date: 'Mar 6', title: 'System Integration Review', score: 62, sentiment: 'negative', duration: 75, flags: ['Over-talking', 'Ran over time', 'Low engagement'] },
      { date: 'Mar 4', title: 'Data Migration Planning', score: 71, sentiment: 'neutral', duration: 65, flags: ['Ran over time'] },
      { date: 'Mar 1', title: 'Compliance Workshop', score: 69, sentiment: 'neutral', duration: 40, flags: ['Low engagement'] },
      { date: 'Feb 25', title: 'API Requirements Session', score: 72, sentiment: 'neutral', duration: 55, flags: ['Over-talking'] },
    ],
    radarData: [
      { skill: 'Communication', val: 58 }, { skill: 'Facilitation', val: 55 },
      { skill: 'Technical', val: 89 }, { skill: 'Stakeholder Mgmt', val: 52 },
      { skill: 'Follow-up', val: 49 }, { skill: 'Time Mgmt', val: 44 },
    ],
    improvementPlan: [
      { area: 'Meeting Efficiency', action: 'Mandatory agenda distribution 24h before; strict 45-min cap', priority: 'high', due: 'Immediate' },
      { area: 'Stakeholder Engagement', action: 'Use structured question rounds; poll participants mid-meeting', priority: 'high', due: '1 week' },
      { area: 'Clarity', action: 'Translate technical findings into business impact statements', priority: 'high', due: '2 weeks' },
    ],
    keywords: ['integration', 'data', 'compliance', 'API', 'systems', 'analysis', 'migration'],
  },
];

const TEAM_TRENDS = [
  { week: 'W1', Sarah: 83, Marcus: 76, Priya: 86, James: 72 },
  { week: 'W2', Sarah: 85, Marcus: 78, Priya: 89, James: 70 },
  { week: 'W3', Sarah: 84, Marcus: 77, Priya: 91, James: 69 },
  { week: 'W4', Sarah: 87, Marcus: 79, Priya: 93, James: 68 },
];
const TOPIC_DIST = [
  { topic: 'Requirements', count: 34 }, { topic: 'Planning', count: 28 },
  { topic: 'Stakeholders', count: 22 }, { topic: 'Technical', count: 19 },
  { topic: 'Risk', count: 14 }, { topic: 'Process', count: 12 },
];
const SENTIMENT_TIMELINE = [
  { date: 'Feb 24', positive: 5, neutral: 3, negative: 1 },
  { date: 'Feb 28', positive: 6, neutral: 4, negative: 2 },
  { date: 'Mar 3', positive: 7, neutral: 5, negative: 1 },
  { date: 'Mar 6', positive: 8, neutral: 4, negative: 1 },
];
const FLAG_DIST = [
  { name: 'Over-talking', value: 8, color: T.yellow },
  { name: 'Ran over time', value: 6, color: T.red },
  { name: 'Low engagement', value: 4, color: T.purple },
  { name: 'Missed actions', value: 3, color: T.blue },
];

const scoreColor = (s) => (s >= 90 ? T.green : s >= 80 ? T.yellow : s >= 70 ? T.orange : T.red);
const scoreGrade = (s) => (s >= 90 ? 'A' : s >= 80 ? 'B' : s >= 70 ? 'C' : 'D');
const sentLabel = (s) => (s >= 0.75 ? 'Positive' : s >= 0.5 ? 'Neutral' : 'Needs Attention');
const sentColor = (s) => (s >= 0.75 ? T.green : s >= 0.5 ? T.yellow : T.red);
const prioColor = (p) => (p === 'high' ? T.red : p === 'medium' ? T.yellow : T.green);

const FLAG_STYLES = {
  'Over-talking': { bg: `${T.yellow}22`, text: T.yellow },
  'Ran over time': { bg: `${T.red}22`, text: T.red },
  'Low engagement': { bg: `${T.purple}22`, text: T.purple },
  'Missed action items': { bg: `${T.blue}22`, text: T.blue },
  'Missed actions': { bg: `${T.blue}22`, text: T.blue },
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="scenario2-tooltip">
      <p className="scenario2-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || T.text }}>{p.name}: <b>{p.value}</b></p>
      ))}
    </div>
  );
}

const MOCK_COACHING = `• Key observation: Strong on stakeholder alignment and requirements clarity; technical depth and time management are the main growth areas.
• Top 2 CPO actions: (1) Pair with a senior engineer for 2 syncs/week to build product-tech vocabulary. (2) Introduce a 45-min hard stop and parking lot for off-agenda topics.
• Positive reinforcement: Their risk identification and clear requirements have reduced rework in the last two sprints — call this out in the next 1:1.`;

export default function Scenario3({ onBack }) {
  const [selectedMember, setSelectedMember] = useState(TEAM_MEMBERS[0]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [pulseIdx, setPulseIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulseIdx((i) => (i + 1) % TEAM_MEMBERS.length), 2000);
    return () => clearInterval(t);
  }, []);

  const totalMeetings = TEAM_MEMBERS.reduce((a, m) => a + m.meetings, 0);
  const avgTeamScore = Math.round(TEAM_MEMBERS.reduce((a, m) => a + m.score, 0) / TEAM_MEMBERS.length);
  const avgSentiment = TEAM_MEMBERS.reduce((a, m) => a + m.sentiment, 0) / TEAM_MEMBERS.length;
  const avgActionCompl = Math.round(TEAM_MEMBERS.reduce((a, m) => a + m.actionCompletion, 0) / TEAM_MEMBERS.length);

  const generateInsight = () => {
    setLoadingInsight(true);
    setAiInsight('');
    setTimeout(() => {
      setAiInsight(MOCK_COACHING);
      setLoadingInsight(false);
    }, 1200);
  };

  return (
    <div className="scenario3-page">
      <header className="scenario3-header">
        <div className="scenario3-header-left">
          {onBack && (
            <button type="button" className="scenario1-back-btn" onClick={onBack} aria-label="Back to Scenarios">← Back</button>
          )}
          <div className="scenario3-header-logo">
            <div className="scenario3-header-logo-icon">◈</div>
            <div>
              <h1 className="scenario3-header-title">Meeting Intelligence Dashboard</h1>
              <p className="scenario3-header-sub">Powered by Fathom AI</p>
            </div>
          </div>
        </div>
        <div className="scenario3-live">
          <span className="scenario3-live-dot" />
          <span>Live · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      </header>

      <div className="scenario3-body">
        <div className="kpi-grid scenario3-kpi-row">
          <div className="card scenario3-stat-card" style={{ ['--stat-accent']: T.orange }}>
            <div className="scenario3-stat-accent" />
            <div className="scenario3-stat-label">Total Meetings Analyzed</div>
            <div className="scenario3-stat-value">{totalMeetings}</div>
            <div className="scenario3-stat-sub">4 team members</div>
          </div>
          <div className="card scenario3-stat-card" style={{ ['--stat-accent']: T.green }}>
            <div className="scenario3-stat-accent" />
            <div className="scenario3-stat-label">Avg. Performance Score</div>
            <div className="scenario3-stat-value">{avgTeamScore}</div>
            <div className="scenario3-stat-sub">↑ +2.3pts vs last period</div>
          </div>
          <div className="card scenario3-stat-card" style={{ ['--stat-accent']: T.purple }}>
            <div className="scenario3-stat-accent" />
            <div className="scenario3-stat-label">Team Sentiment Index</div>
            <div className="scenario3-stat-value">{Math.round(avgSentiment * 100)}%</div>
            <div className="scenario3-stat-sub">{sentLabel(avgSentiment)}</div>
          </div>
          <div className="card scenario3-stat-card" style={{ ['--stat-accent']: T.blue }}>
            <div className="scenario3-stat-accent" />
            <div className="scenario3-stat-label">Action Item Completion</div>
            <div className="scenario3-stat-value">{avgActionCompl}%</div>
            <div className="scenario3-stat-sub">Across all tracked meetings</div>
          </div>
        </div>

        <div className="scenario3-grid">
          <aside className="scenario3-roster">
            <div className="scenario3-section-label">Team Roster</div>
            {TEAM_MEMBERS.map((m, i) => (
              <div key={m.id} className="scenario3-member-wrap">
                {i === pulseIdx && <div className="scenario3-pulse-ring" aria-hidden />}
                <button
                  type="button"
                  className={`card scenario3-member-card ${selectedMember?.id === m.id ? 'active' : ''}`}
                  onClick={() => { setSelectedMember(m); setAiInsight(''); setActiveTab('overview'); }}
                >
                  <div className="scenario3-member-top">
                    <div className="scenario3-member-avatar" style={{ borderColor: scoreColor(m.score), color: scoreColor(m.score) }}>{m.avatar}</div>
                    <div className="scenario3-member-info">
                      <span className="scenario3-member-name">{m.name}</span>
                      <span className="scenario3-member-role">{m.role}</span>
                    </div>
                    <div className="scenario3-member-score-wrap">
                      <span className="scenario3-member-score" style={{ color: scoreColor(m.score) }}>{m.score}</span>
                      <span className="scenario3-member-trend" style={{ color: m.trend >= 0 ? T.green : T.red }}>
                        {m.trend >= 0 ? '▲' : '▼'} {Math.abs(m.trend)}
                      </span>
                    </div>
                  </div>
                  <div className="scenario3-member-pills">
                    <div className="scenario3-pill"><span>{m.meetings}</span><span>Meetings</span></div>
                    <div className="scenario3-pill"><span>{m.avgDuration}</span><span>Avg Min</span></div>
                    <div className="scenario3-pill"><span>{m.actionCompletion}%</span><span>Actions</span></div>
                  </div>
                </button>
              </div>
            ))}
            <div className="card scenario3-panel">
              <div className="scenario3-panel-title">Flags Overview <span className="scenario3-badge">This Period</span></div>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={FLAG_DIST} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                    {FLAG_DIST.map((f, i) => (
                      <Cell key={i} fill={f.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="scenario3-flag-legend">
                {FLAG_DIST.map((f) => (
                  <div key={f.name} className="scenario3-flag-legend-row">
                    <span className="scenario3-flag-dot" style={{ background: f.color }} />
                    <span>{f.name}</span>
                    <span className="scenario3-flag-val">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className="scenario3-detail">
            {selectedMember && (
              <>
                <div className="card scenario3-member-header">
                  <div className="scenario3-member-header-avatar" style={{ borderColor: scoreColor(selectedMember.score), color: scoreColor(selectedMember.score) }}>
                    {selectedMember.avatar}
                  </div>
                  <div className="scenario3-member-header-info">
                    <h2 className="scenario3-member-header-name">{selectedMember.name}</h2>
                    <div className="scenario3-member-header-meta">
                      <span>{selectedMember.role.toUpperCase()}</span>
                      <span style={{ color: sentColor(selectedMember.sentiment) }}>● {sentLabel(selectedMember.sentiment)} Sentiment</span>
                      <span>{selectedMember.talkRatio}% Talk Ratio</span>
                    </div>
                  </div>
                  <div className="scenario3-member-header-score-wrap">
                    <span className="scenario3-member-header-score" style={{ color: scoreColor(selectedMember.score) }}>{selectedMember.score}</span>
                    <span className="scenario3-member-header-label">PERFORMANCE</span>
                  </div>
                  <div className="scenario3-member-header-grade" style={{ borderColor: scoreColor(selectedMember.score), color: scoreColor(selectedMember.score) }}>
                    {scoreGrade(selectedMember.score)}
                  </div>
                  <nav className="scenario3-detail-tabs">
                    {['overview', 'meetings', 'plan'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`scenario3-detail-tab ${activeTab === t ? 'active' : ''}`}
                        onClick={() => setActiveTab(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </nav>
                </div>

                {activeTab === 'overview' && (
                  <div className="scenario3-overview-grid">
                    <div className="card scenario3-panel">
                      <div className="scenario3-panel-title">Skill Profile <span className="scenario3-badge">6 Dimensions</span></div>
                      <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={selectedMember.radarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.12)" />
                          <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text2)', fontSize: 9 }} />
                          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="Score" dataKey="val" stroke={T.orange} fill={T.orange} fillOpacity={0.15} strokeWidth={2} dot={{ fill: T.orange, r: 3 }} isAnimationActive animationDuration={1000} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="card scenario3-panel">
                      <div className="scenario3-panel-title">Strengths & Gaps</div>
                      <div className="scenario3-strengths">
                        <div className="scenario3-label" style={{ color: T.green }}>STRENGTHS</div>
                        <div className="scenario3-tags">
                          {selectedMember.strengths.map((s) => (
                            <span key={s} className="scenario3-tag scenario3-tag-green">✓ {s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="scenario3-weaknesses">
                        <div className="scenario3-label" style={{ color: T.red }}>DEVELOPMENT AREAS</div>
                        <div className="scenario3-tags">
                          {selectedMember.weaknesses.map((s) => (
                            <span key={s} className="scenario3-tag scenario3-tag-red">↗ {s}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="scenario3-label">KEY TOPICS DISCUSSED</div>
                        <div className="scenario3-tags">
                          {selectedMember.keywords.map((k) => (
                            <span key={k} className="scenario3-tag">{k}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="card scenario3-panel">
                      <div className="scenario3-panel-title">Communication Balance <span className="scenario3-badge">Talk / Listen</span></div>
                      <div className="scenario3-talk-row">
                        <span style={{ color: T.red }}>Speaking {selectedMember.talkRatio}%</span>
                        <span style={{ color: T.green }}>Listening {100 - selectedMember.talkRatio}%</span>
                      </div>
                      <div className="scenario3-talk-bar">
                        <div className="scenario3-talk-fill" style={{ width: `${selectedMember.talkRatio}%`, background: selectedMember.talkRatio > 50 ? `linear-gradient(90deg, ${T.red}, ${T.orange})` : `linear-gradient(90deg, ${T.green}, ${T.blue})` }} />
                      </div>
                      <div className="scenario3-talk-msg">
                        {selectedMember.talkRatio > 55 ? '⚠ Speaking too much — allow more stakeholder airtime' : selectedMember.talkRatio < 30 ? '⚠ Consider being more assertive' : '✓ Healthy conversation balance maintained'}
                      </div>
                      <div className="scenario3-mini-bars">
                        <div>
                          <div className="scenario3-mini-bar-head"><span>Action Completion</span><span style={{ color: T.green }}>{selectedMember.actionCompletion}%</span></div>
                          <div className="scenario3-mini-bar-track"><div className="scenario3-mini-bar-fill" style={{ width: `${selectedMember.actionCompletion}%`, background: T.green }} /></div>
                        </div>
                        <div>
                          <div className="scenario3-mini-bar-head"><span>Avg. Sentiment</span><span style={{ color: sentColor(selectedMember.sentiment) }}>{Math.round(selectedMember.sentiment * 100)}%</span></div>
                          <div className="scenario3-mini-bar-track"><div className="scenario3-mini-bar-fill" style={{ width: `${selectedMember.sentiment * 100}%`, background: sentColor(selectedMember.sentiment) }} /></div>
                        </div>
                      </div>
                    </div>
                    <div className="card scenario3-panel scenario3-coaching-panel">
                      <div className="scenario3-panel-title">Coaching Brief <span className="scenario3-badge">AI-Powered</span></div>
                      {!aiInsight && !loadingInsight && (
                        <div className="scenario3-coaching-cta">
                          <div className="scenario3-coaching-cta-icon">◈</div>
                          <p>Generate a personalized AI coaching brief for {selectedMember.name.split(' ')[0]} based on their meeting data.</p>
                          <button type="button" className="scenario3-coaching-btn" onClick={generateInsight}>GENERATE COACHING BRIEF →</button>
                        </div>
                      )}
                      {loadingInsight && (
                        <div className="scenario3-coaching-loading">
                          <div>ANALYZING MEETING DATA...</div>
                          <div className="scenario3-blink-dots">
                            {[0, 1, 2].map((i) => <span key={i} className="scenario3-blink-dot" />)}
                          </div>
                        </div>
                      )}
                      {aiInsight && (
                        <div className="scenario3-coaching-result">
                          <p className="scenario3-coaching-text">{aiInsight}</p>
                          <button type="button" className="scenario3-coaching-regenerate" onClick={generateInsight}>↻ Regenerate</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'meetings' && (
                  <div className="scenario3-meetings-tab">
                    <div className="card scenario3-panel">
                      <div className="scenario3-panel-title">Recent Meetings <span className="scenario3-badge">{selectedMember.meetings} Total</span></div>
                      <div className="scenario3-meeting-list">
                        {selectedMember.recentMeetings.map((m, i) => (
                          <div key={i} className="scenario3-meeting-row" style={{ borderLeftColor: scoreColor(m.score) }}>
                            <div className="scenario3-meeting-info">
                              <div className="scenario3-meeting-title">{m.title}</div>
                              <div className="scenario3-meeting-meta">
                                <span>{m.date} · {m.duration}min</span>
                                {m.flags.map((f) => {
                                  const s = FLAG_STYLES[f] || {};
                                  return (
                                    <span key={f} className="scenario3-flag-badge" style={{ backgroundColor: s.bg, color: s.text }}>{f}</span>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="scenario3-meeting-score-wrap">
                              <span className="scenario3-meeting-score" style={{ color: scoreColor(m.score) }}>{m.score}</span>
                              <span className="scenario3-meeting-sentiment" style={{ color: sentColor(m.sentiment === 'positive' ? 0.9 : m.sentiment === 'neutral' ? 0.6 : 0.3) }}>{m.sentiment.toUpperCase()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="card scenario3-panel">
                      <div className="scenario3-panel-title">Team Score Trajectory <span className="scenario3-badge">4-Week Trend</span></div>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={TEAM_TRENDS}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="week" tick={{ fill: 'var(--muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                          <YAxis domain={[60, 100]} tick={{ fill: 'var(--muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ fontSize: 9 }} />
                          <Line type="monotone" dataKey="Sarah" stroke={T.orange} strokeWidth={2} dot={{ r: 3, fill: T.orange }} />
                          <Line type="monotone" dataKey="Marcus" stroke={T.purple} strokeWidth={2} dot={{ r: 3, fill: T.purple }} />
                          <Line type="monotone" dataKey="Priya" stroke={T.green} strokeWidth={2} dot={{ r: 3, fill: T.green }} />
                          <Line type="monotone" dataKey="James" stroke={T.red} strokeWidth={2} dot={{ r: 3, fill: T.red }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="card scenario3-panel">
                      <div className="scenario3-panel-title">Meeting Sentiment Timeline <span className="scenario3-badge">Team-Wide</span></div>
                      <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={SENTIMENT_TIMELINE}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="date" tick={{ fill: 'var(--muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: 'var(--muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="positive" stackId="1" stroke={T.green} fill={`${T.green}22`} strokeWidth={1.5} />
                          <Area type="monotone" dataKey="neutral" stackId="1" stroke={T.yellow} fill={`${T.yellow}22`} strokeWidth={1.5} />
                          <Area type="monotone" dataKey="negative" stackId="1" stroke={T.red} fill={`${T.red}22`} strokeWidth={1.5} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {activeTab === 'plan' && (
                  <div className="scenario3-plan-tab">
                    <div className="card scenario3-panel scenario3-plan-panel">
                      <div className="scenario3-panel-title">90-Day Improvement Plan <span className="scenario3-badge">AI-Generated</span></div>
                      <p className="scenario3-plan-intro">
                        Personalized coaching roadmap for <strong>{selectedMember.name}</strong> based on Fathom AI transcript analysis across {selectedMember.meetings} meetings this period.
                      </p>
                      <div className="scenario3-improvement-list">
                        {selectedMember.improvementPlan.map((item, i) => (
                          <div key={i} className="scenario3-improvement-item" style={{ borderLeftColor: prioColor(item.priority) }}>
                            <div className="scenario3-improvement-head">
                              <span className="scenario3-prio" style={{ color: prioColor(item.priority) }}>{item.priority.toUpperCase()} PRIORITY</span>
                              <span className="scenario3-due">· Due: {item.due}</span>
                            </div>
                            <div className="scenario3-improvement-area">{item.area}</div>
                            <div className="scenario3-improvement-action">{item.action}</div>
                            <div className="scenario3-improvement-num">0{i + 1}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="card scenario3-panel">
                      <div className="scenario3-panel-title">Topic Frequency <span className="scenario3-badge">All Meetings</span></div>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={TOPIC_DIST} layout="vertical">
                          <CartesianGrid stroke="var(--border)" horizontal={false} />
                          <XAxis type="number" tick={{ fill: 'var(--muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="topic" tick={{ fill: 'var(--text2)', fontSize: 9 }} axisLine={false} tickLine={false} width={90} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="count" radius={[0, 6, 6, 0]} fill={T.orange} fillOpacity={0.7} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="card scenario3-panel scenario3-cpo-actions">
                      <div className="scenario3-panel-title">CPO Action Items <span className="scenario3-badge">For You</span></div>
                      <div className="scenario3-cpo-list">
                        {[
                          { text: `Schedule 1:1 with ${selectedMember.name.split(' ')[0]} to review this plan`, due: 'This week' },
                          { text: `Observe one live meeting led by ${selectedMember.name.split(' ')[0]} to validate transcript insights`, due: 'Next 2 weeks' },
                          { text: 'Set milestone check-in to review improvement on top flag areas', due: '30 days' },
                          { text: `Share positive reinforcement on ${selectedMember.strengths[0].toLowerCase()} in next team standup`, due: 'Immediate' },
                        ].map((a, i) => (
                          <div key={i} className="scenario3-cpo-item">
                            <span className="scenario3-cpo-check" />
                            <span className="scenario3-cpo-text">{a.text}</span>
                            <span className="scenario3-cpo-due">{a.due}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
