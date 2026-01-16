-- Optional: Add password change tracking to profiles table
-- This migration adds a timestamp field to track when a user last changed their password
-- This is useful for security policies that require password rotation

-- Add last_password_changed column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_password_changed TIMESTAMPTZ DEFAULT NOW();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_last_password_changed 
ON public.profiles(last_password_changed);

-- Optional: Create password history table for preventing password reuse
-- Uncomment the following lines to enable password history tracking

/*
-- Create password history table
CREATE TABLE IF NOT EXISTS public.password_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_password UNIQUE (user_id, password_hash)
);

-- Enable Row Level Security
ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own password history
CREATE POLICY "Users can view their own password history"
ON public.password_history FOR SELECT
USING (auth.uid() = user_id);

-- Policy: System can insert password history (for API routes)
CREATE POLICY "System can insert password history"
ON public.password_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_password_history_user_id 
ON public.password_history(user_id);

CREATE INDEX IF NOT EXISTS idx_password_history_changed_at 
ON public.password_history(changed_at DESC);

-- Create function to maintain password history (keep last 5 passwords)
CREATE OR REPLACE FUNCTION maintain_password_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete old password history entries, keep only last 4 (5 total including new one)
  DELETE FROM public.password_history
  WHERE user_id = NEW.user_id
  AND id NOT IN (
    SELECT id FROM public.password_history
    WHERE user_id = NEW.user_id
    ORDER BY changed_at DESC
    LIMIT 4
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically maintain password history
DROP TRIGGER IF EXISTS trigger_maintain_password_history ON public.password_history;
CREATE TRIGGER trigger_maintain_password_history
AFTER INSERT ON public.password_history
FOR EACH ROW
EXECUTE FUNCTION maintain_password_history();
*/

-- Comments explaining the tables
COMMENT ON COLUMN public.profiles.last_password_changed IS 'Timestamp of when the user last changed their password';

/*
COMMENT ON TABLE public.password_history IS 'Tracks password history to prevent reuse of recent passwords';
COMMENT ON COLUMN public.password_history.user_id IS 'Reference to the user who owns this password history';
COMMENT ON COLUMN public.password_history.password_hash IS 'Hashed version of the password for comparison';
COMMENT ON COLUMN public.password_history.changed_at IS 'When this password was set';
*/
