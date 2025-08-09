import { useState, useEffect } from 'react';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  userAgent: string;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouch: false,
        screenWidth: 1920,
        screenHeight: 1080,
        orientation: 'landscape',
        deviceType: 'desktop',
        userAgent: ''
      };
    }

    return getDeviceInfo();
  });

  function getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent || '';
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Mobile detection patterns
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const tabletRegex = /iPad|Tablet|Android(?!.*Mobile)/i;
    
    // Screen-based detection (fallback)
    const isMobileScreen = screenWidth <= 768;
    const isTabletScreen = screenWidth > 768 && screenWidth <= 1024;
    
    // Combine user agent and screen detection
    const isMobileUA = mobileRegex.test(userAgent);
    const isTabletUA = tabletRegex.test(userAgent);
    
    let isMobile = isMobileUA || (isMobileScreen && isTouch);
    let isTablet = isTabletUA || (isTabletScreen && isTouch && !isMobileUA);
    let isDesktop = !isMobile && !isTablet;
    
    // Handle edge cases
    if (userAgent.includes('iPad') || (userAgent.includes('Mac') && isTouch)) {
      isTablet = true;
      isMobile = false;
      isDesktop = false;
    }

    const orientation: 'portrait' | 'landscape' = screenWidth < screenHeight ? 'portrait' : 'landscape';
    
    let deviceType: 'mobile' | 'tablet' | 'desktop';
    if (isMobile) deviceType = 'mobile';
    else if (isTablet) deviceType = 'tablet';
    else deviceType = 'desktop';

    return {
      isMobile,
      isTablet,
      isDesktop,
      isTouch,
      screenWidth,
      screenHeight,
      orientation,
      deviceType,
      userAgent
    };
  }

  useEffect(() => {
    function handleResize() {
      setDeviceInfo(getDeviceInfo());
    }

    function handleOrientationChange() {
      // Delay to allow screen dimensions to update
      setTimeout(() => {
        setDeviceInfo(getDeviceInfo());
      }, 100);
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return deviceInfo;
}

// Utility hook for responsive breakpoints
export function useBreakpoints() {
  const { screenWidth } = useDeviceDetection();

  return {
    xs: screenWidth >= 475,
    sm: screenWidth >= 640,
    md: screenWidth >= 768,
    lg: screenWidth >= 1024,
    xl: screenWidth >= 1280,
    '2xl': screenWidth >= 1536,
    isMobile: screenWidth < 768,
    isTablet: screenWidth >= 768 && screenWidth < 1024,
    isDesktop: screenWidth >= 1024
  };
}