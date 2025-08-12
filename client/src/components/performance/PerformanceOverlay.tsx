/**
 * Performance Overlay Component
 * Displays real-time performance metrics
 */

import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Wifi, AlertCircle } from 'lucide-react';
import { usePerformanceMetrics, usePerformanceWarnings } from '../../hooks/usePerformance';
import { formatBytes } from '../../lib/performance/utils';

interface PerformanceOverlayProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function PerformanceOverlay({ 
  position = 'bottom-right' 
}: PerformanceOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const metrics = usePerformanceMetrics();
  const warnings = usePerformanceWarnings();
  
  // Toggle visibility with keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + P
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  if (!isVisible) return null;
  
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };
  
  const getFPSColor = (fps: number) => {
    if (fps >= 50) return 'text-green-500';
    if (fps >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const getMemoryColor = (percent: number) => {
    if (percent <= 50) return 'text-green-500';
    if (percent <= 75) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const getLatencyColor = (latency: number) => {
    if (latency <= 100) return 'text-green-500';
    if (latency <= 500) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 bg-black/90 backdrop-blur-sm text-white rounded-lg shadow-xl p-3 font-mono text-xs transition-all duration-300 ${
        isMinimized ? 'w-32' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2 border-b border-gray-700 pb-1">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-cyan-400">Performance</span>
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {isMinimized ? '▶' : '▼'}
        </button>
      </div>
      
      {!isMinimized && (
        <>
          {/* Warnings */}
          {(warnings.lowFPS || warnings.highMemory || warnings.slowNetwork) && (
            <div className="mb-2 p-2 bg-red-900/50 rounded border border-red-500/50">
              <div className="flex items-center gap-1 mb-1">
                <AlertCircle className="w-3 h-3 text-red-400" />
                <span className="text-red-400 text-xs">Performance Issues</span>
              </div>
              {warnings.lowFPS && (
                <div className="text-xs text-red-300">• Low FPS detected</div>
              )}
              {warnings.highMemory && (
                <div className="text-xs text-red-300">• High memory usage</div>
              )}
              {warnings.slowNetwork && (
                <div className="text-xs text-red-300">• Slow network connection</div>
              )}
            </div>
          )}
          
          {/* FPS */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-gray-400" />
              <span className="text-gray-400">FPS</span>
            </div>
            <span className={`font-bold ${getFPSColor(metrics.fps)}`}>
              {metrics.fps}
            </span>
          </div>
          
          {/* Memory */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-gray-400" />
              <span className="text-gray-400">Memory</span>
            </div>
            <div className="text-right">
              <span className={`font-bold ${getMemoryColor(metrics.memory.percent)}`}>
                {formatBytes(metrics.memory.used * 1024 * 1024)}
              </span>
              <div className="text-xs text-gray-500">
                {metrics.memory.percent.toFixed(1)}% used
              </div>
            </div>
          </div>
          
          {/* Render Time */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-gray-400" />
              <span className="text-gray-400">Render</span>
            </div>
            <span className={`font-bold ${
              metrics.renderTime <= 16 ? 'text-green-500' : 'text-yellow-500'
            }`}>
              {metrics.renderTime.toFixed(1)}ms
            </span>
          </div>
          
          {/* Network Latency */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-gray-400" />
              <span className="text-gray-400">Latency</span>
            </div>
            <span className={`font-bold ${getLatencyColor(metrics.networkLatency)}`}>
              {metrics.networkLatency.toFixed(0)}ms
            </span>
          </div>
          
          {/* Cache Hit Rate */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-400">Cache Hit</span>
            <span className={`font-bold ${
              metrics.cacheHitRate >= 0.8 ? 'text-green-500' : 'text-yellow-500'
            }`}>
              {(metrics.cacheHitRate * 100).toFixed(0)}%
            </span>
          </div>
          
          {/* Shortcut hint */}
          <div className="mt-2 pt-2 border-t border-gray-700 text-center text-gray-500">
            Press Ctrl+Shift+P to toggle
          </div>
        </>
      )}
    </div>
  );
}