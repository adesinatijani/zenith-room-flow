-- Allow public to insert guests when booking online
CREATE POLICY "Public can create guest profiles when booking"
ON public.guests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow public to view their own guest info by email
CREATE POLICY "Users can view guests by email"
ON public.guests
FOR SELECT
TO anon, authenticated
USING (email = current_setting('request.jwt.claims', true)::json->>'email' OR has_hotel_staff_access());

-- Create function to automatically create or update guest when booking
CREATE OR REPLACE FUNCTION public.handle_booking_guest()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_guest_id uuid;
BEGIN
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
      'Bronze',
      'active',
      NEW.check_in_date
    );
  ELSE
    -- Update existing guest
    UPDATE public.guests
    SET 
      total_bookings = total_bookings + 1,
      total_spent = total_spent + NEW.total_amount,
      last_stay = NEW.check_in_date,
      loyalty_tier = CASE
        WHEN total_spent + NEW.total_amount >= 10000 THEN 'Platinum'
        WHEN total_spent + NEW.total_amount >= 5000 THEN 'Gold'
        WHEN total_spent + NEW.total_amount >= 2000 THEN 'Silver'
        ELSE 'Bronze'
      END
    WHERE id = v_guest_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run on room bookings insert
DROP TRIGGER IF EXISTS trigger_handle_booking_guest ON public.room_bookings;
CREATE TRIGGER trigger_handle_booking_guest
  AFTER INSERT ON public.room_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_booking_guest();