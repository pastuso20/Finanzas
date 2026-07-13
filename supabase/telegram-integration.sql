-- Run this in the Supabase SQL Editor

-- Add telegram integration columns to the profile table
ALTER TABLE public.profile
ADD COLUMN IF NOT EXISTS telegram_chat_id text UNIQUE,
ADD COLUMN IF NOT EXISTS telegram_link_code text;

-- Create an index for faster lookups when receiving Telegram messages
CREATE INDEX IF NOT EXISTS idx_profile_telegram_chat_id ON public.profile(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_profile_telegram_link_code ON public.profile(telegram_link_code);

-- Update RLS policies to allow the backend (using service_role) full access,
-- while maintaining user-level restrictions for standard authenticated requests.
-- Standard policies already only check auth.uid(). 
-- Service role bypasses RLS automatically, so no new RLS policies are strictly needed for the backend.
