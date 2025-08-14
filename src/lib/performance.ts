/**
 * Performance Monitoring Utilities
 * Comprehensive performance tracking with Core Web Vitals, custom metrics, and RUM
 */

// Core Web Vitals and Performance Types
export interface WebVitalsMetrics {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
  inp: number | null; // Interaction to Next Paint
}

export interface CustomPerformanceMetrics {
  domContentLoaded: number | null;
  windowLoad: number | null;
  fontLoadTime: number | null;
  imageLoadTime: number | null;
  lazyLoadTime: number | null;
  navigationTiming: NavigationTimingMetrics | null;
}

export interface NavigationTimingMetrics {
  dnsLookup: number;
  tcpConnection: number;
  tlsHandshake: number;
  serverResponse: number;
  domProcessing: number;
  resourceLoading: number;
}

export interface PerformanceBudgets {
  lcp: number; // 2500ms
  fid: number; // 100ms
  cls: number; // 0.1
  fcp: number; // 1800ms
  ttfb: number; // 800ms
}

export interface PerformanceReport {
  url: string;
  timestamp: number;
  webVitals: WebVitalsMetrics;
  customMetrics: CustomPerformanceMetrics;
  budgetStatus: Record<keyof PerformanceBudgets, 'pass' | 'fail'>;
  deviceInfo: {
    userAgent: string;
    connection: string | null;
    memory: number | null;
  };
}

/**
 * Performance Monitoring Class
 * Handles Core Web Vitals tracking, custom metrics, and reporting
 */
export class PerformanceMonitor {
  private webVitals: WebVitalsMetrics = {
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    inp: null
  };

  private customMetrics: CustomPerformanceMetrics = {
    domContentLoaded: null,
    windowLoad: null,
    fontLoadTime: null,
    imageLoadTime: null,
    lazyLoadTime: null,
    navigationTiming: null
  };

  private budgets: PerformanceBudgets = {
    lcp: 2500, // 2.5 seconds
    fid: 100,  // 100 milliseconds
    cls: 0.1,  // 0.1 cumulative layout shift
    fcp: 1800, // 1.8 seconds
    ttfb: 800  // 800 milliseconds
  };

  private observers: PerformanceObserver[] = [];
  private isInitialized = false;
  private debugMode = false;

  constructor(debugMode = false) {
    this.debugMode = debugMode;
    this.init();
  }

  /**
   * Initialize performance monitoring
   */
  private init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      this.setupWebVitalsTracking();
      this.setupCustomMetricsTracking();
      this.setupNavigationTiming();
      this.isInitialized = true;
      
