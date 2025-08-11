import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Crown, Users, Clock } from 'lucide-react';

interface FounderCountdownProps {
  className?: string;
  showProgress?: boolean;
}

export function FounderCountdown({ className = "", showProgress = true }: FounderCountdownProps) {
  const [spotsData, setSpotsData] = useState({
    remaining: 850,
    total: 1000,
    percentage: 15
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFounderStatus = async () => {
      try {
        const response = await fetch('/api/founder/status');
        if (response.ok) {
          const data = await response.json();
          const remaining = Math.max(0, 1000 - data.currentCount);
          const percentage = ((1000 - remaining) / 1000) * 100;
          
          setSpotsData({
            remaining,
            total: 1000,
            percentage: Math.round(percentage)
          });
        }
      } catch (error) {
        console.error('Failed to fetch founder status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFounderStatus();
    // Update every 15 seconds for real-time feel
    const interval = setInterval(fetchFounderStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-gray-300 rounded-lg h-16 ${className}`}>
      </div>
    );
  }

  if (spotsData.remaining <= 0) {
    return (
      <div className={`bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg p-4 text-center ${className}`}>
        <div className="text-white">
          <Crown className="w-6 h-6 mx-auto mb-2" />
          <div className="font-bold">Founder Program Complete</div>
          <div className="text-sm opacity-90">All 1000 spots claimed!</div>
        </div>
      </div>
    );
  }

  const urgencyLevel = spotsData.remaining < 100 ? 'high' : 
                      spotsData.remaining < 300 ? 'medium' : 'low';

  const urgencyColors = {
    high: 'from-red-500 to-orange-500',
    medium: 'from-purple-500 to-amber-500', 
    low: 'from-blue-500 to-purple-500'
  };

  const urgencyMessages = {
    high: 'URGENT: Almost gone!',
    medium: 'Going fast!',
    low: 'Limited time!'
  };

  return (
    <div className={`bg-gradient-to-r ${urgencyColors[urgencyLevel]} rounded-lg p-4 text-white ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Crown className="w-5 h-5 text-yellow-300" />
          <span className="font-bold text-sm">{urgencyMessages[urgencyLevel]}</span>
        </div>
        <Badge className="bg-white text-purple-900 font-bold text-xs">
          <Users className="w-3 h-3 mr-1" />
          {spotsData.remaining} left
        </Badge>
      </div>
      
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Founder Spots Claimed</span>
            <span>{spotsData.percentage}%</span>
          </div>
          <div className="bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-amber-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${spotsData.percentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-center text-white/90">
            {1000 - spotsData.remaining} of 1000 founders joined
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-center mt-2 text-xs">
        <Clock className="w-3 h-3 mr-1" />
        <span>Premium goes paid after 1000 members</span>
      </div>
    </div>
  );
}