/**
 * Performance Alerts and Reporting System
 * Automated performance monitoring with alerts and comprehensive reporting
 */

import { PerformanceMonitor, type WebVitalsMetrics, getRating } from './performance';
import { getAnalytics } from './analytics';
import { type RealUserMonitoring } from './rum';

export interface AlertConfig {
  enabled: boolean;
  thresholds: AlertThresholds;
  notifications: NotificationConfig;
  reporting: ReportingConfig;
}

export interface AlertThresholds {
  lcp: { warning: number; critical: number };
  fid: { warning: number; critical: number };
  cls: { warning: number; critical: number };
  fcp: { warning: number; critical: number };
  ttfb: { warning: number; critical: number };
  memoryUsage: { warning: number; critical: number }; // percentage
  errorRate: { warning: number; critical: number }; // per minute
  slowResources: { warning: number; critical: number }; // duration in ms
}

export interface NotificationConfig {
  console: boolean;
  analytics: boolean;
  webhook?: string;
  email?: string;
}

export interface ReportingConfig {
  enabled: boolean;
  interval: number; // milliseconds
  includeUserMetrics: boolean;
  includeResourceTiming: boolean;
  includeErrorLogs: boolean;
  retentionDays: number;
}

export interface Alert {
  id: string;
  type: 'warning' | 'critical';
  category: 'performance' | 'error' | 'resource' | 'memory' | 'user';
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  url: string;
  userAgent: string;
  resolved: boolean;
  resolvedAt?: number;
}

export interface PerformanceReport {
  id: string;
  timestamp: number;
  period: {
    start: number;
    end: number;
  };
  summary: {
    totalPageViews: number;
    averageLoadTime: number;
    errorCount: number;
    alertCount: number;
    topPages: PageMetrics[];
    performanceScore: number;
  };
  webVitals: WebVitalsReport;
  customMetrics: CustomMetricsReport;
  resourceTiming: ResourceTimingReport;
  userMetrics: UserMetricsReport;
  alerts: Alert[];
}

export interface PageMetrics {
  url: string;
  views: number;
  averageLoadTime: number;
  performanceScore: number;
}

export interface WebVitalsReport {
  lcp: MetricReport;
  fid: MetricReport;
  cls: MetricReport;
  fcp: MetricReport;
  ttfb: MetricReport;
}

export interface MetricReport {
  average: number;
  median: number;
  p75: number;
  p95: number;
  samples: number;
  distribution: { good: number; needsImprovement: number; poor: number };
}

export interface CustomMetricsReport {
  domContentLoaded: MetricReport;
  windowLoad: MetricReport;
  fontLoad: MetricReport;
  imageLoad: MetricReport;
}

export interface ResourceTimingReport {
  slowestResources: Array<{
    name: string;
    duration: number;
    size: number;
    type: string;
  }>;
  averageResourceTime: number;
  failedResources: number;
}

export interface UserMetricsReport {
  sessionDuration: MetricReport;
  interactionCount: MetricReport;
  scrollDepth: MetricReport;
  bounceRate: number;
}

/**
 * Performance Alerts and Reporting System
 */
export class PerformanceAlerts {
  private config: AlertConfig;
  private performanceMonitor: PerformanceMonitor;
  private rum: RealUserMonitoring | null = null;
  private alerts: Alert[] = [];
  private reports: PerformanceReport[] = [];
  private metricsHistory: Array<{ timestamp: number; metrics: any }> = [];
  private reportingTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor(
    performanceMonitor: PerformanceMonitor,
    config: Partial<AlertConfig> = {},
    rum?: RealUserMonitoring
  ) {
    this.performanceMonitor = performanceMonitor;
    this.rum = rum || null;
    this.config = {
      enabled: true,
      thresholds: {
        lcp: { warning: 2500, critical: 4000 },
        fid: { warning: 100, critical: 300 },
        cls: { warning: 0.1, critical: 0.25 },
        fcp: { warning: 1800, critical: 3000 },
        ttfb: { warning: 800, critical: 1800 },
        memoryUsage: { warning: 75, critical: 90 },
        errorRate: { warning: 5, critical: 15 },
        slowResources: { warning: 2000, critical: 5000 }
      },
      notifications: {
        console: true,
        analytics: true
      },
      reporting: {
        enabled: true,
        interval: 300000, // 5 minutes
        includeUserMetrics: true,
        includeResourceTiming: true,
        includeErrorLogs: true,
        retentionDays: 7
      },
      ...config
    };

    this.init();
  }

