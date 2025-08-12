/**
 * System Diagnostics Component
 * Displays real-time system health information
 */

import React, { useEffect, useState } from 'react';
import { memoryLeakDetector } from '@/lib/utils/memoryLeakDetector';
import { audioCompatibilityManager } from '@/lib/utils/audioCompatibility';
import { Activity, AlertTriangle, CheckCircle, Cpu, HardDrive, Volume2, Wifi } from 'lucide-react';

interface DiagnosticData {
  memory: {
    current: number;
    limit: number;
    percentage: number;
    trend: 'stable' | 'increasing' | 'decreasing';
  } | null;
  audio: {
    supported: boolean;
    vendor: string;
    limitations: string[];
  };
  websocket: {
    connected: boolean;
    latency: number;
    reconnectCount: number;
  };
  performance: {
    fps: number;
    renderTime: number;
  };
}

export const SystemDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticData>({
    memory: null,
    audio: {
      supported: false,
      vendor: 'unknown',
      limitations: []
    },
    websocket: {
      connected: false,
      latency: 0,
      reconnectCount: 0
    },
    performance: {
      fps: 0,
      renderTime: 0
    }
  });
  
  const [isMinimized, setIsMinimized] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Update diagnostics every 2 seconds
    const interval = setInterval(() => {
      updateDiagnostics();
    }, 2000);

    // Initial update
    updateDiagnostics();

    return () => clearInterval(interval);
  }, []);

  const updateDiagnostics = () => {
    // Memory status
    const memoryStatus = memoryLeakDetector.getMemoryStatus();
    
    // Audio compatibility
    const audioReport = audioCompatibilityManager.getCompatibilityReport();
    
    // WebSocket status (would need to be injected from multiplayer store)
    const wsStatus = getWebSocketStatus();
    
    // Performance metrics
    const perfMetrics = getPerformanceMetrics();

    setDiagnostics({
      memory: memoryStatus,
      audio: {
        supported: audioReport.supported,
        vendor: audioReport.vendor,
        limitations: audioReport.limitations
      },
      websocket: wsStatus,
      performance: perfMetrics
    });
  };

  const getWebSocketStatus = () => {
    // This would be connected to the actual WebSocket manager
    // For now, returning mock data
    const store = (window as any).__multiplayerStore;
    if (store) {
      return {
        connected: store.isConnected || false,
        latency: store.latency || 0,
        reconnectCount: store.reconnectCount || 0
      };
    }
    return {
      connected: false,
      latency: 0,
      reconnectCount: 0
    };
  };

  const getPerformanceMetrics = () => {
    // Calculate FPS
    const fps = (performance as any).memory ? 60 : 0; // Simplified
    const renderTime = performance.now() % 100; // Mock render time
    
    return { fps, renderTime };
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getMemoryStatus = () => {
    if (!diagnostics.memory) return 'error';
    if (diagnostics.memory.percentage > 80) return 'error';
    if (diagnostics.memory.percentage > 60) return 'warning';
    return 'good';
  };

  const formatBytes = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gray-800 text-white p-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
          title="System Diagnostics"
        >
          <Activity className="w-5 h-5" />
        </button>
      ) : (
        <div className="bg-gray-800 text-white rounded-lg shadow-xl p-4 w-80">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Diagnostics
            </h3>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          {/* Memory Status */}
          <div className="mb-3 p-2 bg-gray-700 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1">
                <HardDrive className="w-4 h-4" />
                Memory
              </span>
              {getStatusIcon(getMemoryStatus())}
            </div>
            {diagnostics.memory ? (
              <>
                <div className="text-sm text-gray-300">
                  {formatBytes(diagnostics.memory.current)} / {formatBytes(diagnostics.memory.limit)}
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      diagnostics.memory.percentage > 80 
                        ? 'bg-red-500' 
                        : diagnostics.memory.percentage > 60 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${diagnostics.memory.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Trend: {diagnostics.memory.trend}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-400">Not available</div>
            )}
          </div>

          {/* Audio Status */}
          <div className="mb-3 p-2 bg-gray-700 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1">
                <Volume2 className="w-4 h-4" />
                Audio
              </span>
              {getStatusIcon(diagnostics.audio.supported ? 'good' : 'error')}
            </div>
            <div className="text-sm text-gray-300">
              {diagnostics.audio.vendor} ({diagnostics.audio.supported ? 'Supported' : 'Not Supported'})
            </div>
            {diagnostics.audio.limitations.length > 0 && (
              <div className="text-xs text-yellow-400 mt-1">
                {diagnostics.audio.limitations.length} limitation(s)
              </div>
            )}
          </div>

          {/* WebSocket Status */}
          <div className="mb-3 p-2 bg-gray-700 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1">
                <Wifi className="w-4 h-4" />
                WebSocket
              </span>
              {getStatusIcon(diagnostics.websocket.connected ? 'good' : 'error')}
            </div>
            <div className="text-sm text-gray-300">
              {diagnostics.websocket.connected ? 'Connected' : 'Disconnected'}
            </div>
            {diagnostics.websocket.connected && (
              <div className="text-xs text-gray-400">
                Latency: {diagnostics.websocket.latency}ms | Reconnects: {diagnostics.websocket.reconnectCount}
              </div>
            )}
          </div>

          {/* Performance */}
          <div className="mb-3 p-2 bg-gray-700 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1">
                <Cpu className="w-4 h-4" />
                Performance
              </span>
              {getStatusIcon(diagnostics.performance.fps >= 30 ? 'good' : 'warning')}
            </div>
            <div className="text-sm text-gray-300">
              FPS: {diagnostics.performance.fps} | Render: {diagnostics.performance.renderTime.toFixed(1)}ms
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </button>
            <button
              onClick={() => memoryLeakDetector.forceGarbageCollection()}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm transition-colors"
            >
              Force GC
            </button>
          </div>

          {/* Detailed Information */}
          {showDetails && (
            <div className="mt-3 p-2 bg-gray-900 rounded text-xs">
              <div className="mb-2">
                <strong>Potential Leak Sources:</strong>
                <ul className="mt-1 text-gray-400">
                  {memoryLeakDetector.getPotentialLeakSources().map((source, i) => (
                    <li key={i}>• {source}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Audio Limitations:</strong>
                <ul className="mt-1 text-gray-400">
                  {diagnostics.audio.limitations.map((limitation, i) => (
                    <li key={i}>• {limitation}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SystemDiagnostics;