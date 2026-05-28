-- ATOMIC PUBLISH: Delete any existing listing (active or inactive) for this user+card,
-- then insert a fresh one. SECURITY DEFINER bypasses RLS completely.
-- No ON CONFLICT needed — DELETE removes the conflicting row first.
-- No SET search_path = '' — avoids relation-not-found issues.
--
-- To deploy: run this SQL in the Supabase SQL Editor.
-- (Replaces any previous version of the function)

CREATE OR REPLACE FUNCTION publish_listing(
  p_user_id UUID,
  p_card_id TEXT,
  p_card_name TEXT,
  p_team_name TEXT DEFAULT '',
  p_looking_for TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  DELETE FROM trade_listings WHERE user_id = p_user_id AND card_id = p_card_id;

  INSERT INTO trade_listings (user_id, card_id, card_name, team_name, looking_for)
  VALUES (p_user_id, p_card_id, p_card_name, p_team_name, p_looking_for)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