  /**
   * Initialize alerts and reporting system
   */
  private init(): void {
    if (this.isInitialized || typeof window === 'undefined' || !this.config.enabled) {
      return;
    }

    this.setupPerformanceMonitoring();
    this.setupErrorTracking();
    this.setupResourceMonitoring();
    this.setupMemoryMonitoring();
    this.startReportingTimer();
    this.loadStoredData();

    this.isInitialized = true;
    console.log('🚨 Performance alerts and reporting initialized');

    // Expose globally for debugging
    (window as any).performanceAlerts = this;
  }

  /**
   * Setup performance monitoring for alerts
   */
  private setupPerformanceMonitoring(): void {
    // Check performance metrics periodically
    setInterval(() => {
      this.checkPerformanceMetrics();
    }, 10000); // Check every 10 seconds

    // Store metrics for reporting
    setInterval(() => {
      this.storeMetrics();
    }, 30000); // Store every 30 seconds
  }

  /**
   * Setup error tracking
   */
  private setupErrorTracking(): void {
    let errorCount = 0;
    const errorWindow = 60000; // 1 minute window

    const resetErrorCount = () => {
      errorCount = 0;
      setTimeout(resetErrorCount, errorWindow);
    };

    resetErrorCount();

    window.addEventListener('error', (event) => {
      errorCount++;
      this.checkErrorRate(errorCount);
    });

    window.addEventListener('unhandledrejection', (event) => {
      errorCount++;
      this.checkErrorRate(errorCount);
    });
  }

