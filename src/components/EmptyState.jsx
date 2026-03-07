export default function EmptyState({ icon, title, message, action }) {
  return (
    <div className="empty-state">
      <div className="icon">{icon}</div>
      <h2>{title}</h2>
      <p>{message}</p>
      {action}
    </div>
  );
}
