ALTER TABLE reminders
  ADD COLUMN IF NOT EXISTS attempt_count INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ;

UPDATE reminders
SET
  attempt_count = COALESCE(attempt_count, 1),
  last_attempt_at = COALESCE(last_attempt_at, sent_at, created_at)
WHERE attempt_count IS NULL OR last_attempt_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_reminders_next_retry_at ON reminders(next_retry_at);
CREATE INDEX IF NOT EXISTS idx_reminders_attempt_count ON reminders(attempt_count);
