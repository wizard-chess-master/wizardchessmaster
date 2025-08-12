/**
 * Bundle Analyzer
 * Analyzes and reports on bundle size and dependencies
 */

import { logger } from '../utils/clientLogger';

interface ModuleInfo {
  name: string;
  size: number;
  type: 'vendor' | 'app' | 'chunk';
  critical: boolean;
}

interface BundleAnalysis {
  totalSize: number;
  vendorSize: number;
  appSize: number;
  chunkSize: number;
  largestModules: ModuleInfo[];
  unusedExports: string[];
  duplicates: string[];
  recommendations: string[];
}

export class BundleAnalyzer {
  private modules: ModuleInfo[] = [];
  private scriptElements: HTMLScriptElement[] = [];

  constructor() {
    this.analyzeLoadedScripts();
  }

  private analyzeLoadedScripts() {
    // Analyze all script tags
    this.scriptElements = Array.from(document.querySelectorAll('script[src]'));
    
    this.scriptElements.forEach(script => {
      const src = script.src;
      const isVendor = src.includes('vendor') || src.includes('node_modules');
      const isChunk = src.includes('chunk');
      const isCritical = !script.async && !script.defer;
      
      // Try to get size from performance API
      const resourceEntry = performance.getEntriesByName(src)[0] as any;
      const size = resourceEntry?.transferSize || 0;
      
      this.modules.push({
        name: src.split('/').pop() || 'unknown',
        size: size / 1024, // Convert to KB
        type: isVendor ? 'vendor' : isChunk ? 'chunk' : 'app',
        critical: isCritical
      });
    });
  }

  // Analyze bundle composition
  analyzeBundleComposition(): BundleAnalysis {
    const totalSize = this.modules.reduce((acc, m) => acc + m.size, 0);
    const vendorSize = this.modules
      .filter(m => m.type === 'vendor')
      .reduce((acc, m) => acc + m.size, 0);
    const appSize = this.modules
      .filter(m => m.type === 'app')
      .reduce((acc, m) => acc + m.size, 0);
    const chunkSize = this.modules
      .filter(m => m.type === 'chunk')
      .reduce((acc, m) => acc + m.size, 0);

    // Sort modules by size
    const largestModules = [...this.modules]
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    // Check for common large dependencies
    const unusedExports = this.detectUnusedExports();
    const duplicates = this.detectDuplicates();
    const recommendations = this.generateRecommendations(totalSize, vendorSize);

    return {
      totalSize,
      vendorSize,
      appSize,
      chunkSize,
      largestModules,
      unusedExports,
      duplicates,
      recommendations
    };
  }

  private detectUnusedExports(): string[] {
    const unused: string[] = [];
    
    // Check for commonly unused imports
    const checkPatterns = [
      { pattern: 'moment', suggestion: 'Consider date-fns for smaller bundle' },
      { pattern: 'lodash', suggestion: 'Use lodash-es for tree-shaking' },
      { pattern: '@mui', suggestion: 'Import MUI components individually' },
      { pattern: 'react-icons', suggestion: 'Import icons individually' }
    ];

    this.scriptElements.forEach(script => {
      checkPatterns.forEach(({ pattern, suggestion }) => {
        if (script.src.includes(pattern)) {
          unused.push(suggestion);
        }
      });
    });

    return [...new Set(unused)];
  }

  private detectDuplicates(): string[] {
    const duplicates: string[] = [];
    const seen = new Set<string>();
    
    // Simple duplicate detection based on file names
    this.modules.forEach(module => {
      const baseName = module.name.replace(/\.\w+$/, '').replace(/-\w+$/, '');
      if (seen.has(baseName)) {
        duplicates.push(baseName);
      }
      seen.add(baseName);
    });

    return duplicates;
  }

  private generateRecommendations(totalSize: number, vendorSize: number): string[] {
    const recommendations: string[] = [];

    // Bundle size recommendations
    if (totalSize > 1500) { // > 1.5MB
      recommendations.push('Total bundle size exceeds 1.5MB - implement code splitting');
    }

    if (vendorSize > 1000) { // > 1MB
      recommendations.push('Vendor bundle is large - review and remove unused dependencies');
    }

    // Check critical render path
    const criticalScripts = this.modules.filter(m => m.critical);
    if (criticalScripts.length > 3) {
      recommendations.push('Too many render-blocking scripts - use async/defer');
    }

    // Specific optimizations
    if (this.modules.some(m => m.name.includes('source-map'))) {
      recommendations.push('Source maps detected in production - disable for better performance');
    }

    // Check for uncompressed assets
    const uncompressed = this.modules.filter(m => !m.name.includes('.gz') && m.size > 100);
    if (uncompressed.length > 0) {
      recommendations.push('Enable gzip/brotli compression for JavaScript files');
    }

    return recommendations;
  }

  // Get optimization priority list
  getOptimizationPriorities(): Array<{ module: string; saving: number; action: string }> {
    const priorities = [];

    // Identify large vendor chunks
    const largeVendors = this.modules
      .filter(m => m.type === 'vendor' && m.size > 200)
      .map(m => ({
        module: m.name,
        saving: Math.round(m.size * 0.3), // Estimate 30% reduction
        action: 'Tree-shake or replace with lighter alternative'
      }));

    priorities.push(...largeVendors);

    // Identify non-critical large chunks
    const largeCritical = this.modules
      .filter(m => m.critical && m.size > 100)
      .map(m => ({
        module: m.name,
        saving: Math.round(m.size * 0.2), // Estimate 20% from lazy loading
        action: 'Lazy load or code split'
      }));

    priorities.push(...largeCritical);

    return priorities.sort((a, b) => b.saving - a.saving).slice(0, 5);
  }

  // Export analysis report
  exportReport(): string {
    const analysis = this.analyzeBundleComposition();
    const priorities = this.getOptimizationPriorities();
    
    const report = [
      '=== Bundle Analysis Report ===',
      '',
      'Bundle Composition:',
      `- Total Size: ${(analysis.totalSize / 1024).toFixed(2)} MB`,
      `- Vendor: ${(analysis.vendorSize / 1024).toFixed(2)} MB (${Math.round(analysis.vendorSize / analysis.totalSize * 100)}%)`,
      `- App Code: ${(analysis.appSize / 1024).toFixed(2)} MB (${Math.round(analysis.appSize / analysis.totalSize * 100)}%)`,
      `- Chunks: ${(analysis.chunkSize / 1024).toFixed(2)} MB (${Math.round(analysis.chunkSize / analysis.totalSize * 100)}%)`,
      '',
      'Largest Modules:',
      ...analysis.largestModules.slice(0, 5).map(m => 
        `- ${m.name}: ${m.size.toFixed(0)} KB (${m.type})`
      ),
      '',
      'Optimization Priorities:',
      ...priorities.map(p => 
        `- ${p.module}: Save ~${p.saving} KB - ${p.action}`
      ),
      '',
      'Recommendations:',
      ...analysis.recommendations.map(r => `- ${r}`),
      '',
      `Generated: ${new Date().toISOString()}`
    ].join('\n');

    return report;
  }
}

// Singleton instance
export const bundleAnalyzer = new BundleAnalyzer();