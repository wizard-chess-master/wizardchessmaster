import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { useCampaign, CampaignLevel } from '../../lib/stores/useCampaign';
import { useChess } from '../../lib/stores/useChess';
import { CampaignMap } from './CampaignMap';
import { CampaignStats } from './CampaignStats';
import { 
  Trophy, 
  RotateCcw,
  MapPin,
  BarChart3
} from 'lucide-react';

interface CampaignDialogProps {
  children: React.ReactNode;
}

export function CampaignDialog({ children }: CampaignDialogProps) {
  const { 
    levels, 
    playerStats, 
    initializeCampaign, 
    startCampaignLevel,
    resetCampaign 
  } = useCampaign();
  const { startGame } = useChess();
  const [activeTab, setActiveTab] = useState('map');

  useEffect(() => {
    initializeCampaign();
  }, [initializeCampaign]);

  const handleStartLevel = (level: CampaignLevel) => {
    startCampaignLevel(level.id);
    // Map campaign difficulty to AI difficulty
    const aiDifficultyMap: Record<string, 'easy' | 'medium' | 'hard' | 'advanced'> = {
      'easy': 'easy',
      'medium': 'medium', 
      'hard': 'hard',
      'advanced': 'advanced',
      'master': 'advanced', // Map to advanced for now
      'grandmaster': 'advanced' // Map to advanced for now
    };
    const aiDifficulty = aiDifficultyMap[level.difficulty] || 'medium';
    startGame('ai', aiDifficulty);
  };

  const handleResetCampaign = () => {
    if (confirm('Are you sure you want to reset your campaign progress? This cannot be undone.')) {
      resetCampaign();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-6xl h-[95vh] max-h-[800px] overflow-hidden medieval-panel flex flex-col">
        <DialogHeader className="pb-3 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl medieval-text">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            Campaign Mode
            <span className="text-xs sm:text-sm font-normal text-gray-400 ml-2 hidden sm:inline">
              - Progressive AI Challenge
            </span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 mb-3 flex-shrink-0">
            <TabsTrigger value="map" className="flex items-center gap-2 text-sm">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Campaign Map</span>
              <span className="sm:hidden">Map</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2 text-sm">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Statistics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto min-h-0 pr-1">
            <TabsContent value="map" className="mt-0 space-y-4">
              <CampaignMap 
                levels={levels}
                onStartLevel={handleStartLevel}
                playerProgress={playerStats.campaignProgress}
              />
              
              <Separator />
              
              {/* Reset Campaign */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 mt-4 border-t border-gray-700/50">
                <div className="text-xs sm:text-sm text-gray-400">
                  Progress is automatically saved. Reset to start fresh.
                </div>
                <Button
                  variant="outline"
                  className="medieval-btn flex items-center gap-2 text-sm w-full sm:w-auto"
                  onClick={handleResetCampaign}
                >
                  <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                  Reset Campaign
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="mt-0">
              <CampaignStats playerStats={playerStats} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}