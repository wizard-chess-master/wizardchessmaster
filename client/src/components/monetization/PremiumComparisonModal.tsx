import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { X, Crown, Zap, Lock, Check } from 'lucide-react';
import { getPaymentManager } from '../../lib/monetization/paymentManager';

interface PremiumComparisonModalProps {
  open: boolean;
  onClose: () => void;
}

export const PremiumComparisonModal: React.FC<PremiumComparisonModalProps> = ({ 
  open, 
  onClose 
}) => {
  const paymentManager = getPaymentManager();

  const freeFeatures = [
    { icon: '🎯', text: '1 hint per game', limited: true },
    { icon: '📺', text: 'Watch ads for extra hints', limited: true },
    { icon: '♟️', text: 'Basic chess gameplay', limited: false },
    { icon: '🤖', text: 'AI opponents (Easy, Medium)', limited: true },
    { icon: '📊', text: 'Basic statistics', limited: false },
    { icon: '🎨', text: '2 board themes', limited: true }
  ];

  const premiumFeatures = [
    { icon: '♾️', text: 'Unlimited hints & undos', highlight: true },
    { icon: '🚫', text: 'Ad-free experience', highlight: true },
    { icon: '🏆', text: 'Full campaign mode (12 levels)', highlight: true },
    { icon: '🎨', text: 'Exclusive themes & pieces', highlight: true },
    { icon: '🤖', text: 'Advanced AI training modes', highlight: true },
    { icon: '☁️', text: 'Cloud save & sync', highlight: true },
    { icon: '🎯', text: 'Priority support', highlight: true },
    { icon: '🧪', text: 'Beta access to new features', highlight: true }
  ];

  const currentPrice = localStorage.getItem('wizard-chess-price-variant') || '5.00';

  const handleUpgrade = () => {
    paymentManager.showPlanSelector();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-gradient-to-br from-slate-50 to-purple-50 border-2 border-purple-200">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute -top-2 -right-2 h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Choose Your Chess Experience
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Free Plan */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6 relative">
            <div className="text-center mb-4">
              <Badge variant="secondary" className="mb-2">
                Current Plan
              </Badge>
              <h3 className="text-xl font-bold text-gray-700 flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                Free Player
              </h3>
              <div className="text-3xl font-bold text-gray-600 mt-2">$0</div>
              <p className="text-sm text-gray-500">Always free</p>
            </div>

            <div className="space-y-3">
              {freeFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-lg">{feature.icon}</span>
                  <span className={`text-sm ${feature.limited ? 'text-gray-500' : 'text-gray-700'}`}>
                    {feature.text}
                  </span>
                  {feature.limited && (
                    <Lock className="w-4 h-4 text-gray-400 ml-auto" />
                  )}
                </div>
              ))}
            </div>

            <Button 
              variant="outline" 
              className="w-full mt-6" 
              onClick={onClose}
            >
              Continue Free
            </Button>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg border-2 border-purple-400 p-6 text-white relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <Badge className="bg-yellow-500 text-yellow-900 hover:bg-yellow-400">
                Most Popular
              </Badge>
            </div>
            
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Premium Wizard
              </h3>
              <div className="text-3xl font-bold mt-2">
                ${currentPrice}<span className="text-lg">/month</span>
              </div>
              <p className="text-sm text-purple-200">First month $3.99 • Cancel anytime</p>
            </div>

            <div className="space-y-3">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-lg">{feature.icon}</span>
                  <span className="text-sm text-white">
                    {feature.text}
                  </span>
                  <Check className="w-4 h-4 text-green-400 ml-auto" />
                </div>
              ))}
            </div>

            <Button 
              onClick={handleUpgrade}
              className="w-full mt-6 bg-yellow-500 hover:bg-yellow-400 text-yellow-900 font-semibold"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="text-center mt-6 p-4 bg-purple-50 rounded-lg border">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Limited Time:</strong> Get your first month for just $3.99!
          </p>
          <p className="text-xs text-gray-500">
            Join over 10,000+ premium wizards • 30-day money-back guarantee
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook for easy access to the modal
export const usePremiumComparison = () => {
  const [showComparison, setShowComparison] = React.useState(false);
  
  const openComparison = () => setShowComparison(true);
  const closeComparison = () => setShowComparison(false);
  
  return { showComparison, openComparison, closeComparison };
};