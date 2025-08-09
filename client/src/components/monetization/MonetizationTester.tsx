import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Settings, TestTube, Crown, DollarSign } from 'lucide-react';
import { getPaymentManager } from '../../lib/monetization/paymentManager';
import { getAdManager } from '../../lib/monetization/adManager';
import { FreemiumPromo } from './FreemiumPromo';
import { PremiumComparisonModal } from './PremiumComparisonModal';

export const MonetizationTester: React.FC = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const [promoType, setPromoType] = useState<'game_start' | 'hint_limit' | 'undo_attempt' | 'campaign_locked'>('hint_limit');
  const [showComparison, setShowComparison] = useState(false);
  const paymentManager = getPaymentManager();
  const adManager = getAdManager();

  const togglePremiumStatus = (enabled: boolean) => {
    setIsPremium(enabled);
    adManager.setAdFreeStatus(enabled);
    
    if (enabled) {
      // Simulate premium activation
      localStorage.setItem('wizard-chess-user-plan', JSON.stringify({
        id: 'premium-monthly',
        name: 'Wizard Chess Premium',
        price: 5.00,
        active: true
      }));
      console.log('🎉 Premium status activated for testing');
      alert('✅ Switched to PREMIUM mode for testing!');
    } else {
      // Simulate free user
      localStorage.removeItem('wizard-chess-user-plan');
      adManager.setAdFreeStatus(false);
      console.log('📱 Free user status activated for testing');
      alert('✅ Switched to FREE mode for testing!');
    }
  };

  const testPricing = () => {
    const currentPrice = localStorage.getItem('wizard-chess-price-variant');
    console.log('💰 Current A/B test price:', currentPrice || 'Not set');
    
    // Cycle through price variants
    const prices = [4.99, 5.00, 5.99, 6.99];
    const currentIndex = currentPrice ? prices.indexOf(parseFloat(currentPrice)) : -1;
    const nextPrice = prices[(currentIndex + 1) % prices.length];
    
    localStorage.setItem('wizard-chess-price-variant', nextPrice.toString());
    console.log('💰 New A/B test price:', nextPrice);
    window.location.reload(); // Reload to apply new pricing
  };

  const triggerPromo = (type: 'game_start' | 'hint_limit' | 'undo_attempt' | 'campaign_locked') => {
    setPromoType(type);
    setShowPromo(true);
  };

  const currentPrice = localStorage.getItem('wizard-chess-price-variant') || '5.00';
  const userPlan = paymentManager.getUserPlan();

  return (
    <>
      <Card className="max-w-md mx-auto bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Monetization Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Premium Status Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              <span>Premium Status</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={isPremium ? "default" : "outline"}
                onClick={() => togglePremiumStatus(!isPremium)}
              >
                {isPremium ? "Premium" : "Free"}
              </Button>
              <Badge variant={isPremium ? "default" : "secondary"}>
                {isPremium ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {/* Current Pricing */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>A/B Test Price</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">${currentPrice}/month</Badge>
              <Button size="sm" variant="outline" onClick={testPricing}>
                Cycle
              </Button>
            </div>
          </div>

          {/* User Plan Info */}
          <div className="p-3 bg-white rounded-lg border">
            <h4 className="font-semibold text-sm mb-2">Current Plan:</h4>
            {userPlan ? (
              <div className="text-sm space-y-1">
                <div>Name: {userPlan.name}</div>
                <div>Price: ${userPlan.price}/month</div>
                <div>Features: {userPlan.features.length} items</div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No active plan</div>
            )}
          </div>

          {/* Promo Testing */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Test Freemium Promos:</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => triggerPromo('game_start')}
              >
                Game Start
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => triggerPromo('hint_limit')}
              >
                Hint Limit
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => triggerPromo('undo_attempt')}
              >
                Undo Block
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => triggerPromo('campaign_locked')}
              >
                Campaign Lock
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t space-y-2">
            <Button 
              onClick={() => setShowComparison(true)}
              className="w-full"
              variant="default"
            >
              Show Free vs Premium
            </Button>
            <Button 
              onClick={() => paymentManager.showPlanSelector()}
              className="w-full"
              variant="outline"
            >
              Show Plan Selector
            </Button>
            <Button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full"
              variant="destructive"
              size="sm"
            >
              Reset All & Reload
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Freemium Promo Modal */}
      {showPromo && (
        <FreemiumPromo 
          trigger={promoType}
          onClose={() => setShowPromo(false)}
        />
      )}

      {/* Premium Comparison Modal */}
      <PremiumComparisonModal 
        open={showComparison}
        onClose={() => setShowComparison(false)}
      />
    </>
  );
};