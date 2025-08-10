import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  Trophy, 
  Crown, 
  Users, 
  Calendar, 
  Clock, 
  Star,
  DollarSign,
  Zap,
  Gift,
  Lock,
  Unlock,
  Medal,
  Target
} from 'lucide-react';
import { useAuth } from '../../lib/stores/useAuth';
import { AdBanner } from '../monetization/AdBanner';

interface Tournament {
  id: string;
  name: string;
  type: 'free' | 'premium' | 'cash';
  entryFee: number;
  prizePool: number;
  participants: number;
  maxParticipants: number;
  startTime: Date;
  duration: string;
  status: 'upcoming' | 'active' | 'completed';
  requirements: string[];
  rewards: {
    first: string;
    second: string;
    third: string;
    participation?: string;
  };
}

export function TournamentSystem() {
  const { user, isLoggedIn, isPremium } = useAuth();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'active' | 'my-tournaments'>('upcoming');

  const tournaments: Tournament[] = [
    // Free Tournaments
    {
      id: 'weekly-free',
      name: 'Weekly Wizard Chess Championship',
      type: 'free',
      entryFee: 0,
      prizePool: 0,
      participants: 234,
      maxParticipants: 500,
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      duration: '3 days',
      status: 'upcoming',
      requirements: ['Registered account', 'Complete tutorial'],
      rewards: {
        first: 'Champion Badge + 30 Days Premium',
        second: 'Runner-up Badge + 14 Days Premium', 
        third: 'Bronze Badge + 7 Days Premium',
        participation: 'Tournament Participant Badge'
      }
    },
    {
      id: 'daily-blitz',
      name: 'Daily Blitz Tournament',
      type: 'free',
      entryFee: 0,
      prizePool: 0,
      participants: 89,
      maxParticipants: 128,
      startTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      duration: '2 hours',
      status: 'upcoming',
      requirements: ['Registered account'],
      rewards: {
        first: 'Daily Champion Badge',
        second: 'Silver Badge',
        third: 'Bronze Badge'
      }
    },
    // Premium Tournaments
    {
      id: 'premium-masters',
      name: 'Premium Masters Tournament',
      type: 'premium',
      entryFee: 0,
      prizePool: 0,
      participants: 45,
      maxParticipants: 64,
      startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      duration: '5 days',
      status: 'upcoming',
      requirements: ['Premium Membership', 'Rating 1200+'],
      rewards: {
        first: 'Masters Champion Title + Exclusive Avatar',
        second: 'Masters Runner-up + Premium Avatar',
        third: 'Masters Bronze + Special Badge'
      }
    },
    // Cash Prize Tournaments
    {
      id: 'grand-championship',
      name: 'Grand Championship - $500 Prize Pool',
      type: 'cash',
      entryFee: 10,
      prizePool: 500,
      participants: 28,
      maxParticipants: 50,
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      duration: '1 week',
      status: 'upcoming',
      requirements: ['Premium Membership', 'Rating 1500+', '$10 Entry Fee'],
      rewards: {
        first: '$250 Cash Prize',
        second: '$150 Cash Prize',
        third: '$100 Cash Prize'
      }
    },
    {
      id: 'monthly-cash',
      name: 'Monthly Cash Challenge - $200',
      type: 'cash',
      entryFee: 5,
      prizePool: 200,
      participants: 67,
      maxParticipants: 100,
      startTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      duration: '2 weeks',
      status: 'upcoming',
      requirements: ['Premium Membership', '$5 Entry Fee'],
      rewards: {
        first: '$100 Cash Prize',
        second: '$60 Cash Prize',
        third: '$40 Cash Prize'
      }
    }
  ];

  const handleJoinTournament = (tournament: Tournament) => {
    if (!isLoggedIn) {
      alert('Please log in to join tournaments');
      return;
    }

    if (tournament.type === 'premium' && !isPremium()) {
      alert('Premium membership required for this tournament');
      return;
    }

    if (tournament.type === 'cash') {
      alert('Cash tournaments require payment processing - feature coming soon!');
      return;
    }

    setSelectedTournament(tournament);
    setShowJoinDialog(true);
  };

  const getTournamentIcon = (type: Tournament['type']) => {
    switch (type) {
      case 'free': return <Gift className="w-5 h-5 text-green-600" />;
      case 'premium': return <Crown className="w-5 h-5 text-amber-600" />;
      case 'cash': return <DollarSign className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getTournamentBadge = (type: Tournament['type']) => {
    switch (type) {
      case 'free': 
        return <Badge className="bg-green-100 text-green-800">Free Entry</Badge>;
      case 'premium': 
        return <Badge className="bg-amber-100 text-amber-800">Premium Only</Badge>;
      case 'cash': 
        return <Badge className="bg-emerald-100 text-emerald-800">Cash Prizes</Badge>;
    }
  };

  const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming');
  const activeTournaments = tournaments.filter(t => t.status === 'active');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-purple-200">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-purple-900 mb-2">
              Tournament Arena
            </h1>
            <p className="text-purple-700 text-lg">
              Compete against players worldwide in free and premium tournaments
            </p>
          </div>
        </div>
        <AdBanner containerId="tournament-header-banner" size="leaderboard" />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tournament Categories */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <Gift className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-green-900">Free Tournaments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-800 text-center mb-4">
                Open to all registered players. Win premium time and exclusive badges!
              </p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• No entry fees</li>
                <li>• Badge rewards</li>
                <li>• Premium time prizes</li>
                <li>• Open to all skill levels</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="text-center">
              <Crown className="w-12 h-12 text-amber-600 mx-auto mb-2" />
              <CardTitle className="text-amber-900">Premium Tournaments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-800 text-center mb-4">
                Exclusive tournaments for premium members with special rewards.
              </p>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Premium membership required</li>
                <li>• Exclusive titles and avatars</li>
                <li>• Higher skill competition</li>
                <li>• Special recognition</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50">
            <CardHeader className="text-center">
              <DollarSign className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
              <CardTitle className="text-emerald-900">Cash Tournaments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-emerald-800 text-center mb-4">
                Real money prizes for the most skilled players. Entry fees apply.
              </p>
              <ul className="text-sm text-emerald-700 space-y-1">
                <li>• Real cash prizes</li>
                <li>• Entry fees required</li>
                <li>• Premium membership required</li>
                <li>• High-level competition</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <AdBanner containerId="tournament-middle-banner" size="banner" />

        {/* Tournament Tabs */}
        <div className="flex gap-4 mb-6 border-b border-purple-200">
          {[
            { id: 'upcoming', label: 'Upcoming', count: upcomingTournaments.length },
            { id: 'active', label: 'Active', count: activeTournaments.length },
            { id: 'my-tournaments', label: 'My Tournaments', count: 0 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-purple-700 hover:bg-purple-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Tournament List */}
        <div className="grid lg:grid-cols-2 gap-6">
          {(activeTab === 'upcoming' ? upcomingTournaments : activeTournaments).map((tournament) => (
            <Card key={tournament.id} className="border-purple-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {getTournamentIcon(tournament.type)}
                    <div>
                      <CardTitle className="text-purple-900">{tournament.name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        {getTournamentBadge(tournament.type)}
                        {tournament.prizePool > 0 && (
                          <Badge className="bg-emerald-100 text-emerald-800">
                            ${tournament.prizePool} Prize Pool
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-700">Participants:</span>
                    <span className="font-medium">{tournament.participants}/{tournament.maxParticipants}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-700">Duration:</span>
                    <span className="font-medium">{tournament.duration}</span>
                  </div>
                  
                  {tournament.entryFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-700">Entry Fee:</span>
                      <span className="font-medium text-emerald-600">${tournament.entryFee}</span>
                    </div>
                  )}

                  <div className="bg-purple-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-purple-900 mb-2">Prizes:</h4>
                    <ul className="text-xs text-purple-700 space-y-1">
                      <li>🥇 {tournament.rewards.first}</li>
                      <li>🥈 {tournament.rewards.second}</li>
                      <li>🥉 {tournament.rewards.third}</li>
                      {tournament.rewards.participation && (
                        <li>🎖️ {tournament.rewards.participation}</li>
                      )}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleJoinTournament(tournament)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={!isLoggedIn || (tournament.type === 'premium' && !isPremium())}
                    >
                      {tournament.type === 'premium' && !isPremium() ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Premium Required
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4 mr-2" />
                          Join Tournament
                        </>
                      )}
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upgrade Prompt for Non-Premium Users */}
        {!isPremium() && (
          <div className="mt-8 bg-gradient-to-r from-amber-500 to-yellow-500 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Unlock Premium Tournaments</h3>
                <p className="opacity-90">
                  Get access to exclusive tournaments, cash prizes, and premium rewards.
                </p>
              </div>
              <Button className="bg-white text-amber-600 hover:bg-gray-100">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          </div>
        )}

        <AdBanner containerId="tournament-bottom-banner" size="leaderboard" />
      </div>

      {/* Join Tournament Dialog */}
      {showJoinDialog && selectedTournament && (
        <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join {selectedTournament.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Are you ready to compete in this tournament?</p>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <h4 className="font-medium">Requirements:</h4>
                <ul className="space-y-1">
                  {selectedTournament.requirements.map((req, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setShowJoinDialog(false);
                    alert('Successfully joined tournament! You will receive updates via email.');
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Confirm Entry
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowJoinDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}