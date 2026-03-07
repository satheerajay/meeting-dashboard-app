import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
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

export default function WeeklyLoadChart({ meetings }) {
  const dayMap = {};
  const dayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (meetings && meetings.length > 0) {
    meetings.forEach(m => {
      if (!m.startTime) return;
      const d = new Date(m.startTime);
      const day = dayOrder[d.getDay()];
      if (!dayMap[day]) dayMap[day] = { day, meetings: 0, hours: 0 };
      dayMap[day].meetings += 1;
      dayMap[day].hours += (m.duration || 30) / 60;
    });
  }

  const data = dayOrder
    .filter(d => dayMap[d])
    .map(d => ({ ...dayMap[d], hours: Math.round(dayMap[d].hours * 10) / 10 }));

  if (data.length === 0) return null;

  return (
    <div className="chart-card">
      <div className="card-title">📊 Weekly Meeting Load</div>
      <div className="card-sub" style={{ marginTop: -12, marginBottom: 16 }}>Meeting count and hours by day</div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }} />
          <Bar dataKey="meetings" name="Meeting Count" fill="#3B82F6" radius={[3, 3, 0, 0]} opacity={0.8} />
          <Bar dataKey="hours" name="Hours" fill="#FF6600" radius={[3, 3, 0, 0]} opacity={0.8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
