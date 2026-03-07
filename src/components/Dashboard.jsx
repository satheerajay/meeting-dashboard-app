import KPICards from './KPICards';
import MetricCards from './MetricCards';
import ScoreCards from './ScoreCards';
import WeeklyLoadChart from './WeeklyLoadChart';
import TalkShareDonut from './TalkShareDonut';
import MeetingTypes from './MeetingTypes';
import InsightCards from './InsightCards';
import NextWeekRecs from './NextWeekRecs';
import ContributionTrend from './ContributionTrend';
import AsyncSuggestions from './AsyncSuggestions';
import UnresolvedItems from './UnresolvedItems';
import ActionItems from './ActionItems';

export default function Dashboard({ data, isRunning }) {
  const {
    summary, trends, topPerformers, needsImprovement, asyncCandidates,
    unresolvedItems, suggestions, timeBreakdown, meetingTypes,
    participants, actionItems, meetings, attendanceRecs, ownerInsights,
  } = data;

  const alertParts = [];
  if (summary.backToBackCount > 0)
    alertParts.push(`${summary.backToBackCount} back-to-back meeting${summary.backToBackCount > 1 ? 's' : ''} detected`);
  if (summary.calendarDensity > 40)
    alertParts.push(`Calendar density at ${summary.calendarDensity}% — consider blocking focus time`);
  if (asyncCandidates.length > 0)
    alertParts.push(`${asyncCandidates.length} meeting${asyncCandidates.length > 1 ? 's' : ''} flagged as "could be async"`);

  return (
    <>
      {alertParts.length > 0 && (
        <div className="alert-bar">
          ⚠️ <strong>{alertParts[0]}.</strong>&nbsp; {alertParts.slice(1).join('. ')}.
        </div>
      )}

      {/* Row 1: KPI Stat Cards */}
      <KPICards summary={summary} trends={trends} asyncCount={asyncCandidates.length} />

      {/* Row 2: Secondary Metrics */}
      <MetricCards summary={summary} />

      {/* Row 3: Top / Bottom Contribution Lists */}
      <div className="dash-grid">
        <ScoreCards
          title="🏆 Top 5 — Best Performers"
          sub="Meetings where your score drove the conversation"
          items={topPerformers}
          color="#00C48C"
          rankType="top"
        />
        <ScoreCards
          title="📉 Bottom 5 — Needs Improvement"
          sub="Meetings where you should reconsider approach"
          items={needsImprovement}
          color="#FF3B5C"
          rankType="bad"
          showReason
        />
      </div>

      {/* Row 4: Charts — Bar + Donut + Type Bars */}
      <div className="dash-grid-3">
        <WeeklyLoadChart meetings={meetings} />
        <TalkShareDonut breakdown={timeBreakdown} effective={summary.avgEffective} />
        <MeetingTypes types={meetingTypes} />
      </div>

      {/* Row 5: AI Insights + Recommended Actions */}
      <div className="dash-grid">
        <InsightCards items={suggestions} attendanceRecs={attendanceRecs} ownerInsights={ownerInsights} />
        {actionItems.length > 0 ? (
          <NextWeekRecs items={actionItems} />
        ) : (
          <div />
        )}
      </div>

      {/* Row 6: reserved — Team Insights is accessible via sidebar */}

      {/* Row 7: Action Items + Unresolved Items */}
      <div className="dash-grid">
        {actionItems.length > 0 && <ActionItems items={actionItems} />}
        {unresolvedItems.length > 0 && <UnresolvedItems items={unresolvedItems} />}
      </div>

      {/* Row 8: Async Suggestions */}
      {asyncCandidates.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <AsyncSuggestions items={asyncCandidates} />
        </div>
      )}

      {/* Row 9: Contribution Trend (full width) */}
      <ContributionTrend meetings={meetings} />
    </>
  );
}
