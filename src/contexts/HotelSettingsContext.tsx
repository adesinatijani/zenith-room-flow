import React, { createContext, useContext, ReactNode } from 'react';
import { useHotelSettings, HotelSettings } from '@/hooks/useHotelSettings';

interface HotelSettingsContextType {
  settings: HotelSettings;
  loading: boolean;
  saving: boolean;
  updateSetting: (key: keyof HotelSettings, value: any) => void;
  updatePaymentGateway: (gateway: keyof HotelSettings['payment_gateways'], enabled: boolean) => void;
  saveSettings: (updatedSettings?: Partial<HotelSettings>) => Promise<any>;
  fetchSettings: () => Promise<void>;
  formatCurrency: (amount: number) => string;
}

const HotelSettingsContext = createContext<HotelSettingsContextType | undefined>(undefined);

export const useGlobalSettings = () => {
  const context = useContext(HotelSettingsContext);
  if (context === undefined) {
    throw new Error('useGlobalSettings must be used within a HotelSettingsProvider');
  }
  return context;
};

interface HotelSettingsProviderProps {
  children: ReactNode;
}

export const HotelSettingsProvider: React.FC<HotelSettingsProviderProps> = ({ children }) => {
  const hotelSettings = useHotelSettings();

  const formatCurrency = (amount: number): string => {
    const currencies = {
      "USD": { symbol: "$", position: "before" },
      "EUR": { symbol: "€", position: "before" },
      "GBP": { symbol: "£", position: "before" },
      "NGN": { symbol: "₦", position: "before" },
      "GHS": { symbol: "₵", position: "before" },
      "KES": { symbol: "KSh", position: "before" },
      "ZAR": { symbol: "R", position: "before" },
      "EGP": { symbol: "£E", position: "before" },
      "MAD": { symbol: "DH", position: "after" },
      "TZS": { symbol: "TSh", position: "before" },
      "UGX": { symbol: "USh", position: "before" },
      "ETB": { symbol: "Br", position: "after" },
    };

    const currency = currencies[hotelSettings.settings.currency as keyof typeof currencies] || { symbol: "$", position: "before" };
    const formattedAmount = amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });

    return currency.position === "before" 
      ? `${currency.symbol}${formattedAmount}`
      : `${formattedAmount} ${currency.symbol}`;
  };

  const value: HotelSettingsContextType = {
    ...hotelSettings,
    formatCurrency,
  };

  return (
    <HotelSettingsContext.Provider value={value}>
      {children}
    </HotelSettingsContext.Provider>
  );
};