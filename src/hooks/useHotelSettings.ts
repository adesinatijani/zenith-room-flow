import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface HotelSettings {
  id?: string;
  hotel_name: string;
  hotel_icon?: string;
  hotel_address?: string;
  hotel_phone?: string;
  hotel_whatsapp?: string;
  hotel_email?: string;
  hotel_website?: string;
  hotel_description?: string;
  currency: string;
  language: string;
  tax_rate: number;
  timezone: string;
  date_format: string;
  time_format: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  desktop_notifications: boolean;
  dark_mode: boolean;
  payment_gateways: {
    paystack: boolean;
    flutterwave: boolean;
    stripe: boolean;
    paypal: boolean;
    razorpay: boolean;
    mobileMoney: boolean;
  };
  two_factor_enabled: boolean;
  session_timeout: number;
}

const defaultSettings: HotelSettings = {
  hotel_name: "ALOKOLODO HOTELS",
  hotel_icon: "Hotel",
  hotel_address: "",
  hotel_phone: "",
  hotel_whatsapp: "",
  hotel_email: "",
  hotel_website: "",
  hotel_description: "",
  currency: "NGN",
  language: "en",
  tax_rate: 7.5,
  timezone: "UTC",
  date_format: "MM/dd/yyyy",
  time_format: "12h",
  notifications_enabled: true,
  email_notifications: true,
  sms_notifications: false,
  desktop_notifications: true,
  dark_mode: false,
  payment_gateways: {
    paystack: true,
    flutterwave: true,
    stripe: true,
    paypal: false,
    razorpay: false,
    mobileMoney: true,
  },
  two_factor_enabled: false,
  session_timeout: 30,
};

export const useHotelSettings = () => {
  const [settings, setSettings] = useState<HotelSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("hotel_settings")
        .select("*")
        .single();

      console.log("Fetched hotel settings:", data);

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const settingsData = {
          ...data,
          payment_gateways: typeof data.payment_gateways === 'string' 
            ? JSON.parse(data.payment_gateways) 
            : data.payment_gateways || defaultSettings.payment_gateways
        };
        console.log("Setting hotel settings to:", settingsData);
        setSettings(settingsData);
      } else {
        console.log("No settings found, using defaults with hotel name:", defaultSettings.hotel_name);
        // If no settings exist, use defaults (which already have ALOKOLODO HOTELS)
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Error fetching hotel settings:", error);
      toast({
        title: "Error",
        description: "Failed to load hotel settings.",
        variant: "destructive",
      });
      // Fallback to defaults if there's an error
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (updatedSettings: Partial<HotelSettings>) => {
    try {
      setSaving(true);
      const settingsToSave = {
        ...settings,
        ...updatedSettings,
      };

      const { data: existingData } = await supabase
        .from("hotel_settings")
        .select("id")
        .single();

      let result;
      if (existingData) {
        result = await supabase
          .from("hotel_settings")
          .update(settingsToSave)
          .eq("id", existingData.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from("hotel_settings")
          .insert([settingsToSave])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setSettings({
        ...result.data,
        payment_gateways: typeof result.data.payment_gateways === 'string' 
          ? JSON.parse(result.data.payment_gateways) 
          : result.data.payment_gateways
      });

      toast({
        title: "Settings saved",
        description: "Your hotel settings have been updated successfully.",
      });

      return result.data;
    } catch (error) {
      console.error("Error saving hotel settings:", error);
      toast({
        title: "Error",
        description: "Failed to save hotel settings.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof HotelSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updatePaymentGateway = (gateway: keyof HotelSettings['payment_gateways'], enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      payment_gateways: {
        ...prev.payment_gateways,
        [gateway]: enabled
      }
    }));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    saving,
    updateSetting,
    updatePaymentGateway,
    saveSettings,
    fetchSettings,
  };
};