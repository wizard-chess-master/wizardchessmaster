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
  Play
} from 'lucide-react';
import { AdBanner } from '../monetization/AdBanner';

interface LandingPageProps {
  onJoinFree: () => void;
  onPlayNow: () => void;
}

export function LandingPage({ onJoinFree, onPlayNow }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      {/* Header Banner Ad */}
      <div className="w-full py-2 bg-amber-100 border-b border-amber-200">
        <AdBanner containerId="header-banner" size="leaderboard" />
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <Crown className="w-16 h-16 text-amber-600" />
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
              onClick={onJoinFree}
              size="lg" 
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg px-8 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all"
            >
              <Users className="w-5 h-5 mr-2" />
              Join Free - No Credit Card Required
            </Button>
            
            <Button 
              onClick={onPlayNow}
              variant="outline" 
              size="lg"
              className="border-2 border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white text-lg px-8 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all"
            >
              <Play className="w-5 h-5 mr-2" />
              Play Demo Now
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-amber-700">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">4.9/5 Player Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">10,000+ Active Players</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="font-semibold">#1 Wizard Chess Game</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sidebar Ad */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 hidden lg:block">
        <AdBanner containerId="sidebar-banner" size="skyscraper" />
      </div>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-amber-900 mb-4">
            Why Choose Wizard Chess Master?
          </h2>
          <p className="text-center text-amber-700 mb-12 text-lg max-w-2xl mx-auto">
            The most advanced wizard chess platform with AI that learns from your gameplay
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 border-amber-200 hover:border-amber-400 transition-colors shadow-lg hover:shadow-xl">
              <CardHeader className="text-center">
                <Brain className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <CardTitle className="text-amber-900">Advanced AI Opponents</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-800 text-center leading-relaxed">
                  Challenge intelligent AI that adapts to your playing style. From beginner-friendly 
                  to grandmaster level difficulty with neural network learning.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-200 hover:border-amber-400 transition-colors shadow-lg hover:shadow-xl">
              <CardHeader className="text-center">
                <Zap className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <CardTitle className="text-amber-900">Magical Wizard Powers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-800 text-center leading-relaxed">
                  Unique 10x10 board with powerful wizard pieces that can teleport, cast spells, 
                  and execute magical moves traditional chess never imagined.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-200 hover:border-amber-400 transition-colors shadow-lg hover:shadow-xl">
              <CardHeader className="text-center">
                <Crown className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
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

      {/* Testimonials Section */}
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
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    M
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
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    S
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
                  "The medieval fantasy theme is incredible. Best chess variant 
                  I've ever played. The graphics and sound effects are amazing!"
                </p>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    A
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900">Alex R.</p>
                    <p className="text-sm text-amber-700">Gaming Streamer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-amber-600 to-yellow-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Become a Wizard Chess Master?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of players already mastering the art of wizard chess. 
            Start your magical journey today - completely free!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Button removed - direct game access via navigation menu */}
          </div>

          <p className="mt-6 text-sm opacity-75">
            No credit card required • Instant access • Cancel anytime
          </p>
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