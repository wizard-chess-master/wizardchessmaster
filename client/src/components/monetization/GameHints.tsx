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

    // Free hints: 2 per game
    if (hintCount < 2) {
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

    // Free undos: 1 per game
    if (undoCount < 1) {
      onUndo();
      setUndoCount(prev => prev + 1);
      return;
    }

    // Show rewarded ad for additional undos
    const watched = await adManager.showRewardedAd();
    if (watched) {
      onUndo();
      setUndoCount(prev => prev + 1);
    }
  };

  const showUpgrade = () => {
    setShowUpgradeDialog(true);
  };

  const getHintButtonText = () => {
    if (adManager.isAdFree()) return 'Hint';
    if (hintCount < 2) return `Hint (${2 - hintCount} free)`;
    return 'Hint (Watch Ad)';
  };

  const getUndoButtonText = () => {
    if (adManager.isAdFree()) return 'Undo';
    if (undoCount < 1) return `Undo (${1 - undoCount} free)`;
    return 'Undo (Watch Ad)';
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
          <Badge variant="secondary" className="ml-1 bg-white text-yellow-600">
            $2.99
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
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">🧙‍♂️ Wizard Chess Premium</h3>
              <ul className="text-sm space-y-1">
                <li>✨ Remove all advertisements</li>
                <li>🎯 Unlimited hints & undos</li>
                <li>🏆 Exclusive wizard themes</li>
                <li>⚡ Priority game loading</li>
              </ul>
            </div>
            <div className="text-2xl font-bold text-yellow-600">$2.99</div>
            <p className="text-sm text-gray-600">One-time purchase, lifetime access</p>
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