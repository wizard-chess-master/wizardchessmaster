/**
 * Performance Dashboard Component
 * Real-time performance monitoring and profiling UI
 */

import React, { useEffect, useState } from 'react';
import { performanceProfiler } from '@/lib/utils/performanceProfiler';
import { memoryLeakDetector } from '@/lib/utils/memoryLeakDetector';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Zap,
  Database,
  Globe,
  BarChart3,
  Play,
  Square,
  Download,
  Trash2
} from 'lucide-react';

interface PerformanceData {
  measures: Array<{ name: string; duration?: number }>;
  renderMetrics: Array<{
    componentName: string;
    renderCount: number;
    averageRenderTime: number;
    slowRenders: number;
  }>;
  networkMetrics: {
    requestCount: number;
    totalDataTransferred: number;
    averageLatency: number;
    slowRequests: number;
  };
  averageFPS: number;
  memoryUsage: number | null;
}

export const PerformanceDashboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'renders' | 'network' | 'operations'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (autoRefresh && isOpen) {
      const interval = setInterval(() => {
        updatePerformanceData();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, isOpen]);

  const updatePerformanceData = () => {
    const report = performanceProfiler.getReport();
    setPerformanceData(report);
  };

  const handleStartRecording = () => {
    performanceProfiler.startRecording();
    setIsRecording(true);
    setPerformanceData(null);
  };

  const handleStopRecording = () => {
    performanceProfiler.stopRecording();
    setIsRecording(false);
    updatePerformanceData();
  };

  const handleClear = () => {
    performanceProfiler.clear();
    setPerformanceData(null);
  };

  const handleExport = () => {
    if (!performanceData) return;
    
    const dataStr = JSON.stringify(performanceData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportName = `performance-report-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
  };

  const analyzeBundleSize = () => {
    performanceProfiler.analyzeBundleSize();
  };

  const formatDuration = (ms: number) => {
    if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  // Show dashboard in all environments for debugging purposes
  // if (process.env.NODE_ENV !== 'development') {
  //   return null;
  // }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-50 bg-purple-600 text-white p-3 rounded-lg shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
        title="Performance Dashboard"
        style={{ width: '48px', height: '48px' }}
      >
        <BarChart3 className="w-6 h-6" />
      </button>

      {/* Dashboard Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-900 text-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Activity className="w-6 h-6 text-purple-400" />
                  Performance Dashboard
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Controls */}
              <div className="flex gap-2 mt-4">
                {!isRecording ? (
                  <button
                    onClick={handleStartRecording}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={handleStopRecording}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                  >
                    <Square className="w-4 h-4" />
                    Stop Recording
                  </button>
                )}
                
                <button
                  onClick={updatePerformanceData}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                >
                  Refresh
                </button>
                
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-4 py-2 rounded transition-colors ${
                    autoRefresh ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
                </button>
                
                <button
                  onClick={analyzeBundleSize}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
                >
                  Bundle Analysis
                </button>
                
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
                  disabled={!performanceData}
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                
                <button
                  onClick={handleClear}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              {(['overview', 'renders', 'network', 'operations'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 capitalize transition-colors ${
                    activeTab === tab 
                      ? 'bg-gray-800 text-purple-400 border-b-2 border-purple-400' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              {!performanceData ? (
                <div className="text-center text-gray-400 py-12">
                  {isRecording 
                    ? 'Recording performance data...' 
                    : 'Start recording or refresh to see performance data'}
                </div>
              ) : (
                <>
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-800 p-4 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400">FPS</span>
                          <Zap className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div className="text-2xl font-bold">
                          {performanceData.averageFPS.toFixed(1)}
                        </div>
                        <div className={`text-sm ${
                          performanceData.averageFPS >= 50 ? 'text-green-400' : 
                          performanceData.averageFPS >= 30 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {performanceData.averageFPS >= 50 ? 'Excellent' : 
                           performanceData.averageFPS >= 30 ? 'Good' : 'Poor'}
                        </div>
                      </div>

                      <div className="bg-gray-800 p-4 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400">Memory</span>
                          <Database className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold">
                          {performanceData.memoryUsage 
                            ? formatBytes(performanceData.memoryUsage)
                            : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-400">Heap Size</div>
                      </div>

                      <div className="bg-gray-800 p-4 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400">Network</span>
                          <Globe className="w-4 h-4 text-green-400" />
                        </div>
                        <div className="text-2xl font-bold">
                          {performanceData.networkMetrics.requestCount}
                        </div>
                        <div className="text-sm text-gray-400">Requests</div>
                      </div>

                      <div className="bg-gray-800 p-4 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400">Latency</span>
                          <Activity className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="text-2xl font-bold">
                          {formatDuration(performanceData.networkMetrics.averageLatency)}
                        </div>
                        <div className="text-sm text-gray-400">Average</div>
                      </div>
                    </div>
                  )}

                  {/* Renders Tab */}
                  {activeTab === 'renders' && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold mb-4">Component Render Performance</h3>
                      {performanceData.renderMetrics.length === 0 ? (
                        <div className="text-gray-400">No render data available</div>
                      ) : (
                        performanceData.renderMetrics.map((metric, i) => (
                          <div key={i} className="bg-gray-800 p-3 rounded flex justify-between items-center">
                            <div>
                              <div className="font-medium">{metric.componentName}</div>
                              <div className="text-sm text-gray-400">
                                {metric.renderCount} renders • 
                                Avg: {formatDuration(metric.averageRenderTime)}
                              </div>
                            </div>
                            {metric.slowRenders > 0 && (
                              <div className="flex items-center gap-2 text-yellow-400">
                                <AlertTriangle className="w-4 h-4" />
                                {metric.slowRenders} slow
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Network Tab */}
                  {activeTab === 'network' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Network Performance</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-800 p-4 rounded">
                          <div className="text-gray-400 mb-2">Total Requests</div>
                          <div className="text-2xl font-bold">
                            {performanceData.networkMetrics.requestCount}
                          </div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded">
                          <div className="text-gray-400 mb-2">Data Transferred</div>
                          <div className="text-2xl font-bold">
                            {formatBytes(performanceData.networkMetrics.totalDataTransferred)}
                          </div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded">
                          <div className="text-gray-400 mb-2">Average Latency</div>
                          <div className="text-2xl font-bold">
                            {formatDuration(performanceData.networkMetrics.averageLatency)}
                          </div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded">
                          <div className="text-gray-400 mb-2">Slow Requests</div>
                          <div className="text-2xl font-bold text-yellow-400">
                            {performanceData.networkMetrics.slowRequests}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Operations Tab */}
                  {activeTab === 'operations' && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold mb-4">Measured Operations</h3>
                      {performanceData.measures.length === 0 ? (
                        <div className="text-gray-400">No operations recorded</div>
                      ) : (
                        performanceData.measures.slice(-20).reverse().map((measure, i) => (
                          <div key={i} className="bg-gray-800 p-3 rounded flex justify-between items-center">
                            <div className="font-medium">{measure.name}</div>
                            <div className={`font-mono ${
                              measure.duration && measure.duration > 100 ? 'text-yellow-400' : 'text-gray-400'
                            }`}>
                              {measure.duration ? formatDuration(measure.duration) : 'N/A'}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PerformanceDashboard;