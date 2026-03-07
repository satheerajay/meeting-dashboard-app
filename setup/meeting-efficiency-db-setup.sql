-- =============================================================================
-- Smart Meeting Efficiency Analyzer v3 — Database Setup
-- Run this once before activating the n8n workflow
-- Compatible with: PostgreSQL 13+, Supabase, Neon, RDS
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: meeting_metrics
-- One row per analyzed meeting. Updated weekly by the workflow.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS meeting_metrics (
  id                       SERIAL PRIMARY KEY,

  -- Identity
  meeting_id               TEXT UNIQUE NOT NULL,   -- Google Calendar event ID
  fathom_call_id           TEXT,                   -- Fathom recording URL (for deep links)
  summary                  TEXT,                   -- Meeting title
  start_time               TIMESTAMPTZ,
  end_time                 TIMESTAMPTZ,
  duration_minutes         NUMERIC,

  -- Classification
  meeting_type             TEXT DEFAULT 'general', -- 1:1 | standup | planning | review | sync | etc.
  is_recurring             BOOLEAN DEFAULT false,
  is_back_to_back          BOOLEAN DEFAULT false,
  attendee_count           INTEGER,
  has_transcript           BOOLEAN DEFAULT false,

  -- AI-computed time breakdown (minutes)
  decision_minutes         NUMERIC DEFAULT 0,
  discussion_minutes       NUMERIC DEFAULT 0,
  effective_minutes        NUMERIC DEFAULT 0,
  idle_minutes             NUMERIC DEFAULT 0,

  -- Derived ratios
  decision_discussion_ratio NUMERIC DEFAULT 0,     -- % of talk time spent deciding vs discussing
  effective_time_percent    NUMERIC DEFAULT 0,     -- % of meeting that was productive

  -- Composite score (0–100)
  -- Formula: 30% effective_time + 20% decision_ratio + 25% necessity + 15% action_items + 10% decisions
  meeting_score            NUMERIC DEFAULT 0,

  -- Necessity assessment
  meeting_necessity_score  NUMERIC DEFAULT 50,     -- 100 = must be live, 0 = should be async
  meeting_necessity_reason TEXT,

  -- Qualitative analysis
  sentiment                TEXT DEFAULT 'neutral', -- positive | neutral | negative | mixed
  key_decisions            JSONB DEFAULT '[]',     -- ["Decision 1", "Decision 2"]
  action_items             JSONB DEFAULT '[]',     -- [{task, owner, deadline, source}]
  unresolved_items         JSONB DEFAULT '[]',     -- Topics raised but not resolved
  improvement_suggestions  JSONB DEFAULT '[]',     -- AI-generated meeting improvement tips
  quality_summary          TEXT,                   -- 2–3 sentence narrative assessment

  created_at               TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_mm_start      ON meeting_metrics(start_time);
CREATE INDEX IF NOT EXISTS idx_mm_created    ON meeting_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_mm_type       ON meeting_metrics(meeting_type);
CREATE INDEX IF NOT EXISTS idx_mm_score      ON meeting_metrics(meeting_score DESC);
CREATE INDEX IF NOT EXISTS idx_mm_necessity  ON meeting_metrics(meeting_necessity_score);
CREATE INDEX IF NOT EXISTS idx_mm_effective  ON meeting_metrics(effective_time_percent);
CREATE INDEX IF NOT EXISTS idx_mm_fathom     ON meeting_metrics(fathom_call_id) WHERE fathom_call_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: participant_metrics
-- One row per person per meeting. Supports leaderboards and per-person trends.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS participant_metrics (
  id                       SERIAL PRIMARY KEY,

  -- Identity
  meeting_id               TEXT NOT NULL,          -- FK → meeting_metrics.meeting_id
  meeting_date             TIMESTAMPTZ,
  participant_name         TEXT NOT NULL,
  participant_email        TEXT,                   -- From Fathom's matched_calendar_invitee_email

  -- Role & contribution
  role                     TEXT DEFAULT 'contributor', -- facilitator | contributor | observer | dominator
  speaking_time_minutes    NUMERIC DEFAULT 0,
  decision_contributions   INTEGER DEFAULT 0,
  discussion_contributions INTEGER DEFAULT 0,
  contribution_score       NUMERIC DEFAULT 0,      -- 0–100 quality-weighted score
  feedback                 TEXT,                   -- AI-generated constructive feedback

  created_at               TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(meeting_id, participant_name)             -- Prevent duplicate rows per run
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pm_name       ON participant_metrics(participant_name);
CREATE INDEX IF NOT EXISTS idx_pm_email      ON participant_metrics(participant_email) WHERE participant_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pm_created    ON participant_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_pm_meeting    ON participant_metrics(meeting_id);
CREATE INDEX IF NOT EXISTS idx_pm_score      ON participant_metrics(contribution_score DESC);
CREATE INDEX IF NOT EXISTS idx_pm_date       ON participant_metrics(meeting_date);


-- =============================================================================
-- USEFUL QUERIES — copy these into Postgres/Supabase dashboard or BI tools
-- =============================================================================

-- ── Weekly meeting health summary ────────────────────────────────────────────
/*
SELECT
  DATE_TRUNC('week', start_time)              AS week,
  COUNT(*)                                    AS meetings,
  ROUND(SUM(duration_minutes) / 60.0, 1)     AS total_hours,
  ROUND(AVG(meeting_score), 1)               AS avg_score,
  ROUND(AVG(effective_time_percent), 1)      AS avg_effective_pct,
  ROUND(AVG(decision_discussion_ratio), 1)   AS avg_decision_ratio,
  ROUND(AVG(meeting_necessity_score), 1)     AS avg_necessity,
  COUNT(*) FILTER (WHERE is_back_to_back)    AS back_to_back_count,
  COUNT(*) FILTER (WHERE has_transcript)     AS with_transcript
FROM meeting_metrics
GROUP BY 1
ORDER BY 1 DESC;
*/

-- ── Top 10 most efficient meetings ever ──────────────────────────────────────
/*
SELECT
  summary,
  start_time::DATE              AS date,
  meeting_type,
  duration_minutes,
  ROUND(meeting_score, 1)      AS score,
  ROUND(effective_time_percent,1) AS effective_pct,
  sentiment,
  fathom_call_id               AS recording
FROM meeting_metrics
ORDER BY meeting_score DESC
LIMIT 10;
*/

-- ── Meetings that should be emails (necessity < 40) ───────────────────────────
/*
SELECT
  summary,
  start_time::DATE              AS date,
  attendee_count,
  duration_minutes,
  ROUND(meeting_necessity_score,1) AS necessity_score,
  meeting_necessity_reason
FROM meeting_metrics
WHERE meeting_necessity_score < 40
ORDER BY meeting_necessity_score ASC;
*/

-- ── All-time participant leaderboard ─────────────────────────────────────────
/*
SELECT
  COALESCE(participant_email, participant_name) AS identity,
  participant_name,
  COUNT(DISTINCT meeting_id)                    AS meetings,
  ROUND(AVG(contribution_score), 1)            AS avg_score,
  ROUND(SUM(speaking_time_minutes), 1)         AS total_speaking_min,
  SUM(decision_contributions)                  AS total_decisions,
  SUM(discussion_contributions)                AS total_discussions,
  MODE() WITHIN GROUP (ORDER BY role)          AS most_common_role
FROM participant_metrics
GROUP BY 1, 2
ORDER BY avg_score DESC;
*/

-- ── Meeting type breakdown ────────────────────────────────────────────────────
/*
SELECT
  meeting_type,
  COUNT(*)                                    AS count,
  ROUND(SUM(duration_minutes) / 60.0, 1)     AS total_hours,
  ROUND(AVG(meeting_score), 1)               AS avg_score,
  ROUND(AVG(effective_time_percent), 1)      AS avg_effective_pct,
  ROUND(AVG(attendee_count), 1)              AS avg_attendees
FROM meeting_metrics
GROUP BY meeting_type
ORDER BY count DESC;
*/

-- ── Calendar density per week (compare vs 40h work week) ─────────────────────
/*
SELECT
  DATE_TRUNC('week', start_time)                    AS week,
  ROUND(SUM(duration_minutes), 0)                   AS meeting_minutes,
  2400                                              AS working_minutes,  -- 8h * 5d * 60min
  ROUND(SUM(duration_minutes) / 24.0, 1)           AS density_pct
FROM meeting_metrics
GROUP BY 1
ORDER BY 1 DESC;
*/

-- ── Unresolved items requiring follow-up ─────────────────────────────────────
/*
SELECT
  summary          AS meeting,
  start_time::DATE AS date,
  jsonb_array_elements_text(unresolved_items) AS unresolved_item
FROM meeting_metrics
WHERE jsonb_array_length(unresolved_items) > 0
ORDER BY start_time DESC;
*/

-- ── Action items with owners ──────────────────────────────────────────────────
/*
SELECT
  summary                                       AS meeting,
  start_time::DATE                              AS date,
  (ai->>'task')                                 AS task,
  (ai->>'owner')                                AS owner,
  (ai->>'deadline')                             AS deadline,
  (ai->>'source')                               AS source
FROM meeting_metrics,
LATERAL jsonb_array_elements(action_items) AS ai
WHERE jsonb_array_length(action_items) > 0
ORDER BY start_time DESC;
*/
