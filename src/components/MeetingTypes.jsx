const TYPE_COLORS = {
  standup: '#3B82F6', '1:1': '#00C48C', planning: '#EC4899',
  review: '#7C3AED', retrospective: '#14B8A6', 'all-hands': '#FF3B5C',
  sync: '#3B82F6', interview: '#00C48C', workshop: '#FFB800',
  brainstorm: '#FF6600', general: '#6B7280', strategy: '#FF6600',
  status: '#14B8A6', external: '#F97316', compliance: '#6B7280',
};

function getColor(type) {
  if (!type) return '#6B7280';
  return TYPE_COLORS[type.toLowerCase()] || '#6B7280';
}

export default function MeetingTypes({ types }) {
  if (!types || types.length === 0) return null;

  const maxScore = Math.max(...types.map(t => t.avgScore || 0), 1);

  return (
    <div className="chart-card">
      <div className="card-title">🏷️ By Meeting Type</div>
      <div className="card-sub" style={{ marginTop: -12, marginBottom: 16 }}>Count & avg score per category</div>
      <div className="type-bar-list">
        {types.map((t, i) => {
          const color = getColor(t.type);
          const score = Math.round(t.avgScore || 0);
          return (
            <div className="type-bar-row" key={i}>
              <div className="type-bar-header">
                <div className="type-bar-label">
                  <div className="type-bar-dot" style={{ background: color }} />
                  <span>{t.type}</span>
                  <span className="type-bar-count">×{t.count}</span>
                </div>
                <span className="type-bar-pct" style={{ color }}>{score}%</span>
              </div>
              <div className="type-bar-track">
                <div
                  className="type-bar-fill"
                  style={{ width: `${(score / maxScore) * 100}%`, background: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
