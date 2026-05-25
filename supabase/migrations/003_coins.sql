-- 003: Coins system + shop

-- Add coins column
ALTER TABLE user_packs ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 2000;

-- New users start with 2000 coins (4 free packs)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.raw_user_meta_data->>'avatar_url');
  INSERT INTO user_packs (user_id, quantity, coins) VALUES (NEW.id, 0, 2000);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure RLS policies allow coins updates
DROP POLICY IF EXISTS "Allow pack upsert" ON user_packs;
CREATE POLICY "Allow pack upsert" ON user_packs FOR ALL USING (true) WITH CHECK (true);

-- Grant coins to existing profiles without them
UPDATE user_packs SET coins = 2000 WHERE coins IS NULL;
