/**
 * Browser Compatibility Panel Component
 * UI for displaying browser compatibility information
 */

import React, { useState, useEffect } from 'react';
import { browserCompatibility } from '@/lib/utils/browserCompatibility';
import { 
  Globe, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Info,
  Download,
  RefreshCw,
  Smartphone,
  Monitor,
  Chrome,
  Zap
} from 'lucide-react';

interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  platform: string;
  mobile: boolean;
  features: Record<string, boolean>;
  issues: Array<{
    severity: 'critical' | 'warning' | 'info';
    feature: string;
    description: string;
    workaround?: string;
  }>;
}

export const BrowserCompatibilityPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [compatibilityScore, setCompatibilityScore] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'issues'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !browserInfo) {
      loadBrowserInfo();
    }
  }, [isOpen]);

  const loadBrowserInfo = async () => {
    setIsLoading(true);
    try {
      const info = await browserCompatibility.initialize();
      setBrowserInfo(info);
      setCompatibilityScore(browserCompatibility.getCompatibilityScore());
    } catch (error) {
      console.error('Failed to load browser info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = () => {
    const report = browserCompatibility.getReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `browser-compatibility-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getBrowserIcon = (name: string) => {
    // For simplicity, using Chrome icon for all browsers
    // In a real app, you'd have specific icons
    return <Chrome className="w-5 h-5" />;
  };

  const criticalFeatures = [
    'webSockets',
    'localStorage',
    'canvasSupport',
    'promises',
    'fetch'
  ];

  const renderFeatureGroup = (title: string, features: string[]) => {
    if (!browserInfo) return null;

    return (
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">{title}</h4>
        <div className="grid grid-cols-2 gap-2">
          {features.map(feature => (
            <div key={feature} className="flex items-center gap-2">
              {browserInfo.features[feature] ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">
                {feature.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
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
        className="fixed bottom-4 left-28 z-50 bg-blue-600 text-white p-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        title="Browser Compatibility"
        style={{ width: '48px', height: '48px' }}
      >
        <Globe className="w-6 h-6" />
      </button>

      {/* Compatibility Panel Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-900 text-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Globe className="w-6 h-6 text-blue-400" />
                  Browser Compatibility
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded transition-colors ${
                    activeTab === 'overview' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('features')}
                  className={`px-4 py-2 rounded transition-colors ${
                    activeTab === 'features' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Features
                </button>
                <button
                  onClick={() => setActiveTab('issues')}
                  className={`px-4 py-2 rounded transition-colors ${
                    activeTab === 'issues' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Issues
                </button>
                <button
                  onClick={exportReport}
                  className="ml-auto flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 160px)' }}>
              {isLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-400" />
                  <p className="text-gray-400">Detecting browser capabilities...</p>
                </div>
              ) : browserInfo ? (
                <>
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div>
                      {/* Browser Info */}
                      <div className="bg-gray-800 p-4 rounded mb-4">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          {getBrowserIcon(browserInfo.name)}
                          {browserInfo.name} {browserInfo.version}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-400">Engine:</span>
                            <span className="ml-2">{browserInfo.engine}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Platform:</span>
                            <span className="ml-2">{browserInfo.platform}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Device:</span>
                            <span className="ml-2 flex items-center gap-1 inline-flex">
                              {browserInfo.mobile ? (
                                <>
                                  <Smartphone className="w-4 h-4" />
                                  Mobile
                                </>
                              ) : (
                                <>
                                  <Monitor className="w-4 h-4" />
                                  Desktop
                                </>
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Status:</span>
                            <span className="ml-2">
                              {browserCompatibility.isSupported() ? (
                                <span className="text-green-400">Supported</span>
                              ) : (
                                <span className="text-red-400">Limited Support</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Compatibility Score */}
                      <div className="bg-gray-800 p-4 rounded mb-4">
                        <h3 className="text-lg font-semibold mb-3">Compatibility Score</h3>
                        <div className="flex items-center gap-4">
                          <div className={`text-4xl font-bold ${getScoreColor(compatibilityScore)}`}>
                            {compatibilityScore}%
                          </div>
                          <div className="flex-1">
                            <div className="w-full bg-gray-700 rounded-full h-4">
                              <div
                                className={`h-4 rounded-full transition-all ${
                                  compatibilityScore >= 90 ? 'bg-green-500' :
                                  compatibilityScore >= 70 ? 'bg-yellow-500' :
                                  compatibilityScore >= 50 ? 'bg-orange-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${compatibilityScore}%` }}
                              />
                            </div>
                            <p className="text-sm text-gray-400 mt-2">
                              {browserCompatibility.getRecommendation()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Critical Features Status */}
                      <div className="bg-gray-800 p-4 rounded">
                        <h3 className="text-lg font-semibold mb-3">Critical Features</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {criticalFeatures.map(feature => (
                            <div key={feature} className="flex items-center gap-2">
                              {browserInfo.features[feature] ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                              <span>
                                {feature.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Features Tab */}
                  {activeTab === 'features' && (
                    <div>
                      {renderFeatureGroup('Core Features', [
                        'webSockets', 'localStorage', 'sessionStorage', 'indexedDB',
                        'cookies', 'fetch', 'promises', 'asyncAwait'
                      ])}
                      
                      {renderFeatureGroup('Graphics & Media', [
                        'canvasSupport', 'svgSupport', 'webGL', 'webGL2',
                        'webAudio', 'audioContext', 'mediaDevices'
                      ])}
                      
                      {renderFeatureGroup('CSS Features', [
                        'cssGrid', 'cssFlexbox', 'cssVariables', 'cssTransforms',
                        'cssTransitions', 'cssAnimations'
                      ])}
                      
                      {renderFeatureGroup('Advanced APIs', [
                        'webWorkers', 'serviceWorkers', 'webRTC', 'geolocation',
                        'notifications', 'performanceAPI', 'intersectionObserver', 'resizeObserver'
                      ])}
                    </div>
                  )}

                  {/* Issues Tab */}
                  {activeTab === 'issues' && (
                    <div>
                      {browserInfo.issues.length === 0 ? (
                        <div className="text-center py-12">
                          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                          <p className="text-lg">No compatibility issues detected!</p>
                          <p className="text-gray-400 mt-2">Your browser fully supports all features.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {browserInfo.issues.map((issue, index) => (
                            <div
                              key={index}
                              className={`bg-gray-800 p-4 rounded border-l-4 ${
                                issue.severity === 'critical' ? 'border-red-500' :
                                issue.severity === 'warning' ? 'border-yellow-500' :
                                'border-blue-500'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {getSeverityIcon(issue.severity)}
                                <div className="flex-1">
                                  <h4 className="font-semibold mb-1">
                                    {issue.feature}
                                  </h4>
                                  <p className="text-sm text-gray-300">
                                    {issue.description}
                                  </p>
                                  {issue.workaround && (
                                    <p className="text-sm text-blue-400 mt-2">
                                      <strong>Workaround:</strong> {issue.workaround}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Click refresh to detect browser capabilities</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BrowserCompatibilityPanel;