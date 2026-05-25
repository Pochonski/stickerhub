-- 005: Security fixes
--   - Add search_path to SECURITY DEFINER functions
--   - Revoke public RPC access from trigger/non-public functions
--   - Restrict overly permissive RLS policies

-- ============================================
-- A. Fix search_path for SECURITY DEFINER functions
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SET search_path = ''
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.raw_user_meta_data->>'avatar_url');
  INSERT INTO user_packs (user_id, quantity, coins) VALUES (NEW.id, 0, 500);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION increment_reputation(user_id UUID)
RETURNS void
SET search_path = ''
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles SET reputation = LEAST(100, COALESCE(reputation, 100) + 1), updated_at = NOW()
  WHERE id = user_id;
END;
$$;

-- ============================================
-- B. Revoke public RPC access
-- ============================================

-- handle_new_user is a trigger — should never be callable via RPC
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon, authenticated;

-- increment_reputation is client-called but anon should not access it
REVOKE EXECUTE ON FUNCTION increment_reputation(user_id uuid) FROM anon;

-- ============================================
-- C. Fix overly permissive RLS policies
-- ============================================

-- profiles: restrict INSERT to own profile
-- (signup via handle_new_user trigger → SECURITY DEFINER bypasses RLS, so this is safe)
DROP POLICY IF EXISTS "Allow profile insert" ON profiles;
CREATE POLICY "Allow profile insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- user_packs: drop unrestricted INSERT (covered by upsert below)
DROP POLICY IF EXISTS "Allow pack insert" ON user_packs;

-- user_packs: restrict upsert to own packs only
DROP POLICY IF EXISTS "Allow pack upsert" ON user_packs;
CREATE POLICY "Allow pack upsert" ON user_packs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
