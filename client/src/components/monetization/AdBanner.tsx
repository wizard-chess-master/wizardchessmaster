import React, { useEffect, useRef } from 'react';
import { getAdManager } from '../../lib/monetization/adManager';

interface AdBannerProps {
  containerId: string;
  size?: 'banner' | 'leaderboard' | 'skyscraper' | 'mediumRectangle' | 'mobileBanner';
  className?: string;
  style?: React.CSSProperties;
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  containerId, 
  size = 'banner', 
  className = '', 
  style = {} 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const adManager = getAdManager();

  // Ad size configurations
  const adSizes = {
    banner: { width: '728px', height: '90px' },
    leaderboard: { width: '728px', height: '90px' },
    skyscraper: { width: '160px', height: '600px' },
    mediumRectangle: { width: '300px', height: '250px' },
    mobileBanner: { width: '320px', height: '50px' }
  };

  const sizeConfig = adSizes[size];

  useEffect(() => {
    if (containerRef.current && !adManager.isAdFree()) {
      // Small delay to ensure container is mounted
      const timer = setTimeout(() => {
        adManager.showBannerAd(containerId);
      }, 100);

      return () => {
        clearTimeout(timer);
        adManager.hideBannerAd(containerId);
      };
    }
  }, [containerId, adManager]);

  // Don't render anything if user has ad-free version
  if (adManager.isAdFree()) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      id={containerId}
      className={`ad-banner ad-${size} ${className}`}
      style={{
        width: sizeConfig.width,
        height: sizeConfig.height,
        maxWidth: '100%',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        margin: '10px auto',
        ...style
      }}
    >
      <div style={{ color: '#999', fontSize: '12px' }}>
        Advertisement {size}
      </div>
    </div>
  );
};