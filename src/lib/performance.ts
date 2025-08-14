/**
 * Performance Monitoring with Service Worker Integration
 * Tracks Core Web Vitals, resource timing, and offline functionality metrics
 */

export interface WebVitalsMetrics {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
}

export interface PerformanceMetrics {
  webVitals: WebVitalsMetrics;
  navigation: PerformanceNavigationTiming | null;
  resources: PerformanceResourceTiming[];
  memory: any;
  connection: any;
  serviceWorker: ServiceWorkerMetrics;
}

export interface ServiceWorkerMetrics {
  registered: boolean;
  active: boolean;
  cacheHitRate: number;
  offlineUsage: number;
  syncEvents: number;
  lastUpdateCheck: number;
}

/**
 * Performance Monitor Class
 */
export class PerformanceMonitor {
  private debug: boolean;
  private metrics: PerformanceMetrics;
  private observers: Map<string, PerformanceObserver> = new Map();
  private startTime: number;

  constructor(debug = false) {
    this.debug = debug;
    this.startTime = performance.now();
    
    this.metrics = {
      webVitals: {
        lcp: null,
        fid: null,
        cls: null,
        fcp: null,
        ttfb: null
      },
      navigation: null,
      resources: [],
      memory: null,
      connection: null,
      serviceWorker: {
        registered: false,
        active: false,
        cacheHitRate: 0,
        offlineUsage: 0,
        syncEvents: 0,
        lastUpdateCheck: 0
      }
    };

    this.init();
  }

  /**
   * Initialize performance monitoring
   */
  private init(): void {
    this.observeWebVitals();
    this.collectNavigationTiming();
    this.collectResourceTiming();
    this.collectMemoryInfo();
    this.collectConnectionInfo();
    this.collectServiceWorkerMetrics();

    if (this.debug) {
      console.log('[Performance] Monitor initialized');
    }
  }

  /**
   * Observe Core Web Vitals
   */
  private observeWebVitals(): void {
    // Observe LCP
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            this.metrics.webVitals.lcp = entry.startTime;
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (error) {
        if (this.debug) console.log('[Performance] LCP observer not supported');
      }

      // Observe FID
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            this.metrics.webVitals.fid = entry.processingStart - entry.startTime;
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (error) {
        if (this.debug) console.log('[Performance] FID observer not supported');
      }

      // Observe CLS
      try {
        const clsObserver = new PerformanceObserver((entryList) => {
          let clsValue = 0;
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          this.metrics.webVitals.cls = clsValue;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (error) {
        if (this.debug) console.log('[Performance] CLS observer not supported');
      }

      // Observe FCP
      try {
        const fcpObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.webVitals.fcp = entry.startTime;
            }
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('fcp', fcpObserver);
      } catch (error) {
        if (this.debug) console.log('[Performance] FCP observer not supported');
      }
    }

    // Calculate TTFB from navigation timing
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.webVitals.ttfb = navigation.responseStart - navigation.requestStart;
      }
    });
  }

  /**
   * Collect navigation timing
   */
  private collectNavigationTiming(): void {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      this.metrics.navigation = navigation;
    });
  }

  /**
   * Collect resource timing
   */
  private collectResourceTiming(): void {
    // Collect initial resources
    window.addEventListener('load', () => {
      this.metrics.resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    });

    // Observe new resources
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries() as PerformanceResourceTiming[];
          this.metrics.resources.push(...entries);
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      } catch (error) {
        if (this.debug) console.log('[Performance] Resource observer not supported');
      }
    }
  }

  /**
   * Collect memory information
   */
  private collectMemoryInfo(): void {
    if ('memory' in performance) {
      this.metrics.memory = (performance as any).memory;
    }
  }

  /**
   * Collect connection information
   */
  private collectConnectionInfo(): void {
    if ('connection' in navigator) {
      this.metrics.connection = (navigator as any).connection;
    }
  }

  /**
   * Collect service worker metrics
   */
  private collectServiceWorkerMetrics(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        this.metrics.serviceWorker.registered = true;
        this.metrics.serviceWorker.active = !!registration.active;
      });
    }

    // Listen for service worker events
    window.addEventListener('message', (event) => {
      if (event.data?.source === 'service-worker-manager') {
        this.handleServiceWorkerMessage(event.data);
      }
    });
  }

  /**
   * Handle service worker messages
   */
  private handleServiceWorkerMessage(message: any): void {
    switch (message.type) {
      case 'cache-hit':
        this.metrics.serviceWorker.cacheHitRate++;
        break;
      
      case 'offline-usage':
        this.metrics.serviceWorker.offlineUsage++;
        break;
        
      case 'sync-event':
        this.metrics.serviceWorker.syncEvents++;
        break;
        
      case 'update-check':
        this.metrics.serviceWorker.lastUpdateCheck = Date.now();
        break;
    }
  }

  /**
   * Get current metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance score (0-100)
   */
  public getScore(): number {
    const vitals = this.metrics.webVitals;
    let score = 100;

    // LCP scoring (Good: <2.5s, Poor: >4s)
    if (vitals.lcp !== null) {
      if (vitals.lcp > 4000) score -= 30;
      else if (vitals.lcp > 2500) score -= 15;
    }

    // FID scoring (Good: <100ms, Poor: >300ms)
    if (vitals.fid !== null) {
      if (vitals.fid > 300) score -= 25;
      else if (vitals.fid > 100) score -= 10;
    }

    // CLS scoring (Good: <0.1, Poor: >0.25)
    if (vitals.cls !== null) {
      if (vitals.cls > 0.25) score -= 25;
      else if (vitals.cls > 0.1) score -= 10;
    }

    // FCP scoring (Good: <1.8s, Poor: >3s)
    if (vitals.fcp !== null) {
      if (vitals.fcp > 3000) score -= 20;
      else if (vitals.fcp > 1800) score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Send performance report
   */
  public sendReport(): void {
    const report = {
      timestamp: Date.now(),
      sessionDuration: performance.now() - this.startTime,
      metrics: this.getMetrics(),
      score: this.getScore(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    // Send to analytics if available
    const analytics = (window as any).analytics;
    if (analytics) {
      analytics.trackEvent({
        action: 'performance_report',
        category: 'Performance',
        custom_parameters: {
          score: report.score,
          lcp: this.metrics.webVitals.lcp,
          fid: this.metrics.webVitals.fid,
          cls: this.metrics.webVitals.cls,
          fcp: this.metrics.webVitals.fcp,
          ttfb: this.metrics.webVitals.ttfb,
          service_worker_active: this.metrics.serviceWorker.active,
          cache_hit_rate: this.metrics.serviceWorker.cacheHitRate,
          offline_usage: this.metrics.serviceWorker.offlineUsage
        }
      });
    }

    if (this.debug) {
      console.log('[Performance] Report sent:', report);
    }
  }

  /**
   * Destroy monitor and clean up observers
   */
  public destroy(): void {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
  }
}

/**
 * Create performance monitor instance
 */
export function createPerformanceMonitor(debug = false): PerformanceMonitor {
  return new PerformanceMonitor(debug);
}