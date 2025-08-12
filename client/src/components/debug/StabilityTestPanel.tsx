/**
 * Stability Test Panel Component
 * UI for running and monitoring stability tests
 */

import React, { useState } from 'react';
import { stabilityTester } from '@/lib/utils/stabilityTester';
import { 
  Shield, 
  Play, 
  Square, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  RefreshCw,
  Zap
} from 'lucide-react';

interface TestResult {
  testName: string;
  passed: boolean;
  duration: number;
  errors: string[];
  warnings: string[];
  metrics?: Record<string, any>;
}

export const StabilityTestPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      const results = await stabilityTester.runAllTests();
      setTestResults(results);
    } catch (error) {
      console.error('Failed to run stability tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const abortTests = () => {
    stabilityTester.abort();
    setIsRunning(false);
  };

  const exportReport = () => {
    const report = stabilityTester.generateReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stability-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const runStressTest = async () => {
    setIsRunning(true);
    
    try {
      await stabilityTester.runStressTest({
        name: 'Quick Stress Test',
        iterations: 100,
        delayMs: 10,
        action: async () => {
          // Simulate some work
          const data = new Array(1000).fill(0).map(() => Math.random());
          data.sort();
        }
      });
    } catch (error) {
      console.error('Stress test failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getTestIcon = (passed: boolean) => {
    return passed 
      ? <CheckCircle className="w-4 h-4 text-green-500" />
      : <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getTestStats = () => {
    const passed = testResults.filter(r => r.passed).length;
    const failed = testResults.filter(r => !r.passed).length;
    const totalDuration = testResults.reduce((sum, r) => sum + r.duration, 0);
    
    return { passed, failed, totalDuration };
  };

  // Show in all environments for debugging
  // if (process.env.NODE_ENV !== 'development') {
  //   return null;
  // }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-16 z-50 bg-green-600 text-white p-3 rounded-lg shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center"
        title="Stability Tests"
        style={{ width: '48px', height: '48px' }}
      >
        <Shield className="w-6 h-6" />
      </button>

      {/* Test Panel Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-900 text-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="w-6 h-6 text-green-400" />
                  Stability Testing
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
                {!isRunning ? (
                  <>
                    <button
                      onClick={runTests}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Run All Tests
                    </button>
                    <button
                      onClick={runStressTest}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded transition-colors"
                    >
                      <Zap className="w-4 h-4" />
                      Quick Stress Test
                    </button>
                  </>
                ) : (
                  <button
                    onClick={abortTests}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                  >
                    <Square className="w-4 h-4" />
                    Abort Tests
                  </button>
                )}
                
                {testResults.length > 0 && (
                  <button
                    onClick={exportReport}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export Report
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 160px)' }}>
              {isRunning && testResults.length === 0 && (
                <div className="text-center py-12">
                  <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-green-400" />
                  <p className="text-gray-400">Running stability tests...</p>
                </div>
              )}

              {testResults.length > 0 && (
                <>
                  {/* Summary */}
                  <div className="bg-gray-800 p-4 rounded mb-4">
                    <h3 className="text-lg font-semibold mb-2">Test Summary</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-gray-400">Passed:</span>
                        <span className="ml-2 text-green-400 font-bold">
                          {getTestStats().passed}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Failed:</span>
                        <span className="ml-2 text-red-400 font-bold">
                          {getTestStats().failed}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Duration:</span>
                        <span className="ml-2 font-bold">
                          {getTestStats().totalDuration.toFixed(0)}ms
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Test Results */}
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`bg-gray-800 p-3 rounded cursor-pointer hover:bg-gray-700 transition-colors ${
                          selectedTest === result ? 'ring-2 ring-green-500' : ''
                        }`}
                        onClick={() => setSelectedTest(result === selectedTest ? null : result)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {getTestIcon(result.passed)}
                            <span className="font-medium">{result.testName}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400">
                              {result.duration.toFixed(2)}ms
                            </span>
                            {result.warnings.length > 0 && (
                              <div className="flex items-center gap-1 text-yellow-400">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-sm">{result.warnings.length}</span>
                              </div>
                            )}
                            {result.errors.length > 0 && (
                              <div className="flex items-center gap-1 text-red-400">
                                <XCircle className="w-4 h-4" />
                                <span className="text-sm">{result.errors.length}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {selectedTest === result && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            {result.errors.length > 0 && (
                              <div className="mb-2">
                                <span className="text-red-400 font-semibold">Errors:</span>
                                <ul className="mt-1 text-sm text-gray-400">
                                  {result.errors.map((error, i) => (
                                    <li key={i}>• {error}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {result.warnings.length > 0 && (
                              <div className="mb-2">
                                <span className="text-yellow-400 font-semibold">Warnings:</span>
                                <ul className="mt-1 text-sm text-gray-400">
                                  {result.warnings.map((warning, i) => (
                                    <li key={i}>• {warning}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {result.metrics && (
                              <div>
                                <span className="text-blue-400 font-semibold">Metrics:</span>
                                <pre className="mt-1 text-xs text-gray-400 overflow-x-auto">
                                  {JSON.stringify(result.metrics, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {!isRunning && testResults.length === 0 && (
                <div className="text-center text-gray-400 py-12">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Click "Run All Tests" to start stability testing</p>
                  <p className="text-sm mt-2">Tests will check memory, performance, and error recovery</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StabilityTestPanel;