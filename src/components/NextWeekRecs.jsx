const ACTION_STYLES = {
  attend:   { bg: 'rgba(0,196,140,0.15)',  color: '#00C48C', label: 'ATTEND'   },
  skip:     { bg: 'rgba(255,59,92,0.15)',   color: '#FF3B5C', label: 'SKIP'     },
  decline:  { bg: 'rgba(255,59,92,0.15)',   color: '#FF3B5C', label: 'DECLINE'  },
  optional: { bg: 'rgba(255,102,0,0.15)',   color: '#FF6600', label: 'OPTIONAL' },
  review:   { bg: 'rgba(59,130,246,0.15)',  color: '#3B82F6', label: 'REVIEW'   },
};

function classifyAction(item) {
  const text = (item.task || '').toLowerCase();
  if (/skip|decline|cancel/i.test(text)) return 'skip';
  if (/optional|delegate/i.test(text)) return 'optional';
  if (/review|check|assess/i.test(text)) return 'review';
  return 'attend';
}

export default function NextWeekRecs({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="card">
      <div className="card-title">📅 Recommended Actions</div>
      <div className="card-sub" style={{ marginTop: -12, marginBottom: 16 }}>
        Based on past patterns and AI analysis
      </div>
      <div className="rec-list">
        {items.slice(0, 5).map((item, i) => {
          const actionKey = classifyAction(item);
          const a = ACTION_STYLES[actionKey];
          return (
            <div className="rec-row" key={i}>
              <span className="rec-badge" style={{ color: a.color, background: a.bg }}>
                {a.label}
              </span>
              <div>
                <div className="rec-meeting">{item.meeting || 'General'}</div>
                <div className="rec-reason">{item.task}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="rec-tip">
        💡 <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Tip:</strong> Declining low-score
        recurring meetings can recover <strong style={{ color: '#FF6600' }}>~3–4 hours/week</strong> based
        on your patterns.
      </div>
    </div>
  );
}
