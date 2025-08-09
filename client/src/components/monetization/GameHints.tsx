import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Lightbulb, Undo, Crown } from 'lucide-react';
import { getAdManager } from '../../lib/monetization/adManager';
import { getPaymentManager } from '../../lib/monetization/paymentManager';

interface GameHintsProps {
  onHint: () => void;
  onUndo: () => void;
  canUndo: boolean;
  gameStarted: boolean;
}

export const GameHints: React.FC<GameHintsProps> = ({
  onHint,
  onUndo,
  canUndo,
  gameStarted
}) => {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [undoCount, setUndoCount] = useState(0);
  const adManager = getAdManager();
  const paymentManager = getPaymentManager();

  // Reset counters when game starts
  useEffect(() => {
    if (gameStarted) {
      setHintCount(0);
      setUndoCount(0);
    }
  }, [gameStarted]);

  const handleHint = async () => {
    if (adManager.isAdFree()) {
      onHint();
      setHintCount(prev => prev + 1);
      return;
    }

    // Free hints: 1 per game (reduced to encourage subscription)
    if (hintCount < 1) {
      onHint();
      setHintCount(prev => prev + 1);
      return;
    }

    // Show rewarded ad for additional hints
    const watched = await adManager.showRewardedAd();
    if (watched) {
      onHint();
      setHintCount(prev => prev + 1);
    }
  };

  const handleUndo = async () => {
    if (!canUndo) return;

    if (adManager.isAdFree()) {
      onUndo();
      setUndoCount(prev => prev + 1);
      return;
    }

    // Free undos: 0 per game (premium feature only)
    // Show upgrade prompt immediately for free users
    setShowUpgradeDialog(true);
    return;
  };

  const showUpgrade = () => {
    setShowUpgradeDialog(true);
  };

  const getHintButtonText = () => {
    if (adManager.isAdFree()) return 'Hint';
    if (hintCount < 1) return `Hint (${1 - hintCount} free)`;
    return 'Hint (Watch Ad)';
  };

  const getUndoButtonText = () => {
    if (adManager.isAdFree()) return 'Undo';
    return 'Undo (Premium Only)';
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Hint Button */}
      <Button
        onClick={handleHint}
        variant="outline"
        size="sm"
        className="medieval-btn"
        disabled={!gameStarted}
      >
        <Lightbulb className="w-4 h-4 mr-1" />
        {getHintButtonText()}
      </Button>

      {/* Undo Button */}
      <Button
        onClick={handleUndo}
        variant="outline"
        size="sm"
        className="medieval-btn"
        disabled={!canUndo || !gameStarted}
      >
        <Undo className="w-4 h-4 mr-1" />
        {getUndoButtonText()}
      </Button>

      {/* Premium Upgrade Button */}
      {!adManager.isAdFree() && (
        <Button
          onClick={showUpgrade}
          variant="default"
          size="sm"
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white border-0"
        >
          <Crown className="w-4 h-4 mr-1" />
          Remove Ads
          <Badge variant="secondary" className="ml-1 bg-white text-purple-600">
            ${paymentManager.getUserPlan()?.price || '5.00'}/mo
          </Badge>
        </Button>
      )}

      {adManager.isAdFree() && (
        <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </Badge>
      )}

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <Crown className="w-6 h-6 inline mr-2 text-yellow-500" />
              Upgrade to Premium
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-lg mb-2 text-purple-800">🧙‍♂️ Wizard Chess Premium</h3>
              <ul className="text-sm space-y-1 text-purple-700">
                <li>🚫 Remove all advertisements</li>
                <li>♾️ Unlimited hints & undos</li>
                <li>🏆 Full campaign mode access</li>
                <li>🎨 Exclusive themes & pieces</li>
                <li>☁️ Cloud save & sync</li>
                <li>🎯 Priority support</li>
              </ul>
            </div>
            <div className="text-2xl font-bold text-purple-600">${paymentManager.getUserPlan()?.price || '5.00'}/month</div>
            <p className="text-sm text-gray-600">Cancel anytime • First month $3.99</p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => {
                  setShowUpgradeDialog(false);
                  paymentManager.showUpgradeDialog();
                }}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
              >
                Purchase Now
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowUpgradeDialog(false)}
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};