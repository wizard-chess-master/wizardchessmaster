import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Crown, Users, Star, Clock, Gift, Sparkles, Trophy, CheckCircle } from 'lucide-react';
import { FounderPromotion } from './FounderPromotion';
import { JoinFreeForm } from './JoinFreeForm';

export function FounderLandingPage() {
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [spotsRemaining, setSpotsRemaining] = useState<number>(850);
  const [urgencyLevel, setUrgencyLevel] = useState<'high' | 'medium' | 'low'>('medium');

  useEffect(() => {
    // Fetch current founder status
    const fetchFounderStatus = async () => {
      try {
        const response = await fetch('/api/founder/status');
        if (response.ok) {
          const data = await response.json();
          const remaining = 1000 - data.currentCount;
          setSpotsRemaining(remaining);
          
          // Set urgency based on spots remaining
          if (remaining < 100) setUrgencyLevel('high');
          else if (remaining < 300) setUrgencyLevel('medium');
          else setUrgencyLevel('low');
        }
      } catch (error) {
        console.error('Failed to fetch founder status:', error);
      }
    };

    fetchFounderStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchFounderStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinClick = () => {
    setShowJoinForm(true);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      
      const result = await response.json();
      if (result.success) {
        setShowJoinForm(false);
        // Show success message or redirect
      }
      return result;
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: 'Registration failed' };
    }
  };

  const urgencyColors = {
    high: 'from-red-600 to-orange-600',
    medium: 'from-purple-600 to-amber-600',
    low: 'from-blue-600 to-purple-600'
  };

  const urgencyText = {
    high: 'URGENT: Less than 100 spots left!',
    medium: 'LIMITED TIME: Act fast!',
    low: 'EXCLUSIVE OFFER: Join now!'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-amber-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative container mx-auto px-4 py-16">
          
          {/* Urgency Banner */}
          <div className={`bg-gradient-to-r ${urgencyColors[urgencyLevel]} text-white text-center py-3 rounded-lg mb-8 animate-pulse`}>
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-5 h-5" />
              <span className="font-bold">{urgencyText[urgencyLevel]}</span>
              <Badge className="bg-white text-purple-900 font-bold">
                {spotsRemaining} spots left
              </Badge>
            </div>
          </div>

          {/* Main Hero */}
          <div className="text-center text-white max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <Crown className="w-16 h-16 text-yellow-300 animate-bounce" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-300 to-amber-300 bg-clip-text text-transparent">
              Become a Founder
            </h1>
            
            <p className="text-2xl md:text-3xl mb-8 text-gray-200">
              Join the first 1000 players of <span className="text-yellow-300 font-bold">Wizard Chess Master</span>
              <br />and unlock <span className="text-yellow-300 font-bold">lifetime premium access</span>
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur">
                <Gift className="w-8 h-8 mx-auto mb-4 text-yellow-300" />
                <h3 className="font-bold text-xl mb-2">Worth $720</h3>
                <p className="text-gray-300">Premium features valued at $60/year - yours forever</p>
              </div>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur">
                <Trophy className="w-8 h-8 mx-auto mb-4 text-yellow-300" />
                <h3 className="font-bold text-xl mb-2">Exclusive Access</h3>
                <p className="text-gray-300">Founder-only tournaments and special features</p>
              </div>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur">
                <Star className="w-8 h-8 mx-auto mb-4 text-yellow-300" />
                <h3 className="font-bold text-xl mb-2">Forever Badge</h3>
                <p className="text-gray-300">Permanent recognition as a founding member</p>
              </div>
            </div>

            <Button 
              onClick={handleJoinClick}
              className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white font-bold py-4 px-8 text-xl rounded-lg shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              <Crown className="w-6 h-6 mr-2" />
              Claim Your Founder Status - FREE
            </Button>
            
            <p className="text-sm text-gray-400 mt-4">
              No credit card required • Instant access • Limited to first 1000 users
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-black/20 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            What Founder Members Get Forever
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Sparkles, title: "Unlimited AI Training", desc: "Train against advanced AI opponents without limits" },
              { icon: Trophy, title: "Exclusive Tournaments", desc: "Founder-only competitions with special prizes" },
              { icon: Star, title: "Cloud Save Sync", desc: "Cross-device progress synchronization" },
              { icon: CheckCircle, title: "Premium Features", desc: "All future premium content included" }
            ].map((benefit, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-6 text-center text-white backdrop-blur">
                <benefit.icon className="w-10 h-10 mx-auto mb-4 text-yellow-300" />
                <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                <p className="text-gray-300 text-sm">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-gradient-to-r from-purple-800 to-amber-800 py-12">
        <div className="container mx-auto px-4 text-center text-white">
          <h3 className="text-2xl font-bold mb-6">Join Thousands of Strategic Minds</h3>
          <div className="flex justify-center space-x-8 text-lg">
            <div>
              <div className="font-bold text-3xl text-yellow-300">{1000 - spotsRemaining}+</div>
              <div className="text-purple-200">Founders Joined</div>
            </div>
            <div>
              <div className="font-bold text-3xl text-yellow-300">4.9/5</div>
              <div className="text-purple-200">Player Rating</div>
            </div>
            <div>
              <div className="font-bold text-3xl text-yellow-300">10K+</div>
              <div className="text-purple-200">Games Played</div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-black/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <FounderPromotion className="max-w-2xl mx-auto mb-8" />
          
          <Button 
            onClick={handleJoinClick}
            className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white font-bold py-4 px-8 text-xl rounded-lg shadow-2xl"
          >
            Secure Your Founder Status Now
          </Button>
          
          <p className="text-white/70 text-sm mt-6">
            After 1000 members, premium features will cost $5-10/month.<br />
            <strong className="text-yellow-300">Founders get everything free forever.</strong>
          </p>
        </div>
      </div>

      {/* Join Form Modal */}
      {showJoinForm && (
        <JoinFreeForm 
          onSubmit={handleFormSubmit}
          onClose={() => setShowJoinForm(false)}
        />
      )}
    </div>
  );
}