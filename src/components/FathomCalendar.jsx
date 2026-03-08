import { useState, useEffect, useRef } from 'react';

const T = {
  orange: 'var(--orange)',
  green: 'var(--green)',
  red: 'var(--red)',
  blue: 'var(--blue)',
  yellow: 'var(--yellow)',
  purple: 'var(--purple)',
  text: 'var(--text)',
  text2: 'var(--text2)',
  muted: 'var(--muted)',
  border: 'var(--border)',
  surface: 'var(--surface)',
  surface2: 'var(--surface2)',
  charcoal: 'var(--charcoal)',
  charcoal2: 'var(--charcoal2)',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const BASE_EVENTS = [
  { id: 1, day: 1, start: 9, end: 9.5, title: 'Team Standup', color: T.blue, light: 'rgba(59,130,246,0.15)', people: 'Sarah, Marcus +3', insight: true },
  { id: 2, day: 1, start: 11, end: 12, title: 'Design Review', color: T.blue, light: 'rgba(59,130,246,0.15)', people: 'Product team', insight: true },
  { id: 3, day: 2, start: 9, end: 10, title: 'Sprint Planning', color: T.green, light: 'rgba(0,196,140,0.12)', people: 'Eng team', insight: true },
  { id: 4, day: 2, start: 14, end: 15, title: 'Product Sync — Design', color: T.blue, light: 'rgba(59,130,246,0.15)', people: '5 attendees', insight: true, isNext: true },
  { id: 5, day: 2, start: 16, end: 16.5, title: 'Weekly Touchbase', color: T.red, light: 'rgba(255,59,92,0.12)', people: 'Alex P.', insight: true },
  { id: 6, day: 3, start: 10, end: 11, title: 'Eng All-Hands', color: T.green, light: 'rgba(0,196,140,0.12)', people: '24 attendees', insight: false },
  { id: 7, day: 3, start: 13, end: 14, title: '1:1 with Manager', color: T.purple, light: 'rgba(124,58,237,0.12)', people: 'Jordan T.', insight: true },
  { id: 8, day: 4, start: 9.5, end: 10, title: 'Daily Standup', color: T.blue, light: 'rgba(59,130,246,0.15)', people: 'Full team', insight: false },
  { id: 9, day: 4, start: 11, end: 12.5, title: 'Quarterly Roadmap Review', color: T.yellow, light: 'rgba(255,184,0,0.12)', people: 'Leadership +8', insight: true },
  { id: 10, day: 5, start: 10, end: 11, title: 'Customer Feedback Session', color: T.blue, light: 'rgba(59,130,246,0.15)', people: '3 clients', insight: true },
  { id: 11, day: 5, start: 14, end: 14.5, title: 'Marketing Sync', color: T.purple, light: 'rgba(124,58,237,0.12)', people: 'Marketing team', insight: false },
];

const INSIGHT_CARDS = [
  { type: 'warning', icon: '⏱', title: 'Shorten to 45 min', tag: 'Duration', body: 'Past 6 Product Syncs averaged 48 min. Blocking a full hour creates dead time. Suggest scheduling 45 min to keep energy focused.', action: '→ Resize event' },
  { type: 'tip', icon: '📋', title: 'Send agenda 30 min before', tag: 'Prep', body: 'Meetings with a pre-shared agenda ran 22% more efficiently. 3 open action items from last week haven\'t been resolved.', chips: ['Figma prototype review', 'API spec sign-off', 'Q4 roadmap'], action: '→ Draft agenda with AI' },
  { type: 'success', icon: '🎙', title: 'Balance talk time', tag: 'Engagement', body: 'You spoke 68% of the time on average. Try facilitating more input from Sarah K. and Marcus D.', talkRatio: 68, attendees: [{ label: 'You', color: T.blue }, { label: 'Sarah K.', color: T.red }, { label: 'Marcus D.', color: T.yellow }, { label: '+2', color: T.green }] },
  { type: 'danger', icon: '🚫', title: 'Consider skipping', tag: 'Skip', body: 'Your Thursday 4 PM "Weekly Touchbase" with Alex has had no action items in 4 sessions. Convert to async Slack updates.', skipBtn: true },
];

const HEALTH_METRICS = [
  { label: 'Focus', val: 82, color: T.green },
  { label: 'Attendance', val: 60, color: T.yellow },
  { label: 'Action Items', val: 75, color: T.blue },
  { label: 'Follow-up Rate', val: 45, color: T.red },
  { label: 'Punctuality', val: 90, color: T.green },
];

const PATTERNS = [
  { type: 'tip', icon: '🕘', title: 'Peak productivity: 9–11 AM', body: '3 meetings are scheduled during your best deep-work window. Consider blocking it.', action: '→ Block focus time' },
  { type: 'warning', icon: '😓', title: 'Tuesday overload: 6.5h in meetings', body: 'Back-to-back meetings with no breaks. Past days like this correlated with lower sentiment.', action: '→ Suggest rescheduling' },
  { type: 'success', icon: '🌙', title: 'Fridays improving', body: "You've reduced Friday meeting load by 40% over the last month. Deep-work Fridays are working." },
  { type: 'info', icon: '🔁', title: '4 recurring meetings need review', body: "Haven't generated meaningful outcomes in 30+ days. An audit could save ~3.5h/week.", action: '→ Run audit' },
];

const ACTIONS_DATA = [
  { text: 'Finalize API spec for mobile team', from: 'Design Review · 2 days ago', owner: 'You' },
  { text: 'Share Figma link with stakeholders', from: 'Design Review · 2 days ago', owner: 'Sarah K.' },
  { text: 'Schedule user testing sessions', from: 'Sprint Planning · 4 days ago', owner: 'Marcus D.' },
  { text: 'Review Q4 budget with Finance', from: 'Quarterly Sync · 1 week ago', owner: 'You' },
  { text: 'Update onboarding docs with new flow', from: 'Team Standup · 3 days ago', owner: 'Priya M.' },
];

const CALENDAR_SECTIONS = [
  { label: 'My Calendars', items: [{ name: 'Jamie Scott', c: T.blue }, { name: 'Work', c: T.green }, { name: 'Reminders', c: T.yellow }] },
  { label: 'Other Calendars', items: [{ name: 'Holidays in US', c: T.red }, { name: 'Team Shared', c: T.purple }] },
];

const fmtTime = (h) => {
  const hh = Math.floor(h);
  const mm = (h % 1) * 60;
  return `${hh > 12 ? hh - 12 : hh || 12}:${mm === 0 ? '00' : mm} ${h >= 12 ? 'PM' : 'AM'}`;
};

const borderColors = { tip: T.blue, warning: T.yellow, success: T.green, danger: T.red, info: T.blue };

function InsightCard({ card, delay = 0 }) {
  const bc = borderColors[card.type] || T.blue;
  return (
    <div className="fathom-cal-insight-card" style={{ borderLeftColor: bc, animationDelay: `${delay}s` }}>
      <div className="fathom-cal-insight-head">
        <span className="fathom-cal-insight-icon">{card.icon}</span>
        <span className="fathom-cal-insight-title">{card.title}</span>
        <span className="fathom-cal-insight-tag" style={{ color: bc }}>{card.tag}</span>
      </div>
      <p className="fathom-cal-insight-body">{card.body}</p>
      {card.talkRatio != null && (
        <div className="fathom-cal-talk-row">
          <div className="fathom-cal-talk-head">
            <span>You ({card.talkRatio}%)</span>
            <span>Others ({100 - card.talkRatio}%)</span>
          </div>
          <div className="fathom-cal-talk-track">
            <div className="fathom-cal-talk-fill" style={{ width: `${card.talkRatio}%`, background: T.orange }} />
          </div>
        </div>
      )}
      {card.attendees && (
        <div className="fathom-cal-attendees">
          {card.attendees.map((a, i) => (
            <span key={i} className="fathom-cal-attendee">
              <span className="fathom-cal-attendee-dot" style={{ background: a.color }} />
              {a.label}
            </span>
          ))}
        </div>
      )}
      {card.chips && (
        <div className="fathom-cal-chips">
          {card.chips.map((ch, i) => (
            <span key={i} className="fathom-cal-chip">{ch}</span>
          ))}
        </div>
      )}
      {card.action && <div className="fathom-cal-insight-action">{card.action}</div>}
      {card.skipBtn && (
        <button type="button" className="fathom-cal-skip-btn">✕ Decline & suggest async</button>
      )}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="fathom-cal-section-title">
      {children}
      <div className="fathom-cal-section-title-line" />
    </div>
  );
}

function MiniCalendar() {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevDays = new Date(viewYear, viewMonth, 0).getDate();
  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ n: prevDays - i, other: true });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ n: i, other: false });

  const isToday = (n) => !cells.find(c => c.n === n && c.other) && viewYear === today.getFullYear() && viewMonth === today.getMonth() && n === today.getDate();

  return (
    <div className="fathom-cal-mini">
      <div className="fathom-cal-mini-head">
        <span className="fathom-cal-mini-month">{MONTHS[viewMonth]} {viewYear}</span>
        <div className="fathom-cal-mini-nav">
          <button type="button" onClick={() => { if (viewMonth <= 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); }} className="fathom-cal-mini-nav-btn">‹</button>
          <button type="button" onClick={() => { if (viewMonth >= 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); }} className="fathom-cal-mini-nav-btn">›</button>
        </div>
      </div>
      <div className="fathom-cal-mini-grid">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="fathom-cal-mini-day-label">{d}</div>
        ))}
        {cells.map((c, i) => (
          <div
            key={i}
            className={`fathom-cal-mini-day ${c.other ? 'other' : ''} ${isToday(c.n) ? 'today' : ''}`}
          >
            {c.n}
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarEvent({ ev, onClick, isSelected }) {
  const dur = ev.end - ev.start;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(ev)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(ev)}
      className={`fathom-cal-event ${ev.isNext ? 'next' : ''} ${isSelected ? 'selected' : ''}`}
      style={{
        top: ev.start * 60,
        height: (ev.end - ev.start) * 60 - 3,
        background: ev.isNext ? ev.color : ev.light,
        color: ev.isNext ? '#fff' : ev.color,
        borderLeftColor: ev.isNext ? 'transparent' : ev.color,
      }}
    >
      <div className="fathom-cal-event-title">
        {ev.insight && <span className="fathom-cal-event-spark">✦</span>}
        {ev.title}
      </div>
      {dur >= 0.5 && <div className="fathom-cal-event-time">{fmtTime(ev.start)} – {fmtTime(ev.end)}</div>}
      {dur >= 0.75 && <div className="fathom-cal-event-people">{ev.people}</div>}
    </div>
  );
}

function TimeGrid({ weekOffset, selectedEvent, onSelectEvent }) {
  const wrapperRef = useRef(null);
  const today = new Date();
  const ws = new Date(today);
  ws.setDate(today.getDate() - today.getDay() + weekOffset * 7);
  ws.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (wrapperRef.current) wrapperRef.current.scrollTop = 8 * 60 - 20;
  }, []);

  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  return (
    <div ref={wrapperRef} className="fathom-cal-time-wrap">
      <div className="fathom-cal-time-grid">
        <div className="fathom-cal-time-gutter">
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="fathom-cal-time-label" style={{ top: h * 60 }}>
              {h === 0 ? '' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
            </div>
          ))}
        </div>
        {Array.from({ length: 7 }, (_, i) => {
          const d = new Date(ws);
          d.setDate(ws.getDate() + i);
          const isTodayCol = d.toDateString() === today.toDateString();
          const dayEvents = weekOffset === 0 ? BASE_EVENTS.filter(e => e.day === i) : [];
          return (
            <div key={i} className="fathom-cal-day-col">
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} className="fathom-cal-hour-cell" style={{ top: h * 60, height: 60 }} />
              ))}
              {isTodayCol && (
                <div className="fathom-cal-now-line" style={{ top: nowMins }}>
                  <div className="fathom-cal-now-dot" />
                  <div className="fathom-cal-now-bar" />
                </div>
              )}
              {dayEvents.map(ev => (
                <CalendarEvent key={ev.id} ev={ev} onClick={onSelectEvent} isSelected={selectedEvent?.id === ev.id} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FathomCalendar() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [checkedActions, setCheckedActions] = useState({});

  const today = new Date();
  const ws = new Date(today);
  ws.setDate(today.getDate() - today.getDay() + weekOffset * 7);
  ws.setHours(0, 0, 0, 0);
  const we = new Date(ws);
  we.setDate(ws.getDate() + 6);
  const dateStr = ws.getMonth() === we.getMonth()
    ? `${MONTHS[ws.getMonth()]} ${ws.getDate()}–${we.getDate()}, ${ws.getFullYear()}`
    : `${MONTHS[ws.getMonth()]} ${ws.getDate()} – ${MONTHS[we.getMonth()]} ${we.getDate()}, ${ws.getFullYear()}`;

  const toggleAction = (i) => setCheckedActions(p => ({ ...p, [i]: !p[i] }));

  return (
    <div className="fathom-cal-page">
      <header className="fathom-cal-topbar">
        <div className="fathom-cal-topbar-logo">
          <div className="fathom-cal-logo-icon">🗓️</div>
          <span className="fathom-cal-topbar-brand">Fathom <span className="fathom-cal-topbar-brand-accent">Calendar</span></span>
        </div>
        <div className="fathom-cal-topbar-nav">
          <button type="button" className="fathom-cal-nav-btn" onClick={() => setWeekOffset(o => o - 1)}>‹</button>
          <button type="button" className="fathom-cal-nav-btn" onClick={() => setWeekOffset(o => o + 1)}>›</button>
        </div>
        <span className="fathom-cal-topbar-date">{dateStr}</span>
        <button type="button" className="fathom-cal-today-btn" onClick={() => setWeekOffset(0)}>Today</button>
        <div className="fathom-cal-topbar-spacer" />
        <div className="fathom-cal-badge">
          <span className="fathom-cal-badge-dot" />
          <span>Fathom Insights</span>
        </div>
        <div className="fathom-cal-avatar">SA</div>
      </header>

      <div className="fathom-cal-main">
        <aside className="fathom-cal-sidebar">
          <button type="button" className="fathom-cal-create-btn">
            <span className="fathom-cal-create-icon">+</span> Create
          </button>
          <MiniCalendar />
          {CALENDAR_SECTIONS.map(section => (
            <div key={section.label} className="fathom-cal-sidebar-section">
              <div className="fathom-cal-sidebar-section-label">{section.label}</div>
              {section.items.map(item => (
                <div key={item.name} className="fathom-cal-list-item">
                  <span className="fathom-cal-list-dot" style={{ background: item.c }} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          ))}
        </aside>

        <div className="fathom-cal-body">
          <div className="fathom-cal-viewbar">
            {['Day', 'Week', 'Month', 'Schedule'].map(v => (
              <button key={v} type="button" className={`fathom-cal-view-btn ${v === 'Week' ? 'active' : ''}`}>{v}</button>
            ))}
          </div>
          <div className="fathom-cal-weekhead">
            <div className="fathom-cal-weekhead-gutter" />
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - d.getDay() + weekOffset * 7 + i);
              const isToday = d.toDateString() === today.toDateString();
              return (
                <div key={i} className="fathom-cal-weekhead-cell">
                  <div className="fathom-cal-weekhead-day">{DAYS[i]}</div>
                  <div className={`fathom-cal-weekhead-num ${isToday ? 'today' : ''}`}>{d.getDate()}</div>
                </div>
              );
            })}
          </div>
          <TimeGrid weekOffset={weekOffset} selectedEvent={selectedEvent} onSelectEvent={setSelectedEvent} />
        </div>

        <aside className="fathom-cal-panel">
          <div className="fathom-cal-panel-header">
            <div className="fathom-cal-panel-head-row">
              <div className="fathom-cal-panel-brand">
                <div className="fathom-cal-panel-logo">◈</div>
                <span>Fathom <span className="fathom-cal-panel-accent">Insights</span></span>
              </div>
              <button type="button" className="fathom-cal-panel-settings" aria-label="Settings">⚙</button>
            </div>
            <div className="fathom-cal-panel-stats">
              {[['14h', 'Mtgs / week'], ['73%', 'Effectiveness'], ['3↓', 'Can skip']].map(([v, l]) => (
                <div key={l} className="fathom-cal-stat-card">
                  <div className="fathom-cal-stat-value">{v}</div>
                  <div className="fathom-cal-stat-label">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <nav className="fathom-cal-tabs">
            {['upcoming', 'patterns', 'actions'].map(t => (
              <button key={t} type="button" className={`fathom-cal-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
            ))}
          </nav>
          <div className="fathom-cal-panel-content">
            {activeTab === 'upcoming' && (
              <>
                <div className="fathom-cal-next-banner">
                  <div className="fathom-cal-next-bar" />
                  <div className="fathom-cal-next-label">▶ Next Meeting</div>
                  <div className="fathom-cal-next-title">Product Sync — Design Review</div>
                  <div className="fathom-cal-next-meta">Today · 2:00–3:00 PM · 5 attendees</div>
                  <div className="fathom-cal-next-score">
                    <svg width="48" height="48" viewBox="0 0 48 48" className="fathom-cal-score-ring">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                      <circle cx="24" cy="24" r="20" fill="none" stroke={T.orange} strokeWidth="4" strokeDasharray="125.6" strokeDashoffset="37.68" strokeLinecap="round" />
                    </svg>
                    <span className="fathom-cal-score-num">70</span>
                  </div>
                </div>
                <div className="fathom-cal-tab-block">
                  <SectionTitle>💡 Suggestions</SectionTitle>
                  {INSIGHT_CARDS.map((c, i) => <InsightCard key={i} card={c} delay={i * 0.05} />)}
                </div>
                <div className="fathom-cal-tab-block">
                  <SectionTitle>📊 Meeting Health</SectionTitle>
                  <div className="fathom-cal-health-wrap">
                    {HEALTH_METRICS.map(m => (
                      <div key={m.label} className="fathom-cal-health-row">
                        <span className="fathom-cal-health-label">{m.label}</span>
                        <div className="fathom-cal-health-track">
                          <div className="fathom-cal-health-fill" style={{ width: `${m.val}%`, background: m.color }} />
                        </div>
                        <span className="fathom-cal-health-val">{m.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            {activeTab === 'patterns' && (
              <div className="fathom-cal-tab-block">
                <SectionTitle>📈 Weekly Patterns</SectionTitle>
                {PATTERNS.map((c, i) => <InsightCard key={i} card={c} delay={i * 0.05} />)}
              </div>
            )}
            {activeTab === 'actions' && (
              <div className="fathom-cal-tab-block">
                <SectionTitle>✅ Open Action Items</SectionTitle>
                <div className="fathom-cal-actions-list">
                  {ACTIONS_DATA.map((a, i) => (
                    <div key={i} className="fathom-cal-action-row">
                      <button type="button" className={`fathom-cal-action-check ${checkedActions[i] ? 'checked' : ''}`} onClick={() => toggleAction(i)} aria-label="Toggle">
                        {checkedActions[i] && '✓'}
                      </button>
                      <div>
                        <div className={`fathom-cal-action-text ${checkedActions[i] ? 'done' : ''}`}>{a.text}</div>
                        <div className="fathom-cal-action-meta">{a.from} · {a.owner}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <InsightCard card={{ type: 'tip', icon: '🤖', title: '2 items overdue', body: "The API spec and Figma link tasks are overdue. Fathom will auto-surface them in today's meeting brief.", action: '→ View meeting brief' }} delay={0} />
              </div>
            )}
          </div>
          <footer className="fathom-cal-panel-footer">
            <button type="button" className="fathom-cal-footer-btn">📤 Export report</button>
            <button type="button" className="fathom-cal-footer-btn primary">🤖 AI Brief</button>
          </footer>
        </aside>
      </div>
    </div>
  );
}
