import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, LineChart, Line, CartesianGrid, Legend,
  Treemap,
} from 'recharts';

const T = {
  orange: 'var(--orange)',
  green: 'var(--green)',
  red: 'var(--red)',
  blue: 'var(--blue)',
  yellow: 'var(--yellow)',
  purple: 'var(--purple)',
  text: 'var(--text)',
  text2: 'var(--text2)',
  muted: 'var(--muted)',
  border: 'var(--border)',
  surface: 'var(--surface)',
};

const PERIODS = ['Last 2 Weeks', 'Last Month', 'Last Quarter'];

const talkTimeData = [
  { role: 'CEO / C-Suite', pct: 38, minutes: 214, color: T.orange },
  { role: 'Senior Leadership', pct: 24, minutes: 135, color: T.red },
  { role: 'Team Leads', pct: 21, minutes: 118, color: T.blue },
  { role: 'Individual Contributors', pct: 11, minutes: 62, color: T.purple },
  { role: 'External / Guests', pct: 6, minutes: 34, color: T.yellow },
];

const decisionDrivers = [
  { name: 'Marcus Chen (CEO)', score: 91, meetings: 12 },
  { name: 'Priya Nair (VP Eng)', score: 74, meetings: 9 },
  { name: 'Daniel Ortiz (VP Sales)', score: 68, meetings: 11 },
  { name: 'Sofia Müller (VP Prod)', score: 61, meetings: 8 },
  { name: 'James Okafor (Lead DS)', score: 42, meetings: 7 },
  { name: 'Aisha Tan (Lead Design)', score: 31, meetings: 6 },
  { name: 'Ravi Patel (Lead Infra)', score: 28, meetings: 5 },
];

const problemVsSolution = [
  { name: 'Marcus Chen', problems: -12, solutions: 31 },
  { name: 'Priya Nair', problems: -28, solutions: 19 },
  { name: 'Daniel Ortiz', problems: -41, solutions: 14 },
  { name: 'Sofia Müller', problems: -18, solutions: 26 },
  { name: 'James Okafor', problems: -34, solutions: 11 },
  { name: 'Aisha Tan', problems: -9, solutions: 22 },
  { name: 'Ravi Patel', problems: -52, solutions: 8 },
  { name: 'Lin Wei (QA)', problems: -19, solutions: 17 },
];

const interruptionMatrix = [
  { interrupter: 'Marcus Chen', target: 'Priya Nair', count: 7 },
  { interrupter: 'Marcus Chen', target: 'Daniel Ortiz', count: 4 },
  { interrupter: 'Daniel Ortiz', target: 'Sofia Müller', count: 9 },
  { interrupter: 'Priya Nair', target: 'James Okafor', count: 6 },
  { interrupter: 'Daniel Ortiz', target: 'Aisha Tan', count: 11 },
  { interrupter: 'Marcus Chen', target: 'Lin Wei', count: 8 },
  { interrupter: 'Priya Nair', target: 'Ravi Patel', count: 5 },
  { interrupter: 'Daniel Ortiz', target: 'Ravi Patel', count: 12 },
];

const engagementRadar = [
  { metric: 'Speaking Time', 'Team Leads': 62, 'Sr. Leadership': 88, ICs: 34 },
  { metric: 'Questions Asked', 'Team Leads': 55, 'Sr. Leadership': 71, ICs: 29 },
  { metric: 'Decisions Driven', 'Team Leads': 40, 'Sr. Leadership': 85, ICs: 18 },
  { metric: 'Action Items', 'Team Leads': 70, 'Sr. Leadership': 66, ICs: 42 },
  { metric: 'Agenda Items', 'Team Leads': 48, 'Sr. Leadership': 79, ICs: 22 },
  { metric: 'Follow-ups', 'Team Leads': 65, 'Sr. Leadership': 60, ICs: 38 },
];

const silentTeams = [
  { team: 'QA / Testing', avgSpeakPct: 4, meetings: 8, risk: 'critical' },
  { team: 'Infrastructure', avgSpeakPct: 7, meetings: 10, risk: 'high' },
  { team: 'Data Science', avgSpeakPct: 11, meetings: 7, risk: 'high' },
  { team: 'Design', avgSpeakPct: 14, meetings: 9, risk: 'medium' },
  { team: 'Frontend Eng', avgSpeakPct: 18, meetings: 11, risk: 'medium' },
  { team: 'Backend Eng', avgSpeakPct: 22, meetings: 12, risk: 'low' },
  { team: 'Sales', avgSpeakPct: 29, meetings: 10, risk: 'low' },
  { team: 'Product', avgSpeakPct: 33, meetings: 9, risk: 'low' },
];

