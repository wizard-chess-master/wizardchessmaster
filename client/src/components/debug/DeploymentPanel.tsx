/**
 * Deployment Panel Component
 * UI for production deployment readiness checks
 */

import React, { useState, useEffect } from 'react';
import { deploymentChecker } from '@/lib/utils/deploymentChecker';
import {
  Rocket,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  Shield,
  Zap,
  Settings,
  Globe,
  Package,
  Database,
  FileText,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface DeploymentCheck {
  name: string;
  category: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface DeploymentReport {
  timestamp: Date;
  environment: string;
  checks: DeploymentCheck[];
  score: number;
  isReady: boolean;
  criticalIssues: number;
  warnings: number;
}

export const DeploymentPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [report, setReport] = useState<DeploymentReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showChecklist, setShowChecklist] = useState(false);
  const [checklist, setChecklist] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && !report) {
      runDeploymentChecks();
    }
  }, [isOpen]);

  const runDeploymentChecks = async () => {
    setIsRunning(true);
    try {
      const result = await deploymentChecker.runChecks();
      setReport(result);
      setChecklist(deploymentChecker.getChecklist());
      
      // Auto-expand categories with issues
      const categoriesWithIssues = new Set<string>();
      result.checks.forEach(check => {
        if (check.status !== 'pass') {
          categoriesWithIssues.add(check.category);
        }
      });
      setExpandedCategories(categoriesWithIssues);
    } catch (error) {
      console.error('Deployment checks failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const exportReport = () => {
    const reportText = deploymentChecker.exportReport();
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deployment-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'build':
        return <Package className="w-4 h-4" />;
      case 'security':
        return <Shield className="w-4 h-4" />;
      case 'performance':
        return <Zap className="w-4 h-4" />;
      case 'configuration':
        return <Settings className="w-4 h-4" />;
      case 'compatibility':
        return <Globe className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400';
      case 'high':
        return 'text-orange-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const categories = ['build', 'security', 'performance', 'configuration', 'compatibility'];

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-40 z-50 bg-purple-600 text-white p-3 rounded-lg shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
        title="Deployment Readiness"
        style={{ width: '48px', height: '48px' }}
      >
        <Rocket className="w-6 h-6" />
      </button>

      {/* Deployment Panel Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-900 text-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Rocket className="w-6 h-6 text-purple-400" />
                  Production Deployment Readiness
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={runDeploymentChecks}
                  disabled={isRunning}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                    isRunning 
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                  {isRunning ? 'Running Checks...' : 'Run Checks'}
                </button>
                <button
                  onClick={() => setShowChecklist(!showChecklist)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  {showChecklist ? 'Hide' : 'Show'} Checklist
                </button>
                <button
                  onClick={exportReport}
                  disabled={!report}
                  className={`ml-auto flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                    report 
                      ? 'bg-gray-600 hover:bg-gray-700' 
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 140px)' }}>
              {isRunning ? (
                <div className="text-center py-12">
                  <Rocket className="w-16 h-16 animate-pulse mx-auto mb-4 text-purple-400" />
                  <p className="text-lg mb-2">Running deployment checks...</p>
                  <p className="text-gray-400">This may take a few moments</p>
                </div>
              ) : report ? (
                <>
                  {/* Summary */}
                  <div className="bg-gray-800 p-6 rounded-lg mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(report.score)}`}>
                          {report.score}%
                        </div>
                        <div className="text-sm text-gray-400">Overall Score</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${
                          report.isReady ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {report.isReady ? '✅' : '❌'}
                        </div>
                        <div className="text-sm text-gray-400">
                          {report.isReady ? 'Ready' : 'Not Ready'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-400">
                          {report.criticalIssues}
                        </div>
                        <div className="text-sm text-gray-400">Critical Issues</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400">
                          {report.warnings}
                        </div>
                        <div className="text-sm text-gray-400">Warnings</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full transition-all ${
                          report.score >= 90 ? 'bg-green-500' :
                          report.score >= 70 ? 'bg-yellow-500' :
                          report.score >= 50 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${report.score}%` }}
                      />
                    </div>

                    {/* Status Message */}
                    <div className="mt-4 text-center">
                      {report.isReady ? (
                        <p className="text-green-400 text-lg">
                          ✅ Application is ready for production deployment!
                        </p>
                      ) : (
                        <p className="text-red-400 text-lg">
                          ❌ Critical issues must be resolved before deployment
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Deployment Checklist */}
                  {showChecklist && (
                    <div className="bg-gray-800 p-4 rounded-lg mb-6">
                      <h3 className="text-lg font-semibold mb-3">Deployment Checklist</h3>
                      <div className="space-y-2">
                        {checklist.map((item, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              className="mt-1"
                              id={`checklist-${index}`}
                            />
                            <label 
                              htmlFor={`checklist-${index}`}
                              className="text-sm text-gray-300 cursor-pointer"
                            >
                              {item}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Check Results by Category */}
                  <div className="space-y-4">
                    {categories.map(category => {
                      const categoryChecks = report.checks.filter(c => c.category === category);
                      if (categoryChecks.length === 0) return null;

                      const passedCount = categoryChecks.filter(c => c.status === 'pass').length;
                      const isExpanded = expandedCategories.has(category);

                      return (
                        <div key={category} className="bg-gray-800 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleCategory(category)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {getCategoryIcon(category)}
                              <span className="font-semibold capitalize">{category}</span>
                              <span className="text-sm text-gray-400">
                                ({passedCount}/{categoryChecks.length} passed)
                              </span>
                            </div>
                            {isExpanded ? 
                              <ChevronDown className="w-4 h-4" /> : 
                              <ChevronRight className="w-4 h-4" />
                            }
                          </button>

                          {isExpanded && (
                            <div className="px-4 pb-4 space-y-2">
                              {categoryChecks.map((check, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-900 p-3 rounded flex items-start gap-3"
                                >
                                  {getStatusIcon(check.status)}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{check.name}</span>
                                      <span className={`text-xs ${getSeverityColor(check.severity)}`}>
                                        [{check.severity}]
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-300 mt-1">
                                      {check.message}
                                    </p>
                                    {check.details && (
                                      <p className="text-sm text-blue-400 mt-1">
                                        → {check.details}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Rocket className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No deployment report available</p>
                  <p className="text-gray-400">Click "Run Checks" to analyze deployment readiness</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeploymentPanel;