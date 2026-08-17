-- ==============================================================================
-- Supabase Schema: Personal Expense Tracker
-- Table: savings_goals
-- Security: Row Level Security (RLS) with strict UUID user isolation
-- ==============================================================================

-- Drop any previous outdated savings_goals table and related policies/triggers
DROP TABLE IF EXISTS public.savings_goals CASCADE;

-- 1. Create savings_goals table with UUID user_id referencing auth.users
CREATE TABLE public.savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
    target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount > 0),
    saved_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (saved_amount >= 0),
    target_date DATE,
    category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Data rule: saved_amount must not be greater than target_amount
    CONSTRAINT chk_saved_amount_not_greater_than_target CHECK (saved_amount <= target_amount)
);

-- 2. Performance Indexes
-- Fast lookups by user_id
CREATE INDEX idx_savings_goals_user_id 
    ON public.savings_goals(user_id);

-- Chronological lookup index per user
CREATE INDEX idx_savings_goals_user_date 
    ON public.savings_goals(user_id, created_at DESC);

-- Optional category index per user
CREATE INDEX idx_savings_goals_user_category 
    ON public.savings_goals(user_id, category);

-- 3. Automatic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_savings_goals_updated_at ON public.savings_goals;
CREATE TRIGGER set_savings_goals_updated_at
    BEFORE UPDATE ON public.savings_goals
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

-- 5. Row Level Security Policies (Strict User Isolation)
-- All policies compare auth.uid() directly with user_id.
-- Anonymous and public access is blocked; no USING (true) is used.

-- Policy: SELECT (Read own savings goals only)
CREATE POLICY "Users can view own savings goals"
    ON public.savings_goals
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: INSERT (Insert own savings goals only)
CREATE POLICY "Users can insert own savings goals"
    ON public.savings_goals
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: UPDATE (Update own savings goals only)
CREATE POLICY "Users can update own savings goals"
    ON public.savings_goals
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: DELETE (Delete own savings goals only)
CREATE POLICY "Users can delete own savings goals"
    ON public.savings_goals
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
