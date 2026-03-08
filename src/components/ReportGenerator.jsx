import { useRef, useCallback, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import KPICards from './KPICards';
import MetricCards from './MetricCards';
import ScoreCards from './ScoreCards';
import WeeklyLoadChart from './WeeklyLoadChart';
import TalkShareDonut from './TalkShareDonut';
import MeetingTypes from './MeetingTypes';
import InsightCards from './InsightCards';
import ContributionTrend from './ContributionTrend';
import ActionItems from './ActionItems';
import UnresolvedItems from './UnresolvedItems';
import { MeetingCard } from './TeamInsights';
import { SelfEvaluation, MeetingDetailCard } from './MeetingSummary';

const A4_W = 210;
const A4_H = 297;
const MARGIN = 8;
const CONTENT_W = A4_W - MARGIN * 2;
const SCALE = 1.5;
const WIDTH = 1060;

function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 20, fontWeight: 800, color: '#fff',
      borderBottom: '2px solid #FF6600', paddingBottom: 8,
      marginBottom: 16, marginTop: 8,
    }}>
      {children}
    </div>
  );
}

function CoverPage({ summary }) {
  return (
    <div style={{
      minHeight: 580, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '60px 40px',
      background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1a1208 100%)',
      borderRadius: 16,
    }}>
      <img src="/ohrm_logo.png" alt="Logo" style={{ width: 80, marginBottom: 24 }} />
      <div style={{ fontSize: 32, fontWeight: 900, color: '#FF6600', letterSpacing: '-0.02em' }}>
        Meeting Intelligence Report
      </div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
        Smart Meeting Efficiency Analyzer v5 · n8n + GPT-4.1 + Fathom AI
      </div>
      <div style={{
        marginTop: 32, padding: '16px 32px', borderRadius: 10,
        background: 'rgba(255,102,0,0.08)', border: '1px solid rgba(255,102,0,0.2)',
      }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Analysis Period</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
          {summary?.weekLabel || 'All meetings'}
        </div>
      </div>
      <div style={{
        marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24,
      }}>
        {[
          { val: summary?.totalMeetings || 0, label: 'Meetings' },
          { val: `${summary?.totalHours || 0}h`, label: 'Hours' },
          { val: summary?.avgScore || 0, label: 'Avg Score' },
          { val: `${summary?.calendarDensity || 0}%`, label: 'Calendar Load' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#FF6600', fontFamily: "'DM Mono', monospace" }}>
              {s.val}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 48, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
        Generated on {new Date().toLocaleString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })}
      </div>
    </div>
  );
}

async function captureSection(el) {
  const elWidth = Math.max(el.scrollWidth, WIDTH);
  const canvas = await html2canvas(el, {
    scale: SCALE,
    backgroundColor: '#0d1117',
    useCORS: true,
    logging: false,
    width: elWidth,
    windowWidth: elWidth,
    scrollX: 0,
    scrollY: 0,
    imageTimeout: 5000,
  });
  return canvas;
}

function fillPageBg(pdf) {
  pdf.setFillColor(13, 17, 23);
  pdf.rect(0, 0, A4_W, A4_H, 'F');
}

const PAGE_H = A4_H - MARGIN * 2 - 8;
const GAP = 3;

function newPage(pdf) {
  pdf.addPage();
  fillPageBg(pdf);
  return MARGIN;
}

const FOOTER_LOGO_H = 10;
const FOOTER_LOGO_W = 14;
const FOOTER_GAP = 2.5;
const FOOTER_TEXT_Y = A4_H - 6;
const FOOTER_LOGO_Y = FOOTER_TEXT_Y - FOOTER_GAP - FOOTER_LOGO_H;

async function loadLogoDataUrl() {
  try {
    const response = await fetch('/ohrm_logo.png');
    if (!response.ok) return null;
    const blob = await response.blob();
    const dataUrl = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
    const format = blob.type === 'image/png' ? 'PNG' : 'JPEG';
    return { dataUrl, format };
  } catch {
    return null;
  }
}

function placeImage(pdf, imgData, imgW, imgH, cursor) {
  const remaining = PAGE_H - (cursor - MARGIN);

  if (imgH <= remaining) {
    pdf.addImage(imgData, 'JPEG', MARGIN, cursor, imgW, imgH);
    return cursor + imgH + GAP;
  }

  if (imgH <= PAGE_H) {
    cursor = newPage(pdf);
    pdf.addImage(imgData, 'JPEG', MARGIN, cursor, imgW, imgH);
    return cursor + imgH + GAP;
  }

  if (cursor > MARGIN + 2) cursor = newPage(pdf);

  return cursor;
}

function placeCanvasFlowed(pdf, canvas, cursor) {
  const imgW = CONTENT_W;
  const imgH = (canvas.height * imgW) / canvas.width;

  if (imgH <= PAGE_H) {
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    return placeImage(pdf, imgData, imgW, imgH, cursor);
  }

  if (cursor > MARGIN + 2) cursor = newPage(pdf);

  let heightLeft = imgH;
  while (heightLeft > 0) {
    const availH = PAGE_H - (cursor - MARGIN);
    const drawH = Math.min(heightLeft, availH);
    const srcY = (imgH - heightLeft) * (canvas.height / imgH);
    const srcH = drawH * (canvas.height / imgH);

    const slice = document.createElement('canvas');
    slice.width = canvas.width;
    slice.height = Math.ceil(srcH);
    const ctx = slice.getContext('2d');
    ctx.drawImage(canvas, 0, Math.floor(srcY), canvas.width, Math.ceil(srcH),
                  0, 0, canvas.width, Math.ceil(srcH));

    const sliceData = slice.toDataURL('image/jpeg', 0.92);
    pdf.addImage(sliceData, 'JPEG', MARGIN, cursor, imgW, drawH);
    heightLeft -= drawH;

    if (heightLeft > 0) {
      cursor = newPage(pdf);
    } else {
      cursor += drawH + GAP;
    }
  }
  return cursor;
}

export default function ReportGenerator({ data, onStart, onComplete, onProgress }) {
  const containerRef = useRef(null);

  const generate = useCallback(async () => {
    if (!data || !containerRef.current) return;
    onStart?.();

    try {
      const sections = containerRef.current.querySelectorAll('[data-report-section]');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      fillPageBg(pdf);
      const total = sections.length;
      let cursor = MARGIN;

      for (let i = 0; i < total; i++) {
        const sectionName = sections[i].dataset.reportSection;
        onProgress?.(Math.round(((i + 1) / total) * 100), sectionName);
        await new Promise(r => requestAnimationFrame(() => setTimeout(r, 50)));
        const canvas = await captureSection(sections[i]);

        if (sectionName === 'cover') {
          if (cursor > MARGIN + 2) cursor = newPage(pdf);
          cursor = placeCanvasFlowed(pdf, canvas, cursor);
          cursor = newPage(pdf);
        } else {
          cursor = placeCanvasFlowed(pdf, canvas, cursor);
        }
      }

      const pageCount = pdf.internal.getNumberOfPages();
      const logo = await loadLogoDataUrl();
      for (let p = 1; p <= pageCount; p++) {
        pdf.setPage(p);
        if (logo) {
          const logoX = (A4_W - FOOTER_LOGO_W) / 2;
          pdf.addImage(logo.dataUrl, logo.format, logoX, FOOTER_LOGO_Y, FOOTER_LOGO_W, FOOTER_LOGO_H);
        }
        pdf.setFontSize(8);
        pdf.setTextColor(140, 140, 140);
        pdf.text(
          `Page ${p} of ${pageCount}  ·  Meeting Intelligence Report  ·  OrangeHRM`,
          A4_W / 2, FOOTER_TEXT_Y,
          { align: 'center' }
        );
      }

      const dateStr = new Date().toISOString().slice(0, 10);
      pdf.save(`Meeting-Intelligence-Report-${dateStr}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      onComplete?.();
    }
  }, [data, onStart, onComplete, onProgress]);

  if (!data?.summary) return null;

  const {
    summary, trends, topPerformers, needsImprovement, asyncCandidates,
    unresolvedItems, suggestions, timeBreakdown, meetingTypes,
    actionItems, meetings, attendanceRecs, ownerInsights, teamInsights,
  } = data;

  return (
    <>
      <div ref={containerRef} className="report-container">

        <div data-report-section="cover">
          <CoverPage summary={summary} />
        </div>

        <div data-report-section="kpis">
          <SectionTitle>Key Performance Indicators</SectionTitle>
          <KPICards summary={summary} trends={trends} asyncCount={asyncCandidates?.length || 0} />
          <div style={{ marginTop: 16 }}>
            <MetricCards summary={summary} />
          </div>
        </div>

        <div data-report-section="scores">
          <SectionTitle>Meeting Performance</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <ScoreCards title="🏆 Top 5 — Best Performers" sub="Highest scoring meetings"
              items={topPerformers} color="#00C48C" rankType="top" />
            <ScoreCards title="📉 Bottom 5 — Needs Improvement" sub="Lowest scoring meetings"
              items={needsImprovement} color="#FF3B5C" rankType="bad" showReason />
          </div>
        </div>

        <div data-report-section="charts">
          <SectionTitle>Time & Load Analysis</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <WeeklyLoadChart meetings={meetings} />
            <TalkShareDonut breakdown={timeBreakdown} effective={summary.avgEffective} />
          </div>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <MeetingTypes types={meetingTypes} />
            <ContributionTrend meetings={meetings} />
          </div>
        </div>

        <div data-report-section="insights">
          <SectionTitle>AI Insights & Recommendations</SectionTitle>
          <InsightCards items={suggestions} attendanceRecs={attendanceRecs} ownerInsights={ownerInsights} />
        </div>

        {actionItems && actionItems.length > 0 && (
          <div data-report-section="actions">
            <SectionTitle>Action Items</SectionTitle>
            <ActionItems items={actionItems} />
          </div>
        )}

        {unresolvedItems && unresolvedItems.length > 0 && (
          <div data-report-section="unresolved">
            <SectionTitle>Unresolved Items</SectionTitle>
            <UnresolvedItems items={unresolvedItems} />
          </div>
        )}

        {teamInsights && teamInsights.length > 0 && (
          <>
            <div data-report-section="team-header">
              <SectionTitle>Team Insights — Per-Meeting Breakdown</SectionTitle>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>
                Summary of each meeting with participant roles and AI feedback
              </div>
            </div>
            {teamInsights.map((meeting, i) => (
              <div key={meeting.meetingId} data-report-section={`team-${i}`}>
                <MeetingCard meeting={meeting} />
              </div>
            ))}
          </>
        )}

        {ownerInsights && ownerInsights.totalMeetings > 0 && (
          <>
            <div data-report-section="individual-header">
              <SectionTitle>Individual Insights — Self Evaluation</SectionTitle>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>
                Personal self-evaluation across {meetings?.length || 0} meetings — skills, strengths, and actionable advice
              </div>
            </div>
            <div data-report-section="self-eval">
              <SelfEvaluation ownerInsights={ownerInsights} />
            </div>
            {(() => {
              const sorted = [...(meetings || [])].sort((a, b) => (b.ownerScore || b.score || 0) - (a.ownerScore || a.score || 0));
              const skipMeetings = sorted.filter(m => ['skip', 'delegate', 'summary_only'].includes(m.attendanceRecommendation));
              const attendMeetings = sorted.filter(m => (m.attendanceRecommendation || 'attend') === 'attend');
              return (
                <>
                  {skipMeetings.length > 0 && (
                    <div data-report-section="skip-header">
                      <div style={{
                        fontSize: 13, fontWeight: 700, color: '#FF3B5C',
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0',
                      }}>
                        <span style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: '#FF3B5C18', border: '1px solid #FF3B5C33',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                        }}>🚫</span>
                        Meetings You Can Skip ({skipMeetings.length})
                      </div>
                    </div>
                  )}
                  {skipMeetings.map((m, i) => (
                    <div key={m.id} data-report-section={`skip-${i}`}>
                      <MeetingDetailCard meeting={m} initialExpanded />
                    </div>
                  ))}
                  {attendMeetings.length > 0 && (
                    <div data-report-section="attend-header">
                      <div style={{
                        fontSize: 13, fontWeight: 700, color: '#00C48C',
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0',
                      }}>
                        <span style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: '#00C48C18', border: '1px solid #00C48C33',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                        }}>✅</span>
                        Meetings Worth Attending ({attendMeetings.length})
                      </div>
                    </div>
                  )}
                  {attendMeetings.map((m, i) => (
                    <div key={m.id} data-report-section={`attend-${i}`}>
                      <MeetingDetailCard meeting={m} initialExpanded />
                    </div>
                  ))}
                  <div data-report-section="individual-footer">
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 20,
                      padding: '12px 14px', borderRadius: 8,
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                      fontSize: 11, color: 'rgba(255,255,255,0.4)',
                    }}>
                      <span>📅 <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{meetings?.length || 0}</strong> meetings</span>
                      <span>✅ <strong style={{ color: '#00C48C' }}>{attendMeetings.length}</strong> attend</span>
                      <span>🚫 <strong style={{ color: '#FF3B5C' }}>{skipMeetings.length}</strong> skip/delegate</span>
                      {ownerInsights.hoursRecoverable > 0 && (
                        <span>⏱ <strong style={{ color: '#FFB800' }}>{ownerInsights.hoursRecoverable}h</strong> recoverable</span>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </>
        )}
      </div>

      <button onClick={generate} style={{ display: 'none' }} data-report-trigger />
    </>
  );
}
