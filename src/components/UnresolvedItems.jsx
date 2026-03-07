function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${date} · ${time}`;
}

export default function UnresolvedItems({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="card">
      <div className="card-title" style={{ color: 'var(--red)' }}><span>🚨</span> Unresolved Items</div>
      {items.map((item, i) => (
        <div className="unresolved-item" key={i}>
          <div style={{ flex: 1 }}>
            <div className="unresolved-header">
              <strong>{item.meeting}</strong>
              {item.startTime && (
                <span className="unresolved-datetime">📅 {formatDateTime(item.startTime)}</span>
              )}
            </div>
            <div className="unresolved-text">{item.item}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
