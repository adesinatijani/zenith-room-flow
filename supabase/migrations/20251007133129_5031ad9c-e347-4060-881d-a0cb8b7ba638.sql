-- Add footer content to content_pages table
ALTER TABLE public.content_pages 
ADD COLUMN IF NOT EXISTS footer_content jsonb DEFAULT '{"company_info": "Your Hotel - Luxury Accommodation", "phone": "+1234567890", "email": "info@hotel.com", "address": "123 Hotel Street, City, Country", "social_links": {"facebook": "", "twitter": "", "instagram": ""}, "quick_links": [{"text": "About Us", "url": "/about"}, {"text": "Contact", "url": "/contact"}]}'::jsonb;

-- Refresh the schema cache by recreating a simple view
DROP VIEW IF EXISTS schema_cache_refresh CASCADE;
CREATE VIEW schema_cache_refresh AS SELECT 1;
DROP VIEW schema_cache_refresh;