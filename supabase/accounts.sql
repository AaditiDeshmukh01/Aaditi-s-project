-- ==============================================================================
-- Supabase Schema: Personal Expense Tracker
-- Table: accounts_cards (Dedicated application table for Accounts & Cards)
-- Security: Row Level Security (RLS) with strict UUID user isolation
-- 
-- IMPORTANT SAFETY NOTICE:
-- Do NOT use or modify the existing 'public.account' table as it holds auth/provider data.
-- 'public.accounts_cards' is the secure, isolated application table.
-- ==============================================================================

-- 1. Create accounts_cards table with UUID user_id referencing auth.users
CREATE TABLE IF NOT EXISTS public.accounts_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
    type TEXT NOT NULL CHECK (type IN ('bank', 'cash', 'credit_card', 'savings', 'investment', 'loan', 'other')),
    balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'INR' CHECK (char_length(trim(currency)) > 0),
    account_number_last4 VARCHAR(4) CHECK (account_number_last4 IS NULL OR char_length(account_number_last4) <= 4),
    color TEXT,
    icon TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_accounts_cards_user_id 
    ON public.accounts_cards(user_id);

CREATE INDEX IF NOT EXISTS idx_accounts_cards_user_created 
    ON public.accounts_cards(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_accounts_cards_user_type 
    ON public.accounts_cards(user_id, type);

-- 3. Automatic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_accounts_cards_updated_at ON public.accounts_cards;
CREATE TRIGGER set_accounts_cards_updated_at
    BEFORE UPDATE ON public.accounts_cards
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.accounts_cards ENABLE ROW LEVEL SECURITY;

-- 5. Row Level Security Policies (Strict User Isolation)
-- All policies compare auth.uid() directly with user_id.
-- Anonymous and public access is blocked.

DROP POLICY IF EXISTS "Users can view own accounts and cards" ON public.accounts_cards;
CREATE POLICY "Users can view own accounts and cards"
    ON public.accounts_cards
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own accounts and cards" ON public.accounts_cards;
CREATE POLICY "Users can insert own accounts and cards"
    ON public.accounts_cards
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own accounts and cards" ON public.accounts_cards;
CREATE POLICY "Users can update own accounts and cards"
    ON public.accounts_cards
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own accounts and cards" ON public.accounts_cards;
CREATE POLICY "Users can delete own accounts and cards"
    ON public.accounts_cards
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
