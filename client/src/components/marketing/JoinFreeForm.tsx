import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Mail, 
  User, 
  Lock, 
  Crown, 
  CheckCircle, 
  Star,
  Users,
  Trophy,
  Gift,
  Sparkles
} from 'lucide-react';
import { AdBanner } from '../monetization/AdBanner';

interface JoinFreeFormProps {
  onSubmit: (formData: { username: string; email: string; password: string; displayName: string }) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function JoinFreeForm({ onSubmit, onClose, isLoading = false }: JoinFreeFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    displayName: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with benefits */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">Join Free - Start Playing Now!</h2>
              <p className="text-green-100 text-lg">
                No credit card required • Instant access • 10,000+ active players
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-green-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap gap-4 mt-4">
            <Badge className="bg-white text-green-600 font-semibold">
              <Star className="w-4 h-4 mr-1" />
              4.9/5 Rating
            </Badge>
            <Badge className="bg-white text-green-600 font-semibold">
              <Users className="w-4 h-4 mr-1" />
              10K+ Players
            </Badge>
            <Badge className="bg-white text-green-600 font-semibold">
              <Trophy className="w-4 h-4 mr-1" />
              #1 Chess Game
            </Badge>
          </div>
        </div>

        <div className="p-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Registration Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Choose Username
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Display Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Your display name"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="w-4 h-4 inline mr-2" />
                      Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Create secure password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg py-4 rounded-lg font-bold transform hover:scale-105 transition-all"
                >
                  {isLoading ? (
                    'Creating Account...'
                  ) : (
                    <>
                      <Crown className="w-5 h-5 mr-2" />
                      Create Free Account - Start Playing!
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-600 text-center">
                  By joining, you agree to our Terms of Service and Privacy Policy.
                  Your email will never be shared or sold.
                </p>
              </form>
            </div>

            {/* Benefits & Features */}
            <div className="space-y-6">
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-800">
                    <Gift className="w-6 h-6 mr-2" />
                    What You Get Free:
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-green-700">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    Unlimited games against AI opponents
                  </div>
                  <div className="flex items-center text-green-700">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    Full access to tutorial and campaign mode
                  </div>
                  <div className="flex items-center text-green-700">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    Basic hint system and move suggestions
                  </div>
                  <div className="flex items-center text-green-700">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    Global leaderboards and achievements
                  </div>
                  <div className="flex items-center text-green-700">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    Cross-device game saves and progress
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-amber-800">
                    <Sparkles className="w-6 h-6 mr-2" />
                    Premium Upgrade Available:
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-amber-700">
                    <CheckCircle className="w-5 h-5 mr-3 text-amber-500" />
                    Unlimited hints and undo moves
                  </div>
                  <div className="flex items-center text-amber-700">
                    <CheckCircle className="w-5 h-5 mr-3 text-amber-500" />
                    Ad-free gaming experience
                  </div>
                  <div className="flex items-center text-amber-700">
                    <CheckCircle className="w-5 h-5 mr-3 text-amber-500" />
                    Cloud save and sync across devices
                  </div>
                  <div className="flex items-center text-amber-700">
                    <CheckCircle className="w-5 h-5 mr-3 text-amber-500" />
                    Priority customer support
                  </div>
                  
                  <div className="pt-2">
                    <Badge className="bg-amber-600 text-white">
                      Only $5/month • Cancel anytime
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Ad space */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <AdBanner containerId="join-form-sidebar" size="mediumRectangle" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              Join thousands of players already mastering wizard chess
            </p>
            <div className="flex justify-center gap-8 text-sm text-gray-500">
              <span>✓ Instant access</span>
              <span>✓ No credit card</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}