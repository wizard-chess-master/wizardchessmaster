import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Brain, 
  Crown, 
  Zap, 
  Target, 
  BookOpen, 
  Trophy,
  ArrowRight,
  CheckCircle,
  Star,
  Users
} from 'lucide-react';
import { AdBanner } from '../monetization/AdBanner';

// Chess Strategy Guide Page
export function ChessStrategyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-amber-900">Chess Strategy Guide</h1>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              Play Now
            </Button>
          </div>
        </div>
        <AdBanner containerId="strategy-header-banner" size="leaderboard" />
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <article className="bg-white rounded-lg shadow-lg p-8">
              <h1 className="text-4xl font-bold text-amber-900 mb-6">
                Master Chess Strategy: Complete Guide for 2025
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-amber-700 mb-8">
                <span>Last updated: January 2025</span>
                <span>•</span>
                <span>15 min read</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>4.9/5 (2,847 votes)</span>
                </div>
              </div>

              <AdBanner containerId="strategy-content-top" size="banner" />

              <div className="prose max-w-none mt-8">
                <h2 className="text-2xl font-bold text-amber-900 mb-4">
                  Essential Chess Opening Strategies
                </h2>
                <p className="text-amber-800 mb-6 leading-relaxed">
                  Mastering chess openings is crucial for gaining early game advantage. Whether you're playing 
                  traditional 8x8 chess or the advanced 10x10 wizard chess variant, understanding fundamental 
                  opening principles will dramatically improve your game performance and win rate.
                </p>

                <h3 className="text-xl font-bold text-amber-900 mb-3">
                  Top 5 Chess Opening Principles
                </h3>
                <ul className="list-disc pl-6 text-amber-800 mb-6 space-y-2">
                  <li>Control the center squares (e4, e5, d4, d5) with pawns and pieces</li>
                  <li>Develop knights before bishops for maximum flexibility</li>
                  <li>Castle early to protect your king and activate your rook</li>
                  <li>Avoid moving the same piece twice without good reason</li>
                  <li>Connect your rooks for powerful endgame potential</li>
                </ul>

                <AdBanner containerId="strategy-content-middle" size="banner" />

                <h2 className="text-2xl font-bold text-amber-900 mb-4 mt-8">
                  Advanced Wizard Chess Tactics
                </h2>
                <p className="text-amber-800 mb-6 leading-relaxed">
                  Wizard chess introduces magical elements that revolutionize traditional chess strategy. 
                  The wizard piece can teleport across the board, cast protective spells, and execute 
                  powerful magical attacks that bypass normal piece limitations.
                </p>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-6 mb-6">
                  <h4 className="font-bold text-amber-900 mb-2">Pro Tip:</h4>
                  <p className="text-amber-800">
                    In wizard chess, controlling magical energy squares (marked with glowing runes) 
                    amplifies your wizard's power by 50%. Always prioritize these squares in your opening strategy.
                  </p>
                </div>

                <h2 className="text-2xl font-bold text-amber-900 mb-4">
                  Chess Endgame Mastery
                </h2>
                <p className="text-amber-800 mb-6 leading-relaxed">
                  Endgame proficiency separates amateur players from chess masters. Understanding key 
                  endgame patterns, king and pawn endings, and tactical motifs will help you convert 
                  winning positions and save difficult games.
                </p>
              </div>

              <AdBanner containerId="strategy-content-bottom" size="banner" />

              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <h3 className="text-xl font-bold text-green-800 mb-3">
                  Practice These Strategies in Wizard Chess Master
                </h3>
                <p className="text-green-700 mb-4">
                  Apply these proven chess strategies in our advanced AI training system. 
                  Our intelligent opponents adapt to your skill level and help you master these techniques.
                </p>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Crown className="w-4 h-4 mr-2" />
                  Start Training Now
                </Button>
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              <AdBanner containerId="strategy-sidebar-top" size="mediumRectangle" />
              
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900">Related Guides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a href="#" className="block text-amber-700 hover:text-amber-900 transition-colors">
                    → Chess Tactics for Beginners
                  </a>
                  <a href="#" className="block text-amber-700 hover:text-amber-900 transition-colors">
                    → Advanced Wizard Powers Guide
                  </a>
                  <a href="#" className="block text-amber-700 hover:text-amber-900 transition-colors">
                    → Tournament Preparation Tips
                  </a>
                </CardContent>
              </Card>

              <AdBanner containerId="strategy-sidebar-bottom" size="mediumRectangle" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// AI Chess Training Page
export function AIChessTrainingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white shadow-sm border-b border-blue-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-900">AI Chess Training</h1>
        </div>
        <AdBanner containerId="ai-header-banner" size="leaderboard" />
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-blue-900 mb-6">
            AI Chess Training: Improve Your Game with Machine Learning
          </h1>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              Revolutionary AI Training System
            </h2>
            <p className="text-blue-800 mb-6 leading-relaxed">
              Our advanced AI chess training system uses neural networks and machine learning 
              to provide personalized coaching that adapts to your unique playing style. 
              Unlike static chess puzzles, our AI learns from every move you make.
            </p>

            <AdBanner containerId="ai-content-banner" size="banner" />

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <Card className="border-blue-200">
                <CardHeader>
                  <Brain className="w-8 h-8 text-blue-600 mb-2" />
                  <CardTitle className="text-blue-900">Adaptive Difficulty</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-800">
                    AI automatically adjusts difficulty based on your performance, 
                    ensuring optimal learning progression without frustration.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader>
                  <Target className="w-8 h-8 text-blue-600 mb-2" />
                  <CardTitle className="text-blue-900">Weakness Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-800">
                    Advanced pattern recognition identifies your strategic weaknesses 
                    and creates custom training scenarios to improve those areas.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <AdBanner containerId="ai-bottom-banner" size="leaderboard" />
        </div>
      </div>
    </div>
  );
}

// Online Chess Tournament Page
export function OnlineChessTournamentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <header className="bg-white shadow-sm border-b border-purple-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-purple-900">Chess Tournaments</h1>
        </div>
        <AdBanner containerId="tournament-header-banner" size="leaderboard" />
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-purple-900 mb-6">
            Online Chess Tournaments: Compete and Win Prizes
          </h1>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-purple-900 mb-4">
              Weekly Wizard Chess Championships
            </h2>
            <p className="text-purple-800 mb-6 leading-relaxed">
              Join competitive online chess tournaments featuring both traditional and wizard chess variants. 
              Compete against players worldwide, climb the rankings, and win exciting prizes in our 
              structured tournament system.
            </p>

            <AdBanner containerId="tournament-content-banner" size="banner" />

            <div className="mt-8 space-y-6">
              <div className="border border-purple-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-purple-900 mb-3">Current Tournament</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-purple-800">Grand Wizard Championship</p>
                    <p className="text-purple-700">Prize Pool: $500 • 156 Players Registered</p>
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    Join Tournament
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}