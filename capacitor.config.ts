import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f9b50f76f16a44feae3018a013c97e39',
  appName: 'ALOKOLODO HOTELS Staff',
  webDir: 'dist',
  server: {
    url: 'https://f9b50f76-f16a-44fe-ae30-18a013c97e39.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a1a2e'
    }
  }
};

export default config;