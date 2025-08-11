import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Crown, Users, Star, Clock } from 'lucide-react';

interface FounderPromotionProps {
  className?: string;
}

export function FounderPromotion({ className = "" }: FounderPromotionProps) {
  const [spotsRemaining, setSpotsRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch current founder spots remaining
    const fetchFounderStatus = async () => {
      try {
        const response = await fetch('/api/founder/status');
        if (response.ok) {
          const data = await response.json();
          setSpotsRemaining(1000 - data.currentCount);
        }
      } catch (error) {
        console.error('Failed to fetch founder status:', error);
        setSpotsRemaining(850); // Conservative fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchFounderStatus();
  }, []);

  if (isLoading) {
    return (
      <div className={`bg-gradient-to-r from-purple-600 to-amber-600 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse text-white text-center">
          Loading founder status...
        </div>
      </div>
    );
  }

  if (!spotsRemaining || spotsRemaining <= 0) {
    return (
      <div className={`bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg p-4 ${className}`}>
        <div className="text-white text-center">
          <Crown className="w-6 h-6 mx-auto mb-2" />
          <div className="font-bold">Founder Program Complete</div>
          <div className="text-sm opacity-90">All 1000 founder spots have been claimed!</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-purple-600 to-amber-600 rounded-lg p-6 shadow-lg ${className}`}>
      <div className="text-center text-white">
        <div className="flex justify-center items-center mb-3">
          <Crown className="w-8 h-8 mr-2 text-yellow-300" />
          <Badge className="bg-yellow-500 text-purple-900 font-bold px-3 py-1">
            LIMITED TIME
          </Badge>
        </div>
        
        <h3 className="text-2xl font-bold mb-2">
          🎉 Founder Member Promotion
        </h3>
        
        <p className="text-lg mb-4 text-purple-100">
          Join now and get <span className="font-bold text-yellow-300">full premium access</span> for life!
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="bg-white/10 rounded-lg p-3">
            <Users className="w-5 h-5 mx-auto mb-1" />
            <div className="font-bold">{spotsRemaining}</div>
            <div className="opacity-90">Spots Left</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <Star className="w-5 h-5 mx-auto mb-1" />
            <div className="font-bold">FREE</div>
            <div className="opacity-90">For Life</div>
          </div>
        </div>
        
        <div className="text-sm text-purple-100 space-y-1">
          <div className="flex items-center justify-center">
            <Clock className="w-4 h-4 mr-2" />
            First 1000 users only
          </div>
          <div>✨ Unlimited AI training & campaigns</div>
          <div>🏆 Exclusive founder tournament access</div>
          <div>☁️ Cloud save & cross-device sync</div>
          <div>🎖️ Permanent "Founder" badge</div>
        </div>
        
        <div className="mt-4 text-xs text-purple-200">
          Once we reach 1000 members, premium features will require subscription.
          <br />
          <strong>Founders keep premium access forever!</strong>
        </div>
      </div>
    </div>
  );
}

export function FounderBadge({ founderNumber }: { founderNumber: number }) {
  return (
    <Badge className="bg-gradient-to-r from-purple-600 to-amber-600 text-white font-bold">
      <Crown className="w-3 h-3 mr-1" />
      Founder #{founderNumber}
    </Badge>
  );
}