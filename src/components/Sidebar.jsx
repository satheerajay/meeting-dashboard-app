export default function Sidebar({ activeNav, onNav, data }) {
  const actionCount = data?.actionItems?.length || 0;
  const unresolvedCount = data?.unresolvedItems?.length || 0;

  const meetingCount = data?.meetings?.length || 0;

  const navItems = [
    { key: 'dashboard', icon: '📊', label: 'Meeting Efficiency', badge: 'Live' },
    { key: 'team', icon: '👥', label: 'Team Insights' },
    { key: 'meetings', icon: '📋', label: 'Individual Insights', badge: meetingCount > 0 ? meetingCount : null },
  ];

  const mgmtItems = [
    { key: 'calendar', icon: '📅', label: 'Calendar' },
    { key: 'actions', icon: '🎯', label: 'Action Items', badge: actionCount > 0 ? actionCount : null },
    { key: 'unresolved', icon: '🚨', label: 'Unresolved', badge: unresolvedCount > 0 ? unresolvedCount : null },
  ];

  const scenarioItems = [
    { key: 'scenarios', icon: '🧩', label: 'Scenarios' },
  ];

  const sysItems = [
    { key: 'settings', icon: '⚙️', label: 'Settings' },
    { key: 'reports', icon: '📄', label: 'Download Report' },
  ];

  const renderNav = (items) =>
    items.map(({ key, icon, label, badge }) => (
      <button
        key={key}
        className={`nav-item ${activeNav === key ? 'active' : ''}`}
        onClick={() => onNav(key)}
      >
        <span className="nav-icon">{icon}</span>
        {label}
        {badge && <span className="nav-badge">{badge}</span>}
      </button>
    ));

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/ohrm_logo.png" alt="OrangeHRM" className="logo-img" />
        <div className="logo-text">
          <div className="brand">OrangeHRM</div>
          <div className="sub">Meeting Analytics</div>
        </div>
      </div>

      <div className="sidebar-section-label">Analytics</div>
      {renderNav(navItems)}

      <div className="sidebar-section-label">Management</div>
      {renderNav(mgmtItems)}

      <div className="sidebar-section-label">Scenarios</div>
      {renderNav(scenarioItems)}

      <div className="sidebar-section-label">System</div>
      {renderNav(sysItems)}

      <div className="sidebar-footer">
        <div className="avatar">SA</div>
        <div>
          <div className="footer-name">Satheera A.</div>
          <div className="footer-role">HR Admin</div>
        </div>
      </div>
    </aside>
  );
}
