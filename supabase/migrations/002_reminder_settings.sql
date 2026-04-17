CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS reminder_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  days_before INTEGER NOT NULL DEFAULT 3 CHECK (days_before >= 0),
  days_after INTEGER NOT NULL DEFAULT 1 CHECK (days_after >= 0),
  due_day BOOLEAN NOT NULL DEFAULT true,
  channels JSONB NOT NULL DEFAULT '["whatsapp"]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminder_settings_user_id
  ON reminder_settings(user_id);

ALTER TABLE reminder_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminder settings"
  ON reminder_settings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reminder settings"
  ON reminder_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminder settings"
  ON reminder_settings FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_reminder_settings_updated_at
  BEFORE UPDATE ON reminder_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
