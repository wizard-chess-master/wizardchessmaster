import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useRewards } from '../../lib/rewards/pieceSetManager';
import { useAchievements } from '../../lib/achievements/achievementSystem';
import { Lock, Unlock, Star, Crown, Gem, Diamond } from 'lucide-react';

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'bg-gray-500';
    case 'rare': return 'bg-blue-500';
    case 'epic': return 'bg-purple-500';
    case 'legendary': return 'bg-orange-500';
    case 'mythic': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getRarityIcon = (rarity: string) => {
  switch (rarity) {
    case 'common': return <Star className="w-4 h-4" />;
    case 'rare': return <Crown className="w-4 h-4" />;
    case 'epic': return <Gem className="w-4 h-4" />;
    case 'legendary': return <Diamond className="w-4 h-4" />;
    case 'mythic': return <Diamond className="w-4 h-4 text-red-400" />;
    default: return <Star className="w-4 h-4" />;
  }
};

interface RewardsScreenProps {
  onClose: () => void;
  selectedPieceSet: string;
  selectedBoardTheme: string;
  onSelectPieceSet: (setId: string) => void;
  onSelectBoardTheme: (themeId: string) => void;
}

export const RewardsScreen: React.FC<RewardsScreenProps> = ({
  onClose,
  selectedPieceSet,
  selectedBoardTheme,
  onSelectPieceSet,
  onSelectBoardTheme
}) => {
  const { PIECE_SETS, BOARD_THEMES, isPieceSetUnlocked, isBoardThemeUnlocked } = useRewards();
  const { currentLevel, totalExperience } = useAchievements();
  const [activeTab, setActiveTab] = useState<'pieces' | 'boards'>('pieces');

  const unlockedPieceSets = PIECE_SETS.filter(set => isPieceSetUnlocked(set.id));
  const lockedPieceSets = PIECE_SETS.filter(set => !isPieceSetUnlocked(set.id));
  
  const unlockedBoardThemes = BOARD_THEMES.filter(theme => isBoardThemeUnlocked(theme.id));
  const lockedBoardThemes = BOARD_THEMES.filter(theme => !isBoardThemeUnlocked(theme.id));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto medieval-panel">
        <CardHeader className="text-center border-b border-amber-600/30">
          <CardTitle className="medieval-text text-2xl flex items-center justify-center gap-2">
            <Crown className="w-8 h-8 text-amber-400" />
            Treasure Collection
            <Crown className="w-8 h-8 text-amber-400" />
          </CardTitle>
          <div className="flex justify-center gap-4 text-sm text-amber-300">
            <span>Level {currentLevel}</span>
            <span>•</span>
            <span>{totalExperience} XP</span>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'pieces' | 'boards')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="pieces" className="medieval-btn-mini">
                Piece Sets ({unlockedPieceSets.length}/{PIECE_SETS.length})
              </TabsTrigger>
              <TabsTrigger value="boards" className="medieval-btn-mini">
                Board Themes ({unlockedBoardThemes.length}/{BOARD_THEMES.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pieces" className="space-y-6">
              {/* Unlocked Piece Sets */}
              <div>
                <h3 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
                  <Unlock className="w-5 h-5" />
                  Unlocked Piece Sets
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unlockedPieceSets.map((set) => (
                    <Card 
                      key={set.id} 
                      className={`medieval-panel cursor-pointer transition-all duration-300 hover:scale-105 ${
                        selectedPieceSet === set.id ? 'ring-2 ring-amber-400' : ''
                      }`}
                      onClick={() => onSelectPieceSet(set.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg medieval-text">{set.name}</CardTitle>
                          <Badge className={`${getRarityColor(set.rarity)} text-white flex items-center gap-1`}>
                            {getRarityIcon(set.rarity)}
                            {set.rarity}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <img 
                          src={`/attached_assets/generated_images/${set.name.replace(' ', '_')}_*.png`}
                          alt={set.name}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <p className="text-sm text-gray-300 mb-2">{set.description}</p>
                        <p className="text-xs text-amber-300">{set.theme}</p>
                        {selectedPieceSet === set.id && (
                          <Badge className="mt-2 bg-green-600">Currently Active</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Locked Piece Sets */}
              {lockedPieceSets.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-400 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Locked Piece Sets
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lockedPieceSets.map((set) => (
                      <Card key={set.id} className="medieval-panel opacity-60">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg medieval-text flex items-center gap-2">
                              <Lock className="w-4 h-4" />
                              {set.name}
                            </CardTitle>
                            <Badge className={`${getRarityColor(set.rarity)} text-white flex items-center gap-1`}>
                              {getRarityIcon(set.rarity)}
                              {set.rarity}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="w-full h-32 bg-gray-700 rounded-lg mb-2 flex items-center justify-center">
                            <Lock className="w-8 h-8 text-gray-500" />
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{set.description}</p>
                          <div className="text-xs">
                            {set.unlockType === 'achievement' && (
                              <span className="text-yellow-400">
                                Unlock: Complete achievement "{set.unlockRequirement}"
                              </span>
                            )}
                            {set.unlockType === 'level' && (
                              <span className="text-blue-400">
                                Unlock: Reach level {set.unlockRequirement}
                              </span>
                            )}
                            {set.unlockType === 'purchase' && (
                              <span className="text-green-400">
                                Purchase: {set.price} coins
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="boards" className="space-y-6">
              {/* Unlocked Board Themes */}
              <div>
                <h3 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
                  <Unlock className="w-5 h-5" />
                  Unlocked Board Themes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unlockedBoardThemes.map((theme) => (
                    <Card 
                      key={theme.id} 
                      className={`medieval-panel cursor-pointer transition-all duration-300 hover:scale-105 ${
                        selectedBoardTheme === theme.id ? 'ring-2 ring-amber-400' : ''
                      }`}
                      onClick={() => onSelectBoardTheme(theme.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg medieval-text">{theme.name}</CardTitle>
                          <Badge className={`${getRarityColor(theme.rarity)} text-white flex items-center gap-1`}>
                            {getRarityIcon(theme.rarity)}
                            {theme.rarity}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="w-full h-32 rounded-lg mb-2 grid grid-cols-8 gap-px overflow-hidden">
                          {Array.from({ length: 64 }).map((_, i) => (
                            <div
                              key={i}
                              className="aspect-square"
                              style={{
                                backgroundColor: (Math.floor(i / 8) + i) % 2 === 0 
                                  ? theme.lightSquare 
                                  : theme.darkSquare
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{theme.description}</p>
                        <p className="text-xs text-amber-300">{theme.theme}</p>
                        {selectedBoardTheme === theme.id && (
                          <Badge className="mt-2 bg-green-600">Currently Active</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Locked Board Themes */}
              {lockedBoardThemes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-400 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Locked Board Themes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lockedBoardThemes.map((theme) => (
                      <Card key={theme.id} className="medieval-panel opacity-60">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg medieval-text flex items-center gap-2">
                              <Lock className="w-4 h-4" />
                              {theme.name}
                            </CardTitle>
                            <Badge className={`${getRarityColor(theme.rarity)} text-white flex items-center gap-1`}>
                              {getRarityIcon(theme.rarity)}
                              {theme.rarity}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="w-full h-32 bg-gray-700 rounded-lg mb-2 flex items-center justify-center">
                            <Lock className="w-8 h-8 text-gray-500" />
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{theme.description}</p>
                          <div className="text-xs">
                            {theme.unlockType === 'achievement' && (
                              <span className="text-yellow-400">
                                Unlock: Complete achievement "{theme.unlockRequirement}"
                              </span>
                            )}
                            {theme.unlockType === 'level' && (
                              <span className="text-blue-400">
                                Unlock: Reach level {theme.unlockRequirement}
                              </span>
                            )}
                            {theme.unlockType === 'purchase' && (
                              <span className="text-green-400">
                                Purchase: {theme.price} coins
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-center mt-6">
            <Button onClick={onClose} className="medieval-btn px-8">
              Close Collection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};