export default function MetricCards({ summary }) {
  const metrics = [
    {
      icon: '🔀', bg: 'var(--orange-pale)', color: 'var(--orange)',
      value: `${summary.avgDecisionRatio}%`, label: 'Decision Ratio',
    },
    {
      icon: '✅', bg: 'var(--green-bg)', color: 'var(--green)',
      value: `${summary.avgNecessity}/100`, label: 'Necessity Score',
    },
    {
      icon: '🎙', bg: 'var(--blue-bg)', color: 'var(--blue)',
      value: `${summary.transcribedCount}/${summary.totalMeetings}`, label: 'Transcribed',
    },
  ];

  return (
    <div className="metric-row">
      {metrics.map((m, i) => (
        <div className="metric-card" key={i} style={{ animationDelay: `${0.05 * (i + 1)}s` }}>
          <div className="metric-icon-wrap" style={{ background: m.bg }}>{m.icon}</div>
          <div>
            <div className="metric-val" style={{ color: m.color }}>{m.value}</div>
            <div className="metric-label">{m.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
