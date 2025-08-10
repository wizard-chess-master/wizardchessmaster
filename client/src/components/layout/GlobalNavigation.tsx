import React from 'react';
import { Button } from '../ui/button';
import { 
  Home, 
  BookOpen, 
  Brain, 
  Trophy, 
  Newspaper,
  Crown,
  Play
} from 'lucide-react';
import { AdBanner } from '../monetization/AdBanner';

interface GlobalNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onStartGame: () => void;
}

export function GlobalNavigation({ currentPage, onNavigate, onStartGame }: GlobalNavigationProps) {
  const navItems = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'multiplayer', label: 'Play Online', icon: Play },
    { id: 'strategy', label: 'Strategy', icon: BookOpen },
    { id: 'ai-training', label: 'AI Training', icon: Brain },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'blog', label: 'Blog', icon: Newspaper },
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="bg-gradient-to-r from-amber-900 to-amber-800 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            {/* Logo/Brand */}
            <div 
              className="flex items-center gap-2 cursor-pointer hover:text-amber-200 transition-colors"
              onClick={() => onNavigate('landing')}
            >
              <Crown className="w-6 h-6" />
              <h1 className="text-xl font-bold">Wizard Chess Master</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      currentPage === item.id 
                        ? 'bg-amber-700 text-white' 
                        : 'hover:bg-amber-700 hover:text-amber-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
              
              <Button 
                onClick={onStartGame}
                className="bg-green-600 hover:bg-green-700 text-white ml-4"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Game
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button 
                onClick={onStartGame}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Play
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-3">
            <div className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                      currentPage === item.id 
                        ? 'bg-amber-700 text-white' 
                        : 'hover:bg-amber-700 hover:text-amber-100'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Header Ad Banner */}
      <div className="bg-amber-50 border-b border-amber-200">
        <AdBanner containerId="global-header-banner" size="leaderboard" />
      </div>
    </>
  );
}