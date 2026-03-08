import { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// App color palette
const T = {
  bg: 'var(--bg)',
  surface: 'var(--surface)',
  card: 'var(--charcoal2)',
  border: 'var(--border)',
  text: 'var(--text)',
  sub: 'var(--text2)',
  muted: 'var(--muted)',
  orange: 'var(--orange)',
  green: 'var(--green)',
  red: 'var(--red)',
  blue: 'var(--blue)',
  purple: 'var(--purple)',
  yellow: 'var(--yellow)',
};

const CLIENTS = [
  {
    id: 1,
    name: 'Meridian Capital Group',
    contact: 'Sarah Chen',
    title: 'VP of Operations',
    email: 's.chen@meridiancap.com',
    avatar: 'SC',
    tier: 'Enterprise',
    health: 87,
    arr: '$2.4M',
    since: 'Mar 2021',
    csm: 'James Okafor',
    lastMeeting: 'Feb 28, 2026',
    nextMeeting: 'Mar 14, 2026',
    meetingCount: 47,
    riskLevel: 'low',
    nps: 9,
    sentiment: 'positive',
    tags: ['Expansion Candidate', 'Power User', 'Referral Source'],
    summary: 'Meridian Capital is a high-value, deeply embedded client. Sarah Chen is the primary champion and has consistently driven internal adoption across 3 business units. They are evaluating an expansion to the Asia-Pacific team (~40 seats). Key pain point remains reporting latency during quarter-end. They have referred two prospects in the last 6 months. Renewal is secure — focus energy on expansion discovery and executive relationship with their new CTO, David Lim.',
    aiGuidance: [
      'Prioritize intro to David Lim (new CTO) — Sarah mentioned he is eager to assess the platform roadmap.',
      'Follow up on the APAC expansion proposal sent Feb 20 — decision expected by mid-March.',
      'Acknowledge their Q4 reporting pain; share the ETA for the new async export feature (Q2 roadmap).',
      'Reference their internal success story — they reduced reconciliation time by 34%. Great for QBR slides.',
    ],
    risks: [],
    opportunities: ['APAC seat expansion (~40 seats)', 'Executive alignment with new CTO', 'Case study / reference potential'],
    sentiment_history: [
      { month: 'Sep', score: 72 }, { month: 'Oct', score: 78 }, { month: 'Nov', score: 74 },
      { month: 'Dec', score: 80 }, { month: 'Jan', score: 85 }, { month: 'Feb', score: 87 },
    ],
    topics: [
      { topic: 'Reporting', count: 18 }, { topic: 'Integrations', count: 12 }, { topic: 'Onboarding', count: 8 },
      { topic: 'Pricing', count: 5 }, { topic: 'Roadmap', count: 14 }, { topic: 'Support', count: 6 },
    ],
    meetings: [
      { date: 'Feb 28, 2026', type: 'QBR', rep: 'James Okafor', duration: '52 min', sentiment: 'positive', summary: 'Strong QBR. Sarah praised onboarding speed for new hires. APAC expansion discussed in depth. CTO intro planned for March.' },
      { date: 'Feb 10, 2026', type: 'Check-in', rep: 'James Okafor', duration: '28 min', sentiment: 'neutral', summary: 'Minor friction around report export times at quarter-end. Escalated to product. Sarah satisfied with responsiveness.' },
      { date: 'Jan 22, 2026', type: 'Discovery', rep: 'James Okafor', duration: '41 min', sentiment: 'positive', summary: 'Expansion discovery call. Mapped APAC org structure. ~40 seats identified. Proposal requested by Feb 20.' },
    ],
    radar: [
      { axis: 'Engagement', val: 92 }, { axis: 'Adoption', val: 85 }, { axis: 'Satisfaction', val: 87 },
      { axis: 'Expansion', val: 78 }, { axis: 'Support Burden', val: 30 }, { axis: 'Advocacy', val: 90 },
    ],
    interactions: [
      { week: 'W1 Jan', calls: 1, emails: 3 }, { week: 'W2 Jan', calls: 0, emails: 2 },
      { week: 'W3 Jan', calls: 2, emails: 4 }, { week: 'W4 Jan', calls: 1, emails: 2 },
      { week: 'W1 Feb', calls: 1, emails: 3 }, { week: 'W2 Feb', calls: 0, emails: 1 },
      { week: 'W3 Feb', calls: 1, emails: 4 }, { week: 'W4 Feb', calls: 2, emails: 3 },
    ],
  },
  {
    id: 2,
    name: 'Novex Healthcare',
    contact: 'Dr. Marcus Webb',
    title: 'Chief Digital Officer',
    email: 'm.webb@novexhealth.com',
    avatar: 'MW',
    tier: 'Mid-Market',
    health: 52,
    arr: '$680K',
    since: 'Jan 2023',
    csm: 'Priya Nair',
    lastMeeting: 'Feb 19, 2026',
    nextMeeting: 'Mar 5, 2026',
    riskLevel: 'high',
    nps: 5,
    sentiment: 'negative',
    meetingCount: 19,
    tags: ['At Risk', 'Low Adoption', 'Exec Escalation'],
    summary: 'Novex Healthcare is at risk. Adoption metrics have stalled at 38% of licensed seats, primarily due to poor onboarding of clinical staff. Dr. Webb is frustrated with the pace of custom integration work for their EHR system. A competitor evaluation was mentioned in the Feb 19 call. Executive escalation from our side is recommended. The renewal is in 5 months — immediate intervention required.',
    aiGuidance: [
      'Do NOT lead with features — Dr. Webb is outcome-focused. Frame everything around clinical efficiency gains.',
      'Acknowledge the EHR integration delays directly. Come with a concrete revised timeline before the next call.',
      'Propose an executive-to-executive call between your VP CS and their CDO to reset the relationship.',
      'Prepare a 90-day success plan with measurable milestones to rebuild confidence.',
    ],
    risks: ['Competitor evaluation underway', 'Low seat adoption (38%)', 'EHR integration delayed 6 weeks', 'Renewal in 5 months'],
    opportunities: ['EHR integration completion could unlock 3 more departments'],
    sentiment_history: [
      { month: 'Sep', score: 68 }, { month: 'Oct', score: 60 }, { month: 'Nov', score: 55 },
      { month: 'Dec', score: 58 }, { month: 'Jan', score: 50 }, { month: 'Feb', score: 52 },
    ],
    topics: [
      { topic: 'Integration', count: 22 }, { topic: 'Adoption', count: 17 }, { topic: 'Support', count: 15 },
      { topic: 'Pricing', count: 9 }, { topic: 'Roadmap', count: 6 }, { topic: 'Reporting', count: 4 },
    ],
    meetings: [
      { date: 'Feb 19, 2026', type: 'Risk Review', rep: 'Priya Nair', duration: '38 min', sentiment: 'negative', summary: 'Tense call. Dr. Webb mentioned evaluating alternatives. Cited EHR delays and adoption challenges. Requested exec escalation path.' },
      { date: 'Jan 30, 2026', type: 'Check-in', rep: 'Priya Nair', duration: '22 min', sentiment: 'neutral', summary: 'Discussed adoption blockers with clinical staff. Agreed on a training bootcamp for February. Integration timeline remains a concern.' },
      { date: 'Jan 12, 2026', type: 'Support Review', rep: 'Priya Nair', duration: '45 min', sentiment: 'negative', summary: 'Escalated support ticket for EHR connector. Dev team joined call. Timeline extended by 6 weeks — Dr. Webb visibly frustrated.' },
    ],
    radar: [
      { axis: 'Engagement', val: 55 }, { axis: 'Adoption', val: 38 }, { axis: 'Satisfaction', val: 52 },
      { axis: 'Expansion', val: 20 }, { axis: 'Support Burden', val: 80 }, { axis: 'Advocacy', val: 25 },
    ],
    interactions: [
      { week: 'W1 Jan', calls: 0, emails: 2 }, { week: 'W2 Jan', calls: 1, emails: 4 },
      { week: 'W3 Jan', calls: 0, emails: 1 }, { week: 'W4 Jan', calls: 2, emails: 5 },
      { week: 'W1 Feb', calls: 1, emails: 3 }, { week: 'W2 Feb', calls: 0, emails: 2 },
      { week: 'W3 Feb', calls: 1, emails: 6 }, { week: 'W4 Feb', calls: 1, emails: 4 },
    ],
  },
  {
    id: 3,
    name: 'Thornfield Logistics',
    contact: 'Emily Hartmann',
    title: 'Head of Strategy',
    email: 'e.hartmann@thornfield.io',
    avatar: 'EH',
    tier: 'SMB',
    health: 74,
    arr: '$290K',
    since: 'Aug 2022',
    csm: 'Carlos Reyes',
    lastMeeting: 'Mar 3, 2026',
    nextMeeting: 'Apr 1, 2026',
    riskLevel: 'medium',
    nps: 7,
    sentiment: 'positive',
    meetingCount: 31,
    tags: ['Stable', 'Renewal Due Q3', 'Upsell Potential'],
    summary: 'Thornfield Logistics is a steady, well-maintained relationship. Emily Hartmann is pragmatic and data-driven — she responds well to ROI framing. Platform usage is solid at ~75% seat utilization. Their main frustration is the lack of a native mobile app, which affects field logistics managers. Renewal is in Q3 2026 and should be straightforward if the mobile gap is addressed.',
    aiGuidance: [
      'Lead with ROI data — Emily will appreciate seeing their utilization benchmarked against industry peers.',
      'Mention the mobile app beta program — they qualify and this directly addresses their top pain point.',
      'Explore the freight brokerage division as an expansion opportunity. They mentioned a Q2 team launch.',
      'Keep calls concise — Emily prefers 20-30 min focused check-ins over long reviews.',
    ],
    risks: ['Mobile app gap is a known pain point', 'Renewal due Q3 2026'],
    opportunities: ['New freight brokerage division (Q2 launch)', 'Mobile beta program enrollment', 'Seat upsell if division grows'],
    sentiment_history: [
      { month: 'Sep', score: 70 }, { month: 'Oct', score: 72 }, { month: 'Nov', score: 68 },
      { month: 'Dec', score: 73 }, { month: 'Jan', score: 74 }, { month: 'Feb', score: 74 },
    ],
    topics: [
      { topic: 'Mobile', count: 14 }, { topic: 'Reporting', count: 11 }, { topic: 'Integrations', count: 9 },
      { topic: 'Roadmap', count: 8 }, { topic: 'Pricing', count: 6 }, { topic: 'Support', count: 3 },
    ],
    meetings: [
      { date: 'Mar 3, 2026', type: 'Check-in', rep: 'Carlos Reyes', duration: '24 min', sentiment: 'positive', summary: 'Productive check-in. Emily pleased with recent dashboard updates. Raised mobile app again. Discussed freight division plans for Q2.' },
      { date: 'Feb 5, 2026', type: 'QBR', rep: 'Carlos Reyes', duration: '45 min', sentiment: 'positive', summary: 'Smooth QBR. 74% seat utilization. Emily requested field manager workflow demo. Mobile shortfall acknowledged — roadmap shared.' },
      { date: 'Jan 10, 2026', type: 'Check-in', rep: 'Carlos Reyes', duration: '20 min', sentiment: 'neutral', summary: 'Quick sync. No major issues. Emily asked about API rate limits for their warehouse integrations. Resolved async.' },
    ],
    radar: [
      { axis: 'Engagement', val: 74 }, { axis: 'Adoption', val: 75 }, { axis: 'Satisfaction', val: 74 },
      { axis: 'Expansion', val: 60 }, { axis: 'Support Burden', val: 25 }, { axis: 'Advocacy', val: 65 },
    ],
    interactions: [
      { week: 'W1 Jan', calls: 1, emails: 2 }, { week: 'W2 Jan', calls: 0, emails: 1 },
      { week: 'W3 Jan', calls: 0, emails: 2 }, { week: 'W4 Jan', calls: 1, emails: 1 },
      { week: 'W1 Feb', calls: 0, emails: 2 }, { week: 'W2 Feb', calls: 1, emails: 3 },
      { week: 'W3 Feb', calls: 0, emails: 1 }, { week: 'W4 Feb', calls: 1, emails: 2 },
    ],
  },
];

const sentimentColor = { positive: T.green, neutral: T.yellow, negative: T.red };
const riskBadge = {
  low: { bg: 'rgba(0,196,140,0.2)', text: T.green, label: 'Low Risk' },
  medium: { bg: 'rgba(255,102,0,0.2)', text: T.orange, label: 'Med Risk' },
  high: { bg: 'rgba(255,59,92,0.2)', text: T.red, label: 'High Risk' },
};
const tierColor = { Enterprise: T.purple, 'Mid-Market': T.blue, SMB: T.green };
const TOPIC_BAR_COLORS = [T.purple, T.blue, T.green, T.orange, T.yellow, '#f472b6'];

function HealthRing({ score }) {
  const r = 28;
  const cx = 36;
  const cy = 36;
  const circumference = 2 * Math.PI * r;
  const dashFilled = (score / 100) * circumference;
  const color = score >= 75 ? T.green : score >= 55 ? T.yellow : T.red;

  return (
    <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }} className="scenario2-health-ring">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={`${dashFilled} ${circumference - dashFilled}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          transform: 'rotate(90deg)',
          transformOrigin: `${cx}px ${cy}px`,
          fill: color,
          fontSize: '14px',
          fontWeight: 700,
          fontFamily: 'monospace',
        }}
      >
        {score}
      </text>
    </svg>
  );
}

function Tag({ label, color }) {
  return (
    <span className="scenario2-tag" style={{ background: `${color}22`, color, borderColor: `${color}44` }}>
      {label}
    </span>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="scenario2-tooltip">
      <p className="scenario2-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || T.text }}>
          {p.name}: <b>{p.value}</b>
        </p>
      ))}
    </div>
  );
}

const TEAM_ACTIVITY = [
  { name: 'James Okafor', meetings: 14, clients: 5 },
  { name: 'Priya Nair', meetings: 11, clients: 4 },
  { name: 'Carlos Reyes', meetings: 9, clients: 5 },
];

export default function Scenario2({ onBack }) {
  const [selected, setSelected] = useState(CLIENTS[0]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const c = selected;
  const risk = riskBadge[c.riskLevel];

  return (
    <div className="scenario2-page">
      <header className="scenario2-header">
        <div className="scenario2-header-left">
          {onBack && (
            <button type="button" className="scenario1-back-btn" onClick={onBack} aria-label="Back to Scenarios">
              ← Back
            </button>
          )}
          <div className="scenario2-header-logo">
            <div className="scenario2-header-logo-icon">◈</div>
            <div>
              <h1 className="scenario2-header-title">Client Pulse Dashboard</h1>
              <p className="scenario2-header-sub">AI-Powered Client Intelligence</p>
            </div>
          </div>
        </div>
        <div className="scenario2-header-right">
          <div className="scenario2-sync">
            <span className="scenario2-pulse-dot" />
            <span>Fathom AI Sync: Live</span>
          </div>
          <div className="scenario2-user-chip">
            <span className="scenario2-user-avatar">D</span>
            <span>Director, CS</span>
          </div>
        </div>
      </header>

      <div className="scenario2-body">
        <aside className="scenario2-sidebar">
          <div className="scenario2-sidebar-label">Clients · {CLIENTS.length}</div>
          {CLIENTS.map((cl) => (
            <button
              key={cl.id}
              type="button"
              className={`scenario2-client-item ${selected.id === cl.id ? 'active' : ''}`}
              onClick={() => { setSelected(cl); setActiveTab('overview'); }}
            >
              <div className="scenario2-client-avatar" style={{ borderColor: tierColor[cl.tier], color: tierColor[cl.tier] }}>
                {cl.avatar}
              </div>
              <div className="scenario2-client-info">
                <span className="scenario2-client-name">{cl.name}</span>
                <div className="scenario2-client-meta">
                  <span style={{ color: tierColor[cl.tier] }}>{cl.tier}</span>
                  <span>·</span>
                  <span style={{ color: riskBadge[cl.riskLevel].text }}>{riskBadge[cl.riskLevel].label}</span>
                </div>
              </div>
              <span className="scenario2-client-health" style={{ color: cl.health >= 75 ? T.green : cl.health >= 55 ? T.yellow : T.red }}>
                {cl.health}
              </span>
            </button>
          ))}
          <div className="scenario2-team-panel">
            <div className="scenario2-sidebar-label">Team Activity · 30d</div>
            {TEAM_ACTIVITY.map((rep) => (
              <div key={rep.name} className="scenario2-team-row">
                <div className="scenario2-team-avatar">{rep.name[0]}</div>
                <div>
                  <div className="scenario2-team-name">{rep.name}</div>
                  <div className="scenario2-team-meta">{rep.meetings} meetings · {rep.clients} clients</div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="scenario2-main">
          <div className={`scenario2-client-header ${loaded ? 'fade-in' : ''}`}>
            <div className="scenario2-client-header-inner">
              <div className="scenario2-client-identity">
                <div className="scenario2-client-avatar-lg" style={{ borderColor: tierColor[c.tier], color: tierColor[c.tier] }}>
                  {c.avatar}
                </div>
                <div>
                  <div className="scenario2-client-header-row">
                    <h2 className="scenario2-client-title">{c.name}</h2>
                    <span className="scenario2-badge" style={{ borderColor: tierColor[c.tier], color: tierColor[c.tier] }}>{c.tier}</span>
                    <span className="scenario2-badge scenario2-risk-badge" style={{ background: risk.bg, color: risk.text }}>{risk.label}</span>
                  </div>
                  <div className="scenario2-contact">{c.contact} · {c.title} · {c.email}</div>
                  <div className="scenario2-tags">
                    {c.tags.map((t) => (
                      <Tag key={t} label={t} color={c.riskLevel === 'high' ? T.red : c.riskLevel === 'medium' ? T.orange : T.blue} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="scenario2-kpi-strip">
                <div className="scenario2-health-wrap">
                  <HealthRing score={c.health} />
                  <span>Health</span>
                </div>
                {[
                  { label: 'ARR', value: c.arr, color: T.green },
                  { label: 'Since', value: c.since, color: T.sub },
                  { label: 'Meetings', value: c.meetingCount, color: T.blue },
                  { label: 'NPS', value: `${c.nps}/10`, color: c.nps >= 8 ? T.green : c.nps >= 6 ? T.yellow : T.red },
                  { label: 'CSM', value: c.csm.split(' ')[0], color: T.purple },
                ].map((kpi) => (
                  <div key={kpi.label} className="scenario2-kpi-mini">
                    <span className="scenario2-kpi-value" style={{ color: kpi.color }}>{kpi.value}</span>
                    <span className="scenario2-kpi-label">{kpi.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <nav className="scenario2-tabs">
              {['overview', 'meetings', 'analytics', 'guidance'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`scenario2-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="scenario2-content">
            {activeTab === 'overview' && (
              <div className={`scenario2-overview ${loaded ? 'fade-in' : ''}`}>
                <div className="scenario2-overview-left">
                  <div className="card scenario2-card">
                    <div className="scenario2-card-head">
                      <span>◈</span>
                      <span>AI Relationship Summary</span>
                      <span className="scenario2-card-meta">Updated via Fathom · {c.lastMeeting}</span>
                    </div>
                    <p className="scenario2-summary-text">{c.summary}</p>
                  </div>
                  <div className="card scenario2-card">
                    <div className="scenario2-card-title">Sentiment Trend · 6 months</div>
                    <ResponsiveContainer width="100%" height={130}>
                      <AreaChart data={c.sentiment_history}>
                        <defs>
                          <linearGradient id="s2-sentGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--blue)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="score" name="Sentiment Score" stroke="var(--blue)" fill="url(#s2-sentGrad)" strokeWidth={2} dot={{ fill: 'var(--blue)', r: 3 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="card scenario2-card">
                    <div className="scenario2-card-title">Interaction Frequency · Jan–Feb</div>
                    <ResponsiveContainer width="100%" height={120}>
                      <BarChart data={c.interactions} barSize={8} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="week" tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="calls" name="Calls" fill="var(--purple)" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="emails" name="Emails" fill="var(--blue)" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="scenario2-overview-right">
                  {c.risks.length > 0 && (
                    <div className="card scenario2-card scenario2-risks">
                      <div className="scenario2-card-title scenario2-risks-title">⚠ Risk Signals</div>
                      {c.risks.map((r) => (
                        <div key={r} className="scenario2-list-item scenario2-risk-item">
                          <span className="scenario2-dot" style={{ background: T.red }} />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="card scenario2-card scenario2-opportunities">
                    <div className="scenario2-card-title scenario2-opps-title">◆ Opportunities</div>
                    {c.opportunities.map((o) => (
                      <div key={o} className="scenario2-list-item scenario2-opp-item">
                        <span className="scenario2-dot" style={{ background: T.green }} />
                        <span>{o}</span>
                      </div>
                    ))}
                  </div>
                  <div className="card scenario2-card">
                    <div className="scenario2-card-title">Top Topics · All Meetings</div>
                    {[...c.topics].sort((a, b) => b.count - a.count).slice(0, 6).map((t, i) => {
                      const max = Math.max(...c.topics.map((x) => x.count));
                      const pct = (t.count / max) * 100;
                      return (
                        <div key={t.topic} className="scenario2-topic-row">
                          <span className="scenario2-topic-label">{t.topic}</span>
                          <span className="scenario2-topic-count">{t.count}</span>
                          <div className="scenario2-pct-track">
                            <div className="scenario2-pct-fill" style={{ width: `${pct}%`, background: TOPIC_BAR_COLORS[i % TOPIC_BAR_COLORS.length] }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="card scenario2-card">
                    <div className="scenario2-card-title">Schedule</div>
                    {[
                      { label: 'Last Meeting', val: c.lastMeeting, color: T.blue },
                      { label: 'Next Meeting', val: c.nextMeeting, color: T.green },
                      { label: 'CSM Assigned', val: c.csm, color: T.purple },
                    ].map((item) => (
                      <div key={item.label} className="scenario2-schedule-row">
                        <span>{item.label}</span>
                        <span style={{ color: item.color }}>{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'meetings' && (
              <div className={`scenario2-meetings ${loaded ? 'fade-in' : ''}`}>
                <div className="card scenario2-card">
                  <div className="scenario2-meetings-head">Meeting History · {c.meetingCount} total via Fathom</div>
                  {c.meetings.map((m, i) => (
                    <div key={i} className="scenario2-meeting-row">
                      <div className="scenario2-meeting-type">
                        <span style={{ color: sentimentColor[m.sentiment] }}>{m.type}</span>
                        <span className="scenario2-meeting-dur">{m.duration}</span>
                      </div>
                      <div className="scenario2-meeting-body">
                        <div className="scenario2-meeting-meta">
                          <span>{m.date}</span>
                          <span>by {m.rep}</span>
                          <span className="scenario2-sentiment-pill" style={{ background: `${sentimentColor[m.sentiment]}22`, color: sentimentColor[m.sentiment] }}>{m.sentiment}</span>
                        </div>
                        <p>{m.summary}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className={`scenario2-analytics ${loaded ? 'fade-in' : ''}`}>
                <div className="card scenario2-card scenario2-radar-wrap">
                  <div className="scenario2-card-title">Relationship Health Radar</div>
                  <ResponsiveContainer width="100%" height={240}>
                    <RadarChart data={c.radar}>
                      <defs>
                        <radialGradient id="s2-radar-grad" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="var(--purple)" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="var(--purple)" stopOpacity={0.12} />
                        </radialGradient>
                      </defs>
                      <PolarGrid stroke="rgba(255,255,255,0.18)" strokeWidth={1.2} />
                      <PolarAngleAxis dataKey="axis" tick={{ fill: 'var(--text2)', fontSize: 11 }} />
                      <Radar name="Score" dataKey="val" stroke="var(--purple)" fill="url(#s2-radar-grad)" fillOpacity={1} isAnimationActive animationDuration={1200} animationEasing="ease-out" />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="card scenario2-card">
                  <div className="scenario2-card-title">Sentiment Score · 6 months</div>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={c.sentiment_history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="score" name="Score" stroke="var(--blue)" strokeWidth={2.5} dot={{ fill: 'var(--blue)', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="card scenario2-card scenario2-topics-full">
                  <div className="scenario2-card-title">Topic Frequency · All Meetings</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={c.topics} barSize={30}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="topic" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Mentions" radius={[4, 4, 0, 0]}>
                        {c.topics.map((_, i) => (
                          <Cell key={i} fill={TOPIC_BAR_COLORS[i % TOPIC_BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'guidance' && (
              <div className={`scenario2-guidance ${loaded ? 'fade-in' : ''}`}>
                <div className="card scenario2-card scenario2-guidance-panel">
                  <div className="scenario2-guidance-head">
                    <span>◈</span>
                    <div>
                      <div className="scenario2-guidance-title">AI Guidance for Next Interaction</div>
                      <div className="scenario2-guidance-meta">Generated from {c.meetingCount} Fathom transcripts · {c.lastMeeting}</div>
                    </div>
                  </div>
                  {c.aiGuidance.map((g, i) => (
                    <div key={i} className="scenario2-guidance-item">
                      <div className="scenario2-guidance-num">{i + 1}</div>
                      <p>{g}</p>
                    </div>
                  ))}
                </div>
                {c.risks.length > 0 && (
                  <div className="card scenario2-card scenario2-risks-grid">
                    <div className="scenario2-card-title scenario2-risks-title">⚠ Active Risk Flags</div>
                    <div className="scenario2-risks-grid-inner">
                      {c.risks.map((r) => (
                        <div key={r} className="scenario2-risk-card">
                          <span className="scenario2-dot" style={{ background: T.red }} />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="card scenario2-card scenario2-opps-grid">
                  <div className="scenario2-card-title scenario2-opps-title">◆ Expansion Opportunities</div>
                  <div className="scenario2-opps-grid-inner">
                    {c.opportunities.map((o) => (
                      <div key={o} className="scenario2-opp-card">
                        <span className="scenario2-dot" style={{ background: T.green }} />
                        <span>{o}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card scenario2-card">
                  <div className="scenario2-card-title scenario2-new-account-title">👤 New to this Account? Start Here.</div>
                  <div className="scenario2-new-account-grid">
                    {[
                      { label: 'Primary Contact', val: c.contact, sub: c.title },
                      { label: 'Communication Style', val: 'Data-driven', sub: 'Prefers concise, ROI-framed updates' },
                      { label: 'Relationship Since', val: c.since, sub: `${c.meetingCount} meetings logged` },
                      { label: 'Current Mood', val: c.sentiment.charAt(0).toUpperCase() + c.sentiment.slice(1), sub: `NPS: ${c.nps}/10`, color: sentimentColor[c.sentiment] },
                      { label: 'Top Priority', val: c.topics[0]?.topic, sub: 'Most discussed topic' },
                      { label: 'Assigned CSM', val: c.csm, sub: 'Your go-to for context' },
                    ].map((item) => (
                      <div key={item.label} className="scenario2-new-account-cell">
                        <div className="scenario2-new-account-label">{item.label}</div>
                        <div className="scenario2-new-account-val" style={{ color: item.color || 'var(--text)' }}>{item.val}</div>
                        <div className="scenario2-new-account-sub">{item.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
