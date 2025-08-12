/**
 * Database Query Optimizer
 * Provides utilities for optimizing database queries
 */

import logger from './logger';

interface QueryMetrics {
  query: string;
  duration: number;
  rowCount: number;
  timestamp: number;
  params?: any[];
}

interface QueryStats {
  count: number;
  totalDuration: number;
  averageDuration: number;
  maxDuration: number;
  minDuration: number;
  lastExecuted: number;
}

export class QueryOptimizer {
  private queryMetrics: Map<string, QueryMetrics[]> = new Map();
  private queryStats: Map<string, QueryStats> = new Map();
  private slowQueryThreshold = 1000; // 1 second
  private queryCache: Map<string, { result: any; timestamp: number }> = new Map();
  private cacheTTL = 60000; // 1 minute

  /**
   * Profile a database query
   */
  async profileQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    params?: any[]
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;
      
      // Log metrics
      this.logQueryMetrics(queryName, duration, result, params);
      
      // Analyze for optimization opportunities
      this.analyzeQuery(queryName, duration);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.db.error(`Query failed: ${queryName}`, { duration, error });
      throw error;
    }
  }

  /**
   * Log query metrics
   */
  private logQueryMetrics(
    queryName: string,
    duration: number,
    result: any,
    params?: any[]
  ): void {
    const rowCount = Array.isArray(result) ? result.length : 1;
    
    const metric: QueryMetrics = {
      query: queryName,
      duration,
      rowCount,
      timestamp: Date.now(),
      params
    };

    // Store metrics
    if (!this.queryMetrics.has(queryName)) {
      this.queryMetrics.set(queryName, []);
    }
    this.queryMetrics.get(queryName)!.push(metric);

    // Update stats
    this.updateQueryStats(queryName, duration);

    // Log slow queries
    if (duration > this.slowQueryThreshold) {
      logger.performance.slow(queryName, duration, rowCount);
      this.suggestOptimization(queryName, duration, rowCount);
    }
  }

  /**
   * Update query statistics
   */
  private updateQueryStats(queryName: string, duration: number): void {
    const stats = this.queryStats.get(queryName) || {
      count: 0,
      totalDuration: 0,
      averageDuration: 0,
      maxDuration: 0,
      minDuration: Infinity,
      lastExecuted: Date.now()
    };

    stats.count++;
    stats.totalDuration += duration;
    stats.averageDuration = stats.totalDuration / stats.count;
    stats.maxDuration = Math.max(stats.maxDuration, duration);
    stats.minDuration = Math.min(stats.minDuration, duration);
    stats.lastExecuted = Date.now();

    this.queryStats.set(queryName, stats);
  }

  /**
   * Analyze query for optimization opportunities
   */
  private analyzeQuery(queryName: string, duration: number): void {
    const stats = this.queryStats.get(queryName);
    if (!stats) return;

    // Check for N+1 query problems
    if (stats.count > 100 && stats.averageDuration < 50) {
      logger.warn(`Potential N+1 query detected: ${queryName}`, {
        count: stats.count,
        avgDuration: stats.averageDuration
      });
    }

    // Check for consistently slow queries
    if (stats.count > 10 && stats.averageDuration > this.slowQueryThreshold) {
      logger.warn(`Consistently slow query: ${queryName}`, {
        avgDuration: stats.averageDuration,
        executions: stats.count
      });
    }
  }

  /**
   * Suggest query optimizations
   */
  private suggestOptimization(queryName: string, duration: number, rowCount: number): void {
    const suggestions: string[] = [];

    // Large result set
    if (rowCount > 1000) {
      suggestions.push('Consider pagination or limiting results');
      suggestions.push('Add appropriate indexes');
    }

    // Long execution time
    if (duration > 5000) {
      suggestions.push('Review query execution plan');
      suggestions.push('Consider query restructuring');
      suggestions.push('Check for missing indexes');
    }

    // Frequent execution
    const stats = this.queryStats.get(queryName);
    if (stats && stats.count > 100) {
      suggestions.push('Consider caching results');
      suggestions.push('Batch similar queries');
    }

    if (suggestions.length > 0) {
      logger.info(`Query optimization suggestions for ${queryName}:`, suggestions);
    }
  }

  /**
   * Cache query results
   */
  async cachedQuery<T>(
    cacheKey: string,
    queryFn: () => Promise<T>,
    ttl: number = this.cacheTTL
  ): Promise<T> {
    // Check cache
    const cached = this.queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < ttl) {
      logger.debug(`Cache hit: ${cacheKey}`);
      return cached.result;
    }

    // Execute query
    const result = await queryFn();

    // Cache result
    this.queryCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });

    // Clean old cache entries
    this.cleanCache();

    return result;
  }

  /**
   * Clean old cache entries
   */
  private cleanCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.queryCache.forEach((entry, key) => {
      if (now - entry.timestamp > this.cacheTTL * 2) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.queryCache.delete(key));
  }

  /**
   * Batch multiple queries
   */
  async batchQueries<T>(queries: Array<() => Promise<T>>): Promise<T[]> {
    const startTime = Date.now();
    
    try {
      const results = await Promise.all(queries);
      const duration = Date.now() - startTime;
      
      logger.info(`Batched ${queries.length} queries in ${duration}ms`);
      
      return results;
    } catch (error) {
      logger.error('Batch query failed:', error);
      throw error;
    }
  }

  /**
   * Get query statistics report
   */
  getReport(): {
    totalQueries: number;
    slowQueries: number;
    averageQueryTime: number;
    topSlowQueries: Array<{ name: string; stats: QueryStats }>;
    mostFrequentQueries: Array<{ name: string; stats: QueryStats }>;
  } {
    const allStats = Array.from(this.queryStats.entries()).map(([name, stats]) => ({
      name,
      stats
    }));

    const totalQueries = allStats.reduce((sum, { stats }) => sum + stats.count, 0);
    const totalDuration = allStats.reduce((sum, { stats }) => sum + stats.totalDuration, 0);
    const averageQueryTime = totalQueries > 0 ? totalDuration / totalQueries : 0;

    const slowQueries = allStats.filter(({ stats }) => 
      stats.averageDuration > this.slowQueryThreshold
    ).length;

    const topSlowQueries = [...allStats]
      .sort((a, b) => b.stats.averageDuration - a.stats.averageDuration)
      .slice(0, 10);

    const mostFrequentQueries = [...allStats]
      .sort((a, b) => b.stats.count - a.stats.count)
      .slice(0, 10);

    return {
      totalQueries,
      slowQueries,
      averageQueryTime,
      topSlowQueries,
      mostFrequentQueries
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.queryMetrics.clear();
    this.queryStats.clear();
    this.queryCache.clear();
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): {
    metrics: Array<{ name: string; data: QueryMetrics[] }>;
    stats: Array<{ name: string; stats: QueryStats }>;
  } {
    return {
      metrics: Array.from(this.queryMetrics.entries()).map(([name, data]) => ({
        name,
        data
      })),
      stats: Array.from(this.queryStats.entries()).map(([name, stats]) => ({
        name,
        stats
      }))
    };
  }
}

// Singleton instance
export const queryOptimizer = new QueryOptimizer();

// Helper function for easy profiling
export async function profileQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  params?: any[]
): Promise<T> {
  return queryOptimizer.profileQuery(queryName, queryFn, params);
}

// Helper function for cached queries
export async function cachedQuery<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  return queryOptimizer.cachedQuery(cacheKey, queryFn, ttl);
}

export default queryOptimizer;