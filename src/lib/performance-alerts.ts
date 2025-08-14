// Performance alerts and monitoring
export interface PerformanceAlert {
  type: 'warning' | 'error' | 'info';
  message: string;
  threshold: number;
  actual: number;
  timestamp: number;
}

export interface PerformanceAlertsConfig {
  enabled?: boolean;
  thresholds?: {
    loadTime?: number;
    memoryUsage?: number;
    scriptExecution?: number;
  };
  onAlert?: (alert: PerformanceAlert) => void;
}

class PerformanceAlerts {
  private config: PerformanceAlertsConfig;
  private alerts: PerformanceAlert[] = [];

  constructor(config: PerformanceAlertsConfig = {}) {
    this.config = {
      enabled: true,
      thresholds: {
        loadTime: 3000, // 3 seconds
        memoryUsage: 50 * 1024 * 1024, // 50MB
        scriptExecution: 1000, // 1 second
      },
      ...config
    };
  }

  checkLoadTime(loadTime: number) {
    if (!this.config.enabled || !this.config.thresholds?.loadTime) return;

    if (loadTime > this.config.thresholds.loadTime) {
      this.createAlert('warning', 'Slow page load detected', this.config.thresholds.loadTime, loadTime);
    }
  }

  checkMemoryUsage(memoryUsage: number) {
    if (!this.config.enabled || !this.config.thresholds?.memoryUsage) return;

    if (memoryUsage > this.config.thresholds.memoryUsage) {
      this.createAlert('warning', 'High memory usage detected', this.config.thresholds.memoryUsage, memoryUsage);
    }
  }

  checkScriptExecution(executionTime: number) {
    if (!this.config.enabled || !this.config.thresholds?.scriptExecution) return;

    if (executionTime > this.config.thresholds.scriptExecution) {
      this.createAlert('warning', 'Long script execution detected', this.config.thresholds.scriptExecution, executionTime);
    }
  }

  private createAlert(type: PerformanceAlert['type'], message: string, threshold: number, actual: number) {
    const alert: PerformanceAlert = {
      type,
      message,
      threshold,
      actual,
      timestamp: Date.now()
    };

    this.alerts.push(alert);

    if (this.config.onAlert) {
      this.config.onAlert(alert);
    }

    console.warn(`Performance Alert: ${message}`, {
      threshold,
      actual,
      type
    });
  }

  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  clearAlerts() {
    this.alerts = [];
  }
}

let performanceAlerts: PerformanceAlerts | null = null;

export function initializePerformanceAlerts(config?: PerformanceAlertsConfig): PerformanceAlerts {
  if (!performanceAlerts) {
    performanceAlerts = new PerformanceAlerts(config);
  }
  return performanceAlerts;
}
