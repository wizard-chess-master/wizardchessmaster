import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  const [isOpen, setIsOpen] = useState(false);

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
    console.log('Starting campaign level:', level.name, 'with difficulty:', aiDifficulty);
    console.log('🎮 Starting game with mode: ai, difficulty:', aiDifficulty);
    startGame('ai', aiDifficulty);
    // Close dialog after starting game
    setIsOpen(false);
  };

  const handleResetCampaign = () => {
    if (confirm('Are you sure you want to reset your campaign progress? This cannot be undone.')) {
      resetCampaign();
    }
  };

  const handleOpenDialog = () => {
    console.log('Opening campaign dialog');
    setIsOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <DialogTrigger asChild onClick={handleOpenDialog}>
        {children}
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-4xl h-[85vh] bg-gray-900 border-2 border-yellow-600 rounded-lg flex flex-col overflow-hidden">
        <DialogHeader className="pb-4 flex-shrink-0 bg-gray-800 p-6 border-b border-yellow-600">
          <DialogTitle className="flex items-center gap-3 text-2xl text-yellow-400 font-bold">
            <Trophy className="w-6 h-6" />
            Wizard's Quest
          </DialogTitle>
          <DialogDescription className="text-gray-300 mt-2">
            Embark on a magical journey through challenging wizard chess battles. Test your skills against increasingly powerful AI opponents.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col bg-gray-900">
          <TabsList className="grid w-full grid-cols-2 mb-4 mx-6 mt-4 bg-gray-800 border border-yellow-600/30">
            <TabsTrigger value="map" className="flex items-center gap-2 text-yellow-400">
              <MapPin className="w-4 h-4" />
              Campaign Map
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2 text-yellow-400">
              <BarChart3 className="w-4 h-4" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto bg-gray-900 min-h-0">
            <TabsContent value="map" className="mt-0 space-y-6 p-4 sm:p-6 flex flex-col items-center h-full">
              <CampaignMap 
                levels={levels}
                onStartLevel={handleStartLevel}
                playerProgress={playerStats.campaignProgress}
              />
              
              <Separator />
              
              {/* Reset Campaign - Fixed positioning */}
              <div className="mt-auto pt-4 border-t border-gray-700/50 w-full max-w-4xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="text-xs sm:text-sm text-gray-400">
                    Progress is automatically saved. Reset to start fresh.
                  </div>
                  <Button
                    variant="outline"
                    className="medieval-btn flex items-center gap-2 text-sm w-full sm:w-auto flex-shrink-0"
                    onClick={handleResetCampaign}
                  >
                    <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                    Reset Campaign
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="mt-0 p-6 bg-gray-900 text-center">
              <div className="text-yellow-400 text-xl font-bold mb-4">Campaign Statistics - Centered</div>
              <CampaignStats playerStats={playerStats} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}