-- Add loyalty tier threshold settings to hotel_settings
ALTER TABLE public.hotel_settings 
ADD COLUMN IF NOT EXISTS loyalty_bronze_threshold numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS loyalty_silver_threshold numeric DEFAULT 2000,
ADD COLUMN IF NOT EXISTS loyalty_gold_threshold numeric DEFAULT 5000,
ADD COLUMN IF NOT EXISTS loyalty_platinum_threshold numeric DEFAULT 10000;

-- Update existing settings with default values if they don't have them
UPDATE public.hotel_settings 
SET 
  loyalty_bronze_threshold = COALESCE(loyalty_bronze_threshold, 0),
  loyalty_silver_threshold = COALESCE(loyalty_silver_threshold, 2000),
  loyalty_gold_threshold = COALESCE(loyalty_gold_threshold, 5000),
  loyalty_platinum_threshold = COALESCE(loyalty_platinum_threshold, 10000)
WHERE loyalty_bronze_threshold IS NULL 
   OR loyalty_silver_threshold IS NULL 
   OR loyalty_gold_threshold IS NULL 
   OR loyalty_platinum_threshold IS NULL;

-- Update the trigger function to use configurable thresholds
CREATE OR REPLACE FUNCTION public.handle_booking_guest()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_guest_id uuid;
  v_new_total numeric;
  v_bronze_threshold numeric;
  v_silver_threshold numeric;
  v_gold_threshold numeric;
  v_platinum_threshold numeric;
BEGIN
  -- Get loyalty thresholds from settings
  SELECT 
    loyalty_bronze_threshold,
    loyalty_silver_threshold,
    loyalty_gold_threshold,
    loyalty_platinum_threshold
  INTO 
    v_bronze_threshold,
    v_silver_threshold,
    v_gold_threshold,
    v_platinum_threshold
  FROM public.hotel_settings
  LIMIT 1;
  
  -- Use defaults if settings not found
  v_bronze_threshold := COALESCE(v_bronze_threshold, 0);
  v_silver_threshold := COALESCE(v_silver_threshold, 2000);
  v_gold_threshold := COALESCE(v_gold_threshold, 5000);
  v_platinum_threshold := COALESCE(v_platinum_threshold, 10000);
  
  -- Check if guest exists by email
  SELECT id INTO v_guest_id
  FROM public.guests
  WHERE email = NEW.guest_email;
  
  IF v_guest_id IS NULL THEN
    -- Create new guest
    INSERT INTO public.guests (
      name,
      email,
      phone,
      total_bookings,
      total_spent,
      loyalty_tier,
      status,
      last_stay
    ) VALUES (
      NEW.guest_name,
      NEW.guest_email,
      NEW.guest_phone,
      1,
      NEW.total_amount,
      CASE
        WHEN NEW.total_amount >= v_platinum_threshold THEN 'Platinum'
        WHEN NEW.total_amount >= v_gold_threshold THEN 'Gold'
        WHEN NEW.total_amount >= v_silver_threshold THEN 'Silver'
        ELSE 'Bronze'
      END,
      'active',
      NEW.check_in_date
    );
  ELSE
    -- Calculate new total
    SELECT total_spent + NEW.total_amount INTO v_new_total
    FROM public.guests WHERE id = v_guest_id;
    
    -- Update existing guest
    UPDATE public.guests
    SET 
      total_bookings = total_bookings + 1,
      total_spent = v_new_total,
      last_stay = NEW.check_in_date,
      loyalty_tier = CASE
        WHEN v_new_total >= v_platinum_threshold THEN 'Platinum'
        WHEN v_new_total >= v_gold_threshold THEN 'Gold'
        WHEN v_new_total >= v_silver_threshold THEN 'Silver'
        ELSE 'Bronze'
      END
    WHERE id = v_guest_id;
  END IF;
  
  RETURN NEW;
END;
$$;