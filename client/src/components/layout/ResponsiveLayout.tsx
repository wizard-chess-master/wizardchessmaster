import React, { useEffect } from 'react';
import { useDeviceDetection } from '@/lib/hooks/useDeviceDetection';
import { useDeviceStore } from '@/lib/stores/useDeviceStore';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveLayout({ children, className }: ResponsiveLayoutProps) {
  const deviceInfo = useDeviceDetection();
  const { setDeviceType, setOrientation, settings } = useDeviceStore();

  useEffect(() => {
    setDeviceType(deviceInfo.deviceType);
    setOrientation(deviceInfo.orientation);
  }, [deviceInfo.deviceType, deviceInfo.orientation, setDeviceType, setOrientation]);

  // Apply device-specific CSS variables
  useEffect(() => {
    const root = document.documentElement;
    
    // Mobile UI scaling
    if (deviceInfo.isMobile) {
      root.style.setProperty('--ui-scale', settings.mobileUIScale.toString());
      root.style.setProperty('--chess-board-size', getChessBoardSize());
      root.style.setProperty('--touch-target-size', '44px'); // iOS HIG minimum
    } else if (deviceInfo.isTablet) {
      root.style.setProperty('--ui-scale', '1.1');
      root.style.setProperty('--chess-board-size', '500px');
      root.style.setProperty('--touch-target-size', '40px');
    } else {
      root.style.setProperty('--ui-scale', '1.0');
      root.style.setProperty('--chess-board-size', '600px');
      root.style.setProperty('--touch-target-size', '32px');
    }

    // Animation speed
    const animationMultiplier = settings.mobileAnimationSpeed === 'fast' ? '0.5' : 
                               settings.mobileAnimationSpeed === 'slow' ? '2.0' : '1.0';
    root.style.setProperty('--animation-speed-multiplier', animationMultiplier);

    // Performance optimizations
    if (settings.reducedAnimations) {
      root.style.setProperty('--reduced-motion', '1');
    } else {
      root.style.setProperty('--reduced-motion', '0');
    }
  }, [deviceInfo, settings]);

  function getChessBoardSize(): string {
    switch (settings.mobileChessBoardSize) {
      case 'small':
        return deviceInfo.orientation === 'portrait' ? '300px' : '350px';
      case 'large':
        return deviceInfo.orientation === 'portrait' ? '400px' : '450px';
      default: // medium
        return deviceInfo.orientation === 'portrait' ? '350px' : '400px';
    }
  }

  return (
    <div 
      className={cn(
        'responsive-layout',
        'min-h-screen w-full',
        // Device-specific classes
        deviceInfo.isMobile && 'mobile-layout',
        deviceInfo.isTablet && 'tablet-layout',
        deviceInfo.isDesktop && 'desktop-layout',
        // Orientation classes
        deviceInfo.orientation === 'portrait' && 'portrait-layout',
        deviceInfo.orientation === 'landscape' && 'landscape-layout',
        // Touch-specific classes
        deviceInfo.isTouch && 'touch-device',
        // Settings-based classes
        settings.compactMode && 'compact-mode',
        settings.hideNonEssentialUI && 'hide-non-essential',
        settings.reducedAnimations && 'reduced-animations',
        className
      )}
      data-device-type={deviceInfo.deviceType}
      data-orientation={deviceInfo.orientation}
      data-touch={deviceInfo.isTouch}
    >
      {children}
    </div>
  );
}

// Device-specific wrapper components
export function MobileOnlyWrapper({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { isMobile } = useDeviceDetection();
  return isMobile ? <>{children}</> : <>{fallback || null}</>;
}

export function DesktopOnlyWrapper({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { isDesktop } = useDeviceDetection();
  return isDesktop ? <>{children}</> : <>{fallback || null}</>;
}

export function TouchOnlyWrapper({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { isTouch } = useDeviceDetection();
  return isTouch ? <>{children}</> : <>{fallback || null}</>;
}