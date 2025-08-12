import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Play,
  Download,
  RefreshCw,
  Activity,
  Zap,
  Database,
  Wifi,
  HardDrive,
  AlertCircle
} from 'lucide-react';
import { stabilityTester, type StabilityTestResult } from '../../tests/stabilityTests';
import { logger } from '../../lib/utils/clientLogger';

export function StabilityTestPanelV2() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<StabilityTestResult[]>([]);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);
    setCurrentTest('Initializing...');
    
    try {
      const testResults = await stabilityTester.runAllTests((testName) => {
        setCurrentTest(testName);
        setProgress(prev => prev + (100 / 6)); // 6 tests total
      });
      
      setResults(testResults);
      
      // Log summary
      const passed = testResults.filter(r => r.status === 'pass').length;
      const warnings = testResults.filter(r => r.status === 'warning').length;
      const failed = testResults.filter(r => r.status === 'fail').length;
      
      logger.info('Stability', 'All tests completed', {
        passed,
        warnings,
        failed,
        total: testResults.length
      });
    } catch (error) {
      logger.error('Stability', 'Test suite failed', error as Error);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
      setProgress(100);
    }
  };

  const exportReport = () => {
    const report = stabilityTester.generateReport();
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stability-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTestIcon = (testName: string) => {
    if (testName.includes('Memory')) return <Activity className="w-4 h-4" />;
    if (testName.includes('Concurrent')) return <Zap className="w-4 h-4" />;
    if (testName.includes('WebSocket')) return <Wifi className="w-4 h-4" />;
    if (testName.includes('Error')) return <AlertCircle className="w-4 h-4" />;
    if (testName.includes('DOM')) return <Database className="w-4 h-4" />;
    if (testName.includes('Storage')) return <HardDrive className="w-4 h-4" />;
    return <Shield className="w-4 h-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pass':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'fail':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const calculateScore = () => {
    if (results.length === 0) return 0;
    const weights = { pass: 100, warning: 70, fail: 0 };
    const totalScore = results.reduce((sum, r) => sum + (weights[r.status] || 0), 0);
    return Math.round(totalScore / results.length);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Stability Testing Suite
          </span>
          {results.length > 0 && (
            <div className="text-2xl font-bold">
              Score: <span className={calculateScore() >= 90 ? 'text-green-500' : 
                                       calculateScore() >= 70 ? 'text-yellow-500' : 
                                       'text-red-500'}>
                {calculateScore()}%
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            className="flex items-center gap-2 medieval-btn"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
          
          <Button
            variant="outline"
            onClick={exportReport}
            disabled={results.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {isRunning && (
          <div className="space-y-2 p-4 bg-slate-900 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Testing: {currentTest}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-900 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {results.filter(r => r.status === 'pass').length}
                </div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {results.filter(r => r.status === 'warning').length}
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {results.filter(r => r.status === 'fail').length}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>

            {results.map((result, index) => (
              <div 
                key={index} 
                className="border rounded-lg overflow-hidden"
              >
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-900/50 transition-colors"
                  onClick={() => setExpandedTest(expandedTest === result.test ? null : result.test)}
                >
                  <div className="flex items-center gap-3">
                    {getTestIcon(result.test)}
                    <span className="font-medium">{result.test}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {result.duration.toFixed(0)}ms
                    </span>
                    <Badge variant={getStatusVariant(result.status)}>
                      {getStatusIcon(result.status)}
                      <span className="ml-1">{result.status.toUpperCase()}</span>
                    </Badge>
                  </div>
                </div>
                
                {expandedTest === result.test && (
                  <div className="p-3 pt-0 border-t">
                    <p className="text-sm text-muted-foreground">
                      {result.details}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Completed at {new Date(result.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!isRunning && results.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Run stability tests to check application resilience</p>
            <p className="text-sm mt-2">Tests include memory leaks, concurrent requests, WebSocket stability, and more</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}