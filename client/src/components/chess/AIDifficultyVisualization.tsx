import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target,
  Clock,
  Zap,
  Award,
  Settings,
  LineChart,
  BarChart3,
  Activity,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAIDifficultyProgression, DifficultyDataPoint, DifficultyAdjustment } from '../../lib/stores/useAIDifficultyProgression';

interface AIDifficultyVisualizationProps {
  children: React.ReactNode;
}

const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - timestamp;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const getDifficultyColor = (difficulty: number): string => {
  if (difficulty <= 2) return 'text-green-600 bg-green-50 border-green-200';
  if (difficulty <= 4) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (difficulty <= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  if (difficulty <= 8) return 'text-orange-600 bg-orange-50 border-orange-200';
  return 'text-red-600 bg-red-50 border-red-200';
};

const getDifficultyLabel = (difficulty: number): string => {
  if (difficulty <= 2) return 'Easy';
  if (difficulty <= 4) return 'Medium';
  if (difficulty <= 6) return 'Hard';
  if (difficulty <= 8) return 'Expert';
  return 'Master';
};

const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
  switch (trend) {
    case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
    case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
    default: return <Minus className="w-4 h-4 text-gray-600" />;
  }
};

function DifficultyChart({ data }: { data: DifficultyDataPoint[] }) {
  const chartData = useMemo(() => {
    if (data.length === 0) return [];
    
    const maxPoints = 50;
    const step = Math.max(1, Math.floor(data.length / maxPoints));
    const samples = data.filter((_, index) => index % step === 0 || index === data.length - 1);
    
    return samples.map((point, index) => ({
      x: (index / (samples.length - 1)) * 100,
      difficulty: (point.difficulty / 10) * 100,
      performance: point.playerPerformance,
      timestamp: point.timestamp,
      outcome: point.gameOutcome
    }));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <LineChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No data available. Play some games to see the progression!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 relative bg-gray-50 rounded-lg p-4">
      <svg width="100%" height="100%" viewBox="0 0 400 200" className="overflow-visible">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line
            key={y}
            x1="0"
            y1={200 - (y * 2)}
            x2="400"
            y2={200 - (y * 2)}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        
        {/* Difficulty line */}
        <polyline
          points={chartData.map(point => `${point.x * 4},${200 - point.difficulty * 2}`).join(' ')}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
          className="drop-shadow-sm"
        />
        
        {/* Performance line */}
        <polyline
          points={chartData.map(point => `${point.x * 4},${200 - point.performance * 2}`).join(' ')}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeDasharray="5,5"
          className="drop-shadow-sm"
        />
        
        {/* Data points */}
        {chartData.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x * 4}
              cy={200 - point.difficulty * 2}
              r="3"
              fill="#6366f1"
              className="drop-shadow-sm"
            />
            <circle
              cx={point.x * 4}
              cy={200 - point.performance * 2}
              r="2"
              fill={point.outcome === 'win' ? '#10b981' : point.outcome === 'loss' ? '#ef4444' : '#f59e0b'}
            />
          </g>
        ))}
      </svg>
      
      {/* Legend */}
      <div className="absolute bottom-2 right-2 text-xs space-y-1">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-blue-600"></div>
          <span>AI Difficulty</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-green-600 border-dashed"></div>
          <span>Performance</span>
        </div>
      </div>
      
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
        <span>100%</span>
        <span>75%</span>
        <span>50%</span>
        <span>25%</span>
        <span>0%</span>
      </div>
    </div>
  );
}

