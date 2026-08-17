-- ==============================================================================
-- Supabase Schema: Personal Expense Tracker
-- Table: budgets
-- Security: Row Level Security (RLS) with strict UUID user isolation
-- ==============================================================================

-- Drop any previous outdated budgets table and related policies/triggers
DROP TABLE IF EXISTS public.budgets CASCADE;

-- 1. Create budgets table with UUID user_id referencing auth.users
CREATE TABLE public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    month DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent duplicate budgets for the same user, category, and month
    CONSTRAINT uq_budgets_user_category_month UNIQUE (user_id, category, month)
);

-- 2. Performance Indexes
-- Fast lookups by user_id
CREATE INDEX idx_budgets_user_id 
    ON public.budgets(user_id);

-- Optimized index for retrieving budgets by month per user
CREATE INDEX idx_budgets_user_month 
    ON public.budgets(user_id, month);

-- Composite index for category lookups per user and month
CREATE INDEX idx_budgets_user_category_month 
    ON public.budgets(user_id, category, month);

-- 3. Automatic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_budgets_updated_at ON public.budgets;
CREATE TRIGGER set_budgets_updated_at
    BEFORE UPDATE ON public.budgets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- 5. Row Level Security Policies (Strict User Isolation)
-- Anonymous and public access is blocked.

-- Policy: SELECT (Read own budgets only)
CREATE POLICY "Users can view own budgets"
    ON public.budgets
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: INSERT (Insert own budgets only)
CREATE POLICY "Users can insert own budgets"
    ON public.budgets
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: UPDATE (Update own budgets only)
CREATE POLICY "Users can update own budgets"
    ON public.budgets
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: DELETE (Delete own budgets only)
CREATE POLICY "Users can delete own budgets"
    ON public.budgets
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
