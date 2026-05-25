-- Cleanup: remove stadium/venue cards from all data

DELETE FROM user_collections WHERE card_id IN (SELECT id FROM cards WHERE card_type IN ('stadium', 'venue'));
DELETE FROM trade_listings WHERE card_id IN (SELECT id FROM cards WHERE card_type IN ('stadium', 'venue'));
DELETE FROM trade_offers WHERE requested_card_id IN (SELECT id FROM cards WHERE card_type IN ('stadium', 'venue'));
DELETE FROM trade_offers WHERE offered_card_id IN (SELECT id FROM cards WHERE card_type IN ('stadium', 'venue'));
DELETE FROM cards WHERE card_type IN ('stadium', 'venue');
