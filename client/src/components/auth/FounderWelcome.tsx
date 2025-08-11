import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Crown, Star, Gift, Sparkles } from 'lucide-react';
import { FounderBadge } from '../marketing/FounderPromotion';

interface FounderWelcomeProps {
  founderNumber: number;
  onContinue: () => void;
}

export function FounderWelcome({ founderNumber, onContinue }: FounderWelcomeProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full bg-gradient-to-br from-purple-900 via-purple-800 to-amber-800 text-white border-0 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Crown className="w-16 h-16 text-yellow-300" />
              <Sparkles className="w-6 h-6 text-yellow-200 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold mb-2">
            🎉 Welcome, Founder!
          </CardTitle>
          <FounderBadge founderNumber={founderNumber} />
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-lg mb-4 text-purple-100">
              Congratulations! You're Founder Member #{founderNumber} and have unlocked 
              <span className="font-bold text-yellow-300"> lifetime premium access!</span>
            </p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-center mb-3 flex items-center justify-center">
              <Gift className="w-5 h-5 mr-2" />
              Your Founder Benefits
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-300" />
                <span>Unlimited AI training & campaigns</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-300" />
                <span>Exclusive founder tournament access</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-300" />
                <span>Cloud save & cross-device sync</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-300" />
                <span>Permanent "Founder" badge & recognition</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-300" />
                <span>Priority customer support</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-600/20 rounded-lg p-3 text-center">
            <p className="text-sm text-amber-100">
              <strong>Lifetime Value:</strong> Your founder status includes premium features worth $60/year - 
              yours forever as a founding member of Wizard Chess Master!
            </p>
          </div>

          <Button 
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white font-bold py-3 text-lg"
          >
            Start Your Wizard Chess Journey
          </Button>
          
          <p className="text-xs text-center text-purple-200">
            Thank you for being part of our founding community!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}