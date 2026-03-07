import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import TriggerPanel from './components/TriggerPanel';
import Dashboard from './components/Dashboard';
import TeamInsights from './components/TeamInsights';
import MeetingSummary from './components/MeetingSummary';
import Scenarios from './components/Scenarios';
import EmptyState from './components/EmptyState';
import ReportGenerator from './components/ReportGenerator';

const POLL_INTERVAL = 5000;
const POLL_DURATION = 180000;

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dbConnected, setDbConnected] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportProgress, setReportProgress] = useState({ pct: 0, section: '' });
  const [viewDateFrom, setViewDateFrom] = useState(null);
  const [viewDateTo, setViewDateTo] = useState(null);
  const pollRef = useRef(null);
  const countdownRef = useRef(null);
  const lastUpdateRef = useRef(null);

  const fetchDashboard = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (viewDateFrom) params.set('dateFrom', viewDateFrom);
      if (viewDateTo) params.set('dateTo', viewDateTo);
      const qs = params.toString();
      const url = qs ? `/api/dashboard?${qs}` : '/api/dashboard';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
      if (json.summary?.dateFrom != null) setViewDateFrom(json.summary.dateFrom);
      if (json.summary?.dateTo != null) setViewDateTo(json.summary.dateTo);

      if (lastUpdateRef.current && json.summary?.lastUpdated !== lastUpdateRef.current && isRunning) {
        setIsRunning(false);
        stopPolling();
      }
      lastUpdateRef.current = json.summary?.lastUpdated;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isRunning]);

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      const json = await res.json();
      setDbConnected(json.status === 'ok');
    } catch {
      setDbConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(true);
    checkHealth();
  }, [fetchDashboard, checkHealth]);

  const startPolling = useCallback(() => {
    stopPolling();
    pollRef.current = setInterval(() => fetchDashboard(false), POLL_INTERVAL);
    setTimeout(() => stopPolling(), POLL_DURATION);
  }, [fetchDashboard]);

  function stopPolling() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
  }

  const handleTrigger = useCallback(async (payload) => {
    try {
      const res = await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || json.error || 'Trigger failed');

      if (!payload.useDefaults && payload.dateFrom && payload.dateTo) {
        setViewDateFrom(payload.dateFrom);
        setViewDateTo(payload.dateTo);
      }
      setIsRunning(true);
      setCountdown(120);
      startPolling();

      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            stopPolling();
            fetchDashboard(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return { success: true, message: json.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, [startPolling, fetchDashboard]);

  const handleRefresh = useCallback(() => {
    fetchDashboard(true);
    checkHealth();
  }, [fetchDashboard, checkHealth]);

  const dismissBanner = useCallback(() => {
    setIsRunning(false);
    stopPolling();
  }, []);

  const hasData = data && data.summary && data.summary.totalMeetings > 0;

  const handleNav = useCallback((key) => {
    if (key === 'reports' && hasData) {
      setGeneratingReport(true);
      setTimeout(() => {
        const trigger = document.querySelector('[data-report-trigger]');
        if (trigger) trigger.click();
      }, 300);
      return;
    }
    setActiveNav(key);
  }, [hasData]);

  return (
    <>
      {isRunning && (
        <div className="running-banner">
          <span className="pulse">⏳</span>
          Analysis running — auto-refreshing in
          <span className="countdown">{countdown}s</span>
          <button className="dismiss-btn" onClick={dismissBanner}>Dismiss</button>
        </div>
      )}

      <Sidebar activeNav={activeNav} onNav={handleNav} data={data} />

      <main className="main-area" style={isRunning ? { paddingTop: 48 } : undefined}>
        <Topbar
          weekLabel={data?.summary?.weekLabel}
          onRefresh={handleRefresh}
          dbConnected={dbConnected}
          loading={loading}
        />

        <div className="content">
          {activeNav === 'dashboard' && (
            <TriggerPanel onTrigger={handleTrigger} isRunning={isRunning} />
          )}

          {activeNav === 'scenarios' ? (
            <Scenarios />
          ) : loading && !data ? (
            <div className="loading-overlay">
              <div className="spinner" />
              <div className="loading-text">Connecting to database...</div>
            </div>
          ) : error && !data ? (
            <EmptyState
              icon="🔌"
              title="Connection Error"
              message={`Could not load dashboard data: ${error}. Check your .env PostgreSQL credentials.`}
              action={<button className="btn" onClick={handleRefresh}>Retry</button>}
            />
          ) : !hasData ? (
            <EmptyState
              icon="📊"
              title="No Meeting Data Yet"
              message="Run your first analysis using the panel above to trigger the n8n workflow. Results will appear here in real-time."
              action={null}
            />
          ) : activeNav === 'team' ? (
            <TeamInsights teamInsights={data.teamInsights} />
          ) : activeNav === 'meetings' ? (
            <MeetingSummary
              meetings={data.meetings}
              ownerInsights={data.ownerInsights}
              attendanceRecs={data.attendanceRecs}
            />
          ) : (
            <Dashboard data={data} isRunning={isRunning} />
          )}
        </div>

        <footer className="page-footer">
          <div>
            Powered by <strong>Smart Meeting Efficiency Analyzer v5</strong> · n8n + GPT-4.1 + Fathom AI
          </div>
          <div className="footer-badges">
            <div className="f-badge">
              <span className={`connection-dot ${dbConnected ? 'connected' : 'disconnected'}`} />
              {dbConnected ? 'DB Connected' : 'DB Offline'}
            </div>
            <div className="f-badge">⚙️ n8n</div>
            <div className="f-badge" style={{ background: 'var(--orange-pale)', borderColor: 'rgba(255,102,0,0.2)', color: 'var(--orange)' }}>
              🍊 OrangeHRM
            </div>
          </div>
        </footer>
      </main>

      {hasData && (
        <ReportGenerator
          data={data}
          onStart={() => { setGeneratingReport(true); setReportProgress({ pct: 0, section: '' }); }}
          onComplete={() => setGeneratingReport(false)}
          onProgress={(pct, section) => setReportProgress({ pct, section })}
        />
      )}

      {generatingReport && (
        <div className="report-overlay">
          <div className="report-overlay-content">
            <div className="spinner" />
            <div style={{ marginTop: 16, fontSize: 16, fontWeight: 700 }}>Generating PDF Report...</div>
            <div style={{ marginTop: 12, width: 220, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
              <div style={{
                width: `${reportProgress.pct}%`, height: '100%',
                background: '#FF6600', borderRadius: 3,
                transition: 'width 0.3s ease',
              }} />
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              {reportProgress.pct > 0
                ? `${reportProgress.pct}% — capturing ${reportProgress.section}...`
                : 'Preparing sections...'}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
