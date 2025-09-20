-- Update the hotel name to have correct spacing
UPDATE hotel_settings 
SET hotel_name = 'ALOKOLODO HOTELS', 
    updated_at = now() 
WHERE hotel_name = 'ALOKOLODOHOTELS' OR hotel_name = 'WHIHS';