      if (this.debugMode) {
        console.log('🚀 Performance monitoring initialized');
      }
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
    }
  }

  /**
   * Set up Core Web Vitals tracking
   */
  private setupWebVitalsTracking(): void {
    // Largest Contentful Paint (LCP)
    this.observeMetric('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1] as PerformanceEventTiming;
      this.webVitals.lcp = Math.round(lastEntry.startTime);
      this.reportMetric('LCP', this.webVitals.lcp);
    });

    // First Input Delay (FID)
    this.observeMetric('first-input', (entries) => {
      const firstEntry = entries[0] as PerformanceEventTiming & { processingStart: number };
      this.webVitals.fid = Math.round(firstEntry.processingStart - firstEntry.startTime);
      this.reportMetric('FID', this.webVitals.fid);
    });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    this.observeMetric('layout-shift', (entries) => {
      for (const entry of entries as PerformanceEntry[] & { value: number; hadRecentInput: boolean }[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      this.webVitals.cls = Math.round(clsValue * 10000) / 10000; // Round to 4 decimal places
      this.reportMetric('CLS', this.webVitals.cls);
    });

    // First Contentful Paint (FCP)
    this.observeMetric('paint', (entries) => {
      for (const entry of entries as PerformanceEntry[]) {
        if (entry.name === 'first-contentful-paint') {
          this.webVitals.fcp = Math.round(entry.startTime);
          this.reportMetric('FCP', this.webVitals.fcp);
        }
      }
    });

    // Interaction to Next Paint (INP) - newer metric
    if ('PerformanceEventTiming' in window) {
      this.observeMetric('event', (entries) => {
        let maxDelay = 0;
        for (const entry of entries as PerformanceEventTiming[]) {
          if (entry.processingStart && entry.processingEnd) {
            const delay = entry.processingEnd - entry.startTime;
            maxDelay = Math.max(maxDelay, delay);
          }
        }
        if (maxDelay > 0) {
          this.webVitals.inp = Math.round(maxDelay);
          this.reportMetric('INP', this.webVitals.inp);
        }
      });
    }

    // Time to First Byte (TTFB)
    if ('navigation' in performance) {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      this.webVitals.ttfb = Math.round(navTiming.responseStart - navTiming.fetchStart);
      this.reportMetric('TTFB', this.webVitals.ttfb);
    }
  }

  /**
   * Set up custom metrics tracking
   */
  private setupCustomMetricsTracking(): void {
    // DOM Content Loaded
    if (document.readyState === 'loading') {
      const startTime = performance.now();
      document.addEventListener('DOMContentLoaded', () => {
        this.customMetrics.domContentLoaded = Math.round(performance.now() - startTime);
        this.reportMetric('DOM Content Loaded', this.customMetrics.domContentLoaded);
      });
    }

    // Window Load
    if (document.readyState !== 'complete') {
      const startTime = performance.now();
      window.addEventListener('load', () => {
        this.customMetrics.windowLoad = Math.round(performance.now() - startTime);
        this.reportMetric('Window Load', this.customMetrics.windowLoad);
        
        // Measure font and image loading after window load
        this.measureFontLoading();
        this.measureImageLoading();
      });
    }

    // Track lazy loading performance
    this.setupLazyLoadTracking();
  }

  /**
   * Set up navigation timing tracking
   */
  private setupNavigationTiming(): void {
    if (!('navigation' in performance)) return;

    const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    this.customMetrics.navigationTiming = {
      dnsLookup: Math.round(navTiming.domainLookupEnd - navTiming.domainLookupStart),
      tcpConnection: Math.round(navTiming.connectEnd - navTiming.connectStart),
      tlsHandshake: navTiming.secureConnectionStart > 0 
        ? Math.round(navTiming.connectEnd - navTiming.secureConnectionStart) 
        : 0,
      serverResponse: Math.round(navTiming.responseEnd - navTiming.requestStart),
      domProcessing: Math.round(navTiming.domComplete - navTiming.responseEnd),
      resourceLoading: Math.round(navTiming.loadEventEnd - navTiming.domComplete)
    };

    if (this.debugMode) {
      console.table(this.customMetrics.navigationTiming);
    }
  }

  /**
   * Track lazy loading performance
   */
  private setupLazyLoadTracking(): void {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if (lazyImages.length === 0) return;

    const startTime = performance.now();
    let loadedCount = 0;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const imageStartTime = performance.now();
          
          img.addEventListener('load', () => {
            loadedCount++;
            const loadTime = performance.now() - imageStartTime;
            
            if (loadedCount === lazyImages.length) {
              this.customMetrics.lazyLoadTime = Math.round(performance.now() - startTime);
              this.reportMetric('Lazy Load Time', this.customMetrics.lazyLoadTime);
            }
          });
          
          imageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach((img) => imageObserver.observe(img));
  }

  /**
   * Measure font loading performance
   */
  private measureFontLoading(): void {
    if (!('fonts' in document)) return;

    const startTime = performance.now();
    document.fonts.ready.then(() => {
      this.customMetrics.fontLoadTime = Math.round(performance.now() - startTime);
      this.reportMetric('Font Load Time', this.customMetrics.fontLoadTime);
    });
  }

  /**
   * Measure image loading performance
   */
  private measureImageLoading(): void {
    const images = document.querySelectorAll('img:not([loading="lazy"])');
    if (images.length === 0) return;

    const startTime = performance.now();
    let loadedCount = 0;
    let totalCount = images.length;

    images.forEach((img: HTMLImageElement) => {
      if (img.complete) {
        loadedCount++;
      } else {
        img.addEventListener('load', () => {
          loadedCount++;
          if (loadedCount === totalCount) {
            this.customMetrics.imageLoadTime = Math.round(performance.now() - startTime);
            this.reportMetric('Image Load Time', this.customMetrics.imageLoadTime);
          }
        });
      }
    });

    if (loadedCount === totalCount) {
      this.customMetrics.imageLoadTime = 0;
      this.reportMetric('Image Load Time', this.customMetrics.imageLoadTime);
    }
  }

  /**
   * Generic performance observer setup
   */
  private observeMetric(type: string, callback: (entries: PerformanceEntry[]) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      if (this.debugMode) {
        console.warn(`Failed to observe ${type}:`, error);
      }
    }
  }

  /**
   * Report individual metric
   */
  private reportMetric(name: string, value: number | null): void {
    if (this.debugMode && value !== null) {
      console.log(`📊 ${name}: ${value}ms`);
    }

    // Send to analytics if available
    if (typeof window !== 'undefined' && 'gtag' in window && value !== null) {
      (window as any).gtag('event', 'performance_metric', {
        event_category: 'Performance',
        event_label: name,
        value: Math.round(value),
        custom_map: {
          metric_name: name,
          metric_value: value
        }
      });
    }
  }

  /**
   * Check performance against budgets
   */
  private checkBudgets(): Record<keyof PerformanceBudgets, 'pass' | 'fail'> {
    const status: Record<keyof PerformanceBudgets, 'pass' | 'fail'> = {
      lcp: 'pass',
      fid: 'pass',
      cls: 'pass',
      fcp: 'pass',
      ttfb: 'pass'
    };

    if (this.webVitals.lcp && this.webVitals.lcp > this.budgets.lcp) status.lcp = 'fail';
    if (this.webVitals.fid && this.webVitals.fid > this.budgets.fid) status.fid = 'fail';
    if (this.webVitals.cls && this.webVitals.cls > this.budgets.cls) status.cls = 'fail';
    if (this.webVitals.fcp && this.webVitals.fcp > this.budgets.fcp) status.fcp = 'fail';
    if (this.webVitals.ttfb && this.webVitals.ttfb > this.budgets.ttfb) status.ttfb = 'fail';

    return status;
  }

  /**
   * Get device information
   */
  private getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection?.effectiveType || null,
      memory: (navigator as any).deviceMemory || null
    };
  }

  /**
   * Generate comprehensive performance report
   */
  public generateReport(): PerformanceReport {
    return {
      url: window.location.href,
      timestamp: Date.now(),
      webVitals: { ...this.webVitals },
      customMetrics: { ...this.customMetrics },
      budgetStatus: this.checkBudgets(),
      deviceInfo: this.getDeviceInfo()
    };
  }

  /**
   * Send performance report to analytics
   */
  public sendReport(): void {
    const report = this.generateReport();
    
    if (this.debugMode) {
      console.log('📋 Performance Report:', report);
    }

    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'performance_report', {
        event_category: 'Performance',
        event_label: 'Full Report',
        custom_map: {
          lcp: report.webVitals.lcp,
          fid: report.webVitals.fid,
          cls: report.webVitals.cls,
          fcp: report.webVitals.fcp,
          ttfb: report.webVitals.ttfb,
          budget_failures: Object.values(report.budgetStatus).filter(s => s === 'fail').length
        }
      });
    }

    // Check for budget failures
    const failures = Object.entries(report.budgetStatus).filter(([, status]) => status === 'fail');
    if (failures.length > 0) {
      this.reportBudgetFailures(failures);
    }
  }

  /**
   * Report performance budget failures
   */
  private reportBudgetFailures(failures: [string, 'pass' | 'fail'][]): void {
    const failureNames = failures.map(([name]) => name);
    
    if (this.debugMode) {
      console.warn('⚠️ Performance budget failures:', failureNames);
    }

    // Send alert to analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'performance_budget_failure', {
        event_category: 'Performance',
        event_label: failureNames.join(', '),
        value: failures.length
      });
    }
  }

  /**
   * Cleanup observers
   */
  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  /**
   * Get current metrics (for debugging)
   */
  public getMetrics(): { webVitals: WebVitalsMetrics; customMetrics: CustomPerformanceMetrics } {
    return {
      webVitals: { ...this.webVitals },
      customMetrics: { ...this.customMetrics }
    };
  }
}

