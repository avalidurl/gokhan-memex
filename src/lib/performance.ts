// Performance monitoring utilities
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface PerformanceMonitorConfig {
  enabled?: boolean;
  debug?: boolean;
  sampleRate?: number;
}

class PerformanceMonitor {
  private config: PerformanceMonitorConfig;
  private metrics: PerformanceMetric[] = [];

  constructor(config: PerformanceMonitorConfig = {}) {
    this.config = {
      enabled: true,
      debug: false,
      sampleRate: 1,
      ...config
    };
  }

  measure(name: string, fn: () => void): void;
  measure(name: string, fn: () => Promise<void>): Promise<void>;
  measure(name: string, fn: () => void | Promise<void>): void | Promise<void> {
    if (!this.config.enabled) {
      return fn();
    }

    const startTime = performance.now();
    const result = fn();

    if (result instanceof Promise) {
      return result.finally(() => {
        const endTime = performance.now();
        this.recordMetric(name, endTime - startTime);
      });
    } else {
      const endTime = performance.now();
      this.recordMetric(name, endTime - startTime);
    }
  }

  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    if (!this.config.enabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);

    if (this.config.debug) {
      console.log(`Performance metric: ${name} = ${value.toFixed(2)}ms`, metadata);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  clearMetrics() {
    this.metrics = [];
  }
}

let performanceMonitor: PerformanceMonitor | null = null;

export function createPerformanceMonitor(config?: PerformanceMonitorConfig): PerformanceMonitor {
  return new PerformanceMonitor(config);
}

export function measurePerformance(name: string, fn: () => void): void {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor.measure(name, fn);
}

export async function measureAsyncPerformance(name: string, fn: () => Promise<void>): Promise<void> {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return await performanceMonitor.measure(name, fn);
}
