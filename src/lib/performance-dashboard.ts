// Performance dashboard utilities
export interface DashboardData {
  metrics: {
    loadTime: number;
    memoryUsage: number;
    scriptExecution: number;
    networkRequests: number;
  };
  timestamp: number;
}

export interface PerformanceDashboardConfig {
  enabled?: boolean;
  updateInterval?: number;
  maxDataPoints?: number;
  debug?: boolean;
}

class PerformanceDashboard {
  private config: PerformanceDashboardConfig;
  private data: DashboardData[] = [];
  private updateTimer: number | null = null;

  constructor(config: PerformanceDashboardConfig = {}) {
    this.config = {
      enabled: true,
      updateInterval: 5000, // 5 seconds
      maxDataPoints: 100,
      debug: false,
      ...config
    };
  }

  start() {
    if (!this.config.enabled) return;

    this.updateTimer = window.setInterval(() => {
      this.collectMetrics();
    }, this.config.updateInterval);

    // Collect initial metrics
    this.collectMetrics();
  }

  stop() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  private collectMetrics() {
    const metrics = this.getCurrentMetrics();
    
    const dashboardData: DashboardData = {
      metrics,
      timestamp: Date.now()
    };

    this.data.push(dashboardData);

    // Keep only the most recent data points
    if (this.config.maxDataPoints && this.data.length > this.config.maxDataPoints) {
      this.data = this.data.slice(-this.config.maxDataPoints);
    }

    if (this.config.debug) {
      console.log('Performance dashboard update:', metrics);
    }
  }

  private getCurrentMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
      memoryUsage: (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0,
      scriptExecution: this.getScriptExecutionTime(),
      networkRequests: performance.getEntriesByType('resource').length
    };
  }

  private getScriptExecutionTime(): number {
    const entries = performance.getEntriesByType('measure');
    return entries.reduce((total, entry) => total + entry.duration, 0);
  }

  getData(): DashboardData[] {
    return [...this.data];
  }

  getLatestData(): DashboardData | null {
    return this.data.length > 0 ? this.data[this.data.length - 1] : null;
  }

  clearData() {
    this.data = [];
  }
}

let performanceDashboard: PerformanceDashboard | null = null;

export function initializePerformanceDashboard(config?: PerformanceDashboardConfig): PerformanceDashboard {
  if (!performanceDashboard) {
    performanceDashboard = new PerformanceDashboard(config);
    performanceDashboard.start();
  }
  return performanceDashboard;
}

export function performanceDebug() {
  if (performanceDashboard) {
    const data = performanceDashboard.getLatestData();
    console.table(data?.metrics);
    return data;
  }
  return null;
}
