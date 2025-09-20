export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isNativeApp = (): boolean => {
  return window.location.protocol === 'capacitor:';
};

export const shouldShowMobileUI = (): boolean => {
  return isMobileDevice() || isNativeApp() || window.innerWidth < 768;
};

export const getDeviceInfo = () => {
  return {
    isMobile: isMobileDevice(),
    isNative: isNativeApp(),
    userAgent: navigator.userAgent,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    platform: navigator.platform
  };
};