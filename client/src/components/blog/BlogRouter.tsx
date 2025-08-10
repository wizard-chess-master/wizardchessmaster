import React from 'react';

// Blog Page Imports
import { 
  ChessTrainingPage, 
  AdvancedChessPage, 
  InteractiveChessPage 
} from './BlogPages';

import { 
  StrategyGamePage, 
  TenByTenChessBoardPage, 
  MagicalWizardsPage, 
  RealTimeMultiplayerPage 
} from './BlogPages2';

import { 
  AIOpponentsPage, 
  AdaptiveLearningPage, 
  CampaignModePage, 
  StoryProgressionPage 
} from './BlogPages3';

import { 
  HintSystemPage, 
  MoveAnalysisPage, 
  LiveTournamentsPage, 
  ChessRankingsPage 
} from './BlogPages4';

import { 
  CrossDeviceSynchronizationPage, 
  ChessGameplayPage, 
  OnlineChessToolsPage, 
  ChessMasteryPage, 
  MultiplayerChessPage 
} from './BlogPages5';

export type BlogPageType = 
  | 'chess-training'
  | 'advanced-chess'
  | 'strategy-game'
  | 'interactive-chess'
  | '10x10-chess-board'
  | 'magical-wizards'
  | 'real-time-multiplayer'
  | 'ai-opponents'
  | 'adaptive-learning'
  | 'campaign-mode'
  | 'story-progression'
  | 'hint-system'
  | 'move-analysis'
  | 'live-tournaments'
  | 'chess-rankings'
  | 'cross-device-synchronization'
  | 'chess-gameplay'
  | 'online-chess-tools'
  | 'chess-mastery'
  | 'multiplayer-chess';

interface BlogRouterProps {
  currentPage: BlogPageType;
}

export function BlogRouter({ currentPage }: BlogRouterProps) {
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'chess-training':
        return <ChessTrainingPage />;
      case 'advanced-chess':
        return <AdvancedChessPage />;
      case 'strategy-game':
        return <StrategyGamePage />;
      case 'interactive-chess':
        return <InteractiveChessPage />;
      case '10x10-chess-board':
        return <TenByTenChessBoardPage />;
      case 'magical-wizards':
        return <MagicalWizardsPage />;
      case 'real-time-multiplayer':
        return <RealTimeMultiplayerPage />;
      case 'ai-opponents':
        return <AIOpponentsPage />;
      case 'adaptive-learning':
        return <AdaptiveLearningPage />;
      case 'campaign-mode':
        return <CampaignModePage />;
      case 'story-progression':
        return <StoryProgressionPage />;
      case 'hint-system':
        return <HintSystemPage />;
      case 'move-analysis':
        return <MoveAnalysisPage />;
      case 'live-tournaments':
        return <LiveTournamentsPage />;
      case 'chess-rankings':
        return <ChessRankingsPage />;
      case 'cross-device-synchronization':
        return <CrossDeviceSynchronizationPage />;
      case 'chess-gameplay':
        return <ChessGameplayPage />;
      case 'online-chess-tools':
        return <OnlineChessToolsPage />;
      case 'chess-mastery':
        return <ChessMasteryPage />;
      case 'multiplayer-chess':
        return <MultiplayerChessPage />;
      default:
        return <ChessTrainingPage />;
    }
  };

  return <>{renderCurrentPage()}</>;
}

// Export individual pages for external use
export {
  ChessTrainingPage,
  AdvancedChessPage,
  StrategyGamePage,
  InteractiveChessPage,
  TenByTenChessBoardPage,
  MagicalWizardsPage,
  RealTimeMultiplayerPage,
  AIOpponentsPage,
  AdaptiveLearningPage,
  CampaignModePage,
  StoryProgressionPage,
  HintSystemPage,
  MoveAnalysisPage,
  LiveTournamentsPage,
  ChessRankingsPage,
  CrossDeviceSynchronizationPage,
  ChessGameplayPage,
  OnlineChessToolsPage,
  ChessMasteryPage,
  MultiplayerChessPage
};