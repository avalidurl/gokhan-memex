/**
 * Performance Dashboard Utilities
 * Debug mode, reporting, and performance insights for development
 */

import { PerformanceMonitor, type WebVitalsMetrics, type CustomPerformanceMetrics, getRating } from './performance';
import { getAnalytics } from './analytics';

export interface DashboardConfig {
  enabled: boolean;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  minimized: boolean;
  autoUpdate: boolean;
  updateInterval: number; // milliseconds
  showAlerts: boolean;
}

export interface PerformanceBudgetConfig {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
  inp: number;
}

export interface AlertConfig {
  enabled: boolean;
  budgetFailures: boolean;
  slowMetrics: boolean;
  memoryUsage: boolean;
  networkIssues: boolean;
}

/**
 * Performance Dashboard Class
 * Provides real-time performance insights and debugging information
 */
export class PerformanceDashboard {
  private config: DashboardConfig;
  private budgetConfig: PerformanceBudgetConfig;
  private alertConfig: AlertConfig;
  private performanceMonitor: PerformanceMonitor;
  private dashboardElement: HTMLElement | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor(
    performanceMonitor: PerformanceMonitor,
    config: Partial<DashboardConfig> = {},
    budgetConfig: Partial<PerformanceBudgetConfig> = {},
    alertConfig: Partial<AlertConfig> = {}
  ) {
    this.performanceMonitor = performanceMonitor;
    this.config = {
      enabled: true,
      position: 'bottom-right',
      minimized: false,
      autoUpdate: true,
      updateInterval: 2000,
      showAlerts: true,
      ...config
    };
    this.budgetConfig = {
      lcp: 2500,
      fid: 100,
      cls: 0.1,
      fcp: 1800,
      ttfb: 800,
      inp: 200,
      ...budgetConfig
    };
    this.alertConfig = {
      enabled: true,
      budgetFailures: true,
      slowMetrics: true,
      memoryUsage: true,
      networkIssues: true,
      ...alertConfig
    };

    this.init();
  }

  /**
   * Initialize dashboard
   */
  private init(): void {
    if (this.isInitialized || typeof window === 'undefined' || !this.config.enabled) {
      return;
    }

    this.createDashboard();
    this.setupEventListeners();
    this.startAutoUpdate();
    this.isInitialized = true;

    console.log('🎯 Performance dashboard initialized');
  }

  /**
   * Create dashboard UI
   */
  private createDashboard(): void {
    this.dashboardElement = document.createElement('div');
    this.dashboardElement.id = 'performance-dashboard';
    this.dashboardElement.className = this.getDashboardClasses();
    
    this.updateDashboardContent();
    document.body.appendChild(this.dashboardElement);

    // Add dashboard styles
    this.injectStyles();
  }

  /**
   * Get dashboard CSS classes
   */
  private getDashboardClasses(): string {
    const baseClasses = 'perf-dashboard';
    const positionClass = `perf-dashboard--${this.config.position}`;
    const stateClass = this.config.minimized ? 'perf-dashboard--minimized' : 'perf-dashboard--expanded';
    
    return `${baseClasses} ${positionClass} ${stateClass}`;
  }

  /**
   * Update dashboard content
   */
  private updateDashboardContent(): void {
    if (!this.dashboardElement) return;

    const metrics = this.performanceMonitor.getMetrics();
    const report = this.performanceMonitor.generateReport();
    
    this.dashboardElement.innerHTML = this.config.minimized
      ? this.renderMinimizedView(metrics)
      : this.renderExpandedView(metrics, report);
  }

  /**
   * Render minimized view
   */
  private renderMinimizedView(metrics: { webVitals: WebVitalsMetrics; customMetrics: CustomPerformanceMetrics }): string {
    const { webVitals } = metrics;
    const score = this.calculatePerformanceScore(webVitals);
    const scoreClass = this.getScoreClass(score);

    return `
      <div class="perf-dashboard__minimized">
        <button class="perf-dashboard__toggle" onclick="window.performanceDashboard?.toggle()">
          <span class="perf-dashboard__score perf-dashboard__score--${scoreClass}">${score}</span>
          <span class="perf-dashboard__label">Perf</span>
        </button>
      </div>
    `;
  }

