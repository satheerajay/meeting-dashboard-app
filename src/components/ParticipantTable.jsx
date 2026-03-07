export default function ParticipantTable({ participants }) {
  if (!participants || participants.length === 0) return null;

  return (
    <div className="card">
      <div className="card-title"><span>👥</span> Participant Leaderboard</div>
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Participant</th>
            <th>Score</th>
            <th>Role</th>
            <th>Decisions</th>
            <th>Speaking Time</th>
            <th>Meetings</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p) => (
            <tr key={p.rank}>
              <td className="rank-cell">{String(p.rank).padStart(2, '0')}</td>
              <td><strong>{p.name}</strong></td>
              <td>
                <span className={`pill pill-${p.tier}`}>{p.score}</span>
              </td>
              <td>
                <span className={`role-chip role-${p.roleKey}`}>{p.role}</span>
              </td>
              <td>{p.decisions}</td>
              <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
                {p.speakingMinutes} min
              </td>
              <td>{p.meetings}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
