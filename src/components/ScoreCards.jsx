const TYPE_COLORS = {
  standup: '#3B82F6', '1:1': '#00C48C', planning: '#EC4899',
  review: '#7C3AED', retrospective: '#14B8A6', 'all-hands': '#FF3B5C',
  sync: '#3B82F6', interview: '#00C48C', workshop: '#FFB800',
  brainstorm: '#FF6600', general: '#6B7280', strategy: '#FF6600',
};

function getColor(type) {
  if (!type) return '#6B7280';
  return TYPE_COLORS[type.toLowerCase()] || '#6B7280';
}

export default function ScoreCards({ title, sub, items, color, rankType, showReason = false }) {
  if (!items || items.length === 0) return null;

  const barColor = color || (rankType === 'bad' ? '#FF3B5C' : '#00C48C');

  return (
    <div className="card">
      <div className="card-title">
        <span>{title}</span>
      </div>
      {sub && <div className="card-sub" style={{ marginTop: -12, marginBottom: 16 }}>{sub}</div>}
      <div>
        {items.map((item, i) => {
          const name = item.summary || item.name;
          const score = Math.round(item.score ?? item.contrib ?? 0);
          const typeColor = getColor(item.type);

          return (
            <div className="contrib-row" key={i}>
              <div className="contrib-header">
                <div className="contrib-left">
                  <div
                    className="contrib-rank"
                    style={{
                      background: `${typeColor}22`,
                      border: `1px solid ${typeColor}55`,
                      color: typeColor,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <div className="contrib-name">{name}</div>
                    <div className="contrib-meta">
                      {item.type && <span>{item.type}</span>}
                      {item.duration && <span> · {item.duration}min</span>}
                      {item.attendees && <span> · {item.attendees} attendees</span>}
                    </div>
                  </div>
                </div>
                <div className="contrib-pct" style={{ color: barColor }}>{score}%</div>
              </div>
              <div className="contrib-bar-track">
                <div
                  className="contrib-bar-fill"
                  style={{ width: `${score}%`, background: barColor }}
                />
              </div>
              {showReason && item.isAsync && (
                <div className="contrib-reason">⚠ Could be async</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
