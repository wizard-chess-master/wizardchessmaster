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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden medieval-panel">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-2xl medieval-text">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Campaign Mode
            <span className="text-sm font-normal text-gray-400 ml-2">
              - Progressive AI Challenge
            </span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Campaign Map
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
            <TabsContent value="map" className="mt-0 space-y-4">
              <CampaignMap 
                levels={levels}
                onStartLevel={handleStartLevel}
                playerProgress={playerStats.campaignProgress}
              />
              
              <Separator />
              
              {/* Reset Campaign */}
              <div className="flex justify-between items-center pt-2">
                <div className="text-sm text-gray-400">
                  Progress is automatically saved. Reset to start fresh.
                </div>
                <Button
                  variant="outline"
                  className="medieval-btn flex items-center gap-2"
                  onClick={handleResetCampaign}
                >
                  <RotateCcw className="w-4 h-4" />
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