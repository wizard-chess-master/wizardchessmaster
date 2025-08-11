import React, { useState } from 'react';
import { EnhancedLandingPage } from './EnhancedLandingPage';
import { JoinFreeForm } from './JoinFreeForm';
import { ChessStrategyPage, AIChessTrainingPage, OnlineChessTournamentPage } from './SEOPages';
import { useAuth } from '../../lib/stores/useAuth';

interface MarketingRouterProps {
  currentPage: 'landing' | 'strategy' | 'ai-training' | 'tournaments';
  onNavigate: (page: string) => void;
  onStartGame: () => void;
}

export function MarketingRouter({ currentPage, onNavigate, onStartGame }: MarketingRouterProps) {
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { register } = useAuth();

  const handleJoinFree = () => {
    setShowJoinForm(true);
  };

  const handleRegisterSubmit = async (formData: { 
    username: string; 
    email: string; 
    password: string; 
    displayName: string 
  }) => {
    setIsRegistering(true);
    try {
      const success = await register(formData);
      
      if (success) {
        setShowJoinForm(false);
        onStartGame(); // Redirect to game after successful registration
      }
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'strategy':
        return <ChessStrategyPage />;
      case 'ai-training':
        return <AIChessTrainingPage />;
      case 'tournaments':
        return <OnlineChessTournamentPage />;
      default:
        return (
          <EnhancedLandingPage 
            onJoinFree={handleJoinFree}
            onPlayNow={onStartGame}
          />
        );
    }
  };

  return (
    <>
      {renderCurrentPage()}
      
      {showJoinForm && (
        <JoinFreeForm
          onSubmit={handleRegisterSubmit}
          onClose={() => setShowJoinForm(false)}
          isLoading={isRegistering}
        />
      )}
    </>
  );
}