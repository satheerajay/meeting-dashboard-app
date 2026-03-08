import { useState, useEffect } from 'react';
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Funnel, FunnelChart, LabelList, Legend,
  AreaChart, Area,
} from 'recharts';

// App color palette (CSS variables)
const T = {
  bg: 'var(--bg)',
  card: 'var(--charcoal2)',
  border: 'var(--border)',
  text: 'var(--text)',
  sub: 'var(--text2)',
  gold: 'var(--orange)',
  green: 'var(--green)',
  red: 'var(--red)',
  blue: 'var(--blue)',
  orange: 'var(--orange)',
  purple: 'var(--purple)',
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const REPS = [
  { id: 1, name: 'Arjun Mehta', avatar: 'AM', tier: 'Senior AE' },
  { id: 2, name: 'Sofia Chen', avatar: 'SC', tier: 'AE' },
  { id: 3, name: 'Marcus Williams', avatar: 'MW', tier: 'AE' },
  { id: 4, name: 'Priya Nair', avatar: 'PN', tier: 'Junior AE' },
  { id: 5, name: "Liam O'Brien", avatar: 'LO', tier: 'Senior AE' },
];

const CALLS = [
  { id: 1, rep: 1, prospect: 'Apex Logistics', outcome: 'won', duration: 47, dealValue: 84000, date: '2024-12-03', score: 91, painDiscovery: 9, objectionHandling: 8, nextStepsClarity: 9, rapport: 9, productKnowledge: 10, talkRatio: 38 },
  { id: 2, rep: 1, prospect: 'TerraFin Capital', outcome: 'won', duration: 38, dealValue: 120000, date: '2024-12-07', score: 88, painDiscovery: 9, objectionHandling: 9, nextStepsClarity: 8, rapport: 8, productKnowledge: 9, talkRatio: 41 },
  { id: 3, rep: 1, prospect: 'NovaBuild Inc', outcome: 'lost', duration: 72, dealValue: 210000, date: '2024-12-11', score: 55, painDiscovery: 5, objectionHandling: 4, nextStepsClarity: 5, rapport: 7, productKnowledge: 8, talkRatio: 68 },
  { id: 4, rep: 2, prospect: 'CloudNest Systems', outcome: 'won', duration: 44, dealValue: 65000, date: '2024-12-04', score: 85, painDiscovery: 8, objectionHandling: 8, nextStepsClarity: 9, rapport: 8, productKnowledge: 8, talkRatio: 40 },
  { id: 5, rep: 2, prospect: 'GreenPath Energy', outcome: 'lost', duration: 89, dealValue: 175000, date: '2024-12-09', score: 48, painDiscovery: 4, objectionHandling: 3, nextStepsClarity: 4, rapport: 6, productKnowledge: 7, talkRatio: 74 },
  { id: 6, rep: 2, prospect: 'Quantum Health', outcome: 'lost', duration: 61, dealValue: 98000, date: '2024-12-14', score: 52, painDiscovery: 5, objectionHandling: 5, nextStepsClarity: 4, rapport: 6, productKnowledge: 7, talkRatio: 65 },
  { id: 7, rep: 3, prospect: 'PeakRetail Group', outcome: 'won', duration: 51, dealValue: 92000, date: '2024-12-05', score: 82, painDiscovery: 8, objectionHandling: 7, nextStepsClarity: 8, rapport: 9, productKnowledge: 8, talkRatio: 44 },
  { id: 8, rep: 3, prospect: 'Solaris Ventures', outcome: 'won', duration: 39, dealValue: 55000, date: '2024-12-12', score: 79, painDiscovery: 7, objectionHandling: 8, nextStepsClarity: 8, rapport: 8, productKnowledge: 7, talkRatio: 46 },
  { id: 9, rep: 3, prospect: 'BlueSky Media', outcome: 'lost', duration: 95, dealValue: 310000, date: '2024-12-16', score: 41, painDiscovery: 3, objectionHandling: 3, nextStepsClarity: 3, rapport: 5, productKnowledge: 6, talkRatio: 79 },
  { id: 10, rep: 4, prospect: 'IronClad Security', outcome: 'lost', duration: 58, dealValue: 145000, date: '2024-12-06', score: 44, painDiscovery: 4, objectionHandling: 4, nextStepsClarity: 3, rapport: 5, productKnowledge: 5, talkRatio: 70 },
  { id: 11, rep: 4, prospect: 'Zenith Analytics', outcome: 'lost', duration: 83, dealValue: 220000, date: '2024-12-10', score: 39, painDiscovery: 3, objectionHandling: 3, nextStepsClarity: 3, rapport: 4, productKnowledge: 5, talkRatio: 77 },
  { id: 12, rep: 4, prospect: 'SwiftPay Ltd', outcome: 'won', duration: 42, dealValue: 48000, date: '2024-12-15', score: 74, painDiscovery: 7, objectionHandling: 7, nextStepsClarity: 7, rapport: 7, productKnowledge: 7, talkRatio: 47 },
  { id: 13, rep: 5, prospect: 'OrionTech', outcome: 'won', duration: 35, dealValue: 135000, date: '2024-12-02', score: 94, painDiscovery: 10, objectionHandling: 9, nextStepsClarity: 9, rapport: 9, productKnowledge: 10, talkRatio: 35 },
  { id: 14, rep: 5, prospect: 'MapleSoft', outcome: 'won', duration: 41, dealValue: 88000, date: '2024-12-08', score: 89, painDiscovery: 9, objectionHandling: 9, nextStepsClarity: 8, rapport: 9, productKnowledge: 9, talkRatio: 37 },
  { id: 15, rep: 5, prospect: 'Harborview Hotels', outcome: 'lost', duration: 67, dealValue: 190000, date: '2024-12-13', score: 61, painDiscovery: 6, objectionHandling: 6, nextStepsClarity: 6, rapport: 7, productKnowledge: 8, talkRatio: 58 },
];

const WIN_REASONS = [
  { reason: 'Strong ROI Articulation', count: 7, pct: 78 },
  { reason: 'Tailored Demo', count: 6, pct: 67 },
  { reason: 'Quick Follow-up < 2hrs', count: 5, pct: 56 },
  { reason: 'Champion Identified Early', count: 5, pct: 56 },
  { reason: 'Competitive Differentiation', count: 4, pct: 44 },
  { reason: 'Multi-stakeholder Buy-in', count: 3, pct: 33 },
];

const LOSS_REASONS = [
  { reason: 'Pricing Objection Unresolved', count: 5, pct: 71 },
  { reason: 'Went to Competitor', count: 4, pct: 57 },
  { reason: 'No Clear Next Step', count: 4, pct: 57 },
  { reason: 'Decision Maker Not Engaged', count: 3, pct: 43 },
  { reason: 'Product Gap – Integrations', count: 2, pct: 29 },
  { reason: 'Deal Stalled / No Urgency', count: 2, pct: 29 },
];

const MISTAKES = [
  { rep: 'Marcus Williams', mistake: 'Dominated 79% of talk time; prospect barely spoke', severity: 'critical', calls: 2 },
  { rep: 'Priya Nair', mistake: 'Failed to identify economic buyer in 2 of 3 calls', severity: 'critical', calls: 2 },
  { rep: 'Sofia Chen', mistake: 'Presented pricing before establishing value', severity: 'high', calls: 2 },
  { rep: 'Priya Nair', mistake: 'No concrete next step set at end of call', severity: 'high', calls: 2 },
  { rep: 'Marcus Williams', mistake: 'Skipped discovery; jumped to demo after 8 minutes', severity: 'high', calls: 1 },
  { rep: 'Sofia Chen', mistake: "Couldn't handle 'too expensive' objection effectively", severity: 'medium', calls: 1 },
  { rep: "Liam O'Brien", mistake: "Missed buying signal; didn't ask for commitment", severity: 'medium', calls: 1 },
  { rep: 'Arjun Mehta', mistake: 'Over-promised on implementation timeline', severity: 'low', calls: 1 },
];

const FUNNEL_DATA = [
  { name: 'Calls Conducted', value: 15, fill: 'var(--orange)' },
  { name: 'Discovery Complete', value: 12, fill: 'var(--orange-soft)' },
  { name: 'Demo Delivered', value: 10, fill: 'var(--orange-pale)' },
  { name: 'Proposal Sent', value: 8, fill: 'rgba(255,102,0,0.4)' },
  { name: 'Deals Won', value: 8, fill: 'var(--green)' },
];

const WEEKLY_TREND = [
  { week: 'W48', won: 1, lost: 1, calls: 3 },
  { week: 'W49', won: 2, lost: 1, calls: 4 },
  { week: 'W50', won: 3, lost: 2, calls: 5 },
  { week: 'W51', won: 2, lost: 3, calls: 6 },
];

const OBJECTIONS = [
  { objection: 'Pricing', arjun: 85, sofia: 55, marcus: 40, priya: 42, liam: 88 },
  { objection: 'Competitor', arjun: 80, sofia: 70, marcus: 60, priya: 50, liam: 82 },
  { objection: 'Timing', arjun: 88, sofia: 72, marcus: 55, priya: 48, liam: 80 },
  { objection: 'Budget', arjun: 82, sofia: 58, marcus: 45, priya: 40, liam: 85 },
  { objection: 'Risk', arjun: 90, sofia: 68, marcus: 50, priya: 38, liam: 87 },
];

const KEYWORDS_WON = [
  { word: 'ROI', freq: 23 }, { word: 'integration', freq: 19 },
  { word: 'timeline', freq: 17 }, { word: 'savings', freq: 15 },
  { word: 'champion', freq: 12 }, { word: 'pilot', freq: 10 },
];
const KEYWORDS_LOST = [
  { word: 'expensive', freq: 21 }, { word: 'budget', freq: 18 },
  { word: 'competitor', freq: 16 }, { word: 'later', freq: 14 },
  { word: 'evaluate', freq: 11 }, { word: 'committee', freq: 9 },
];

const WIN_FACTORS = {
  1: 'Strong ROI framing + champion identified', 2: 'Multi-stakeholder buy-in secured',
  4: 'Tailored demo + quick follow-up', 7: 'Rapport + clear next step',
  8: 'Tight discovery; short, focused call', 12: 'Budget pre-confirmed before call',
  13: 'Best-in-class discovery; 35% talk time', 14: 'Competitive diff well articulated',
};

const LOSS_DETAIL = {
  3: ['Over-promised delivery timeline', 'Align with engineering before any commitment'],
  5: ["Couldn't counter 'we'll go with X'", 'Prepare 3-point competitor battle card'],
  6: ['No urgency established', 'Connect to Q1 compliance deadline'],
  9: ['Talk ratio 79% — prospect disengaged', 'Switch to discovery questions by min 10'],
  10: ['Decision maker absent from all 3 calls', 'Require DM attendance as precondition'],
  11: ['No economic buyer involved in call', 'Map org chart; get CFO on next call'],
  15: ['Pricing presented too early', 'Lead with savings calc before mentioning price'],
};

const COACHING = {
  1: { strengths: ['Best-in-class ROI storytelling', 'Short, focused calls'], focus: ['Avoid over-committing on timelines', 'Push for multi-threading earlier'] },
  2: { strengths: ['Strong rapport building', 'Clear next steps on won deals'], focus: ['Delay pricing conversation', 'Improve pricing objection handling'] },
  3: { strengths: ['High rapport scores', 'Good competitor awareness'], focus: ['Reduce talk time below 50%', 'Start with discovery, not demo'] },
  4: { strengths: ['Improving product knowledge', 'Strong empathy in calls'], focus: ['Mandate DM presence before calls', 'Set explicit urgency in every call'] },
  5: { strengths: ['Highest discovery scores', 'Best objection handling in team'], focus: ['Convert large enterprise deals', "Don't miss buying signals"] },
};

const fmt = (n) => (n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`);
const repById = (id) => REPS.find((r) => r.id === id);

function repStats(repId) {
  const calls = CALLS.filter((c) => c.rep === repId);
  const won = calls.filter((c) => c.outcome === 'won');
  const lost = calls.filter((c) => c.outcome === 'lost');
  return {
    calls, won, lost,
    avgScore: Math.round(calls.reduce((a, c) => a + c.score, 0) / calls.length),
    revenue: won.reduce((a, c) => a + c.dealValue, 0),
    lostTime: lost.reduce((a, c) => a + c.duration, 0),
    winRate: Math.round((won.length / calls.length) * 100),
    avgTalk: Math.round(calls.reduce((a, c) => a + c.talkRatio, 0) / calls.length),
  };
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div className="card scenario1-card" style={{ ...style }}>
      {children}
    </div>
  );
}

function SectionHeader({ title, sub }) {
  return (
    <div className="scenario1-section-header">
      <div className="scenario1-section-header-row">
        <div className="scenario1-section-header-bar" />
        <h2 className="scenario1-section-title">{title}</h2>
      </div>
      {sub && <p className="scenario1-section-sub">{sub}</p>}
    </div>
  );
}

function KpiCard({ label, value, sub, accent, icon }) {
  return (
    <div className="kpi-card scenario1-kpi" style={{ ['--kpi-accent']: accent }}>
      <div className="kpi-accent" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
      <div className="scenario1-kpi-icon">{icon}</div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="scenario1-kpi-sub" style={{ color: accent }}>{sub}</div>
    </div>
  );
}

function Tag({ color, children }) {
  return (
    <span className="scenario1-tag" style={{ background: `${color}22`, color, borderColor: `${color}44` }}>
      {children}
    </span>
  );
}

function CTip({ active, payload, label, suffix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="scenario1-tooltip">
      <div className="scenario1-tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--text)' }}>
          {p.name}: {p.value}{suffix}
        </div>
      ))}
    </div>
  );
}

function Avatar({ initials, color = 'var(--orange)' }) {
  return (
    <div className="scenario1-avatar" style={{ background: `${color}28`, color }}>
      {initials}
    </div>
  );
}

function ScoreBar({ score, width = 50 }) {
  const c = score > 80 ? 'var(--green)' : score > 65 ? 'var(--orange)' : 'var(--red)';
  return (
    <div className="scenario1-score-bar">
      <div className="scenario1-score-track" style={{ width }}>
        <div style={{ width: `${score}%`, background: c }} />
      </div>
      <span style={{ color: c }}>{score}</span>
    </div>
  );
}

function PctBar({ pct, color }) {
  return (
    <div className="scenario1-pct-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div
        className="scenario1-pct-fill"
        style={{
          width: `${Math.min(100, Math.max(0, pct))}%`,
          background: color,
        }}
      />
    </div>
  );
}

function ScoreRing({ score }) {
  const c = score > 75 ? 'var(--green)' : score > 60 ? 'var(--orange)' : 'var(--red)';
  return (
    <div className="scenario1-score-ring" style={{ background: `conic-gradient(${c} ${score * 3.6}deg, var(--border) 0)` }}>
      <div className="scenario1-score-ring-inner">{score}</div>
    </div>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
function OverviewTab() {
  const won = CALLS.filter((c) => c.outcome === 'won').map((c) => ({ x: c.duration, y: c.score, name: c.prospect, v: c.dealValue, o: 'won' }));
  const lost = CALLS.filter((c) => c.outcome === 'lost').map((c) => ({ x: c.duration, y: c.score, name: c.prospect, v: c.dealValue, o: 'lost' }));
  const INSIGHTS = [
    { icon: '🔑', color: T.green, title: 'Win Pattern Detected', body: 'All 9 won deals had a clearly defined next step set before the call ended.' },
    { icon: '⚠️', color: T.red, title: 'Talk Ratio Alert', body: '3 reps exceeded 65% talk time on lost deals. Winning calls averaged 40%.' },
    { icon: '💡', color: T.gold, title: 'Champion Strategy', body: 'Liam and Arjun identified an internal champion within the first 15 minutes.' },
    { icon: '📉', color: T.red, title: 'Pricing Timing Risk', body: 'Sofia presented pricing before establishing ROI on 2 lost deals.' },
    { icon: '🎯', color: T.blue, title: 'Discovery Depth', body: 'Won deals averaged 9.2/10 on pain discovery. Lost deals averaged 4.1.' },
    { icon: '⏱️', color: T.gold, title: 'Ideal Call Length', body: 'Sweet spot: 35–51 min. Calls over 60 min had only a 14% win rate.' },
  ];

  return (
    <div className="scenario1-tab-content">
      <div className="dash-grid">
        <Card>
          <SectionHeader title="Weekly Call Activity & Outcomes" />
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={WEEKLY_TREND}>
              <defs>
                <linearGradient id="s1-gw" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--green)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--green)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="s1-gl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--red)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--red)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" stroke="var(--muted)" tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--muted)" tick={{ fontSize: 10 }} />
              <Tooltip content={<CTip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="calls" name="Total Calls" stroke="var(--blue)" fill="none" strokeDasharray="4 2" strokeWidth={2} />
              <Area type="monotone" dataKey="won" name="Won" stroke="var(--green)" fill="url(#s1-gw)" strokeWidth={2} />
              <Area type="monotone" dataKey="lost" name="Lost" stroke="var(--red)" fill="url(#s1-gl)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionHeader title="Deal Pipeline Funnel" />
          <ResponsiveContainer width="100%" height={210}>
            <FunnelChart>
              <Tooltip />
              <Funnel dataKey="value" data={FUNNEL_DATA} isAnimationActive>
                <LabelList position="right" fill="var(--text)" stroke="none" fontSize={10} formatter={(v) => { const f = FUNNEL_DATA.find((x) => x.value === v); return f ? `${f.name}: ${v}` : v; }} />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, marginBottom: 20 }}>
        <Card>
          <SectionHeader title="Call Duration vs. AI Score" sub="Won deals cluster short+high; lost deals drift long+low" />
          <ResponsiveContainer width="100%" height={230}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="x" type="number" name="Duration" stroke="var(--muted)" tick={{ fontSize: 10 }} />
              <YAxis dataKey="y" type="number" domain={[30, 100]} stroke="var(--muted)" tick={{ fontSize: 10 }} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="scenario1-tooltip">
                      <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: 12 }}>{d.name}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 11 }}>{d.x} min · score {d.y}</div>
                      <div style={{ color: d.o === 'won' ? 'var(--green)' : 'var(--red)', fontSize: 11 }}>{d.o === 'won' ? '✓ Won' : '✗ Lost'} · {fmt(d.v)}</div>
                    </div>
                  );
                }}
              />
              <Scatter name="Won" data={won} fill="var(--green)" opacity={0.85} r={6} />
              <Scatter name="Lost" data={lost} fill="var(--red)" opacity={0.85} r={6} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </ScatterChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionHeader title="AI Keyword Signals" sub="Top words in won vs. lost transcripts" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { label: '✓ WON', color: T.green, data: KEYWORDS_WON, max: 23 },
              { label: '✗ LOST', color: T.red, data: KEYWORDS_LOST, max: 21 },
            ].map((col) => (
              <div key={col.label}>
                <div className="scenario1-keyword-label" style={{ color: col.color }}>{col.label}</div>
                {col.data.map((k) => (
                  <div key={k.word} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ color: 'var(--text)', fontSize: 12 }}>{k.word}</span>
                      <span style={{ color: 'var(--muted)', fontSize: 10, fontFamily: 'monospace' }}>{k.freq}×</span>
                    </div>
                    <div className="scenario1-pct-track">
                      <div style={{ width: `${(k.freq / col.max) * 100}%`, height: '100%', background: col.color, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <SectionHeader title="AI Insights Feed" sub="Auto-generated observations from transcript analysis" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {INSIGHTS.map((ins, i) => (
            <div key={i} className="scenario1-insight-card" style={{ borderColor: `${ins.color}22` }}>
              <div style={{ fontSize: 18, marginBottom: 8 }}>{ins.icon}</div>
              <div style={{ color: ins.color, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{ins.title}</div>
              <div style={{ color: 'var(--text2)', fontSize: 12, lineHeight: 1.6 }}>{ins.body}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── WON DEALS TAB ────────────────────────────────────────────────────────────
function WonDealsTab() {
  const wonCalls = CALLS.filter((c) => c.outcome === 'won').sort((a, b) => b.dealValue - a.dealValue);
  const radarData = [
    { metric: 'Pain Discovery', val: 86 }, { metric: 'Objection Handling', val: 82 },
    { metric: 'Next Steps', val: 84 }, { metric: 'Rapport', val: 84 }, { metric: 'Product Knowledge', val: 88 },
  ];
  return (
    <div className="scenario1-tab-content">
      <div className="dash-grid">
        <Card>
          <SectionHeader title="Top Reasons Deals Were Won" sub="AI extracted from closed-won transcripts" />
          {WIN_REASONS.map((r, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ color: 'var(--text)', fontSize: 13 }}>{r.reason}</span>
                <span style={{ color: 'var(--green)', fontSize: 12, fontFamily: 'monospace' }}>{r.pct}%</span>
              </div>
              <PctBar pct={r.pct} color={T.green} />
              <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 3 }}>In {r.count} of 9 won deals</div>
            </div>
          ))}
        </Card>
        <Card>
          <SectionHeader title="Won Deal Competency Profile" sub="Avg sub-scores across all won deals" />
          <div className="scenario1-radar-wrap scenario1-radar-wrap-green">
            <ResponsiveContainer width="100%" height={270}>
              <RadarChart data={radarData}>
                <defs>
                  <radialGradient id="scenario1-radar-gradient-green" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#00C48C" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#00C48C" stopOpacity={0.12} />
                  </radialGradient>
                </defs>
                <PolarGrid stroke="rgba(255,255,255,0.18)" strokeWidth={1.2} />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600 }} />
                <Radar name="Won Deals" dataKey="val" stroke="#00E5A8" strokeWidth={2.5} fill="url(#scenario1-radar-gradient-green)" fillOpacity={1} isAnimationActive animationDuration={1200} animationEasing="ease-out" />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <Card>
        <SectionHeader title="Closed-Won Deal Breakdown" />
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {['Prospect', 'Rep', 'Value', 'Duration', 'AI Score', 'Talk Ratio', 'Key Success Factor'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {wonCalls.map((c) => {
                const rep = repById(c.rep);
                return (
                  <tr key={c.id}>
                    <td>{c.prospect}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar initials={rep.avatar} color={T.gold} />
                        <span>{rep.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--green)', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(c.dealValue)}</td>
                    <td style={{ fontFamily: 'monospace' }}>{c.duration}m</td>
                    <td><ScoreBar score={c.score} /></td>
                    <td style={{ color: c.talkRatio < 50 ? 'var(--green)' : 'var(--red)', fontFamily: 'monospace' }}>{c.talkRatio}%</td>
                    <td style={{ color: 'var(--muted)', fontSize: 11 }}>{WIN_FACTORS[c.id] || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── LOST DEALS TAB ───────────────────────────────────────────────────────────
function LostDealsTab() {
  const lostCalls = CALLS.filter((c) => c.outcome === 'lost').sort((a, b) => b.duration - a.duration);
  const timeData = REPS.map((r) => {
    const lost = CALLS.filter((c) => c.rep === r.id && c.outcome === 'lost');
    return { name: r.name.split(' ')[0], minutes: lost.reduce((a, c) => a + c.duration, 0) };
  });
  return (
    <div className="scenario1-tab-content">
      <div className="dash-grid">
        <Card>
          <SectionHeader title="Why Deals Were Lost" sub="AI-extracted loss patterns across all closed-lost calls" />
          {LOSS_REASONS.map((r, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ color: 'var(--text)', fontSize: 13 }}>{r.reason}</span>
                <span style={{ color: 'var(--red)', fontSize: 12, fontFamily: 'monospace' }}>{r.pct}%</span>
              </div>
              <PctBar pct={r.pct} color={T.red} />
              <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 3 }}>In {r.count} of 7 lost deals</div>
            </div>
          ))}
        </Card>
        <Card>
          <SectionHeader title="Time Invested in Lost Deals" sub="Minutes burned per rep on deals that didn't close" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={timeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" stroke="var(--muted)" tick={{ fontSize: 10 }} unit=" min" />
              <YAxis type="category" dataKey="name" stroke="var(--muted)" tick={{ fontSize: 11 }} width={55} />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="scenario1-tooltip">
                    <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: 12 }}>{label}</div>
                    <div style={{ color: 'var(--red)', fontSize: 12 }}>{payload[0].value} min on lost deals</div>
                  </div>
                );
              }} />
              <Bar dataKey="minutes" fill="var(--red)" radius={[0, 4, 4, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card>
        <SectionHeader title="High-Effort Lost Deals" sub="Ranked by call duration — where the most time was burned" />
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {['Prospect', 'Rep', 'Deal Size', 'Duration', 'Score', 'Primary Loss Reason', 'Improvement'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lostCalls.map((c) => {
                const rep = repById(c.rep);
                const [reason, improvement] = LOSS_DETAIL[c.id] || ['—', 'Review transcript'];
                return (
                  <tr key={c.id}>
                    <td>{c.prospect}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar initials={rep.avatar} color={T.red} />
                        <span>{rep.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--red)', fontFamily: 'monospace' }}>{fmt(c.dealValue)}</td>
                    <td>
                      <span style={{ color: c.duration > 70 ? 'var(--red)' : 'var(--orange)', fontFamily: 'monospace' }}>{c.duration}m</span>
                      {c.duration > 70 && <span style={{ color: 'var(--red)', fontSize: 10, marginLeft: 4 }}>⚠</span>}
                    </td>
                    <td><ScoreBar score={c.score} /></td>
                    <td style={{ color: 'var(--muted)', fontSize: 11, maxWidth: 180 }}>{reason}</td>
                    <td>
                      <div className="scenario1-improvement-pill">💡 {improvement}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── REP PERFORMANCE TAB ──────────────────────────────────────────────────────
function RepPerformanceTab() {
  const [sel, setSel] = useState(1);
  const stats = repStats(sel);
  const rep = repById(sel);
  const radarData = [
    { metric: 'Pain Discovery', val: Math.round(stats.calls.reduce((a, c) => a + c.painDiscovery, 0) / stats.calls.length) },
    { metric: 'Objections', val: Math.round(stats.calls.reduce((a, c) => a + c.objectionHandling, 0) / stats.calls.length) },
    { metric: 'Next Steps', val: Math.round(stats.calls.reduce((a, c) => a + c.nextStepsClarity, 0) / stats.calls.length) },
    { metric: 'Rapport', val: Math.round(stats.calls.reduce((a, c) => a + c.rapport, 0) / stats.calls.length) },
    { metric: 'Product Knowledge', val: Math.round(stats.calls.reduce((a, c) => a + c.productKnowledge, 0) / stats.calls.length) },
  ];
  const repKeys = ['arjun', 'sofia', 'marcus', 'priya', 'liam'];
  const repColors = [T.gold, T.green, T.blue, T.orange, T.purple];

  return (
    <div className="scenario1-tab-content">
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {REPS.map((r) => {
          const s = repStats(r.id);
          const active = sel === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setSel(r.id)}
              className={`scenario1-rep-card ${active ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Avatar initials={r.avatar} color={active ? T.gold : 'var(--muted)'} />
                <div>
                  <div style={{ color: active ? 'var(--text)' : 'var(--muted)', fontSize: 12, fontWeight: 600 }}>{r.name.split(' ')[0]}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 10 }}>{r.tier}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--green)', fontSize: 14, fontWeight: 700 }}>{s.winRate}%</span>
                <span style={{ color: 'var(--muted)', fontSize: 11 }}>Score: {s.avgScore}</span>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        {[
          { label: 'Win Rate', value: `${stats.winRate}%`, color: stats.winRate > 60 ? T.green : T.red },
          { label: 'Revenue Closed', value: fmt(stats.revenue), color: T.green },
          { label: 'Avg Call Score', value: stats.avgScore, color: stats.avgScore > 75 ? T.green : T.gold },
          { label: 'Avg Talk Ratio', value: `${stats.avgTalk}%`, color: stats.avgTalk < 50 ? T.green : T.red },
        ].map((k, i) => (
          <div key={i} className="scenario1-mini-kpi" style={{ borderColor: 'var(--border)' }}>
            <div style={{ color: 'var(--muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{k.label}</div>
            <div style={{ color: k.color, fontSize: 24, fontWeight: 700 }}>{k.value}</div>
          </div>
        ))}
      </div>
      <div className="dash-grid">
        <Card>
          <SectionHeader title={`${rep.name} — Competency Radar`} />
          <div className="scenario1-radar-wrap scenario1-radar-wrap-orange" key={rep.id}>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <defs>
                  <radialGradient id="scenario1-radar-gradient-orange" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FF6600" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#FF8C3A" stopOpacity={0.15} />
                  </radialGradient>
                </defs>
                <PolarGrid stroke="rgba(255,255,255,0.18)" strokeWidth={1.2} />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600 }} />
                <Radar name={rep.name} dataKey="val" stroke="#FF7A1A" strokeWidth={2.5} fill="url(#scenario1-radar-gradient-orange)" fillOpacity={1} isAnimationActive animationDuration={1400} animationEasing="ease-out" animationBegin={100} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <SectionHeader title={`Call-by-Call — ${rep.name}`} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, maxHeight: 280, overflowY: 'auto' }}>
            {stats.calls.map((c) => (
              <div key={c.id} className="scenario1-call-row" style={{ borderColor: c.outcome === 'won' ? 'var(--green)22' : 'var(--red)22' }}>
                <span style={{ fontSize: 14 }}>{c.outcome === 'won' ? '✅' : '❌'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--text)', fontSize: 13, fontWeight: 600 }}>{c.prospect}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 2 }}>{c.date} · {c.duration}m · talk {c.talkRatio}%</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: c.outcome === 'won' ? 'var(--green)' : 'var(--red)', fontFamily: 'monospace', fontSize: 13 }}>{fmt(c.dealValue)}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 11 }}>Score {c.score}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <SectionHeader title="Team Benchmarking — Objection Handling" sub="How each rep handles the 5 most common objection types (AI scored 0–100)" />
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={OBJECTIONS}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="objection" stroke="var(--muted)" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} stroke="var(--muted)" tick={{ fontSize: 10 }} />
            <Tooltip content={<CTip suffix="%" />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {REPS.map((r, i) => (
              <Bar key={r.id} dataKey={repKeys[i]} name={r.name.split(' ')[0]} fill={repColors[i]} radius={[3, 3, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// ─── COACHING TAB ─────────────────────────────────────────────────────────────
function CoachingTab() {
  const SEV = { critical: T.red, high: T.orange, medium: T.gold, low: T.blue };
  const talkData = REPS.map((r) => {
    const s = repStats(r.id);
    return { name: r.name.split(' ')[0], rep: s.avgTalk, prospect: 100 - s.avgTalk };
  });

  return (
    <div className="scenario1-tab-content">
      <Card style={{ marginBottom: 18 }}>
        <SectionHeader title="Critical Mistakes Detected by AI" sub="Behaviours identified in transcripts that contributed to lost deals" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {MISTAKES.map((m, i) => {
            const col = SEV[m.severity];
            return (
              <div key={i} className="scenario1-mistake-row" style={{ borderColor: `${col}22` }}>
                <Tag color={col}>{m.severity}</Tag>
                <div style={{ flex: 1 }}>
                  <span style={{ color: T.gold, fontWeight: 600, fontSize: 13 }}>{m.rep}</span>
                  <span style={{ color: 'var(--muted)', fontSize: 12 }}> · </span>
                  <span style={{ color: 'var(--text)', fontSize: 13 }}>{m.mistake}</span>
                </div>
                <span style={{ color: 'var(--muted)', fontSize: 11, whiteSpace: 'nowrap' }}>{m.calls} call{m.calls > 1 ? 's' : ''}</span>
              </div>
            );
          })}
        </div>
      </Card>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 18 }}>
        {REPS.map((r) => {
          const s = repStats(r.id);
          const c = COACHING[r.id];
          return (
            <div key={r.id} className="scenario1-coaching-card" style={{ borderColor: 'var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Avatar initials={r.avatar} color={T.gold} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--text)', fontSize: 14, fontWeight: 700 }}>{r.name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 11 }}>{r.tier} · Score {s.avgScore} · {s.winRate}% win rate</div>
                </div>
                <ScoreRing score={s.avgScore} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ color: 'var(--green)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 8 }}>✓ STRENGTHS</div>
                  {c.strengths.map((str, j) => (
                    <div key={j} style={{ color: 'var(--text2)', fontSize: 11, marginBottom: 5, paddingLeft: 8, borderLeft: '2px solid var(--green)' }}>{str}</div>
                  ))}
                </div>
                <div>
                  <div style={{ color: 'var(--red)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 8 }}>↑ FOCUS AREAS</div>
                  {c.focus.map((f, j) => (
                    <div key={j} style={{ color: 'var(--text2)', fontSize: 11, marginBottom: 5, paddingLeft: 8, borderLeft: '2px solid var(--red)' }}>{f}</div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Card>
        <SectionHeader title="Talk Ratio Analysis" sub="Ideal: Rep 40%, Prospect 60%. Higher rep talk = lower win rate." />
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={talkData} layout="vertical" barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} stroke="var(--muted)" tick={{ fontSize: 10 }} unit="%" />
            <YAxis type="category" dataKey="name" stroke="var(--muted)" tick={{ fontSize: 11 }} width={55} />
            <Tooltip content={<CTip suffix="%" />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="rep" name="Rep Talks" stackId="a" fill="var(--red)" />
            <Bar dataKey="prospect" name="Prospect Talks" stackId="a" fill="var(--green)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10 }}>
          <div style={{ height: 2, flex: 1, background: `repeating-linear-gradient(90deg, var(--orange) 0, var(--orange) 6px, transparent 6px, transparent 12px)` }} />
          <span style={{ color: 'var(--orange)', fontSize: 11, whiteSpace: 'nowrap' }}>40% rep / 60% prospect = ideal benchmark</span>
          <div style={{ height: 2, flex: 1, background: `repeating-linear-gradient(90deg, var(--orange) 0, var(--orange) 6px, transparent 6px, transparent 12px)` }} />
        </div>
      </Card>
    </div>
  );
}

const TABS = ['overview', 'won deals', 'lost deals', 'rep performance', 'coaching'];

export default function Scenario1({ onBack }) {
  const [tab, setTab] = useState('overview');

  const won = CALLS.filter((c) => c.outcome === 'won');
  const lost = CALLS.filter((c) => c.outcome === 'lost');
  const revenue = won.reduce((a, c) => a + c.dealValue, 0);
  const atRisk = lost.reduce((a, c) => a + c.dealValue, 0);
  const winRate = Math.round((won.length / CALLS.length) * 100);
  const lostHrs = Math.round(lost.reduce((a, c) => a + c.duration, 0) / 60 * 10) / 10;
  const avgScore = Math.round(CALLS.reduce((a, c) => a + c.score, 0) / CALLS.length);

  return (
    <div className="scenario1-page">
      <header className="scenario1-header">
        <div className="scenario1-header-left">
          {onBack && (
            <button type="button" className="scenario1-back-btn" onClick={onBack} aria-label="Back to Scenarios">
              ← Back
            </button>
          )}
          <div className="scenario1-header-logo">
            <div className="scenario1-header-logo-icon">📊</div>
            <div>
              <h1 className="scenario1-header-title">Sales Intelligence</h1>
              <p className="scenario1-header-sub">Powered by Fathom AI · Call analytics & coaching</p>
            </div>
          </div>
        </div>
        <nav className="scenario1-tabs">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`scenario1-tab ${tab === t ? 'active' : ''}`}
            >
              {t}
            </button>
          ))}
        </nav>
        <div className="scenario1-period">📅 March 2026</div>
      </header>

      <div className="scenario1-body">
        <div className="kpi-grid scenario1-kpi-row">
          <KpiCard label="Revenue Won" value={fmt(revenue)} sub="↑ 18% vs prev period" accent={T.green} icon="💰" />
          <KpiCard label="Win Rate" value={`${winRate}%`} sub="9 of 15 deals closed" accent={T.gold} icon="🏆" />
          <KpiCard label="Avg Call Score" value={`${avgScore}/100`} sub="AI-assessed quality" accent={T.blue} icon="🎯" />
          <KpiCard label="Pipeline at Risk" value={fmt(atRisk)} sub="7 deals lost" accent={T.red} icon="⚠️" />
          <KpiCard label="Hours Lost" value={`${lostHrs}h`} sub="on failed deals" accent={T.orange} icon="⏱️" />
        </div>

        {tab === 'overview' && <OverviewTab />}
        {tab === 'won deals' && <WonDealsTab />}
        {tab === 'lost deals' && <LostDealsTab />}
        {tab === 'rep performance' && <RepPerformanceTab />}
        {tab === 'coaching' && <CoachingTab />}
      </div>
    </div>
  );
}
