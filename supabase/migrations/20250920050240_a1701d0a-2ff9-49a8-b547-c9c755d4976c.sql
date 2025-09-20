-- Update the hotel name in the existing record
UPDATE hotel_settings 
SET hotel_name = 'ALOKOLODOHOTELS', 
    updated_at = now() 
WHERE id = '4e8061cd-0383-466e-8e47-24804d6aa4f3';