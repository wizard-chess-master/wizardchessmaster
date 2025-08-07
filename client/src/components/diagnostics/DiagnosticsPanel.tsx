import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Eye, 
  Gauge, 
  Info,
  ChevronDown,
  RefreshCw,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { uiDiagnostics, DiagnosticReport, DiagnosticResult } from '../../lib/diagnostics/uiDiagnostics';

interface DiagnosticsPanelProps {
  onClose: () => void;
}

export function DiagnosticsPanel({ onClose }: DiagnosticsPanelProps) {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<'basic' | 'detailed' | 'performance'>('detailed');

  useEffect(() => {
    // Run initial diagnostics
    runDiagnostics();
    
    // Start FPS monitoring
    uiDiagnostics.startFPSMonitoring();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        runDiagnostics();
      }, 5000); // Refresh every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, selectedLevel]);

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      const diagnosticReport = await uiDiagnostics.runDiagnostics(selectedLevel);
      setReport(diagnosticReport);
    } catch (error) {
      console.error('Diagnostics failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getSeverityIcon = (severity: DiagnosticResult['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity: DiagnosticResult['severity']) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'outline';
    }
  };

  const getCategoryIcon = (category: DiagnosticResult['category']) => {
    switch (category) {
      case 'canvas':
        return <Eye className="w-4 h-4" />;
      case 'layout':
        return <Activity className="w-4 h-4" />;
      case 'performance':
        return <Gauge className="w-4 h-4" />;
      case 'accessibility':
        return <CheckCircle className="w-4 h-4" />;
      case 'components':
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getOverallStatus = () => {
    if (!report) return 'unknown';
    
    if (report.criticalIssues > 0) return 'critical';
    if (report.errorIssues > 0) return 'error';
    if (report.warningIssues > 0) return 'warning';
    return 'healthy';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const groupedResults = report?.results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Partial<Record<DiagnosticResult['category'], DiagnosticResult[]>>) || {};

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-background">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6" />
              <div>
                <CardTitle>UI Diagnostics</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Auto-diagnostic system for UI rendering issues
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(getOverallStatus())}
              <Button variant="ghost" onClick={onClose}>
                ✕
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Controls */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Level:</label>
              <select 
                value={selectedLevel} 
                onChange={(e) => setSelectedLevel(e.target.value as any)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="basic">Basic</option>
                <option value="detailed">Detailed</option>
                <option value="performance">Performance</option>
              </select>
            </div>
            
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunning}
              size="sm"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {isRunning ? 'Running...' : 'Run Diagnostics'}
            </Button>
            
            <Button
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
              size="sm"
            >
              <Clock className="w-4 h-4 mr-2" />
              Auto Refresh
            </Button>
          </div>

          {report && (
            <>
              {/* Summary */}
              <Card className="mb-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">{report.criticalIssues}</div>
                      <div className="text-xs text-muted-foreground">Critical</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">{report.errorIssues}</div>
                      <div className="text-xs text-muted-foreground">Errors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-500">{report.warningIssues}</div>
                      <div className="text-xs text-muted-foreground">Warnings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{report.infoIssues}</div>
                      <div className="text-xs text-muted-foreground">Info</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Render Time:</span> {report.performance.renderTime.toFixed(2)}ms
                    </div>
                    {report.performance.fps && (
                      <div>
                        <span className="font-medium">FPS:</span> {report.performance.fps.toFixed(1)}
                      </div>
                    )}
                    {report.performance.memoryUsage && (
                      <div>
                        <span className="font-medium">Memory:</span> {report.performance.memoryUsage.toFixed(1)}MB
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Issues by Category */}
              {Object.entries(groupedResults).map(([category, results]: [DiagnosticResult['category'], DiagnosticResult[]]) => (
                <Collapsible key={category} defaultOpen={results.some(r => r.severity === 'critical' || r.severity === 'error')}>
                  <CollapsibleTrigger asChild>
                    <Card className="mb-4 cursor-pointer hover:bg-muted/50">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getCategoryIcon(category as DiagnosticResult['category'])}
                            <div>
                              <h3 className="font-medium capitalize">{category}</h3>
                              <p className="text-sm text-muted-foreground">
                                {results.length} issue{results.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {(['critical', 'error', 'warning', 'info'] as const).map(severity => {
                                const count = results.filter((r: DiagnosticResult) => r.severity === severity).length;
                                if (count > 0) {
                                  return (
                                    <Badge 
                                      key={severity}
                                      variant={getSeverityColor(severity as DiagnosticResult['severity'])}
                                      className="text-xs"
                                    >
                                      {count}
                                    </Badge>
                                  );
                                }
                                return null;
                              })}
                            </div>
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="ml-4 space-y-3 mb-4">
                      {results.map((result: DiagnosticResult, index: number) => (
                        <Card key={index} className="border-l-4 border-l-muted">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {getSeverityIcon(result.severity)}
                              <div className="flex-1">
                                <h4 className="font-medium">{result.issue}</h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {result.description}
                                </p>
                                <p className="text-sm font-medium text-green-600">
                                  💡 {result.suggestion}
                                </p>
                                {result.coordinates && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Position: {result.coordinates.x}, {result.coordinates.y} 
                                    ({result.coordinates.width}×{result.coordinates.height})
                                  </p>
                                )}
                                {result.element && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => {
                                      result.element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      result.element?.classList.add('ring-2', 'ring-blue-500');
                                      setTimeout(() => {
                                        result.element?.classList.remove('ring-2', 'ring-blue-500');
                                      }, 3000);
                                    }}
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    Highlight Element
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}

              {report.totalIssues === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">All Systems Healthy!</h3>
                    <p className="text-muted-foreground">
                      No UI rendering issues detected. The application is running smoothly.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {!report && !isRunning && (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Ready to Diagnose</h3>
                <p className="text-muted-foreground mb-4">
                  Click "Run Diagnostics" to analyze the UI for rendering issues.
                </p>
                <Button onClick={runDiagnostics}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Start Diagnostics
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}