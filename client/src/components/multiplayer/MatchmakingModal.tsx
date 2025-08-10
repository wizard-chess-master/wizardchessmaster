import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Clock, 
  Users, 
  Search, 
  X, 
  Zap,
  Target,
  Trophy,
  Timer
} from 'lucide-react';
import { useMultiplayer } from '../../lib/stores/useMultiplayer';

interface MatchmakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGameStart: () => void;
}

export function MatchmakingModal({ isOpen, onClose, onGameStart }: MatchmakingModalProps) {
  const { 
    matchmaking, 
    joinMatchmaking, 
    leaveMatchmaking, 
    currentGame,
    serverStats 
  } = useMultiplayer();
  
  const [selectedTimeControl, setSelectedTimeControl] = useState(600); // 10 minutes
  const [searchStartTime, setSearchStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const timeControls = [
    { seconds: 300, label: '5 min', icon: Zap, color: 'text-red-500', description: 'Blitz' },
    { seconds: 600, label: '10 min', icon: Clock, color: 'text-orange-500', description: 'Rapid' },
    { seconds: 900, label: '15 min', icon: Timer, color: 'text-blue-500', description: 'Classical' },
    { seconds: 1800, label: '30 min', icon: Target, color: 'text-green-500', description: 'Long' }
  ];

  useEffect(() => {
    // Start matchmaking automatically if modal opens
    if (isOpen && !matchmaking.inQueue) {
      handleStartSearch();
    }
  }, [isOpen]);

  useEffect(() => {
    // Update elapsed time while searching
    if (matchmaking.inQueue && searchStartTime) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - searchStartTime.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [matchmaking.inQueue, searchStartTime]);

  useEffect(() => {
    // Handle game found
    if (currentGame) {
      onGameStart();
    }
  }, [currentGame, onGameStart]);

  const handleStartSearch = () => {
    setSearchStartTime(new Date());
    setElapsedTime(0);
    joinMatchmaking(selectedTimeControl);
  };

  const handleCancelSearch = () => {
    leaveMatchmaking();
    setSearchStartTime(null);
    setElapsedTime(0);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEstimatedWaitPercent = () => {
    if (!matchmaking.estimatedWait || elapsedTime === 0) return 0;
    return Math.min((elapsedTime / matchmaking.estimatedWait) * 100, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-blue-900 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Find Opponent
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelSearch}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Time Control Selection */}
          {!matchmaking.inQueue && (
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Choose Time Control</h3>
              <div className="grid grid-cols-2 gap-3">
                {timeControls.map((control) => {
                  const Icon = control.icon;
                  return (
                    <button
                      key={control.seconds}
                      onClick={() => setSelectedTimeControl(control.seconds)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedTimeControl === control.seconds
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${control.color}`} />
                        <span className="font-semibold text-gray-900">{control.label}</span>
                      </div>
                      <div className="text-xs text-gray-600">{control.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matchmaking Status */}
          {matchmaking.inQueue && (
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-1">Searching for Opponent</h3>
                <p className="text-blue-700">
                  Time Control: {Math.floor(selectedTimeControl / 60)} minutes
                </p>
              </div>

              {/* Search Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-blue-700">
                  <span>Search Time</span>
                  <span className="font-mono">{formatTime(elapsedTime)}</span>
                </div>
                {matchmaking.estimatedWait && (
                  <Progress 
                    value={getEstimatedWaitPercent()} 
                    className="h-2"
                  />
                )}
              </div>

              {/* Queue Information */}
              {matchmaking.queuePosition && (
                <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Queue Position</span>
                    <Badge variant="outline" className="text-blue-800">
                      #{matchmaking.queuePosition}
                    </Badge>
                  </div>
                  {matchmaking.estimatedWait && (
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Estimated Wait</span>
                      <span className="text-blue-800 font-mono">
                        {formatTime(matchmaking.estimatedWait)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Server Stats */}
          {serverStats && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Server Status
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Players Online</span>
                  <div className="font-semibold text-gray-900">{serverStats.onlinePlayers}</div>
                </div>
                <div>
                  <span className="text-gray-600">Active Games</span>
                  <div className="font-semibold text-gray-900">{serverStats.activeGames}</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!matchmaking.inQueue ? (
              <>
                <Button
                  onClick={handleStartSearch}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Find Match
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={handleCancelSearch}
                variant="outline"
                className="w-full border-red-300 text-red-700 hover:bg-red-50"
              >
                Cancel Search
              </Button>
            )}
          </div>

          {/* Tips */}
          <div className="text-xs text-blue-600 bg-blue-50 rounded p-2">
            <strong>Tip:</strong> You'll be matched with players within ±200 rating points for fair games.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}