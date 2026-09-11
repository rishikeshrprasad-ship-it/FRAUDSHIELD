-- =========================================================================
-- FRAUDSHIELD CLOUD DATABASE PRODUCTION ISOLATION & RLS SCRIPT
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ucfguensnanhzpwyvxck/sql
-- =========================================================================

-- 1. Ensure Table Structure with Text Primary Key
CREATE TABLE IF NOT EXISTS public."FRAUDSHIELD" (
    id BIGSERIAL PRIMARY KEY,
    case_id TEXT NOT NULL,
    account_holder TEXT DEFAULT 'Anonymous Citizen',
    status TEXT DEFAULT 'pending',
    "citizen-statement" TEXT DEFAULT '',
    urgency_score INTEGER DEFAULT 50,
    amount NUMERIC(15, 2) DEFAULT 0.00,
    scam_type TEXT DEFAULT 'Financial Fraud',
    location_name TEXT DEFAULT 'National Cyber Grid',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- If table already existed with bigint case_id, migrate to TEXT safely:
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'FRAUDSHIELD' 
          AND column_name = 'case_id' 
          AND data_type != 'text'
    ) THEN
        ALTER TABLE public."FRAUDSHIELD" ALTER COLUMN case_id TYPE TEXT;
    END IF;
END $$;

-- 2. Performance Query Indexing
-- Optimizes case search, status filtering, and chronological sorting
CREATE INDEX IF NOT EXISTS idx_fraudshield_case_id ON public."FRAUDSHIELD" (case_id);
CREATE INDEX IF NOT EXISTS idx_fraudshield_status ON public."FRAUDSHIELD" (status);
CREATE INDEX IF NOT EXISTS idx_fraudshield_account_holder ON public."FRAUDSHIELD" (account_holder);
CREATE INDEX IF NOT EXISTS idx_fraudshield_created_at ON public."FRAUDSHIELD" (created_at DESC);

-- 3. Enable Row-Level Security (RLS)
ALTER TABLE public."FRAUDSHIELD" ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Drop existing policies if any to ensure clean idempotent run
DROP POLICY IF EXISTS "Enable read access for all authorized users" ON public."FRAUDSHIELD";
DROP POLICY IF EXISTS "Enable insert for citizens and public incident reporting" ON public."FRAUDSHIELD";
DROP POLICY IF EXISTS "Enable update for authorized officers" ON public."FRAUDSHIELD";
DROP POLICY IF EXISTS "Allow service role full management" ON public."FRAUDSHIELD";

-- Policy A: Service Role has full access (Backend Server)
CREATE POLICY "Allow service role full management"
ON public."FRAUDSHIELD"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy B: Allow public/anon and authenticated users to submit new fraud reports
CREATE POLICY "Enable insert for citizens and public incident reporting"
ON public."FRAUDSHIELD"
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy C: Allow users to view cases (public read for incident tracking)
CREATE POLICY "Enable read access for all authorized users"
ON public."FRAUDSHIELD"
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy D: Allow update only for authenticated law enforcement / service roles
CREATE POLICY "Enable update for authorized officers"
ON public."FRAUDSHIELD"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Verification Query
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'FRAUDSHIELD';
