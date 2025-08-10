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
            Wizard Chess Tournaments: Compete & Earn Legendary Rewards
          </h1>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full mb-4 border-2 border-amber-300">
                <span className="text-2xl mr-3">⏰</span>
                <span className="font-bold text-amber-900 text-lg">COMING SOON</span>
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4">
                <span className="text-2xl mr-2">🏆</span>
                <span className="font-bold text-purple-900">Safe Competition • No Cash Prizes • Pure Skill</span>
              </div>
              <p className="text-purple-800 leading-relaxed max-w-3xl mx-auto">
                We're building epic wizard chess tournaments where skill and strategy are the only currencies that matter. 
                Soon you'll earn prestigious titles, exclusive avatars, premium time, and legendary badges in our carefully 
                designed competition system that celebrates pure chess mastery.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-purple-900 mb-6 text-center">
              Tournament Categories
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white text-xl">🆓</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-green-800 text-xl">Free Tournaments</h3>
                    <p className="text-green-600 text-sm">Open to Everyone</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-green-700">
                    <span className="mr-3 text-lg">🎖️</span>
                    <span>Champion badges & achievements</span>
                  </div>
                  <div className="flex items-center text-green-700">
                    <span className="mr-3 text-lg">⏰</span>
                    <span>Premium time rewards (7-30 days)</span>
                  </div>
                  <div className="flex items-center text-green-700">
                    <span className="mr-3 text-lg">📅</span>
                    <span>Daily blitz & weekly championships</span>
                  </div>
                  <div className="flex items-center text-green-700">
                    <span className="mr-3 text-lg">🌟</span>
                    <span>Leaderboard recognition</span>
                  </div>
                  <div className="flex items-center text-green-700">
                    <span className="mr-3 text-lg">🔓</span>
                    <span>No registration barriers</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-green-100 rounded-lg border border-green-200">
                  <p className="text-green-800 font-medium text-center">
                    Perfect starting point for all skill levels!
                  </p>
                </div>
              </div>

              <div className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white text-xl">👑</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-800 text-xl">Premium Tournaments</h3>
                    <p className="text-amber-600 text-sm">Members Only</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-amber-700">
                    <span className="mr-3 text-lg">🎯</span>
                    <span>Exclusive championship events</span>
                  </div>
                  <div className="flex items-center text-amber-700">
                    <span className="mr-3 text-lg">🏅</span>
                    <span>Legendary titles & rare avatars</span>
                  </div>
                  <div className="flex items-center text-amber-700">
                    <span className="mr-3 text-lg">⚔️</span>
                    <span>Elite-level competition</span>
                  </div>
                  <div className="flex items-center text-amber-700">
                    <span className="mr-3 text-lg">💎</span>
                    <span>Unique cosmetic rewards</span>
                  </div>
                  <div className="flex items-center text-amber-700">
                    <span className="mr-3 text-lg">🔒</span>
                    <span>Premium membership required</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-amber-100 rounded-lg border border-amber-200">
                  <p className="text-amber-800 font-medium text-center">
                    Elite competition with prestigious rewards!
                  </p>
                </div>
              </div>
            </div>

            <AdBanner containerId="tournament-content-banner" size="banner" />

            <h2 className="text-2xl font-bold text-purple-900 mb-6 mt-8 text-center">
              🔥 Active Tournaments This Week
            </h2>

            <div className="space-y-6">
              {/* Featured Tournament */}
              <div className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white text-2xl">👑</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-purple-900">Weekly Grand Championship</h3>
                      <p className="text-purple-700">Open to all • 412/1000 participants</p>
                      <div className="flex items-center mt-1">
                        <span className="text-yellow-500 text-sm">⭐⭐⭐⭐⭐</span>
                        <span className="text-purple-600 text-sm ml-2">Most Popular</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                      FREE ENTRY
                    </span>
                    <p className="text-purple-600 text-sm mt-1">Ends in 4 days</p>
                  </div>
                </div>
                
                <p className="text-purple-800 mb-4 leading-relaxed">
                  Our flagship tournament where legends are born! Compete for the most prestigious rewards 
                  and cement your place in Wizard Chess history.
                </p>
                
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-2xl mb-1">🥇</div>
                    <div className="font-bold text-yellow-800">1st Place</div>
                    <div className="text-sm text-yellow-700">30 Days Premium + "Grand Master" Title + Legendary Crown Avatar</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="text-2xl mb-1">🥈</div>
                    <div className="font-bold text-gray-800">2nd Place</div>
                    <div className="text-sm text-gray-700">14 Days Premium + "Chess Sage" Title + Royal Robes Avatar</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="text-2xl mb-1">🥉</div>
                    <div className="font-bold text-orange-800">3rd Place</div>
                    <div className="text-sm text-orange-700">7 Days Premium + "Knight Champion" Title + Noble Badge</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-purple-600">
                    <span className="font-medium">Plus:</span> Top 10 get exclusive tournament badges • All participants earn XP
                  </div>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2">
                    Join Championship
                  </Button>
                </div>
              </div>

              {/* Daily Blitz */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white">⚡</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-900">Daily Speed Blitz</h3>
                      <p className="text-blue-700 text-sm">5-minute games • 89/150 players</p>
                    </div>
                  </div>
                  <p className="text-blue-800 text-sm mb-3">
                    Fast-paced action for quick thinkers. New tournament every day!
                  </p>
                  <div className="text-xs text-blue-600 mb-3">
                    🏆 Winner gets "Speed Demon" badge + 3 days premium
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                    Join Blitz
                  </Button>
                </div>

                <div className="border border-amber-200 bg-amber-50 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white">🔒</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-amber-900">Premium Elite League</h3>
                      <p className="text-amber-700 text-sm">Members only • 24/50 players</p>
                    </div>
                  </div>
                  <p className="text-amber-800 text-sm mb-3">
                    Exclusive high-skill competition with the most prestigious rewards.
                  </p>
                  <div className="text-xs text-amber-600 mb-3">
                    🏆 Winner gets "Elite Champion" title + rare golden avatar
                  </div>
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white w-full">
                    Requires Premium
                  </Button>
                </div>
              </div>
            </div>

            {/* Tournament Benefits & CTA */}
            <div className="mt-8 p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl shadow-lg">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-purple-900 mb-3">
                  🎯 Why Choose Our Tournament System?
                </h3>
                <p className="text-purple-700 leading-relaxed max-w-2xl mx-auto">
                  Experience the purest form of chess competition. No gambling, no unfair advantages - 
                  just skill, strategy, and legendary rewards that celebrate your mastery.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-white rounded-lg border border-purple-100">
                  <div className="text-3xl mb-2">🛡️</div>
                  <h4 className="font-bold text-purple-900 mb-2">Fair Play Guaranteed</h4>
                  <p className="text-purple-700 text-sm">Advanced anti-cheat systems ensure every match is decided by pure skill</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-purple-100">
                  <div className="text-3xl mb-2">🎨</div>
                  <h4 className="font-bold text-purple-900 mb-2">Exclusive Rewards</h4>
                  <p className="text-purple-700 text-sm">Unique titles, avatars, and badges you can't get anywhere else</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-purple-100">
                  <div className="text-3xl mb-2">🌟</div>
                  <h4 className="font-bold text-purple-900 mb-2">Skill Progression</h4>
                  <p className="text-purple-700 text-sm">Tournament play is the fastest way to improve your chess rating</p>
                </div>
              </div>

              <div className="text-center">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg">
                    Join Free Tournaments
                  </Button>
                  <Button variant="outline" className="border-2 border-purple-500 text-purple-700 hover:bg-purple-50 px-8 py-3 text-lg">
                    Unlock Premium Events
                  </Button>
                </div>
                <p className="text-purple-600 text-sm mt-4">
                  Start competing today • No credit card required • Instant access
                </p>
              </div>
            </div>

            {/* Tournament Schedule */}
            <div className="mt-8 bg-white border border-purple-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-purple-900 mb-4 text-center">
                📅 Weekly Tournament Schedule
              </h3>
              <div className="grid md:grid-cols-7 gap-2 text-sm">
                <div className="text-center p-3 bg-red-50 border border-red-200 rounded">
                  <div className="font-bold text-red-800">Monday</div>
                  <div className="text-red-700">Speed Blitz</div>
                  <div className="text-xs text-red-600">5pm UTC</div>
                </div>
                <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="font-bold text-blue-800">Tuesday</div>
                  <div className="text-blue-700">Beginner Cup</div>
                  <div className="text-xs text-blue-600">6pm UTC</div>
                </div>
                <div className="text-center p-3 bg-green-50 border border-green-200 rounded">
                  <div className="font-bold text-green-800">Wednesday</div>
                  <div className="text-green-700">Standard Play</div>
                  <div className="text-xs text-green-600">7pm UTC</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="font-bold text-yellow-800">Thursday</div>
                  <div className="text-yellow-700">Rapid Round</div>
                  <div className="text-xs text-yellow-600">8pm UTC</div>
                </div>
                <div className="text-center p-3 bg-purple-50 border border-purple-200 rounded">
                  <div className="font-bold text-purple-800">Friday</div>
                  <div className="text-purple-700">Weekend Prep</div>
                  <div className="text-xs text-purple-600">5pm UTC</div>
                </div>
                <div className="text-center p-3 bg-pink-50 border border-pink-200 rounded">
                  <div className="font-bold text-pink-800">Saturday</div>
                  <div className="text-pink-700">Grand Champ</div>
                  <div className="text-xs text-pink-600">2pm UTC</div>
                </div>
                <div className="text-center p-3 bg-amber-50 border border-amber-200 rounded">
                  <div className="font-bold text-amber-800">Sunday</div>
                  <div className="text-amber-700">Premium Elite</div>
                  <div className="text-xs text-amber-600">3pm UTC</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}