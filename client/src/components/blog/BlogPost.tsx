import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Calendar, 
  Clock, 
  User, 
  Share2, 
  BookOpen,
  ArrowLeft,
  Tag
} from 'lucide-react';
import { AdBanner } from '../monetization/AdBanner';

interface BlogPostProps {
  onBack: () => void;
}

export function BlogPost({ onBack }: BlogPostProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Game
            </Button>
            <h1 className="text-2xl font-bold text-amber-900">Chess Strategy Blog</h1>
          </div>
        </div>
        <AdBanner containerId="blog-header-banner" size="leaderboard" />
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <article className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-blue-100 text-blue-800">Chess Strategy</Badge>
                  <Badge className="bg-green-100 text-green-800">AI Training</Badge>
                  <Badge className="bg-purple-100 text-purple-800">Wizard Chess</Badge>
                </div>

                <h1 className="text-4xl font-bold text-amber-900 mb-4">
                  Advanced Chess Opening Strategies for Wizard Chess Masters
                </h1>

                <div className="flex items-center gap-6 text-sm text-amber-700 border-b border-amber-200 pb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>January 10, 2025</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>12 min read</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Chess Master AI Team</span>
                  </div>
                </div>
              </div>

              <AdBanner containerId="blog-content-top" size="banner" />

              <div className="prose max-w-none mt-8 text-amber-800 leading-relaxed">
                <p className="text-lg mb-6">
                  Mastering chess openings is the foundation of strategic excellence, and in the expanded world 
                  of wizard chess, these principles become even more critical. Whether you're battling our 
                  advanced AI opponents or competing against human players, understanding opening theory will 
                  dramatically improve your performance.
                </p>

                <h2 className="text-2xl font-bold text-amber-900 mb-4">
                  Essential Opening Principles in Wizard Chess
                </h2>

                <p className="mb-6">
                  The 10x10 board of wizard chess introduces new strategic dimensions while maintaining 
                  classical chess principles. Here are the core concepts every aspiring wizard chess 
                  master must understand:
                </p>

                <h3 className="text-xl font-bold text-amber-900 mb-3">
                  1. Control the Expanded Center
                </h3>
                <p className="mb-6">
                  In traditional chess, controlling the center squares (e4, e5, d4, d5) is crucial. 
                  In wizard chess, the expanded center includes additional key squares (e5, f5, e6, f6) 
                  that provide strategic advantages for piece development and wizard positioning.
                </p>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-6 mb-6">
                  <h4 className="font-bold text-amber-900 mb-2">Pro Tip:</h4>
                  <p className="text-amber-800">
                    Place pawns on e4 and f5 early to create a powerful pawn chain that supports 
                    both traditional pieces and magical wizard positioning.
                  </p>
                </div>

                <AdBanner containerId="blog-content-middle" size="banner" />

                <h3 className="text-xl font-bold text-amber-900 mb-3 mt-8">
                  2. Wizard Piece Integration
                </h3>
                <p className="mb-6">
                  The unique wizard pieces in corners require special consideration during opening play. 
                  Unlike traditional pieces, wizards can teleport and attack at range, making early 
                  wizard development a game-changing strategy.
                </p>

                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li>Develop wizards to central squares by move 6-8 for maximum board control</li>
                  <li>Use wizard teleportation to bypass pawn chains and threaten opponent pieces</li>
                  <li>Position wizards to support traditional piece attacks with ranged magic</li>
                  <li>Consider wizard sacrifices for powerful positional advantages</li>
                </ul>

                <h3 className="text-xl font-bold text-amber-900 mb-3">
                  3. Extended Castling Considerations
                </h3>
                <p className="mb-6">
                  The modified castling rules in wizard chess (king moves 3 squares, rook moves adjacent) 
                  create new tactical opportunities and defensive formations that don't exist in traditional chess.
                </p>

                <h2 className="text-2xl font-bold text-amber-900 mb-4 mt-8">
                  Popular Wizard Chess Openings
                </h2>

                <h3 className="text-xl font-bold text-amber-900 mb-3">
                  The Mystical Defense
                </h3>
                <p className="mb-6">
                  Starting with 1.e4 e6 2.Nf3 d5, this opening prioritizes early wizard development 
                  while maintaining solid pawn structure. It's particularly effective against aggressive 
                  AI opponents who favor rapid attacks.
                </p>

                <h3 className="text-xl font-bold text-amber-900 mb-3">
                  The Arcane Gambit
                </h3>
                <p className="mb-6">
                  A more aggressive approach with 1.f4 f5 2.Wizard-e3, offering a pawn for rapid 
                  piece development and wizard activation. This opening scores well in our AI training 
                  database with a 68% win rate for experienced players.
                </p>

                <AdBanner containerId="blog-content-bottom" size="banner" />

                <h2 className="text-2xl font-bold text-amber-900 mb-4 mt-8">
                  Training With AI Opponents
                </h2>
                <p className="mb-6">
                  Our advanced AI training system provides the perfect environment to practice these 
                  opening strategies. The AI adapts to your playing style, gradually increasing difficulty 
                  as you master each opening pattern.
                </p>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-8">
                  <h3 className="text-xl font-bold text-green-800 mb-3">
                    Ready to Master These Openings?
                  </h3>
                  <p className="text-green-700 mb-4">
                    Practice these advanced wizard chess openings against our intelligent AI opponents. 
                    Start with beginner-friendly difficulty and work your way up to grandmaster level.
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Start Training Now
                  </Button>
                </div>
              </div>
            </article>

            {/* Related Articles */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <Card className="border-amber-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-amber-900">Chess Endgame Tactics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-800 text-sm mb-3">
                    Master advanced endgame techniques specific to wizard chess, including 
                    magical piece coordination and extended board control.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-amber-600">
                    <Clock className="w-3 h-3" />
                    <span>8 min read</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-amber-900">AI Training Strategies</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-800 text-sm mb-3">
                    Optimize your training sessions with our AI opponents to rapidly improve 
                    your tactical awareness and strategic thinking.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-amber-600">
                    <Clock className="w-3 h-3" />
                    <span>10 min read</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              <AdBanner containerId="blog-sidebar-top" size="mediumRectangle" />
              
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900">Popular Articles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a href="#" className="block text-amber-700 hover:text-amber-900 transition-colors text-sm">
                    → Complete Wizard Chess Rules Guide
                  </a>
                  <a href="#" className="block text-amber-700 hover:text-amber-900 transition-colors text-sm">
                    → Top 10 Chess Tactics for Beginners
                  </a>
                  <a href="#" className="block text-amber-700 hover:text-amber-900 transition-colors text-sm">
                    → Advanced AI Training Techniques
                  </a>
                  <a href="#" className="block text-amber-700 hover:text-amber-900 transition-colors text-sm">
                    → Mastering Wizard Teleportation
                  </a>
                  <a href="#" className="block text-amber-700 hover:text-amber-900 transition-colors text-sm">
                    → Tournament Preparation Guide
                  </a>
                </CardContent>
              </Card>

              <AdBanner containerId="blog-sidebar-bottom" size="mediumRectangle" />

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-900">Join Our Community</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-800 text-sm mb-4">
                    Get weekly chess strategy tips, tournament updates, and exclusive content 
                    delivered to your inbox.
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm">
                    Subscribe Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Ad */}
      <div className="mt-16 border-t border-amber-200 pt-8">
        <AdBanner containerId="blog-footer-banner" size="leaderboard" />
      </div>
    </div>
  );
}