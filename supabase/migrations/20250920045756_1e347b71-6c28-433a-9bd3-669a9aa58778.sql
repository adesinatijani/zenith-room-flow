-- Update existing hotel settings to use the new hotel name
UPDATE hotel_settings 
SET hotel_name = 'ALOKOLODOHOTELS', 
    updated_at = now() 
WHERE hotel_name IN ('My Hotel', 'LuxeStay', 'ALOKOLODO HOTELS');

-- If no settings exist, insert default settings with the new name
INSERT INTO hotel_settings (hotel_name, currency, language, timezone)
SELECT 'ALOKOLODOHOTELS', 'NGN', 'en', 'Africa/Lagos'
WHERE NOT EXISTS (SELECT 1 FROM hotel_settings);