export default function Scenarios({ onSelectScenario }) {
  const sections = [
    {
      id: 1,
      title: 'Sales Intelligence Dashboard',
      subtitle: 'Scenario 1',
      icon: '📊',
      description: 'Call analytics, rep performance, won/lost deal patterns, and AI coaching from sales call transcripts (Fathom AI, Gong, Chorus).',
      image: 'sales', // gradient + icon
      onSelect: onSelectScenario ? () => onSelectScenario(1) : undefined,
    },
    {
      id: 2,
      title: 'Client Pulse Dashboard',
      subtitle: 'Scenario 2',
      icon: '👥',
      description: 'Customer Success intelligence: client health, AI relationship summaries, sentiment trends, meeting history, and AI coaching from Fathom transcripts.',
      image: 'clientpulse',
      onSelect: onSelectScenario ? () => onSelectScenario(2) : undefined,
    },
    {
      id: 3,
      title: 'Meeting Intelligence Dashboard',
      subtitle: 'Scenario 3',
      icon: '◈',
      description: 'CPO command center: team meeting performance, Fathom AI insights, skill radar, coaching briefs, and 90-day improvement plans.',
      image: 'cpo',
      onSelect: onSelectScenario ? () => onSelectScenario(3) : undefined,
    },
    {
      id: 4,
      title: 'Leadership Visibility Dashboard',
      subtitle: 'Scenario 4',
      icon: '◈',
      description: 'CEO view: who speaks, who is silent, decision drivers, problem vs. solution ratio, meeting health pulse, and participation equity from Fathom AI transcripts.',
      image: 'leadership',
      onSelect: onSelectScenario ? () => onSelectScenario(4) : undefined,
    },
  ];

  return (
    <div className="scenarios-page">
      <div className="scenarios-header">
        <h2 className="scenarios-title">Scenarios</h2>
        <p className="scenarios-subtitle">Review and manage your scenarios below.</p>
      </div>

      <div className="scenarios-grid">
        {sections.map(({ id, title, subtitle, icon, description, image, onSelect }) => (
          <section
            key={id}
            className={`scenario-section card ${onSelect ? 'scenario-section-clickable' : ''}`}
            onClick={onSelect}
            onKeyDown={onSelect ? (e) => e.key === 'Enter' && onSelect() : undefined}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
          >
            {image === 'sales' && (
              <div className="scenario-card-hero scenario-card-hero-sales">
                <div className="scenario-card-hero-pattern" aria-hidden />
                <img src="/ohrm_logo.png" alt="" className="scenario-card-hero-img" />
                <span className="scenario-card-hero-icon" aria-hidden>📈</span>
              </div>
            )}
            {image === 'clientpulse' && (
              <div className="scenario-card-hero scenario-card-hero-clientpulse">
                <div className="scenario-card-hero-pattern" aria-hidden />
                <span className="scenario-card-hero-icon scenario-card-hero-icon-cs" aria-hidden>◈</span>
              </div>
            )}
            {image === 'cpo' && (
              <div className="scenario-card-hero scenario-card-hero-cpo">
                <div className="scenario-card-hero-pattern" aria-hidden />
                <span className="scenario-card-hero-icon scenario-card-hero-icon-cpo" aria-hidden>◈</span>
              </div>
            )}
            {image === 'leadership' && (
              <div className="scenario-card-hero scenario-card-hero-leadership">
                <div className="scenario-card-hero-pattern" aria-hidden />
                <span className="scenario-card-hero-icon scenario-card-hero-icon-leadership" aria-hidden>◈</span>
              </div>
            )}
            <div className="scenario-section-header">
              <span className="scenario-icon">{icon}</span>
              <div>
                <h3 className="scenario-section-title">{title}</h3>
                {subtitle && <span className="scenario-section-subtitle">{subtitle}</span>}
              </div>
            </div>
            <p className="scenario-section-desc">{description}</p>
            <div className="scenario-section-body">
              {onSelect ? (
                <span className="scenario-enter-link">Open dashboard →</span>
              ) : (
                <p className="scenario-placeholder">Content for {title} can be added here.</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