function PerformanceMetrics() {
  const { recentPerformance, currentDifficulty, getPredictedDifficulty } = useAIDifficultyProgression();
  const predictedDifficulty = getPredictedDifficulty();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Difficulty</p>
              <p className="text-2xl font-bold">{currentDifficulty}/10</p>
            </div>
            <div className={`p-2 rounded-full border-2 ${getDifficultyColor(currentDifficulty)}`}>
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <Badge variant="outline" className="mt-2">
            {getDifficultyLabel(currentDifficulty)}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold">{recentPerformance.winRate.toFixed(1)}%</p>
            </div>
            <div className="p-2 rounded-full bg-green-50 border-2 border-green-200">
              <Target className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {getTrendIcon(recentPerformance.improvementTrend)}
            <span className="text-xs text-gray-600 capitalize">
              {recentPerformance.improvementTrend}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Game Time</p>
              <p className="text-2xl font-bold">{formatTime(recentPerformance.averageGameTime)}</p>
            </div>
            <div className="p-2 rounded-full bg-blue-50 border-2 border-blue-200">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Streak: {recentPerformance.currentStreak}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Skill Level</p>
              <p className="text-xl font-bold capitalize">{recentPerformance.skillLevel}</p>
            </div>
            <div className="p-2 rounded-full bg-purple-50 border-2 border-purple-200">
              <Award className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          {predictedDifficulty !== currentDifficulty && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-gray-600">Next:</span>
              <Badge variant="outline" className="text-xs">
                {predictedDifficulty}/10
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AdjustmentHistory({ adjustments }: { adjustments: DifficultyAdjustment[] }) {
  if (adjustments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No difficulty adjustments yet. The AI will adapt as you play!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-64">
      <div className="space-y-2">
        {adjustments.slice().reverse().map((adjustment, index) => (
          <Card key={index} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {adjustment.newDifficulty > adjustment.oldDifficulty ? (
                  <ChevronUp className="w-4 h-4 text-green-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-red-600" />
                )}
                <span className="font-medium">
                  {adjustment.oldDifficulty} → {adjustment.newDifficulty}
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    adjustment.triggerEvent === 'win_streak' ? 'border-green-300 text-green-700' :
                    adjustment.triggerEvent === 'loss_streak' ? 'border-red-300 text-red-700' :
                    adjustment.triggerEvent === 'performance_improvement' ? 'border-blue-300 text-blue-700' :
                    adjustment.triggerEvent === 'performance_decline' ? 'border-orange-300 text-orange-700' :
                    'border-gray-300 text-gray-700'
                  }`}
                >
                  {adjustment.triggerEvent.replace('_', ' ')}
                </Badge>
              </div>
              <span className="text-xs text-gray-500">
                {formatTimestamp(adjustment.timestamp)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{adjustment.reason}</p>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}

function VisualizationSettings() {
  const {
    timeRange,
    adaptationEnabled,
    showPredictions,
    showAdjustmentReasons,
    setTimeRange,
    toggleAdaptation,
    togglePredictions,
    toggleAdjustmentReasons,
    resetProgression
  } = useAIDifficultyProgression();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Visualization Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Time Range</label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Adaptive Difficulty</p>
              <p className="text-sm text-gray-600">AI adjusts difficulty based on performance</p>
            </div>
            <Switch
              checked={adaptationEnabled}
              onCheckedChange={toggleAdaptation}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Predictions</p>
              <p className="text-sm text-gray-600">Display predicted difficulty changes</p>
            </div>
            <Switch
              checked={showPredictions}
              onCheckedChange={togglePredictions}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Adjustment Reasons</p>
              <p className="text-sm text-gray-600">Show why difficulty was changed</p>
            </div>
            <Switch
              checked={showAdjustmentReasons}
              onCheckedChange={toggleAdjustmentReasons}
            />
          </div>
        </div>

        <Separator />

        <Button
          variant="destructive"
          onClick={resetProgression}
          className="w-full"
        >
          Reset All Progression Data
        </Button>
      </CardContent>
    </Card>
  );
}

export function AIDifficultyVisualization({ children }: AIDifficultyVisualizationProps) {
  const {
    getFilteredHistory,
    adjustmentHistory,
    currentDifficulty,
    adaptationEnabled
  } = useAIDifficultyProgression();

  const [filteredData, setFilteredData] = useState<DifficultyDataPoint[]>([]);

  useEffect(() => {
    setFilteredData(getFilteredHistory());
  }, [getFilteredHistory]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Difficulty Progression Visualization
            <Badge variant={adaptationEnabled ? "default" : "secondary"} className="ml-2">
              {adaptationEnabled ? "Adaptive" : "Fixed"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <PerformanceMetrics />

          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chart" className="flex items-center gap-2">
                <LineChart className="w-4 h-4" />
                Progression Chart
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Adjustment History
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Difficulty & Performance Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DifficultyChart data={filteredData} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Difficulty Adjustments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AdjustmentHistory adjustments={adjustmentHistory} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <VisualizationSettings />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}