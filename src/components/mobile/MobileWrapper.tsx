import { useEffect, ReactNode } from 'react';
import { useMobileRedirect } from '@/hooks/useMobileRedirect';
import { isNativeApp } from '@/utils/mobileDetection';

interface MobileWrapperProps {
  children: ReactNode;
}

export const MobileWrapper: React.FC<MobileWrapperProps> = ({ children }) => {
  const { isMobile, isNative } = useMobileRedirect();

  useEffect(() => {
    if (isNative) {
      // Set up native app specific configurations
      document.body.classList.add('native-app');
      
      // Disable text selection for native app feel
      document.body.style.webkitUserSelect = 'none';
      document.body.style.userSelect = 'none';
      
      // Prevent zoom
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
      }
    }

    return () => {
      if (isNative) {
        document.body.classList.remove('native-app');
        document.body.style.webkitUserSelect = '';
        document.body.style.userSelect = '';
      }
    };
  }, [isNative]);

  return <>{children}</>;
};