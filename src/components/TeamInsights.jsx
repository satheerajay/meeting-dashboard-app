import { useState } from 'react';

const TYPE_COLORS = {
  standup: '#3B82F6', '1:1': '#00C48C', planning: '#EC4899',
  review: '#7C3AED', retrospective: '#14B8A6', 'all-hands': '#FF3B5C',
  sync: '#3B82F6', interview: '#00C48C', workshop: '#FFB800',
  brainstorm: '#FF6600', general: '#6B7280', strategy: '#FF6600',
  status: '#14B8A6', external: '#F97316', compliance: '#6B7280',
};

const ROLE_STYLES = {
  facilitator: { bg: 'rgba(255,102,0,0.15)', color: '#FF6600' },
  contributor: { bg: 'rgba(0,196,140,0.15)', color: '#00C48C' },
  observer:    { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' },
  dominator:   { bg: 'rgba(255,59,92,0.15)', color: '#FF3B5C' },
};

const SENTIMENT_STYLES = {
  positive: { icon: '😊', color: '#00C48C' },
  neutral:  { icon: '😐', color: 'rgba(255,255,255,0.4)' },
  negative: { icon: '😟', color: '#FF3B5C' },
  mixed:    { icon: '🤔', color: '#FFB800' },
};

function getTypeColor(type) {
  if (!type) return '#6B7280';
  return TYPE_COLORS[type.toLowerCase()] || '#6B7280';
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function MeetingCard({ meeting }) {
  const [expanded, setExpanded] = useState(true);
  const typeColor = getTypeColor(meeting.type);
  const sentiment = SENTIMENT_STYLES[meeting.sentiment] || SENTIMENT_STYLES.neutral;
  const decisions = Array.isArray(meeting.keyDecisions) ? meeting.keyDecisions : [];

  return (
    <div className="card" style={{ marginBottom: 16, overflow: 'hidden' }}>
      {/* Meeting header */}
      <div
        onClick={() => setExpanded(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', marginBottom: expanded ? 16 : 0,
          paddingBottom: expanded ? 14 : 0,
          borderBottom: expanded ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `${typeColor}20`, border: `1px solid ${typeColor}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>📋</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{meeting.summary}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
              {formatDate(meeting.startTime)}
              <span style={{
                marginLeft: 8, padding: '1px 7px', borderRadius: 4,
                background: `${typeColor}20`, color: typeColor,
                fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
              }}>{meeting.type}</span>
              <span style={{
                marginLeft: 6, padding: '1px 7px', borderRadius: 4,
                background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)',
                fontSize: 10, fontWeight: 600,
              }}>{meeting.duration}min · {meeting.attendeeCount} attendees</span>
              <span style={{
                marginLeft: 6, color: sentiment.color, fontSize: 10,
              }}>{sentiment.icon} {meeting.sentiment}</span>
            </div>
          </div>
        </div>
        <span style={{
          fontSize: 14, color: 'var(--orange)', fontWeight: 800,
          transition: 'transform 0.3s',
          transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
        }}>▼</span>
      </div>

      {expanded && (
        <div>
          {/* Quality summary */}
          {meeting.qualitySummary && (
            <div style={{
              padding: '12px 14px', borderRadius: 8, marginBottom: 14,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              fontSize: 12.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6,
            }}>
              {meeting.qualitySummary}
            </div>
          )}

          {/* Key decisions */}
          {decisions.length > 0 && (
            <div style={{
              padding: '10px 14px', borderRadius: 8, marginBottom: 14,
              background: 'rgba(0,196,140,0.05)', border: '1px solid rgba(0,196,140,0.1)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#00C48C', marginBottom: 6 }}>
                Key Decisions ({decisions.length})
              </div>
              {decisions.map((d, i) => (
                <div key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', padding: '2px 0' }}>
                  • {typeof d === 'string' ? d : JSON.stringify(d)}
                </div>
              ))}
            </div>
          )}

          {/* Participant list - summary style, no scores */}
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Participants
          </div>
          {meeting.participants.map((p, i) => {
            const rs = ROLE_STYLES[p.roleKey] || ROLE_STYLES.contributor;
            return (
              <div key={i} style={{
                padding: '8px 10px', borderRadius: 6, marginBottom: 2,
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontWeight: 800, color: 'var(--orange)',
                    fontFamily: "'DM Mono', monospace", fontSize: 11,
                    width: 22, flexShrink: 0,
                  }}>{String(i + 1).padStart(2, '0')}</span>

                  <span style={{ fontSize: 13, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </span>

                  <span style={{
                    padding: '2px 8px', borderRadius: 5,
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.04em',
                    fontFamily: "'DM Mono', monospace", textTransform: 'uppercase',
                    background: rs.bg, color: rs.color,
                  }}>{p.role}</span>

                  {p.speaking > 0 && (
                    <span style={{
                      fontSize: 11, color: 'rgba(255,255,255,0.4)',
                      fontFamily: "'DM Mono', monospace",
                    }}>🗣 {p.speaking}min</span>
                  )}
                </div>

                {p.feedback && (
                  <div style={{
                    marginTop: 4, marginLeft: 32,
                    fontSize: 11, color: 'rgba(255,255,255,0.35)',
                    fontStyle: 'italic', lineHeight: 1.4,
                  }}>
                    💬 {p.feedback}
                  </div>
                )}
              </div>
            );
          })}

          {/* Footer strip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16, marginTop: 10,
            padding: '8px 12px', borderRadius: 8,
            background: 'rgba(255,255,255,0.03)',
            fontSize: 11, color: 'rgba(255,255,255,0.35)',
          }}>
            <span>👥 {meeting.participants.length} participants</span>
            <span>🗣 {Math.round(meeting.participants.reduce((s, p) => s + p.speaking, 0))}min speaking</span>
            <span>🔀 {meeting.participants.reduce((s, p) => s + p.decisions, 0)} decisions</span>
          </div>
        </div>
      )}
    </div>
  );
}

export { MeetingCard };

export default function TeamInsights({ teamInsights }) {
  if (!teamInsights || teamInsights.length === 0) return null;

  return (
    <div>
      <div className="card-title" style={{ marginBottom: 6, fontSize: 14 }}>
        👥 Team Insights — By Meeting
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>
        Summary of each meeting with participant roles and AI feedback
      </div>
      {teamInsights.map((meeting) => (
        <MeetingCard key={meeting.meetingId} meeting={meeting} />
      ))}
    </div>
  );
}
