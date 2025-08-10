import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Crown, X, Star, Gift, Clock } from 'lucide-react';
import { getPaymentManager } from '../../lib/monetization/paymentManager';
import { getAdManager } from '../../lib/monetization/adManager';

interface FreemiumPromoProps {
  trigger?: 'game_start' | 'hint_limit' | 'undo_attempt' | 'campaign_locked';
  onClose?: () => void;
}

export const FreemiumPromo: React.FC<FreemiumPromoProps> = ({ 
  trigger = 'hint_limit', 
  onClose 
}) => {
  const [showPromo, setShowPromo] = useState(false);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds
  const paymentManager = getPaymentManager();
  const adManager = getAdManager();

  // DISABLED: Show promo based on trigger and user status
  useEffect(() => {
    // Always return early - disable all promos
    return;
  }, [trigger, adManager]);

  // Countdown timer for limited-time offer
  useEffect(() => {
    if (!showPromo) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [showPromo]);

  const handleClose = () => {
    setShowPromo(false);
    onClose?.();
  };

  const handleUpgrade = () => {
    paymentManager.showPlanSelector();
    handleClose();
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPromoContent = () => {
    switch (trigger) {
      case 'game_start':
        return {
          title: "Welcome to Wizard Chess! 🧙‍♂️",
          subtitle: "Ready to unlock the full magical experience?",
          features: ["♾️ Unlimited hints & undos", "🎨 Exclusive wizard themes", "🏆 Full campaign mode"]
        };
      case 'hint_limit':
        return {
          title: "Hint Limit Reached! 💡",
          subtitle: "Need more strategic guidance?",
          features: ["♾️ Unlimited AI hints", "🧠 Advanced strategy tips", "📚 Move explanations"]
        };
      case 'undo_attempt':
        return {
          title: "Undo Requires Premium! ↩️",
          subtitle: "Make perfect moves every time",
          features: ["♾️ Unlimited undos", "🔄 Experiment freely", "🎯 Perfect your strategy"]
        };
      case 'campaign_locked':
        return {
          title: "Campaign Mode Locked! 🔒",
          subtitle: "Unlock epic wizard adventures",
          features: ["🏰 12 magical campaigns", "🗺️ Unique board variants", "📖 Rich storylines"]
        };
      default:
        return {
          title: "Upgrade to Premium! ⭐",
          subtitle: "Unlock the full wizard chess experience",
          features: ["🚫 Ad-free gaming", "♾️ Unlimited features", "🎨 Exclusive content"]
        };
    }
  };

  const content = getPromoContent();

  if (!showPromo) return null;

  return (
    <Dialog open={showPromo} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white border-2 border-gold">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 p-0 text-white hover:bg-white/20"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            {content.title}
          </DialogTitle>
          <p className="text-center text-purple-200 text-sm">{content.subtitle}</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Limited Time Offer Banner */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 p-3 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-semibold">Limited Time Offer!</span>
            </div>
            <div className="text-lg font-bold">{formatTime(timeLeft)}</div>
            <div className="text-xs opacity-90">First month only $3.99 (normally $5.00)</div>
          </div>

          {/* Features List */}
          <div className="space-y-2">
            {content.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              $3.99 <span className="text-lg text-purple-200">first month</span>
            </div>
            <div className="text-sm text-purple-300">
              Then $5.00/month • Cancel anytime
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
            >
              <Crown className="w-4 h-4 mr-2" />
              Start Premium
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-purple-400 text-purple-200 hover:bg-purple-800"
            >
              Later
            </Button>
          </div>

          {/* Social Proof */}
          <div className="text-center text-xs text-purple-300">
            <Gift className="w-3 h-3 inline mr-1" />
            Join 10,000+ premium wizards already playing!
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook for triggering promos at strategic moments
export const useFreemiumPromo = () => {
  const [promoTrigger, setPromoTrigger] = useState<string | null>(null);
  
  const triggerPromo = (type: 'game_start' | 'hint_limit' | 'undo_attempt' | 'campaign_locked') => {
    setPromoTrigger(type);
  };
  
  const clearPromo = () => {
    setPromoTrigger(null);
  };
  
  return { promoTrigger, triggerPromo, clearPromo };
};