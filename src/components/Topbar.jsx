export default function Topbar({ weekLabel, onRefresh, dbConnected, loading }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1>Meeting Intelligence</h1>
        <p>POWERED BY AI TRANSCRIPTS · n8n · GPT-4.1 · Fathom AI</p>
      </div>
      <div className="topbar-right">
        {dbConnected !== null && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--muted)' }}>
            <span className={`connection-dot ${dbConnected ? 'connected' : 'disconnected'}`} />
            {dbConnected ? 'DB Connected' : 'DB Offline'}
          </span>
        )}
        <img
          src="/images/Team_logo.png"
          alt="Adroit"
          style={{
            height: 36,
            objectFit: 'contain',
            filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.3))',
          }}
        />
      </div>
    </div>
  );
}
