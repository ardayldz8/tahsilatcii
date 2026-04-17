ALTER TABLE reminders
  ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'none'
    CHECK (provider IN ('whatsapp', 'sms', 'email', 'none')),
  ADD COLUMN IF NOT EXISTS error_message TEXT;

CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_provider ON reminders(provider);
