import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  Download,
  RefreshCw,
  Gauge,
  Package,
  Zap
} from 'lucide-react';
import { performanceProfiler } from '../../lib/performance/performanceProfiler';
import { bundleAnalyzer } from '../../lib/performance/bundleAnalyzer';
import { logger } from '../../lib/utils/clientLogger';

interface Metric {
  name: string;
  value: string | number;
  target: string;
  status: 'good' | 'warning' | 'error';
  icon: React.ReactNode;
}

export function PerformanceProfilerPanel() {
  const [score, setScore] = useState(0);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [issues, setIssues] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [bundleInfo, setBundleInfo] = useState<any>(null);

  useEffect(() => {
    // Initial analysis after page load
    const timer = setTimeout(() => {
      analyzePerformance();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const analyzePerformance = async () => {
    setIsAnalyzing(true);
    
    try {
      // Get performance metrics
      const report = performanceProfiler.exportReport();
      const { score: perfScore, issues: perfIssues } = report.score;
      const optimizations = performanceProfiler.getOptimizations();
      
      setScore(perfScore);
      setIssues(perfIssues);
      setRecommendations(optimizations);

      // Format metrics for display
      const formattedMetrics: Metric[] = [];
      
      if (report.metrics.pageLoadTime) {
        formattedMetrics.push({
          name: 'Page Load Time',
          value: `${(report.metrics.pageLoadTime / 1000).toFixed(2)}s`,
          target: '< 3s',
          status: report.metrics.pageLoadTime < 3000 ? 'good' : 
                  report.metrics.pageLoadTime < 5000 ? 'warning' : 'error',
          icon: <Gauge className="w-4 h-4" />
        });
      }

      if (report.metrics.ttfb) {
        formattedMetrics.push({
          name: 'Time to First Byte',
          value: `${report.metrics.ttfb}ms`,
          target: '< 600ms',
          status: report.metrics.ttfb < 600 ? 'good' : 
                  report.metrics.ttfb < 1000 ? 'warning' : 'error',
          icon: <Zap className="w-4 h-4" />
        });
      }

      if (report.metrics.lcp) {
        formattedMetrics.push({
          name: 'Largest Contentful Paint',
          value: `${(report.metrics.lcp / 1000).toFixed(2)}s`,
          target: '< 2.5s',
          status: report.metrics.lcp < 2500 ? 'good' : 
                  report.metrics.lcp < 4000 ? 'warning' : 'error',
          icon: <Activity className="w-4 h-4" />
        });
      }

      if (report.metrics.bundleSize) {
        formattedMetrics.push({
          name: 'Bundle Size',
          value: `${report.metrics.bundleSize.toFixed(2)} MB`,
          target: '< 1 MB',
          status: report.metrics.bundleSize < 1 ? 'good' : 
                  report.metrics.bundleSize < 1.5 ? 'warning' : 'error',
          icon: <Package className="w-4 h-4" />
        });
      }

      setMetrics(formattedMetrics);

      // Analyze bundle
      const bundleAnalysis = bundleAnalyzer.analyzeBundleComposition();
      setBundleInfo(bundleAnalysis);

      logger.info('Performance', 'Analysis complete', {
        score: perfScore,
        issues: perfIssues.length,
        recommendations: optimizations.length
      });
    } catch (error) {
      logger.error('Performance', 'Analysis failed', error as Error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportReport = () => {
    const fullReport = {
      timestamp: new Date().toISOString(),
      performanceScore: score,
      metrics,
      issues,
      recommendations,
      bundleInfo,
      profilerReport: performanceProfiler.exportReport(),
      bundleReport: bundleAnalyzer.exportReport()
    };

    const blob = new Blob([JSON.stringify(fullReport, null, 2)], 
      { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Performance Profiler</span>
          <div className="flex gap-2">
            <Button
              onClick={analyzePerformance}
              disabled={isAnalyzing}
              className="medieval-btn"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
            </Button>
            <Button
              onClick={exportReport}
              variant="outline"
              disabled={metrics.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Score */}
        <div className="text-center p-6 bg-slate-900 rounded-lg">
          <h3 className="text-sm text-muted-foreground mb-2">Performance Score</h3>
          <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
            {score}
          </div>
          <Progress value={score} className="mt-4 h-3" />
        </div>

        {/* Core Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {metric.icon}
                  <span className="font-medium">{metric.name}</span>
                </div>
                <Badge className={getStatusColor(metric.status)}>
                  {metric.value}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Target: {metric.target}
              </div>
            </div>
          ))}
        </div>

        {/* Bundle Analysis */}
        {bundleInfo && (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Bundle Composition
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Total Size</div>
                <div className="font-mono">{(bundleInfo.totalSize / 1024).toFixed(2)} MB</div>
              </div>
              <div>
                <div className="text-muted-foreground">Vendor</div>
                <div className="font-mono">
                  {(bundleInfo.vendorSize / 1024).toFixed(2)} MB 
                  ({Math.round(bundleInfo.vendorSize / bundleInfo.totalSize * 100)}%)
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">App Code</div>
                <div className="font-mono">
                  {(bundleInfo.appSize / 1024).toFixed(2)} MB
                  ({Math.round(bundleInfo.appSize / bundleInfo.totalSize * 100)}%)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Issues */}
        {issues.length > 0 && (
          <div className="border border-yellow-500/50 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-yellow-500">
              <AlertCircle className="w-4 h-4" />
              Performance Issues ({issues.length})
            </h3>
            <ul className="space-y-1 text-sm">
              {issues.map((issue, index) => (
                <li key={index} className="flex items-start gap-2">
                  <TrendingDown className="w-3 h-3 mt-1 text-red-500 shrink-0" />
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="border border-green-500/50 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-500">
              <TrendingUp className="w-4 h-4" />
              Optimization Recommendations
            </h3>
            <ul className="space-y-1 text-sm">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}