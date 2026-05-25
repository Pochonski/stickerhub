-- 004: Trade system - reputation RPC + fixes

CREATE OR REPLACE FUNCTION increment_reputation(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET reputation = LEAST(100, COALESCE(reputation, 100) + 1),
      updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