/**
 * Utility Functions
 */

/**
 * Create and initialize performance monitor
 */
export function createPerformanceMonitor(debugMode = false): PerformanceMonitor {
  return new PerformanceMonitor(debugMode);
}

/**
 * Simple performance measurement utility
 */
export function measurePerformance<T>(name: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`⏱️ ${name}: ${Math.round(end - start)}ms`);
  
  return result;
}

/**
 * Async performance measurement utility
 */
export async function measureAsyncPerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  console.log(`⏱️ ${name}: ${Math.round(end - start)}ms`);
  
  return result;
}

/**
 * Check if performance monitoring is supported
 */
export function isPerformanceSupported(): boolean {
  return typeof window !== 'undefined' && 
         'performance' in window && 
         'PerformanceObserver' in window;
}

/**
 * Get Core Web Vitals ratings
 */
export function getRating(metric: keyof WebVitalsMetrics, value: number | null): 'good' | 'needs-improvement' | 'poor' | 'unknown' {
  if (value === null) return 'unknown';

  const thresholds = {
    lcp: { good: 2500, poor: 4000 },
    fid: { good: 100, poor: 300 },
    cls: { good: 0.1, poor: 0.25 },
    fcp: { good: 1800, poor: 3000 },
    ttfb: { good: 800, poor: 1800 },
    inp: { good: 200, poor: 500 }
  };

  const threshold = thresholds[metric];
  if (!threshold) return 'unknown';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}