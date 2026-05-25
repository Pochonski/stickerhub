CREATE OR REPLACE FUNCTION unpublish_listing(listing_id UUID, owner_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE trade_listings SET is_active = FALSE, updated_at = NOW()
  WHERE id = listing_id AND user_id = owner_id AND is_active = TRUE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Listing not found or not owned'; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
