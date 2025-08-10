import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, RotateCcw, Info } from 'lucide-react';

interface HintSettingsProps {
  showHints: boolean;
  isNewPlayer: boolean;
  onToggleHints: (enabled: boolean) => void;
  onResetHints: () => void;
  onMarkExperienced: () => void;
}

export function HintSettings({
  showHints,
  isNewPlayer,
  onToggleHints,
  onResetHints,
  onMarkExperienced
}: HintSettingsProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Hint System Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Hints */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="hint-toggle" className="font-medium">
              Show Contextual Hints
            </Label>
            <p className="text-sm text-muted-foreground">
              Display helpful hints during gameplay for new players
            </p>
          </div>
          <Switch
            id="hint-toggle"
            checked={showHints}
            onCheckedChange={onToggleHints}
          />
        </div>

        {/* New Player Status */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="font-medium">Player Experience Level</Label>
            <p className="text-sm text-muted-foreground">
              {isNewPlayer ? 'New Player - Hints will be shown' : 'Experienced Player - Limited hints'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isNewPlayer ? 'bg-green-500' : 'bg-blue-500'}`} />
            <span className="text-sm font-medium">
              {isNewPlayer ? 'New' : 'Experienced'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onResetHints}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All Dismissed Hints
          </Button>

          {isNewPlayer && (
            <Button
              variant="secondary"
              onClick={onMarkExperienced}
              className="flex items-center gap-2"
            >
              <Info className="w-4 h-4" />
              Mark as Experienced Player
            </Button>
          )}
        </div>

        {/* Information Panel */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-medium text-amber-900 mb-2">How Hints Work</h4>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• Hints appear automatically based on game situations</li>
            <li>• Each hint can be dismissed individually</li>
            <li>• New players see more detailed guidance</li>
            <li>• Experienced players see only critical hints</li>
            <li>• All hints can be disabled in settings</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}