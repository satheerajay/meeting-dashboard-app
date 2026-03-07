import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0F1923', border: '1px solid rgba(255,102,0,0.3)',
      borderRadius: 8, padding: '10px 14px',
    }}>
      <div style={{ color: '#FF6600', fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: '#fff', fontSize: 12 }}>
          {p.name}: <span style={{ color: p.color || '#FF6600' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function ContributionTrend({ meetings }) {
  if (!meetings || meetings.length === 0) return null;

  const dayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayMap = {};

  meetings.forEach(m => {
    if (!m.startTime) return;
    const d = new Date(m.startTime);
    const day = dayOrder[d.getDay()];
    if (!dayMap[day]) dayMap[day] = { scores: [], count: 0 };
    dayMap[day].count += 1;
    if (m.score != null) dayMap[day].scores.push(m.score);
  });

  const data = dayOrder
    .filter(d => dayMap[d])
    .map(d => ({
      day: d,
      avgScore: dayMap[d].scores.length
        ? Math.round(dayMap[d].scores.reduce((a, b) => a + b, 0) / dayMap[d].scores.length)
        : 0,
      meetings: dayMap[d].count,
    }));

  if (data.length === 0) return null;

  return (
    <div className="chart-card">
      <div className="card-title">📈 Score vs. Meeting Load Trend</div>
      <div className="card-sub" style={{ marginTop: -12, marginBottom: 16 }}>
        Are scores declining as your meeting load increases?
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="avgScore" name="Avg Score" stroke="#FF6600" strokeWidth={2.5} dot={{ fill: '#FF6600', r: 4 }} />
          <Line type="monotone" dataKey="meetings" name="Meetings" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 4" dot={{ fill: '#3B82F6', r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="chart-note">
        ↑ When meetings pile up, scores tend to drop — consider blocking focus time to protect quality.
      </div>
    </div>
  );
}
