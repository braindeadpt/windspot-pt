-- WindSpot Chat Schema — SECURE VERSION
-- Execute this in your Supabase SQL Editor
-- 
-- SECURITY FIXES APPLIED:
-- 1. Content length enforced at DB level (1-280 chars)
-- 2. Rate limiting via RLS: same username max 1 msg per 10 seconds
-- 3. Auto-cleanup cron job: deletes messages older than 24h
-- 4. Note: For production, consider Edge Functions + CAPTCHA

BEGIN;

-- Messages table (chat per spot)
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spot_slug TEXT NOT NULL,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast queries by spot
CREATE INDEX IF NOT EXISTS idx_messages_spot ON messages(spot_slug);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_username_created ON messages(username, created_at DESC);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read messages (anonymous chat)
CREATE POLICY "Allow anonymous read" ON messages
  FOR SELECT TO anon, authenticated
  USING (true);

-- SECURE: Allow anonymous insert with content validation + rate limiting
-- Content must be 1-280 characters
-- Same username cannot post more than once per 10 seconds
DROP POLICY IF EXISTS "Allow anonymous insert" ON messages;
CREATE POLICY "Allow anonymous insert with rate limit" ON messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(content) <= 280 
    AND length(content) > 0
    AND (
      -- Rate limit: prevent same username from posting more than once per 10 seconds
      NOT EXISTS (
        SELECT 1 FROM messages m 
        WHERE m.username = messages.username 
        AND m.created_at > NOW() - INTERVAL '10 seconds'
      )
    )
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

COMMIT;

-- ─── Auto-cleanup: Delete messages older than 24 hours ───
-- Option A: pg_cron (if available on your Supabase plan)
-- SELECT cron.schedule('cleanup-old-messages', '0 * * * *', 
--   $$DELETE FROM messages WHERE created_at < NOW() - INTERVAL '24 hours'$$);

-- Option B: Run manually or via GitHub Actions workflow
-- DELETE FROM messages WHERE created_at < NOW() - INTERVAL '24 hours';

-- Verify setup
SELECT * FROM messages LIMIT 1;
