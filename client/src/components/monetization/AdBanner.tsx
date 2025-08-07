import React, { useEffect, useRef } from 'react';
import { getAdManager } from '../../lib/monetization/adManager';

interface AdBannerProps {
  id: string;
  className?: string;
  style?: React.CSSProperties;
}

export const AdBanner: React.FC<AdBannerProps> = ({ id, className = '', style = {} }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const adManager = getAdManager();

  useEffect(() => {
    if (containerRef.current && !adManager.isAdFree()) {
      // Small delay to ensure container is mounted
      const timer = setTimeout(() => {
        adManager.showBannerAd(id);
      }, 100);

      return () => {
        clearTimeout(timer);
        adManager.hideBannerAd(id);
      };
    }
  }, [id, adManager]);

  // Don't render anything if user has ad-free version
  if (adManager.isAdFree()) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      id={id}
      className={`ad-banner ${className}`}
      style={{
        minHeight: '90px',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        ...style
      }}
    >
      <div style={{ color: '#999', fontSize: '12px' }}>
        Advertisement
      </div>
    </div>
  );
};