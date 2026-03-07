import { useState, useMemo, useCallback } from 'react';

function parse24(timeStr) {
  const [h, m] = (timeStr || '09:00').split(':').map(Number);
  return { h24: h, m: m || 0 };
}

function to24(h12, min, period) {
  let h24 = h12;
  if (period === 'AM' && h12 === 12) h24 = 0;
  else if (period === 'PM' && h12 !== 12) h24 = h12 + 12;
  return `${String(h24).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function TimePicker({ value, onChange, label }) {
  const { h24, m } = parse24(value);
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;

  const setH = useCallback((newH) => {
    const clamped = Math.max(1, Math.min(12, parseInt(newH) || 1));
    onChange(to24(clamped, m, period));
  }, [m, period, onChange]);

  const setM = useCallback((newM) => {
    const clamped = Math.max(0, Math.min(59, parseInt(newM) || 0));
    onChange(to24(h12, clamped, period));
  }, [h12, period, onChange]);

  const togglePeriod = useCallback(() => {
    const newP = period === 'AM' ? 'PM' : 'AM';
    onChange(to24(h12, m, newP));
  }, [h12, m, period, onChange]);

  return (
    <div className="tp-wrap">
      <div className="tp-box">
        <input
          type="number"
          className="tp-num"
          value={h12}
          min={1} max={12}
          onChange={e => setH(e.target.value)}
        />
        <span className="tp-colon">:</span>
        <input
          type="number"
          className="tp-num"
          value={String(m).padStart(2, '0')}
          min={0} max={59}
          onChange={e => setM(e.target.value)}
        />
        <button type="button" className="tp-period" onClick={togglePeriod}>
          {period}
        </button>
      </div>
      <span className="tp-label">{label}</span>
    </div>
  );
}

const DURATION_OPTIONS = [
  { value: 0, label: 'All meetings' },
  { value: 5, label: '5 min +' },
  { value: 10, label: '10 min +' },
  { value: 15, label: '15 min +' },
  { value: 30, label: '30 min +' },
  { value: 45, label: '45 min +' },
  { value: 60, label: '1 hour +' },
  { value: 90, label: '1.5 hours +' },
  { value: 120, label: '2 hours +' },
];

export default function TriggerPanel({ onTrigger, isRunning }) {
  const [collapsed, setCollapsed] = useState(false);
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState({
    dateFrom: '', dateTo: '',
    workStart: '09:00', workEnd: '17:00',
    workDays: '',
    minDuration: 0, typeFilter: '',
    ownerEmail: localStorage.getItem('ownerEmail') || '',
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const workHoursCalc = useMemo(() => {
    const s = parse24(form.workStart);
    const e = parse24(form.workEnd);
    const startMin = s.h24 * 60 + s.m;
    const endMin = e.h24 * 60 + e.m;
    let diff = endMin - startMin;
    if (diff <= 0) diff += 1440;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return { total: diff, hours, mins, display: mins > 0 ? `${hours}h ${mins}m` : `${hours}h` };
  }, [form.workStart, form.workEnd]);

  async function handleRun() {
    setStatus({ type: 'loading', message: 'Starting analysis...' });
    if (form.ownerEmail) localStorage.setItem('ownerEmail', form.ownerEmail);
    const payload = {
      dateFrom: form.dateFrom || null,
      dateTo: form.dateTo || null,
      workHours: workHoursCalc.total / 60,
      workDays: parseFloat(form.workDays) || 5,
      minDuration: form.minDuration,
      typeFilter: form.typeFilter || null,
      ownerEmail: form.ownerEmail || null,
    };
    const result = await onTrigger(payload);
    setStatus({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });
  }

  async function handleDefaults() {
    setStatus({ type: 'loading', message: 'Starting with defaults...' });
    const result = await onTrigger({ useDefaults: true });
    setStatus({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });
  }

  return (
    <div className="trigger-panel">
      <div className="trigger-header" onClick={() => setCollapsed(!collapsed)}>
        <div className="trigger-header-left">
          <span className="icon">⚙️</span>
          <div>
            <div className="title">Run Custom Analysis</div>
            <div className="subtitle">Set date range &amp; filters — or skip to use last week's defaults</div>
          </div>
        </div>
        <div className="trigger-toggle" style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▲
        </div>
      </div>

      <div className={`trigger-body ${collapsed ? 'collapsed' : ''}`}>
        <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="form-field">
            <label>👤 Your Email <span style={{ fontSize: 10, opacity: 0.5 }}>(for personalized insights)</span></label>
            <input type="email" placeholder="e.g. you@orangehrm.com"
              value={form.ownerEmail} onChange={e => update('ownerEmail', e.target.value)}
              style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }} />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>📅 Date From</label>
            <input type="date" value={form.dateFrom} onChange={e => update('dateFrom', e.target.value)} />
          </div>
          <div className="form-field">
            <label>📅 Date To</label>
            <input type="date" value={form.dateTo} onChange={e => update('dateTo', e.target.value)} />
          </div>
          <div className="form-field">
            <label>📆 Work Days / Week</label>
            <input type="number" min="1" max="7" placeholder="Default: 5"
              value={form.workDays} onChange={e => update('workDays', e.target.value)} />
          </div>
        </div>

        <div className="form-row-2col">
          <div className="form-field">
            <label>🕐 Work Hours</label>
            <div className="time-range-picker">
              <TimePicker value={form.workStart} onChange={v => update('workStart', v)} label="Start" />
              <span className="time-arrow">→</span>
              <TimePicker value={form.workEnd} onChange={v => update('workEnd', v)} label="End" />
              <div className="time-calc">
                = <strong>{workHoursCalc.display}</strong> / day
              </div>
            </div>
          </div>

          <div className="form-field">
            <label>⏱ Minimum Meeting Duration</label>
            <div className="duration-picker">
              {DURATION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`dur-chip ${form.minDuration === opt.value ? 'active' : ''}`}
                  onClick={() => update('minDuration', opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-grid" style={{ marginTop: 14, gridTemplateColumns: '1fr' }}>
          <div className="form-field">
            <label>🏷 Meeting Type</label>
            <select value={form.typeFilter} onChange={e => update('typeFilter', e.target.value)}>
              <option value="">All types</option>
              <option value="standup">Standup</option>
              <option value="1:1">1:1</option>
              <option value="planning">Planning</option>
              <option value="review">Review</option>
              <option value="retrospective">Retrospective</option>
              <option value="all-hands">All-hands</option>
              <option value="sync">Sync</option>
            </select>
          </div>
        </div>

        <div className="form-actions" style={{ marginTop: 18 }}>
          <button className="btn" onClick={handleRun} disabled={isRunning}>
            {isRunning ? '⏳ Running...' : '▶ Run Analysis'}
          </button>
          <button className="btn-secondary" onClick={handleDefaults} disabled={isRunning}>
            ⏭ Skip — use last week's defaults
          </button>
          {status && (
            <span className={`status-pill ${status.type === 'success' ? 'success' : status.type === 'error' ? 'error' : ''}`}>
              {status.type === 'loading' ? '⏳' : status.type === 'success' ? '✅' : '❌'} {status.message}
            </span>
          )}
        </div>

        <div className="form-hint">
          💡 All fields optional. Results appear on this dashboard in real-time after ~2 minutes and are also sent via email.
        </div>
      </div>
    </div>
  );
}