const meetingPulse = [
  { week: 'W1', equity: 38, dominance: 72, participation: 54 },
  { week: 'W2', equity: 42, dominance: 68, participation: 61 },
  { week: 'W3', equity: 35, dominance: 79, participation: 49 },
  { week: 'W4', equity: 51, dominance: 61, participation: 67 },
  { week: 'W5', equity: 44, dominance: 65, participation: 63 },
  { week: 'W6', equity: 48, dominance: 58, participation: 71 },
];

const keyInsights = [
  { severity: 'critical', icon: '⚡', headline: 'Senior leadership holds 62% of speaking time', detail: 'In cross-functional syncs, C-Suite + VP tier speak for 62% of total meeting time. ICs average just 4.2 minutes per session.', tag: 'Voice Dominance' },
  { severity: 'critical', icon: '🔇', headline: 'QA & Infrastructure teams are effectively silent', detail: 'QA averages 4% speaking time. Infrastructure averages 7%. Both are present in 100% of stand-ups but contribute to under 5% of documented decisions.', tag: 'Disengagement' },
  { severity: 'warning', icon: '🚨', headline: 'Daniel Ortiz leads interruption count at 32 incidents', detail: 'Sales VP interrupts peers 32 times across 11 meetings — predominantly targeting Design and Infrastructure leads. Pattern suggests status-based silencing.', tag: 'Interruptions' },
  { severity: 'warning', icon: '🧩', headline: 'Problem-raising concentrated in middle management', detail: 'Team Leads raise 3.4× more problems than solutions. Sr. Leadership proposes 2.1× more solutions than they identify problems — a potential blind-spot dynamic.', tag: 'Problem vs. Solution' },
  { severity: 'positive', icon: '✅', headline: 'Participation equity improving week-over-week', detail: 'Equity score rose 38 → 48 over 6 weeks following the new structured-turn agenda rollout. Still below the healthy 60+ threshold.', tag: 'Trend' },
];

const treemapData = [
  { name: 'CEO', size: 214, fill: T.orange },
  { name: 'VP Eng', size: 98, fill: T.red },
  { name: 'VP Sales', size: 87, fill: T.red },
  { name: 'VP Product', size: 71, fill: T.red },
  { name: 'Lead DS', size: 52, fill: T.blue },
  { name: 'Lead Design', size: 44, fill: T.blue },
  { name: 'Lead Infra', size: 38, fill: T.blue },
  { name: 'Lead QA', size: 31, fill: T.blue },
  { name: 'ICs (avg)', size: 62, fill: T.purple },
  { name: 'Guests', size: 34, fill: T.yellow },
];

const riskColor = { critical: T.red, high: T.orange, medium: T.yellow, low: T.green };
const riskBg = {
  critical: 'rgba(255,59,92,0.1)',
  high: 'rgba(255,102,0,0.1)',
  medium: 'rgba(255,184,0,0.1)',
  low: 'rgba(0,196,140,0.1)',
};
const severityBorder = { critical: T.red, warning: T.orange, positive: T.green };
const driverBarColor = (i) => (i === 0 ? T.orange : i === 1 ? T.red : i === 2 ? T.yellow : T.blue);

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="scenario2-tooltip">
      <div className="scenario2-tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || T.text }}>{p.name}: <strong>{p.value}</strong></div>
      ))}
    </div>
  );
}

const methodologyCards = [
  { label: 'Talk Time Gini', weight: '30%', val: '0.61', note: 'Higher = more unequal' },
  { label: 'Decision Concentration', weight: '25%', val: '68%', note: '% held by top 2 speakers' },
  { label: 'Silent Participant Rate', weight: '25%', val: '22%', note: 'Spoke <2min total' },
  { label: 'Interruption Density', weight: '20%', val: '1.3/hr', note: 'Avg interruptions per hour' },
];

