import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Crown, 
  Brain, 
  Zap, 
  Star, 
  Users, 
  Trophy, 
  Gamepad2,
  ArrowRight,
  CheckCircle,
  Play,
  Shield,
  Target,
  Sparkles
} from 'lucide-react';
import { AdBanner } from '../monetization/AdBanner';

interface EnhancedLandingPageProps {
  onJoinFree: () => void;
  onPlayNow: () => void;
}

export function EnhancedLandingPage({ onJoinFree, onPlayNow }: EnhancedLandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      {/* Header Banner Ad */}
      <div className="w-full py-2 bg-amber-100 border-b border-amber-200">
        <AdBanner containerId="header-banner" size="leaderboard" />
      </div>

      {/* Hero Section with Background Image Container */}
      <section className="relative container mx-auto px-4 py-16 text-center overflow-hidden">
        {/* Hero Background Image Container - Ready for 1920x1080 WebP */}
        <div className="absolute inset-0 -z-10">
          <div className="w-full h-full bg-gradient-to-br from-amber-900/20 via-purple-900/20 to-amber-800/20 flex items-center justify-center">
            <div className="text-amber-600/20 text-6xl font-bold">
              Hero Background Ready
              <br />
              1920x1080 WebP
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Logo Container - Ready for 512x512 SVG/PNG */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-amber-200/50 rounded-full flex items-center justify-center border-4 border-amber-300/50">
              <Crown className="w-16 h-16 text-amber-600" />
              <div className="absolute -bottom-2 text-xs text-amber-600/70 whitespace-nowrap">
                Logo: 512x512 SVG
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-amber-900 mb-6 leading-tight">
            Master the Art of
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-amber-600">
              Wizard Chess
            </span>
          </h1>
          
          <p className="text-xl text-amber-800 mb-8 max-w-3xl mx-auto leading-relaxed">
            Experience the ultimate 10x10 chess adventure with magical wizards, intelligent AI opponents, 
            and medieval fantasy gameplay. Join thousands of players mastering strategic wizard battles.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={(e) => {
                console.log('🆓 Join Free button clicked on enhanced landing page');
                e.preventDefault();
                onJoinFree();
              }}
              size="lg" 
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg px-8 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all"
            >
              <Users className="w-5 h-5 mr-2" />
              Join Free - No Credit Card Required
            </Button>
            
            <Button 
              onClick={(e) => {
                console.log('🎮 Play Demo Now button clicked on enhanced landing page');
                e.preventDefault();
                onPlayNow();
              }}
              variant="outline" 
              size="lg"
              className="border-2 border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white text-lg px-8 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all"
            >
              <Play className="w-5 h-5 mr-2" />
              Play Demo Now
            </Button>
          </div>

          {/* Game Preview Container - Ready for 800x800 Chess Board Screenshot */}
          <div className="relative max-w-2xl mx-auto">
            <div className="aspect-square bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl border-4 border-amber-300/50 shadow-2xl flex items-center justify-center">
              <div className="text-center text-amber-600/70">
                <Gamepad2 className="w-16 h-16 mx-auto mb-4" />
                <div className="text-lg font-semibold">Game Preview</div>
                <div className="text-sm">800x800 Chess Board</div>
              </div>
            </div>
            {/* Floating UI Elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg">
              <Crown className="w-6 h-6 text-amber-600" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-3 shadow-lg">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Screenshot Containers */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-amber-900 mb-4">
            Why Choose Wizard Chess Master?
          </h2>
          <p className="text-center text-amber-700 mb-12 text-lg max-w-2xl mx-auto">
            The most advanced wizard chess platform with AI that learns from your gameplay
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 with Image Container */}
            <Card className="border-2 border-amber-200 hover:border-amber-400 transition-colors shadow-lg hover:shadow-xl overflow-hidden">
              {/* Feature Screenshot Container - Ready for 400x300 WebP */}
              <div className="h-48 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                <div className="text-center text-purple-600/70">
                  <Brain className="w-12 h-12 mx-auto mb-2" />
                  <div className="text-sm">AI Demo Screenshot</div>
                  <div className="text-xs">400x300 WebP</div>
                </div>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-amber-900">Advanced AI Opponents</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-800 text-center leading-relaxed">
                  Challenge intelligent AI that adapts to your playing style. From beginner-friendly 
                  to grandmaster level difficulty with neural network learning.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 with Image Container */}
            <Card className="border-2 border-amber-200 hover:border-amber-400 transition-colors shadow-lg hover:shadow-xl overflow-hidden">
              {/* Feature Screenshot Container - Ready for 400x300 WebP */}
              <div className="h-48 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                <div className="text-center text-amber-600/70">
                  <Zap className="w-12 h-12 mx-auto mb-2" />
                  <div className="text-sm">Wizard Powers Demo</div>
                  <div className="text-xs">400x300 WebP</div>
                </div>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-amber-900">Magical Wizard Powers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-800 text-center leading-relaxed">
                  Unique 10x10 board with powerful wizard pieces that can teleport, cast spells, 
                  and execute magical moves traditional chess never imagined.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 with Image Container */}
            <Card className="border-2 border-amber-200 hover:border-amber-400 transition-colors shadow-lg hover:shadow-xl overflow-hidden">
              {/* Feature Screenshot Container - Ready for 400x300 WebP */}
              <div className="h-48 bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                <div className="text-center text-yellow-600/70">
                  <Crown className="w-12 h-12 mx-auto mb-2" />
                  <div className="text-sm">Campaign Screenshot</div>
                  <div className="text-xs">400x300 WebP</div>
                </div>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-amber-900">Campaign & Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-800 text-center leading-relaxed">
                  Progress through 12 challenging campaign levels, unlock achievements, 
                  and climb global leaderboards in this immersive medieval fantasy world.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Middle Banner Ad */}
          <div className="mt-16 flex justify-center">
            <AdBanner containerId="middle-content-banner" size="banner" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gradient-to-br from-amber-50 to-yellow-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-amber-900 mb-12">
            Master Wizard Chess in 3 Easy Steps
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-amber-900 mb-4">Create Free Account</h3>
              <p className="text-amber-800">
                Sign up instantly with email. No credit card required. 
                Start playing immediately with full access to tutorial mode.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-amber-900 mb-4">Learn Wizard Moves</h3>
              <p className="text-amber-800">
                Master unique wizard abilities like teleportation and spell casting. 
                Our AI mentor guides you through magical chess strategies.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-amber-900 mb-4">Challenge AI & Players</h3>
              <p className="text-amber-800">
                Battle progressively challenging AI opponents or compete against 
                real players in ranked matches and tournaments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Player Showcase Section with Avatar Containers */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-amber-900 mb-12">
            What Players Are Saying
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border border-amber-200 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-amber-800 mb-4 italic">
                  "Amazing twist on chess! The wizard pieces add so much strategy. 
                  The AI actually learns how I play and gets better over time."
                </p>
                <div className="flex items-center">
                  {/* Avatar Container - Ready for 64x64 player photos */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3 relative">
                    M
                    <div className="absolute -bottom-6 text-xs text-gray-500 whitespace-nowrap">
                      64x64 Avatar
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900">Magnus K.</p>
                    <p className="text-sm text-amber-700">Chess Enthusiast</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-amber-200 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-amber-800 mb-4 italic">
                  "Perfect for improving strategic thinking. The campaign mode 
                  teaches advanced tactics I never learned in regular chess."
                </p>
                <div className="flex items-center">
                  {/* Avatar Container - Ready for 64x64 player photos */}
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold mr-3 relative">
                    S
                    <div className="absolute -bottom-6 text-xs text-gray-500 whitespace-nowrap">
                      64x64 Avatar
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900">Sarah L.</p>
                    <p className="text-sm text-amber-700">Tournament Player</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-amber-200 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-amber-800 mb-4 italic">
                  "The multiplayer tournaments are incredible! Finally found a chess 
                  variant that keeps me coming back for more challenges."
                </p>
                <div className="flex items-center">
                  {/* Avatar Container - Ready for 64x64 player photos */}
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3 relative">
                    A
                    <div className="absolute -bottom-6 text-xs text-gray-500 whitespace-nowrap">
                      64x64 Avatar
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900">Alex M.</p>
                    <p className="text-sm text-amber-700">Competitive Gamer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Showcase Section */}
      <section className="py-16 bg-gradient-to-r from-amber-600 to-yellow-600 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Join the Wizard Chess Community
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-5xl font-bold mb-2">10K+</div>
              <div className="text-xl opacity-90">Active Players</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50K+</div>
              <div className="text-xl opacity-90">Games Played</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">98%</div>
              <div className="text-xl opacity-90">Player Satisfaction</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="text-xl opacity-90">Online Tournaments</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-gradient-to-br from-purple-900 via-amber-800 to-purple-900 text-white relative overflow-hidden">
        {/* CTA Background Image Container - Ready for 1920x600 WebP */}
        <div className="absolute inset-0 bg-black/40">
          <div className="w-full h-full flex items-center justify-center text-white/20 text-4xl font-bold">
            CTA Background Ready
            <br />
            1920x600 WebP
          </div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Become a Wizard Chess Master?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of players already mastering the art of wizard chess. 
            Start your magical journey today - completely free!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              onClick={(e) => {
                console.log('🆓 Final CTA Join Free button clicked');
                e.preventDefault();
                onJoinFree();
              }}
              size="lg" 
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xl px-10 py-5 rounded-xl shadow-lg transform hover:scale-105 transition-all"
            >
              <Users className="w-6 h-6 mr-2" />
              Start Playing Free Now
            </Button>
            
            <Button 
              onClick={(e) => {
                console.log('🎮 Final CTA Play Demo button clicked');
                e.preventDefault();
                onPlayNow();
              }}
              variant="outline" 
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-purple-900 text-xl px-10 py-5 rounded-xl shadow-lg transform hover:scale-105 transition-all"
            >
              <Play className="w-6 h-6 mr-2" />
              Try Demo First
            </Button>
          </div>

          <div className="flex justify-center space-x-8 text-sm opacity-75">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              No Credit Card Required
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Instant Access
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Cancel Anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer Banner Ad */}
      <div className="w-full py-4 bg-amber-100 border-t border-amber-200">
        <AdBanner containerId="footer-banner" size="leaderboard" />
      </div>

      {/* Bottom Mobile Ad */}
      <div className="block md:hidden w-full sticky bottom-0 bg-white border-t border-gray-200 z-50">
        <AdBanner containerId="mobile-bottom-banner" size="mobileBanner" />
      </div>
    </div>
  );
}