  /**
   * Setup resource monitoring
   */
  private setupResourceMonitoring(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: PerformanceResourceTiming) => {
          this.checkResourceTiming(entry);
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Resource timing observer not supported:', error);
    }
  }

  /**
   * Setup memory monitoring
   */
  private setupMemoryMonitoring(): void {
    if (!('memory' in performance)) return;

    setInterval(() => {
      this.checkMemoryUsage();
    }, 15000); // Check every 15 seconds
  }

  /**
   * Check performance metrics against thresholds
   */
  private checkPerformanceMetrics(): void {
    const metrics = this.performanceMonitor.getMetrics();
    const { webVitals } = metrics;

    this.checkMetric('lcp', webVitals.lcp, this.config.thresholds.lcp);
    this.checkMetric('fid', webVitals.fid, this.config.thresholds.fid);
    this.checkMetric('cls', webVitals.cls, this.config.thresholds.cls);
    this.checkMetric('fcp', webVitals.fcp, this.config.thresholds.fcp);
    this.checkMetric('ttfb', webVitals.ttfb, this.config.thresholds.ttfb);
  }

  /**
   * Check individual metric against threshold
   */
  private checkMetric(
    metric: keyof AlertThresholds,
    value: number | null,
    threshold: { warning: number; critical: number }
  ): void {
    if (value === null) return;

    let alertType: 'warning' | 'critical' | null = null;

    if (value >= threshold.critical) {
      alertType = 'critical';
    } else if (value >= threshold.warning) {
      alertType = 'warning';
    }

    if (alertType) {
      this.createAlert({
        type: alertType,
        category: 'performance',
        metric,
        value,
        threshold: alertType === 'critical' ? threshold.critical : threshold.warning
      });
    }
  }

  /**
   * Check error rate
   */
  private checkErrorRate(errorCount: number): void {
    const threshold = this.config.thresholds.errorRate;
    let alertType: 'warning' | 'critical' | null = null;

    if (errorCount >= threshold.critical) {
      alertType = 'critical';
    } else if (errorCount >= threshold.warning) {
      alertType = 'warning';
    }

    if (alertType) {
      this.createAlert({
        type: alertType,
        category: 'error',
        metric: 'errorRate',
        value: errorCount,
        threshold: alertType === 'critical' ? threshold.critical : threshold.warning
      });
    }
  }

  /**
   * Check resource timing
   */
  private checkResourceTiming(entry: PerformanceResourceTiming): void {
    const threshold = this.config.thresholds.slowResources;
    let alertType: 'warning' | 'critical' | null = null;

    if (entry.duration >= threshold.critical) {
      alertType = 'critical';
    } else if (entry.duration >= threshold.warning) {
      alertType = 'warning';
    }

    if (alertType) {
      this.createAlert({
        type: alertType,
        category: 'resource',
        metric: 'resourceLoadTime',
        value: entry.duration,
        threshold: alertType === 'critical' ? threshold.critical : threshold.warning,
        additionalData: {
          resourceName: entry.name,
          resourceType: entry.initiatorType,
          transferSize: entry.transferSize
        }
      });
    }
  }

  /**
   * Check memory usage
   */
  private checkMemoryUsage(): void {
    if (!('memory' in performance)) return;

    const memory = (performance as any).memory;
    const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    const threshold = this.config.thresholds.memoryUsage;

    let alertType: 'warning' | 'critical' | null = null;

    if (usedPercent >= threshold.critical) {
      alertType = 'critical';
    } else if (usedPercent >= threshold.warning) {
      alertType = 'warning';
    }

    if (alertType) {
      this.createAlert({
        type: alertType,
        category: 'memory',
        metric: 'memoryUsage',
        value: usedPercent,
        threshold: alertType === 'critical' ? threshold.critical : threshold.warning
      });
    }
  }

  /**
   * Create alert
   */
  private createAlert(alertData: Partial<Alert> & {
    type: 'warning' | 'critical';
    category: string;
    metric: string;
    value: number;
    threshold: number;
    additionalData?: any;
  }): void {
    // Check if similar alert already exists and is not resolved
    const existingAlert = this.alerts.find(alert => 
      alert.metric === alertData.metric &&
      alert.category === alertData.category &&
      !alert.resolved &&
      Date.now() - alert.timestamp < 300000 // Within 5 minutes
    );

    if (existingAlert) return; // Don't create duplicate alerts

    const alert: Alert = {
      id: this.generateAlertId(),
      type: alertData.type,
      category: alertData.category as any,
      metric: alertData.metric,
      value: alertData.value,
      threshold: alertData.threshold,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      resolved: false,
      ...alertData.additionalData
    };

    this.alerts.push(alert);
    this.notifyAlert(alert);

    // Auto-resolve alerts after some time
    setTimeout(() => {
      this.resolveAlert(alert.id);
    }, 600000); // Auto-resolve after 10 minutes
  }

  /**
   * Notify alert
   */
  private notifyAlert(alert: Alert): void {
    const message = `${alert.type.toUpperCase()} Alert: ${alert.metric} = ${alert.value} (threshold: ${alert.threshold})`;

    // Console notification
    if (this.config.notifications.console) {
      const consoleMethod = alert.type === 'critical' ? 'error' : 'warn';
      console[consoleMethod](`🚨 ${message}`);
    }

    // Analytics notification
    if (this.config.notifications.analytics) {
      const analytics = getAnalytics();
      if (analytics) {
        analytics.trackEvent({
          action: 'performance_alert',
          category: 'Performance',
          label: `${alert.type}_${alert.metric}`,
          value: Math.round(alert.value),
          custom_parameters: {
            alertType: alert.type,
            metric: alert.metric,
            threshold: alert.threshold,
            url: alert.url
          }
        });
      }
    }

    // Webhook notification
    if (this.config.notifications.webhook) {
      this.sendWebhookNotification(alert);
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(alert: Alert): Promise<void> {
    if (!this.config.notifications.webhook) return;

    try {
      await fetch(this.config.notifications.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'performance_alert',
          alert: alert,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to send webhook notification:', error);
    }
  }

  /**
   * Resolve alert
   */
  private resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();
    }
  }

  /**
   * Store metrics for reporting
   */
  private storeMetrics(): void {
    const metrics = this.performanceMonitor.getMetrics();
    
    this.metricsHistory.push({
      timestamp: Date.now(),
      metrics: {
        webVitals: metrics.webVitals,
        customMetrics: metrics.customMetrics,
        url: window.location.href
      }
    });

    // Keep only recent metrics based on retention days
    const retentionTime = this.config.reporting.retentionDays * 24 * 60 * 60 * 1000;
    const cutoffTime = Date.now() - retentionTime;
    this.metricsHistory = this.metricsHistory.filter(entry => entry.timestamp > cutoffTime);

    // Store in localStorage for persistence
    this.saveToStorage();
  }

  /**
   * Start reporting timer
   */
  private startReportingTimer(): void {
    if (!this.config.reporting.enabled) return;

    this.reportingTimer = setInterval(() => {
      this.generateReport();
    }, this.config.reporting.interval);
  }

  /**
   * Generate performance report
   */
  private generateReport(): PerformanceReport {
    const now = Date.now();
    const periodStart = now - this.config.reporting.interval;
    const periodMetrics = this.metricsHistory.filter(
      entry => entry.timestamp >= periodStart && entry.timestamp <= now
    );

    const report: PerformanceReport = {
      id: this.generateReportId(),
      timestamp: now,
      period: { start: periodStart, end: now },
      summary: this.generateSummary(periodMetrics),
      webVitals: this.generateWebVitalsReport(periodMetrics),
      customMetrics: this.generateCustomMetricsReport(periodMetrics),
      resourceTiming: this.generateResourceTimingReport(),
      userMetrics: this.generateUserMetricsReport(),
      alerts: this.alerts.filter(alert => 
        alert.timestamp >= periodStart && alert.timestamp <= now
      )
    };

    this.reports.push(report);
    this.notifyReport(report);

    // Keep only recent reports
    const maxReports = 100; // Keep last 100 reports
    if (this.reports.length > maxReports) {
      this.reports = this.reports.slice(-maxReports);
    }

    return report;
  }

  /**
   * Generate report summary
   */
  private generateSummary(periodMetrics: any[]): any {
    const pageViews = new Set(periodMetrics.map(m => m.metrics.url)).size;
    const loadTimes = periodMetrics
      .map(m => m.metrics.customMetrics.windowLoad)
      .filter(t => t !== null);
    const averageLoadTime = loadTimes.length > 0 
      ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length 
      : 0;

    return {
      totalPageViews: pageViews,
      averageLoadTime: Math.round(averageLoadTime),
      errorCount: 0, // Would be calculated from error tracking
      alertCount: this.alerts.filter(a => !a.resolved).length,
      topPages: [], // Would be calculated from metrics
      performanceScore: this.calculateOverallScore(periodMetrics)
    };
  }

  /**
   * Generate Web Vitals report
   */
  private generateWebVitalsReport(periodMetrics: any[]): WebVitalsReport {
    const webVitalsData = periodMetrics
      .map(m => m.metrics.webVitals)
      .filter(wv => wv.lcp !== null || wv.fid !== null || wv.cls !== null);

    return {
      lcp: this.generateMetricReport(webVitalsData.map(wv => wv.lcp).filter(v => v !== null)),
      fid: this.generateMetricReport(webVitalsData.map(wv => wv.fid).filter(v => v !== null)),
      cls: this.generateMetricReport(webVitalsData.map(wv => wv.cls).filter(v => v !== null)),
      fcp: this.generateMetricReport(webVitalsData.map(wv => wv.fcp).filter(v => v !== null)),
      ttfb: this.generateMetricReport(webVitalsData.map(wv => wv.ttfb).filter(v => v !== null))
    };
  }

  /**
   * Generate metric report from values
   */
  private generateMetricReport(values: number[]): MetricReport {
    if (values.length === 0) {
      return {
        average: 0,
        median: 0,
        p75: 0,
        p95: 0,
        samples: 0,
        distribution: { good: 0, needsImprovement: 0, poor: 0 }
      };
    }

    const sorted = values.sort((a, b) => a - b);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const p75 = sorted[Math.floor(sorted.length * 0.75)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];

    return {
      average: Math.round(average),
      median: Math.round(median),
      p75: Math.round(p75),
      p95: Math.round(p95),
      samples: values.length,
      distribution: { good: 0, needsImprovement: 0, poor: 0 } // Would calculate based on thresholds
    };
  }

  /**
   * Generate custom metrics report
   */
  private generateCustomMetricsReport(periodMetrics: any[]): CustomMetricsReport {
    const customMetricsData = periodMetrics.map(m => m.metrics.customMetrics);

    return {
      domContentLoaded: this.generateMetricReport(
        customMetricsData.map(cm => cm.domContentLoaded).filter(v => v !== null)
      ),
      windowLoad: this.generateMetricReport(
        customMetricsData.map(cm => cm.windowLoad).filter(v => v !== null)
      ),
      fontLoad: this.generateMetricReport(
        customMetricsData.map(cm => cm.fontLoadTime).filter(v => v !== null)
      ),
      imageLoad: this.generateMetricReport(
        customMetricsData.map(cm => cm.imageLoadTime).filter(v => v !== null)
      )
    };
  }

  /**
   * Generate resource timing report
   */
  private generateResourceTimingReport(): ResourceTimingReport {
    // This would analyze resource timing data
    return {
      slowestResources: [],
      averageResourceTime: 0,
      failedResources: 0
    };
  }

  /**
   * Generate user metrics report
   */
  private generateUserMetricsReport(): UserMetricsReport {
    // This would use RUM data if available
    return {
      sessionDuration: this.generateMetricReport([]),
      interactionCount: this.generateMetricReport([]),
      scrollDepth: this.generateMetricReport([]),
      bounceRate: 0
    };
  }

  /**
   * Calculate overall performance score
   */
  private calculateOverallScore(periodMetrics: any[]): number {
    if (periodMetrics.length === 0) return 0;

    let totalScore = 0;
    let validMetrics = 0;

    periodMetrics.forEach(entry => {
      const webVitals = entry.metrics.webVitals;
      let score = 100;

      if (webVitals.lcp !== null) {
        validMetrics++;
        if (webVitals.lcp > 4000) score -= 25;
        else if (webVitals.lcp > 2500) score -= 12.5;
      }

      if (webVitals.fid !== null) {
        validMetrics++;
        if (webVitals.fid > 300) score -= 25;
        else if (webVitals.fid > 100) score -= 12.5;
      }

      if (webVitals.cls !== null) {
        validMetrics++;
        if (webVitals.cls > 0.25) score -= 25;
        else if (webVitals.cls > 0.1) score -= 12.5;
      }

      if (webVitals.fcp !== null) {
        validMetrics++;
        if (webVitals.fcp > 3000) score -= 25;
        else if (webVitals.fcp > 1800) score -= 12.5;
      }

      totalScore += Math.max(0, score);
    });

    return validMetrics > 0 ? Math.round(totalScore / periodMetrics.length) : 0;
  }

  /**
   * Notify report generation
   */
  private notifyReport(report: PerformanceReport): void {
    if (this.config.notifications.console) {
      console.log('📊 Performance report generated:', {
        id: report.id,
        period: `${new Date(report.period.start).toISOString()} - ${new Date(report.period.end).toISOString()}`,
        summary: report.summary
      });
    }

    // Send to analytics
    if (this.config.notifications.analytics) {
      const analytics = getAnalytics();
      if (analytics) {
        analytics.trackEvent({
          action: 'performance_report',
          category: 'Performance',
          label: 'Automated Report',
          custom_parameters: {
            reportId: report.id,
            performanceScore: report.summary.performanceScore,
            alertCount: report.alerts.length
          }
        });
      }
    }
  }

  /**
   * Generate alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate report ID
   */
  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save data to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem('performanceAlertsData', JSON.stringify({
        alerts: this.alerts.slice(-50), // Keep last 50 alerts
        metricsHistory: this.metricsHistory.slice(-1000) // Keep last 1000 metrics
      }));
    } catch (error) {
      console.warn('Failed to save performance data to localStorage:', error);
    }
  }

  /**
   * Load stored data
   */
  private loadStoredData(): void {
    try {
      const stored = localStorage.getItem('performanceAlertsData');
      if (stored) {
        const data = JSON.parse(stored);
        this.alerts = data.alerts || [];
        this.metricsHistory = data.metricsHistory || [];
      }
    } catch (error) {
      console.warn('Failed to load stored performance data:', error);
    }
  }

  /**
   * Get current alerts
   */
  public getAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Get recent reports
   */
  public getReports(limit = 10): PerformanceReport[] {
    return this.reports.slice(-limit);
  }

  /**
   * Export data for external analysis
   */
  public exportData(): any {
    return {
      config: this.config,
      alerts: this.alerts,
      reports: this.reports,
      metricsHistory: this.metricsHistory
    };
  }

  /**
   * Destroy alerts system
   */
  public destroy(): void {
    if (this.reportingTimer) {
      clearInterval(this.reportingTimer);
      this.reportingTimer = null;
    }

    this.saveToStorage();
    this.isInitialized = false;
    console.log('🚨 Performance alerts and reporting destroyed');
  }
}

/**
 * Initialize performance alerts and reporting
 */
export function initializePerformanceAlerts(
  performanceMonitor: PerformanceMonitor,
  config?: Partial<AlertConfig>,
  rum?: RealUserMonitoring
): PerformanceAlerts {
  return new PerformanceAlerts(performanceMonitor, config, rum);
}