  /**
   * Render expanded view
   */
  private renderExpandedView(
    metrics: { webVitals: WebVitalsMetrics; customMetrics: CustomPerformanceMetrics },
    report: any
  ): string {
    const { webVitals, customMetrics } = metrics;
    const score = this.calculatePerformanceScore(webVitals);
    const scoreClass = this.getScoreClass(score);

    return `
      <div class="perf-dashboard__expanded">
        <div class="perf-dashboard__header">
          <div class="perf-dashboard__title">
            <span class="perf-dashboard__score perf-dashboard__score--${scoreClass}">${score}</span>
            <span class="perf-dashboard__title-text">Performance</span>
          </div>
          <div class="perf-dashboard__controls">
            <button class="perf-dashboard__btn" onclick="window.performanceDashboard?.refresh()">↻</button>
            <button class="perf-dashboard__btn" onclick="window.performanceDashboard?.exportReport()">⇩</button>
            <button class="perf-dashboard__toggle" onclick="window.performanceDashboard?.toggle()">−</button>
          </div>
        </div>
        
        <div class="perf-dashboard__content">
          <div class="perf-dashboard__section">
            <h4>Core Web Vitals</h4>
            ${this.renderWebVitalsMetrics(webVitals)}
          </div>
          
          <div class="perf-dashboard__section">
            <h4>Custom Metrics</h4>
            ${this.renderCustomMetrics(customMetrics)}
          </div>
          
          <div class="perf-dashboard__section">
            <h4>Budget Status</h4>
            ${this.renderBudgetStatus(report.budgetStatus)}
          </div>
          
          <div class="perf-dashboard__section">
            <h4>Device Info</h4>
            ${this.renderDeviceInfo(report.deviceInfo)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render Core Web Vitals metrics
   */
  private renderWebVitalsMetrics(webVitals: WebVitalsMetrics): string {
    const metrics = [
      { name: 'LCP', value: webVitals.lcp, unit: 'ms', key: 'lcp' as const },
      { name: 'FID', value: webVitals.fid, unit: 'ms', key: 'fid' as const },
      { name: 'CLS', value: webVitals.cls, unit: '', key: 'cls' as const },
      { name: 'FCP', value: webVitals.fcp, unit: 'ms', key: 'fcp' as const },
      { name: 'TTFB', value: webVitals.ttfb, unit: 'ms', key: 'ttfb' as const },
      { name: 'INP', value: webVitals.inp, unit: 'ms', key: 'inp' as const }
    ];

    return metrics
      .map(({ name, value, unit, key }) => {
        const rating = getRating(key, value);
        const displayValue = value !== null ? `${value}${unit}` : '—';
        
        return `
          <div class="perf-dashboard__metric perf-dashboard__metric--${rating}">
            <span class="perf-dashboard__metric-name">${name}</span>
            <span class="perf-dashboard__metric-value">${displayValue}</span>
          </div>
        `;
      })
      .join('');
  }

  /**
   * Render custom metrics
   */
  private renderCustomMetrics(customMetrics: CustomPerformanceMetrics): string {
    const metrics = [
      { name: 'DOM Ready', value: customMetrics.domContentLoaded },
      { name: 'Window Load', value: customMetrics.windowLoad },
      { name: 'Font Load', value: customMetrics.fontLoadTime },
      { name: 'Image Load', value: customMetrics.imageLoadTime },
      { name: 'Lazy Load', value: customMetrics.lazyLoadTime }
    ];

    return metrics
      .map(({ name, value }) => {
        const displayValue = value !== null ? `${value}ms` : '—';
        const rating = this.getCustomMetricRating(value);
        
        return `
          <div class="perf-dashboard__metric perf-dashboard__metric--${rating}">
            <span class="perf-dashboard__metric-name">${name}</span>
            <span class="perf-dashboard__metric-value">${displayValue}</span>
          </div>
        `;
      })
      .join('');
  }

  /**
   * Render budget status
   */
  private renderBudgetStatus(budgetStatus: Record<string, 'pass' | 'fail'>): string {
    return Object.entries(budgetStatus)
      .map(([metric, status]) => {
        const statusIcon = status === 'pass' ? '✅' : '❌';
        return `
          <div class="perf-dashboard__budget-item perf-dashboard__budget-item--${status}">
            <span class="perf-dashboard__budget-metric">${metric.toUpperCase()}</span>
            <span class="perf-dashboard__budget-status">${statusIcon}</span>
          </div>
        `;
      })
      .join('');
  }

  /**
   * Render device information
   */
  private renderDeviceInfo(deviceInfo: any): string {
    return `
      <div class="perf-dashboard__device-info">
        <div><strong>Connection:</strong> ${deviceInfo.connection || 'Unknown'}</div>
        <div><strong>Memory:</strong> ${deviceInfo.memory ? `${deviceInfo.memory}GB` : 'Unknown'}</div>
      </div>
    `;
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(webVitals: WebVitalsMetrics): number {
    let score = 100;
    let validMetrics = 0;

    // LCP scoring
    if (webVitals.lcp !== null) {
      validMetrics++;
      if (webVitals.lcp > 4000) score -= 30;
      else if (webVitals.lcp > 2500) score -= 15;
    }

    // FID scoring
    if (webVitals.fid !== null) {
      validMetrics++;
      if (webVitals.fid > 300) score -= 30;
      else if (webVitals.fid > 100) score -= 15;
    }

    // CLS scoring
    if (webVitals.cls !== null) {
      validMetrics++;
      if (webVitals.cls > 0.25) score -= 30;
      else if (webVitals.cls > 0.1) score -= 15;
    }

    // FCP scoring
    if (webVitals.fcp !== null) {
      validMetrics++;
      if (webVitals.fcp > 3000) score -= 20;
      else if (webVitals.fcp > 1800) score -= 10;
    }

    return validMetrics === 0 ? 0 : Math.max(0, Math.round(score));
  }

  /**
   * Get score class for styling
   */
  private getScoreClass(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Get custom metric rating
   */
  private getCustomMetricRating(value: number | null): string {
    if (value === null) return 'unknown';
    if (value < 1000) return 'good';
    if (value < 3000) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Expose dashboard methods globally
    (window as any).performanceDashboard = {
      toggle: () => this.toggle(),
      refresh: () => this.refresh(),
      exportReport: () => this.exportReport(),
      show: () => this.show(),
      hide: () => this.hide()
    };

    // Listen for performance alerts
    this.setupAlertSystem();
  }

  /**
   * Setup alert system
   */
  private setupAlertSystem(): void {
    if (!this.alertConfig.enabled) return;

    // Check for budget failures every 5 seconds
    setInterval(() => {
      if (this.alertConfig.budgetFailures) {
        this.checkBudgetFailures();
      }
      
      if (this.alertConfig.memoryUsage) {
        this.checkMemoryUsage();
      }
      
      if (this.alertConfig.networkIssues) {
        this.checkNetworkIssues();
      }
    }, 5000);
  }

  /**
   * Check for budget failures
   */
  private checkBudgetFailures(): void {
    const report = this.performanceMonitor.generateReport();
    const failures = Object.entries(report.budgetStatus).filter(([, status]) => status === 'fail');
    
    if (failures.length > 0) {
      this.showAlert('Budget Failure', `${failures.length} performance budget(s) exceeded: ${failures.map(([name]) => name).join(', ')}`);
    }
  }

  /**
   * Check memory usage
   */
  private checkMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      
      if (usedPercent > 80) {
        this.showAlert('Memory Warning', `High memory usage: ${Math.round(usedPercent)}%`);
      }
    }
  }

  /**
   * Check for network issues
   */
  private checkNetworkIssues(): void {
    const connection = (navigator as any).connection;
    if (connection && connection.effectiveType) {
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        this.showAlert('Network Warning', 'Slow connection detected');
      }
    }
  }

  /**
   * Show alert
   */
  private showAlert(title: string, message: string): void {
    if (!this.config.showAlerts) return;

    console.warn(`⚠️ Performance Alert - ${title}: ${message}`);
    
    // Track alert in analytics
    const analytics = getAnalytics();
    if (analytics) {
      analytics.trackEvent({
        action: 'performance_alert',
        category: 'Performance',
        label: title,
        custom_parameters: { message }
      });
    }
  }

  /**
   * Start auto-update
   */
  private startAutoUpdate(): void {
    if (!this.config.autoUpdate) return;

    this.updateInterval = setInterval(() => {
      this.updateDashboardContent();
    }, this.config.updateInterval);
  }

  /**
   * Stop auto-update
   */
  private stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Toggle dashboard visibility
   */
  public toggle(): void {
    this.config.minimized = !this.config.minimized;
    if (this.dashboardElement) {
      this.dashboardElement.className = this.getDashboardClasses();
      this.updateDashboardContent();
    }
  }

  /**
   * Show dashboard
   */
  public show(): void {
    this.config.enabled = true;
    if (this.dashboardElement) {
      this.dashboardElement.style.display = 'block';
    } else {
      this.createDashboard();
    }
  }

  /**
   * Hide dashboard
   */
  public hide(): void {
    this.config.enabled = false;
    if (this.dashboardElement) {
      this.dashboardElement.style.display = 'none';
    }
  }

  /**
   * Refresh dashboard
   */
  public refresh(): void {
    this.updateDashboardContent();
  }

  /**
   * Export performance report
   */
  public exportReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      performance: this.performanceMonitor.generateReport(),
      analytics: getAnalytics()?.generateReport()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('📊 Performance report exported:', report);
  }

  /**
   * Destroy dashboard
   */
  public destroy(): void {
    this.stopAutoUpdate();
    if (this.dashboardElement) {
      this.dashboardElement.remove();
      this.dashboardElement = null;
    }
    this.isInitialized = false;
  }

  /**
   * Inject dashboard styles
   */
  private injectStyles(): void {
    if (document.getElementById('performance-dashboard-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'performance-dashboard-styles';
    styles.textContent = `
      .perf-dashboard {
        position: fixed;
        z-index: 9999;
        font-family: monospace;
        font-size: 12px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
      }
      
      .perf-dashboard--top-left { top: 10px; left: 10px; }
      .perf-dashboard--top-right { top: 10px; right: 10px; }
      .perf-dashboard--bottom-left { bottom: 10px; left: 10px; }
      .perf-dashboard--bottom-right { bottom: 10px; right: 10px; }
      
      .perf-dashboard--minimized { width: 60px; height: 60px; }
      .perf-dashboard--expanded { width: 320px; max-height: 80vh; overflow-y: auto; }
      
      .perf-dashboard__minimized {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
      
      .perf-dashboard__toggle {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: 8px;
      }
      
      .perf-dashboard__score {
        font-size: 18px;
        font-weight: bold;
        line-height: 1;
      }
      
      .perf-dashboard__score--excellent { color: #10b981; }
      .perf-dashboard__score--good { color: #f59e0b; }
      .perf-dashboard__score--needs-improvement { color: #f97316; }
      .perf-dashboard__score--poor { color: #ef4444; }
      
      .perf-dashboard__label {
        font-size: 8px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .perf-dashboard__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .perf-dashboard__title {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .perf-dashboard__title-text {
        font-weight: bold;
      }
      
      .perf-dashboard__controls {
        display: flex;
        gap: 4px;
      }
      
      .perf-dashboard__btn {
        background: none;
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 3px;
        font-size: 11px;
      }
      
      .perf-dashboard__btn:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      
      .perf-dashboard__content {
        padding: 0;
        max-height: 60vh;
        overflow-y: auto;
      }
      
      .perf-dashboard__section {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding: 12px;
      }
      
      .perf-dashboard__section:last-child {
        border-bottom: none;
      }
      
      .perf-dashboard__section h4 {
        margin: 0 0 8px 0;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #9ca3af;
      }
      
      .perf-dashboard__metric {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 4px 0;
        padding: 4px 6px;
        border-radius: 3px;
      }
      
      .perf-dashboard__metric--good { background: rgba(16, 185, 129, 0.1); }
      .perf-dashboard__metric--needs-improvement { background: rgba(245, 158, 11, 0.1); }
      .perf-dashboard__metric--poor { background: rgba(239, 68, 68, 0.1); }
      .perf-dashboard__metric--unknown { background: rgba(107, 114, 128, 0.1); }
      
      .perf-dashboard__metric-name {
        font-size: 10px;
        color: #d1d5db;
      }
      
      .perf-dashboard__metric-value {
        font-weight: bold;
        font-size: 11px;
      }
      
      .perf-dashboard__budget-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 4px 0;
        padding: 4px 6px;
        border-radius: 3px;
      }
      
      .perf-dashboard__budget-item--pass { background: rgba(16, 185, 129, 0.1); }
      .perf-dashboard__budget-item--fail { background: rgba(239, 68, 68, 0.1); }
      
      .perf-dashboard__budget-metric {
        font-size: 10px;
        color: #d1d5db;
      }
      
      .perf-dashboard__device-info div {
        margin: 4px 0;
        font-size: 10px;
        color: #d1d5db;
      }
      
      .perf-dashboard__device-info strong {
        color: white;
      }
    `;
    
    document.head.appendChild(styles);
  }
}

/**
 * Initialize performance dashboard
 */
export function initializePerformanceDashboard(
  performanceMonitor: PerformanceMonitor,
  config?: Partial<DashboardConfig>
): PerformanceDashboard {
  return new PerformanceDashboard(performanceMonitor, config);
}

/**
 * Performance debugging utilities
 */
export const performanceDebug = {
  /**
   * Log current performance metrics
   */
  logMetrics(): void {
    if (typeof window !== 'undefined' && (window as any).performanceMonitor) {
      const monitor = (window as any).performanceMonitor as PerformanceMonitor;
      console.table(monitor.getMetrics());
    }
  },

  /**
   * Log performance report
   */
  logReport(): void {
    if (typeof window !== 'undefined' && (window as any).performanceMonitor) {
      const monitor = (window as any).performanceMonitor as PerformanceMonitor;
      console.log(monitor.generateReport());
    }
  },

  /**
   * Measure function performance
   */
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`⏱️ ${name}: ${Math.round(end - start)}ms`);
    return result;
  },

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    console.log('🚀 Starting performance monitoring...');
    
    // Enable performance observer for all metrics
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.log(`📊 ${entry.entryType}:`, entry);
      });
    });

    try {
      observer.observe({ entryTypes: ['measure', 'mark', 'navigation', 'resource'] });
    } catch (e) {
      console.warn('Some performance observers not supported:', e);
    }

    (window as any).perfObserver = observer;
  },

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if ((window as any).perfObserver) {
      (window as any).perfObserver.disconnect();
      delete (window as any).perfObserver;
      console.log('⏹️ Performance monitoring stopped');
    }
  }
};

// Expose debug utilities globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).performanceDebug = performanceDebug;
}