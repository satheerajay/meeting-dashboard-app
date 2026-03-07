import { useState } from 'react';

function priorityFromDeadline(deadline) {
  if (!deadline) return 'none';
  const dl = deadline.toLowerCase();
  if (/today|asap|urgent|immediately|now/i.test(dl)) return 'high';
  if (/tomorrow|end of day|eod|next day/i.test(dl)) return 'high';
  if (/this week|next meeting|few days/i.test(dl)) return 'medium';
  return 'low';
}

const priorityConfig = {
  high:   { label: 'Urgent',  color: '#FF3B5C', bg: 'rgba(255,59,92,0.12)', icon: '🔴' },
  medium: { label: 'Soon',    color: '#FF6600', bg: 'rgba(255,102,0,0.12)', icon: '🟠' },
  low:    { label: 'Later',   color: '#00C48C', bg: 'rgba(0,196,140,0.12)', icon: '🟢' },
  none:   { label: 'No date', color: 'rgba(255,255,255,0.35)', bg: 'rgba(255,255,255,0.06)', icon: '⚪' },
};

export default function ActionItems({ items }) {
  const [checked, setChecked] = useState({});

  if (!items || items.length === 0) return null;

  const toggle = (i) => setChecked(prev => ({ ...prev, [i]: !prev[i] }));

  const enriched = items.map((item, i) => ({
    ...item,
    index: i,
    priority: priorityFromDeadline(item.deadline),
  }));

  const sortOrder = { high: 0, medium: 1, low: 2, none: 3 };
  enriched.sort((a, b) => sortOrder[a.priority] - sortOrder[b.priority]);

  return (
    <div className="card">
      <div className="card-title"><span>🎯</span> Action Items</div>
      <div className="ai-list">
        {enriched.map((item) => {
          const p = priorityConfig[item.priority];
          const done = checked[item.index];
          return (
            <div
              className={`ai-card ${done ? 'ai-done' : ''}`}
              key={item.index}
              onClick={() => toggle(item.index)}
            >
              <div className="ai-left">
                <div className={`ai-checkbox ${done ? 'checked' : ''}`}>
                  {done && <span>✓</span>}
                </div>
                <div className="ai-priority-dot" style={{ background: p.color }} title={p.label} />
              </div>
              <div className="ai-center">
                <div className={`ai-task-text ${done ? 'struck' : ''}`}>{item.task}</div>
                <div className="ai-meta">
                  <span className="ai-owner-chip">👤 {item.owner}</span>
                  {item.deadline && (
                    <span className="ai-deadline-chip" style={{ background: p.bg, color: p.color }}>
                      📅 {item.deadline}
                    </span>
                  )}
                </div>
              </div>
              <div className="ai-right">
                <span className="ai-meeting-chip">{item.meeting}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="ai-summary-bar">
        <span>{Object.values(checked).filter(Boolean).length} / {items.length} completed</span>
        <div className="ai-progress-track">
          <div
            className="ai-progress-fill"
            style={{ width: `${(Object.values(checked).filter(Boolean).length / items.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
