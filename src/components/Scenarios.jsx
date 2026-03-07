export default function Scenarios() {
  const sections = [
    { id: 1, title: 'Scenario 1', icon: '🎯', description: 'Configure and explore scenario 1.' },
    { id: 2, title: 'Scenario 2', icon: '📌', description: 'Configure and explore scenario 2.' },
    { id: 3, title: 'Scenario 3', icon: '🔀', description: 'Configure and explore scenario 3.' },
    { id: 4, title: 'Scenario 4', icon: '📋', description: 'Configure and explore scenario 4.' },
  ];

  return (
    <div className="scenarios-page">
      <div className="scenarios-header">
        <h2 className="scenarios-title">Scenarios</h2>
        <p className="scenarios-subtitle">Review and manage your scenarios below.</p>
      </div>

      <div className="scenarios-grid">
        {sections.map(({ id, title, icon, description }) => (
          <section key={id} className="scenario-section card">
            <div className="scenario-section-header">
              <span className="scenario-icon">{icon}</span>
              <h3 className="scenario-section-title">{title}</h3>
            </div>
            <p className="scenario-section-desc">{description}</p>
            <div className="scenario-section-body">
              <p className="scenario-placeholder">Content for {title} can be added here.</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
