export default function AsyncSuggestions({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="card">
      <div className="card-title"><span>💡</span> Consider Making Async</div>
      {items.map((item, i) => (
        <div className="async-item" key={i}>
          <div className="async-icon">📧</div>
          <div className="async-info">
            <strong>{item.summary}</strong>
            <span>{item.reason}</span>
          </div>
          <div className="async-necessity">{Math.round(item.necessityScore)}/100</div>
        </div>
      ))}
    </div>
  );
}
