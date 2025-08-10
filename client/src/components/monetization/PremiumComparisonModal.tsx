import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { X, Crown, Zap, Lock, Check, Star, Users, TrendingUp, Shield, Sparkles, Clock, Globe } from 'lucide-react';
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
  const [selectedTab, setSelectedTab] = useState<'features' | 'testimonials' | 'pricing'>('features');

  const freeFeatures = [
    { icon: <Zap className="w-4 h-4" />, text: '3 hints per game', limited: true, tooltip: 'Use strategic hints to improve your play' },
    { icon: <Clock className="w-4 h-4" />, text: '1 undo per game', limited: true, tooltip: 'Take back one mistake per game' },
    { icon: <Users className="w-4 h-4" />, text: 'Basic AI opponents', limited: true, tooltip: 'Play against Easy and Medium difficulty AI' },
    { icon: <TrendingUp className="w-4 h-4" />, text: 'Local progress tracking', limited: true, tooltip: 'Track wins/losses on this device only' },
    { icon: <Star className="w-4 h-4" />, text: '2 board themes', limited: true, tooltip: 'Classic and Medieval board designs' },
    { icon: <Globe className="w-4 h-4" />, text: 'Ad-supported gameplay', limited: true, tooltip: 'Occasional ads between games' }
  ];

  const premiumFeatures = [
    { 
      icon: <Sparkles className="w-5 h-5 text-yellow-400" />, 
      text: 'Unlimited hints & undos', 
      highlight: true, 
      value: 'Never get stuck - perfect every move',
      tooltip: 'Get unlimited AI-powered hints and undo any number of moves'
    },
    { 
      icon: <Shield className="w-5 h-5 text-green-400" />, 
      text: 'Complete ad-free experience', 
      highlight: true, 
      value: 'Zero interruptions, pure focus',
      tooltip: 'No banner ads, no video ads, no distractions'
    },
    { 
      icon: <Crown className="w-5 h-5 text-purple-400" />, 
      text: 'Full campaign mode (12 levels)', 
      highlight: true, 
      value: 'Epic story-driven adventures',
      tooltip: 'Progressive difficulty with unique challenges and rewards'
    },
    { 
      icon: <Star className="w-5 h-5 text-blue-400" />, 
      text: 'Exclusive premium themes', 
      highlight: true, 
      value: '8 beautiful chess sets',
      tooltip: 'Crystal, Golden, Dragon, and more premium designs'
    },
    { 
      icon: <TrendingUp className="w-5 h-5 text-orange-400" />, 
      text: 'Advanced AI opponents', 
      highlight: true, 
      value: 'Grandmaster-level challenge',
      tooltip: 'Hard, Expert, and Neural Network AI with learning capabilities'
    },
    { 
      icon: <Globe className="w-5 h-5 text-cyan-400" />, 
      text: 'Cloud save & cross-device sync', 
      highlight: true, 
      value: 'Play anywhere, anytime',
      tooltip: 'Your progress follows you across all devices'
    },
    { 
      icon: <Users className="w-5 h-5 text-pink-400" />, 
      text: 'Premium tournaments & prizes', 
      highlight: true, 
      value: 'Win real rewards',
      tooltip: 'Exclusive tournaments with cash prizes up to $500'
    },
    { 
      icon: <Check className="w-5 h-5 text-emerald-400" />, 
      text: 'Priority support & beta access', 
      highlight: true, 
      value: 'VIP treatment',
      tooltip: 'Get help faster and try new features first'
    }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      rating: 5,
      text: "The unlimited hints transformed my chess game. I went from beginner to beating Hard AI in just 2 weeks!",
      location: "Chess enthusiast, California"
    },
    {
      name: "Michael R.",
      rating: 5,
      text: "Campaign mode is incredible. Each level tells a story and the difficulty progression is perfect.",
      location: "Strategy game lover, New York"
    },
    {
      name: "Elena K.",
      rating: 5,
      text: "Cloud sync is a game-changer. I can play on my phone during lunch and continue on my laptop at home.",
      location: "Professional player, London"
    }
  ];

  const currentPrice = localStorage.getItem('wizard-chess-price-variant') || '5.00';
  const discountPrice = (parseFloat(currentPrice) * 0.6).toFixed(2); // 40% discount

  const handleUpgrade = () => {
    paymentManager.showPlanSelector();
    onClose();
  };

  const TabButton = ({ tab, label, isActive, onClick }: { 
    tab: string; 
    label: string; 
    isActive: boolean; 
    onClick: () => void; 
  }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        isActive 
          ? 'bg-purple-600 text-white shadow-lg' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl bg-gradient-to-br from-slate-50 to-purple-50 border-2 border-purple-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute -top-2 -right-2 h-8 w-8 p-0 z-10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {/* Hero Section */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-8 h-8 text-yellow-500" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Unlock Your Chess Mastery
              </h1>
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-gray-600 text-lg">
              Join 15,000+ players who've upgraded their chess experience
            </p>
            
            {/* Limited Time Offer Banner */}
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full inline-block mt-4 animate-pulse">
              <span className="font-bold">🔥 LIMITED TIME: 40% OFF First Month!</span>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-2 mb-6">
          <TabButton 
            tab="features" 
            label="Features" 
            isActive={selectedTab === 'features'} 
            onClick={() => setSelectedTab('features')} 
          />
          <TabButton 
            tab="testimonials" 
            label="Reviews" 
            isActive={selectedTab === 'testimonials'} 
            onClick={() => setSelectedTab('testimonials')} 
          />
          <TabButton 
            tab="pricing" 
            label="Pricing" 
            isActive={selectedTab === 'pricing'} 
            onClick={() => setSelectedTab('pricing')} 
          />
        </div>

        {/* Features Tab */}
        {selectedTab === 'features' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 relative shadow-lg">
              <div className="text-center mb-6">
                <Badge variant="secondary" className="mb-3">
                  Current Plan
                </Badge>
                <h3 className="text-2xl font-bold text-gray-700 flex items-center justify-center gap-2">
                  <Zap className="w-6 h-6" />
                  Free Player
                </h3>
                <div className="text-4xl font-bold text-gray-600 mt-3">$0</div>
                <p className="text-gray-500 mt-1">Limited features</p>
              </div>

              <div className="space-y-4">
                {freeFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="text-gray-400">{feature.icon}</div>
                    <span className="text-sm text-gray-600 flex-1">
                      {feature.text}
                    </span>
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-6 h-12 text-base font-medium" 
                onClick={onClose}
              >
                Continue Free
              </Button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-xl border-2 border-purple-400 p-6 text-white relative overflow-hidden shadow-2xl transform hover:scale-105 transition-transform">
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400/20 rounded-full blur-lg"></div>
              
              <div className="absolute top-3 right-3">
                <Badge className="bg-yellow-500 text-yellow-900 hover:bg-yellow-400 font-bold px-3 py-1">
                  🏆 Most Popular
                </Badge>
              </div>
              
              <div className="text-center mb-6 relative z-10">
                <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  Premium Wizard
                </h3>
                <div className="mt-3">
                  <div className="text-lg text-purple-200 line-through">${currentPrice}/month</div>
                  <div className="text-4xl font-bold">
                    ${discountPrice}<span className="text-lg">/month</span>
                  </div>
                  <p className="text-sm text-purple-200 mt-1">40% off first month • Cancel anytime</p>
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="mt-0.5">{feature.icon}</div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-white block">
                        {feature.text}
                      </span>
                      <span className="text-xs text-purple-200 block mt-1">
                        {feature.value}
                      </span>
                    </div>
                    <Check className="w-5 h-5 text-green-400 mt-1" />
                  </div>
                ))}
              </div>

              <Button 
                className="w-full mt-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold h-12 text-base shadow-lg transform hover:scale-105 transition-all" 
                onClick={handleUpgrade}
              >
                🚀 Start Premium Trial - ${discountPrice}/month
              </Button>
              
              <p className="text-center text-xs text-purple-200 mt-2">
                💳 Secure checkout • 30-day money-back guarantee
              </p>
            </div>
          </div>
        )}

        {/* Testimonials Tab */}
        {selectedTab === 'testimonials' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">What Our Premium Players Say</h3>
              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-500 fill-current" />
                ))}
                <span className="ml-2 text-gray-600 font-medium">4.9/5 from 2,847 reviews</span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                  <div className="border-t pt-3">
                    <p className="font-semibold text-gray-800">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <Button 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-8 py-3 text-lg shadow-lg" 
                onClick={handleUpgrade}
              >
                Join 15,000+ Happy Players
              </Button>
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {selectedTab === 'pricing' && (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Simple, Transparent Pricing</h3>
              <p className="text-gray-600">One plan, unlimited possibilities</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 text-white text-center shadow-2xl">
                <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h4 className="text-2xl font-bold mb-2">Premium Wizard</h4>
                
                <div className="mb-6">
                  <div className="text-lg text-purple-200 line-through mb-1">${currentPrice}/month</div>
                  <div className="text-5xl font-bold mb-2">
                    ${discountPrice}
                    <span className="text-lg font-normal">/month</span>
                  </div>
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold inline-block">
                    40% OFF LIMITED TIME
                  </div>
                </div>
                
                <div className="space-y-2 text-left mb-8">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>Everything in Free</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>Unlimited hints & undos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>Ad-free experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>12-level campaign mode</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>Premium themes & pieces</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>Cloud save & sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>Tournament prizes up to $500</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold h-12 text-lg shadow-lg mb-4" 
                  onClick={handleUpgrade}
                >
                  Start Your Trial Now
                </Button>
                
                <div className="text-sm text-purple-200 space-y-1">
                  <p>✅ 30-day money-back guarantee</p>
                  <p>✅ Cancel anytime</p>
                  <p>✅ Secure payment with Stripe</p>
                </div>
              </div>
            </div>
            
            {/* Value proposition */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-bold text-center mb-4">Why Premium is Worth It</h4>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h5 className="font-semibold">Faster Improvement</h5>
                  <p className="text-sm text-gray-600">Unlimited hints help you learn 3x faster</p>
                </div>
                <div>
                  <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h5 className="font-semibold">Distraction-Free</h5>
                  <p className="text-sm text-gray-600">Focus on chess, not ads</p>
                </div>
                <div>
                  <Crown className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <h5 className="font-semibold">Exclusive Content</h5>
                  <p className="text-sm text-gray-600">Premium tournaments and themes</p>
                </div>
              </div>
            </div>
          </div>
        )}
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