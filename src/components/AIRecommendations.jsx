const typeIcons = {
  standup: '🔁', '1:1': '👤', planning: '🗺', review: '🔍',
  retrospective: '🔄', 'all-hands': '🏢', sync: '🔗',
  interview: '🤝', workshop: '🎓', brainstorm: '💡', general: '📋',
};

export default function AIRecommendations({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="card">
      <div className="card-title"><span>🧠</span> AI Recommendations</div>
      {items.map((item, i) => {
        const rec = typeof item === 'string' ? { text: item, meetings: [] } : item;
        return (
          <div className="ai-rec-item" key={i}>
            <div className="ai-rec-num">{i + 1}</div>
            <div className="ai-rec-body">
              <div className="ai-rec-text">{rec.text}</div>
              {rec.meetings && rec.meetings.length > 0 && (
                <div className="ai-rec-meetings">
                  <span className="ai-rec-from">Applies to:</span>
                  {rec.meetings.map((m, j) => (
                    <span className="ai-rec-tag" key={j}>
                      {typeIcons[m.type] || '📋'} {m.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
