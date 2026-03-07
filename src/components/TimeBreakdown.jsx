export default function TimeBreakdown({ breakdown, effective }) {
  const { decision, discussion, idle } = breakdown;
  const circumference = 2 * Math.PI * 52;

  const segments = [
    { pct: decision, color: '#FF6600', label: 'Decision time', labelColor: 'var(--orange)' },
    { pct: discussion, color: '#00C48C', label: 'Discussion', labelColor: 'var(--green)' },
    { pct: idle, color: '#FFB800', label: 'Idle / wasted', labelColor: 'var(--yellow)' },
  ];

  let offset = 0;
  const circles = segments.map((seg, i) => {
    const dashLen = (seg.pct / 100) * circumference;
    const dashGap = circumference - dashLen;
    const el = (
      <circle
        key={i}
        cx="70" cy="70" r="52"
        fill="none"
        stroke={seg.color}
        strokeWidth="24"
        strokeDasharray={`${dashLen} ${dashGap}`}
        strokeDashoffset={-offset}
        transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dasharray 1.4s ease' }}
      />
    );
    offset += dashLen;
    return el;
  });

  return (
    <div className="card">
      <div className="card-title"><span>⏱</span> Time Breakdown</div>
      <div className="donut-section">
        <div className="donut-container">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="52" fill="none" stroke="#F5F6FA" strokeWidth="24" />
            {circles}
          </svg>
          <div className="donut-center">
            <div className="val">{effective}%</div>
            <div className="sub">effective</div>
          </div>
        </div>
        <div>
          {segments.map((seg, i) => (
            <div className="legend-item" key={i}>
              <div className="legend-dot" style={{ background: seg.color }} />
              <div className="legend-label">{seg.label}</div>
              <div className="legend-pct" style={{ color: seg.labelColor }}>{seg.pct}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
