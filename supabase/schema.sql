-- ==============================================================================
-- Supabase Schema: Personal Expense Tracker
-- Table: transactions
-- Security: Row Level Security (RLS) with strict UUID user isolation
-- ==============================================================================

-- Drop any previous outdated transactions table and related policies/triggers
DROP TABLE IF EXISTS public.transactions CASCADE;

-- 1. Create transactions table with UUID user_id referencing auth.users
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Performance Indexes
-- Fast lookups by user_id
CREATE INDEX idx_transactions_user_id 
    ON public.transactions(user_id);

-- Composite index optimized for retrieving transactions by date per user
CREATE INDEX idx_transactions_user_id_date 
    ON public.transactions(user_id, date DESC);

-- Index for filtering by category per user
CREATE INDEX idx_transactions_user_id_category 
    ON public.transactions(user_id, category);

-- 3. Automatic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_transactions_updated_at ON public.transactions;
CREATE TRIGGER set_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 5. Row Level Security Policies (Strict User Isolation)
-- All policies compare auth.uid() (UUID) directly with user_id (UUID).
-- Anonymous/public access is blocked; no USING (true) is used.

-- Policy: SELECT (Read own transactions only)
CREATE POLICY "Users can view own transactions"
    ON public.transactions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: INSERT (Insert own transactions only)
CREATE POLICY "Users can insert own transactions"
    ON public.transactions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: UPDATE (Update own transactions only)
CREATE POLICY "Users can update own transactions"
    ON public.transactions
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: DELETE (Delete own transactions only)
CREATE POLICY "Users can delete own transactions"
    ON public.transactions
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
