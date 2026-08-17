-- ==============================================================================
-- Supabase Schema: Personal Expense Tracker
-- Table: notifications
-- Security: Row Level Security (RLS) with strict UUID user isolation
-- ==============================================================================

-- Drop any previous outdated notifications table and related policies/triggers
DROP TABLE IF EXISTS public.notifications CASCADE;

-- 1. Create notifications table with UUID user_id referencing auth.users
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (char_length(trim(type)) > 0),
    title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
    message TEXT NOT NULL CHECK (char_length(trim(message)) > 0),
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    related_id UUID,
    related_type TEXT
);

-- 2. Performance Indexes
-- Fast lookups by user_id
CREATE INDEX idx_notifications_user_id 
    ON public.notifications(user_id);

-- Optimized index for chronological lookups per user
CREATE INDEX idx_notifications_user_created_at 
    ON public.notifications(user_id, created_at DESC);

-- Partial index for quick unread notifications queries
CREATE INDEX idx_notifications_user_unread 
    ON public.notifications(user_id, read) 
    WHERE read = FALSE;

-- Composite index for fast deduplication lookups by user, related entity, and type
CREATE INDEX idx_notifications_user_related_type 
    ON public.notifications(user_id, related_id, type);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. Row Level Security Policies (Strict User Isolation)
-- All policies compare auth.uid() directly with user_id.
-- Anonymous/public access is blocked; no USING (true) is used.

-- Policy: SELECT (Read own notifications only)
CREATE POLICY "Users can view own notifications"
    ON public.notifications
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: INSERT (Insert own notifications only)
CREATE POLICY "Users can insert own notifications"
    ON public.notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: UPDATE (Update own notifications only)
CREATE POLICY "Users can update own notifications"
    ON public.notifications
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: DELETE (Delete own notifications only)
CREATE POLICY "Users can delete own notifications"
    ON public.notifications
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
