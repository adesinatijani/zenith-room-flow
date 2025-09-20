import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { shouldShowMobileUI, isNativeApp } from '@/utils/mobileDetection';

export const useMobileRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If we're in a native app or mobile device, redirect auth to mobile login
    if (shouldShowMobileUI() && location.pathname === '/auth') {
      navigate('/mobile/staff-login');
    }
    
    // If we're in a native app and on the admin dashboard, show mobile dashboard
    if (isNativeApp() && location.pathname === '/admin') {
      navigate('/mobile/staff-dashboard');
    }
  }, [location.pathname, navigate]);

  return {
    isMobile: shouldShowMobileUI(),
    isNative: isNativeApp()
  };
};