export default function Scenario4({ onBack }) {
  const [period, setPeriod] = useState('Last Month');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const dominanceScore = 72;
  const equityScore = 44;

  return (
    <div className={`scenario4-page ${loaded ? 'scenario4-loaded' : ''}`}>
      <header className="scenario4-header">
        <div className="scenario4-header-left">
          {onBack && (
            <button type="button" className="scenario1-back-btn" onClick={onBack} aria-label="Back to Scenarios">← Back</button>
          )}
          <div>
            <div className="scenario4-header-badge">◈ Fathom AI · Leadership Intelligence</div>
            <h1 className="scenario4-title">
              Leadership <span className="scenario4-title-accent">Visibility</span> Dashboard
            </h1>
            <p className="scenario4-sub">CEO · Powered by meeting transcript analysis across all Team Lead sessions</p>
          </div>
        </div>
        <div className="scenario4-period-wrap">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              className={`scenario4-period-btn ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </header>

      <div className="scenario4-body">
        <div className="scenario4-stat-row">
          <div className="card scenario4-stat-card" style={{ ['--stat-accent']: T.blue }}>
            <div className="scenario4-stat-accent" />
            <div className="scenario4-stat-label">Total Meetings</div>
            <div className="scenario4-stat-value">47</div>
            <div className="scenario4-stat-sub">across all team leads</div>
          </div>
          <div className="card scenario4-stat-card" style={{ ['--stat-accent']: T.purple }}>
            <div className="scenario4-stat-accent" />
            <div className="scenario4-stat-label">Total Talk Time</div>
            <div className="scenario4-stat-value">94.2h</div>
            <div className="scenario4-stat-sub">563 minutes avg/week</div>
          </div>
          <div className="card scenario4-stat-card" style={{ ['--stat-accent']: T.purple }}>
            <div className="scenario4-stat-accent" />
            <div className="scenario4-stat-label">Participants</div>
            <div className="scenario4-stat-value">138</div>
            <div className="scenario4-stat-sub">unique voices recorded</div>
          </div>
          <div className="card scenario4-stat-card" style={{ ['--stat-accent']: T.red }}>
            <div className="scenario4-stat-accent" />
            <div className="scenario4-stat-label">Voice Dominance</div>
            <div className="scenario4-stat-value">{dominanceScore}%</div>
            <div className="scenario4-stat-sub">held by top 3 speakers</div>
          </div>
          <div className="card scenario4-stat-card" style={{ ['--stat-accent']: T.orange }}>
            <div className="scenario4-stat-accent" />
            <div className="scenario4-stat-label">Equity Score</div>
            <div className="scenario4-stat-value">{equityScore}/100</div>
            <div className="scenario4-stat-sub">↑ 6pts from prior period</div>
          </div>
          <div className="card scenario4-stat-card" style={{ ['--stat-accent']: T.yellow }}>
            <div className="scenario4-stat-accent" />
            <div className="scenario4-stat-label">Silent Participants</div>
            <div className="scenario4-stat-value">31</div>
            <div className="scenario4-stat-sub">spoke &lt;2min per meeting</div>
          </div>
        </div>

        <section className="scenario4-section">
          <div className="scenario4-section-head">
            <div className="scenario4-section-bar" />
            <h2 className="scenario4-section-title">Key Insights</h2>
          </div>
          <p className="scenario4-section-sub">Auto-detected patterns from transcript analysis</p>
          <div className="scenario4-insight-list">
            {keyInsights.map((ins, i) => (
              <div
                key={i}
                className="card scenario4-insight-card"
                style={{ borderLeftColor: severityBorder[ins.severity], animationDelay: `${i * 0.08}s` }}
              >
                <span className="scenario4-insight-icon">{ins.icon}</span>
                <div className="scenario4-insight-body">
                  <div className="scenario4-insight-head">
                    <span className="scenario4-insight-headline">{ins.headline}</span>
                    <span className="scenario4-insight-tag" style={{ backgroundColor: `${severityBorder[ins.severity]}22`, color: severityBorder[ins.severity], borderColor: `${severityBorder[ins.severity]}44` }}>{ins.tag}</span>
                  </div>
                  <p className="scenario4-insight-detail">{ins.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="scenario4-grid scenario4-grid-2a">
          <div className="card scenario4-panel">
            <div className="scenario4-panel-head">
              <div className="scenario4-section-bar" />
              <h2 className="scenario4-panel-title">Talk Time Distribution</h2>
            </div>
            <p className="scenario4-panel-sub">by organizational role</p>
            <div className="scenario4-donut-wrap">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={talkTimeData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="pct" stroke="none">
                    {talkTimeData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="scenario4-legend">
              {talkTimeData.map((d, i) => (
                <div key={i} className="scenario4-legend-row">
                  <span className="scenario4-legend-dot" style={{ background: d.color }} />
                  <span className="scenario4-legend-label">{d.role}</span>
                  <span className="scenario4-legend-meta">{d.minutes}m</span>
                  <span className="scenario4-legend-pct" style={{ color: d.color }}>{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card scenario4-panel">
            <div className="scenario4-panel-head">
              <div className="scenario4-section-bar" />
              <h2 className="scenario4-panel-title">Speaking Volume Map</h2>
            </div>
            <p className="scenario4-panel-sub">area = total minutes spoken (all meetings)</p>
            <ResponsiveContainer width="100%" height={300}>
              <Treemap
                data={treemapData}
                dataKey="size"
                nameKey="name"
                aspectRatio={4 / 3}
                content={({ x, y, width, height, name, value, fill, payload }) => {
                const color = fill || payload?.fill || T.orange;
                return (
                  <g>
                    <rect x={x + 1} y={y + 1} width={width - 2} height={height - 2} fill={color} fillOpacity={0.8} rx={4} />
                    {width > 50 && height > 30 && (
                      <>
                        <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={600}>{name}</text>
                        <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={9}>{value}m</text>
                      </>
                    )}
                  </g>
                );
              }}
              />
            </ResponsiveContainer>
          </div>
        </div>

        <div className="scenario4-grid scenario4-grid-2">
          <div className="card scenario4-panel">
            <div className="scenario4-panel-head">
              <div className="scenario4-section-bar" />
              <h2 className="scenario4-panel-title">Decision Driver Index</h2>
            </div>
            <p className="scenario4-panel-sub">who initiates & closes decisions</p>
            <div className="scenario4-driver-list">
              {decisionDrivers.map((d, i) => (
                <div key={i} className="scenario4-driver-row">
                  <div className="scenario4-driver-head">
                    <span className="scenario4-driver-name">{d.name}</span>
                    <span className="scenario4-driver-score">{d.score}/100</span>
                  </div>
                  <div className="scenario4-driver-track">
                    <div className="scenario4-driver-fill" style={{ width: `${d.score}%`, background: driverBarColor(i) }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="scenario4-callout scenario4-callout-warn">
              ⚠ Top 2 individuals drive 68% of all documented decisions. Decision authority appears highly centralized.
            </div>
          </div>

          <div className="card scenario4-panel">
            <div className="scenario4-panel-head">
              <div className="scenario4-section-bar" />
              <h2 className="scenario4-panel-title">Problem vs. Solution Ratio</h2>
            </div>
            <p className="scenario4-panel-sub">negative = problem-raiser, positive = solution-driver</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={problemVsSolution} layout="vertical" margin={{ left: 90, right: 10 }}>
                <XAxis type="number" tick={{ fontSize: 9, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={88} tick={{ fontSize: 9, fill: 'var(--text2)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical horizontal={false} />
                <Bar dataKey="problems" name="Problems Raised" fill={T.red} fillOpacity={0.8} radius={[0, 3, 3, 0]} />
                <Bar dataKey="solutions" name="Solutions Proposed" fill={T.green} fillOpacity={0.8} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="scenario4-grid scenario4-grid-2b">
          <div className="card scenario4-panel">
            <div className="scenario4-panel-head">
              <div className="scenario4-section-bar" />
              <h2 className="scenario4-panel-title">Engagement Breakdown</h2>
            </div>
            <p className="scenario4-panel-sub">normalized score across 6 participation dimensions</p>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={engagementRadar}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--muted)', fontSize: 10 }} />
                <Radar name="Team Leads" dataKey="Team Leads" stroke={T.blue} fill={T.blue} fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Sr. Leadership" dataKey="Sr. Leadership" stroke={T.orange} fill={T.orange} fillOpacity={0.15} strokeWidth={2} />
                <Radar name="ICs" dataKey="ICs" stroke={T.purple} fill={T.purple} fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 2" />
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="card scenario4-panel">
            <div className="scenario4-panel-head">
              <div className="scenario4-section-bar" />
              <h2 className="scenario4-panel-title">Team Silence Index</h2>
            </div>
            <p className="scenario4-panel-sub">avg speaking time % per session</p>
            <div className="scenario4-silent-list">
              {silentTeams.map((t, i) => (
                <div key={i} className="scenario4-silent-row" style={{ background: riskBg[t.risk], borderColor: `${riskColor[t.risk]}22` }}>
                  <span className="scenario4-silent-dot" style={{ background: riskColor[t.risk] }} />
                  <span className="scenario4-silent-team">{t.team}</span>
                  <div className="scenario4-silent-track">
                    <div className="scenario4-silent-fill" style={{ width: `${Math.min(t.avgSpeakPct * 2.5, 100)}%`, background: riskColor[t.risk] }} />
                  </div>
                  <span className="scenario4-silent-pct" style={{ color: riskColor[t.risk] }}>{t.avgSpeakPct}%</span>
                </div>
              ))}
            </div>
            <div className="scenario4-risk-legend">
              {['critical', 'high', 'medium', 'low'].map((r) => (
                <div key={r} className="scenario4-risk-legend-item">
                  <span className="scenario4-risk-dot" style={{ background: riskColor[r] }} />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="scenario4-grid scenario4-grid-2c">
          <div className="card scenario4-panel">
            <div className="scenario4-panel-head">
              <div className="scenario4-section-bar" />
              <h2 className="scenario4-panel-title">Meeting Health Pulse</h2>
            </div>
            <p className="scenario4-panel-sub">6-week trend · equity, dominance & participation</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={meetingPulse} margin={{ right: 10, left: -10 }}>
                <CartesianGrid strokeDasharray="2 6" stroke="var(--border)" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="equity" name="Equity Score" stroke={T.green} strokeWidth={2} dot={{ r: 3, fill: T.green }} />
                <Line type="monotone" dataKey="dominance" name="Voice Dominance" stroke={T.red} strokeWidth={2} dot={{ r: 3, fill: T.red }} />
                <Line type="monotone" dataKey="participation" name="Active Participation" stroke={T.blue} strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3, fill: T.blue }} />
              </LineChart>
            </ResponsiveContainer>
            <p className="scenario4-pulse-note">→ Dominance declining (good). Equity & participation trending up. Target: Equity &gt;60, Dominance &lt;50 by Q3.</p>
          </div>

          <div className="card scenario4-panel">
            <div className="scenario4-panel-head">
              <div className="scenario4-section-bar" />
              <h2 className="scenario4-panel-title">Interruption Log</h2>
            </div>
            <p className="scenario4-panel-sub">recorded cross-speaker interruptions</p>
            <InterruptionLog />
          </div>
        </div>

        <section className="card scenario4-methodology">
          <div className="scenario4-panel-head">
            <div className="scenario4-section-bar" />
            <h2 className="scenario4-panel-title">Participation Equity Score — Methodology</h2>
          </div>
          <p className="scenario4-panel-sub">how the 0–100 score is calculated</p>
          <div className="scenario4-method-grid">
            {methodologyCards.map((m, i) => (
              <div key={i} className="scenario4-method-card">
                <div className="scenario4-method-label">{m.label}</div>
                <div className="scenario4-method-val">{m.val}</div>
                <div className="scenario4-method-meta">
                  <span className="scenario4-method-weight">weight: {m.weight}</span>
                  <span className="scenario4-method-note">{m.note}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="scenario4-footer">
          <span>◈ Leadership Visibility Dashboard · Powered by Fathom AI · {period}</span>
          <span>Last sync: 2 hours ago · 47 meetings · 94.2h audio</span>
        </footer>
      </div>
    </div>
  );
}

function InterruptionLog() {
  const sorted = [...interruptionMatrix].sort((a, b) => b.count - a.count);
  const max = sorted[0]?.count || 1;
  const getColor = (n) => (n >= 10 ? T.red : n >= 7 ? T.orange : T.yellow);
  return (
    <>
      <div className="scenario4-interrupt-list">
        {sorted.map((item, i) => (
          <div key={i} className="scenario4-interrupt-row">
            <div className="scenario4-interrupt-body">
              <div className="scenario4-interrupt-label">
                <span style={{ color: getColor(item.count) }}>{item.interrupter.split(' ')[0]}</span>
                <span> → </span>
                <span>{item.target.split(' ')[0]}</span>
              </div>
              <div className="scenario4-interrupt-track">
                <div className="scenario4-interrupt-fill" style={{ width: `${(item.count / max) * 100}%`, background: getColor(item.count) }} />
              </div>
            </div>
            <span className="scenario4-interrupt-count" style={{ color: getColor(item.count) }}>{item.count}×</span>
          </div>
        ))}
      </div>
      <div className="scenario4-callout scenario4-callout-red">
        Total: <strong>62 interruptions</strong> across 47 meetings. Sales & C-Suite account for 71% of all incidents.
      </div>
    </>
  );
}
