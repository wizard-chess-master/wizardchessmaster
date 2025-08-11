import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, Users, Clock, Target, Crown } from 'lucide-react';

interface AnalyticsData {
  totalFounders: number;
  dailySignups: number;
  conversionRate: number;
  timeRemaining: string;
  projectedCompletion: string;
  recentActivity: Array<{
    timestamp: string;
    founderNumber: number;
    action: string;
  }>;
}

export function FounderAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalFounders: 0,
    dailySignups: 0,
    conversionRate: 0,
    timeRemaining: '',
    projectedCompletion: '',
    recentActivity: []
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/founder/analytics');
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        } else {
          // Fallback mock data for development
          setAnalytics({
            totalFounders: 247,
            dailySignups: 15,
            conversionRate: 78,
            timeRemaining: '6 weeks',
            projectedCompletion: 'September 2025',
            recentActivity: [
              { timestamp: '2 min ago', founderNumber: 247, action: 'joined' },
              { timestamp: '8 min ago', founderNumber: 246, action: 'completed tutorial' },
              { timestamp: '15 min ago', founderNumber: 245, action: 'won first game' },
              { timestamp: '23 min ago', founderNumber: 244, action: 'joined tournament' },
              { timestamp: '31 min ago', founderNumber: 243, action: 'shared on social media' }
            ]
          });
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
        ))}
      </div>
    );
  }

  const progressPercentage = (analytics.totalFounders / 1000) * 100;
  const remainingSpots = 1000 - analytics.totalFounders;

  return (
    <div className="p-4 space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Founders</CardTitle>
            <Crown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalFounders}</div>
            <p className="text-xs text-muted-foreground">
              of 1000 total spots
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Signups</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.dailySignups}</div>
            <p className="text-xs text-muted-foreground">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              visitors to founders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Completion</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.timeRemaining}</div>
            <p className="text-xs text-muted-foreground">
              at current pace
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Founder Program Progress</span>
            <Badge variant="secondary">
              {remainingSpots} spots remaining
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-600 to-amber-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>500</span>
              <span>1000</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Recent Founder Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div>
                    <div className="font-medium text-sm">
                      Founder #{activity.founderNumber} {activity.action}
                    </div>
                    <div className="text-xs text-gray-500">{activity.timestamp}</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  #{activity.founderNumber}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Quarter Milestone (250 founders)</span>
              <Badge className={analytics.totalFounders >= 250 ? "bg-green-500" : "bg-gray-300"}>
                {analytics.totalFounders >= 250 ? "Complete" : `${250 - analytics.totalFounders} to go`}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Half Milestone (500 founders)</span>
              <Badge className={analytics.totalFounders >= 500 ? "bg-green-500" : "bg-gray-300"}>
                {analytics.totalFounders >= 500 ? "Complete" : `${500 - analytics.totalFounders} to go`}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Three Quarter (750 founders)</span>
              <Badge className={analytics.totalFounders >= 750 ? "bg-green-500" : "bg-gray-300"}>
                {analytics.totalFounders >= 750 ? "Complete" : `${750 - analytics.totalFounders} to go`}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Program Complete (1000 founders)</span>
              <Badge className={analytics.totalFounders >= 1000 ? "bg-purple-500" : "bg-gray-300"}>
                {analytics.totalFounders >= 1000 ? "Complete!" : `${1000 - analytics.totalFounders} to go`}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}