/**
 * Real User Monitoring (RUM) System
 * Comprehensive user experience tracking and performance monitoring
 */

import { PerformanceMonitor } from './performance';
import { getAnalytics } from './analytics';

export interface RUMConfig {
  enabled: boolean;
  sampleRate: number; // 0-1, percentage of users to track
  trackUserInteractions: boolean;
  trackPageVisibility: boolean;
  trackNetworkInfo: boolean;
  trackMemoryUsage: boolean;
  trackLongTasks: boolean;
  trackResourceTiming: boolean;
  batchSize: number;
  flushInterval: number; // milliseconds
  endpoint?: string; // Custom endpoint for sending data
}

export interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: number;
  pageViews: PageView[];
  interactions: UserInteraction[];
  performanceMetrics: PerformanceSnapshot[];
  deviceInfo: DeviceInfo;
  networkInfo: NetworkInfo;
}

export interface PageView {
  url: string;
  title: string;
  timestamp: number;
  referrer: string;
  loadTime: number;
  timeToInteractive: number;
  visibilityChanges: VisibilityChange[];
  scrollDepth: number;
  timeOnPage: number;
}

export interface UserInteraction {
  type: 'click' | 'scroll' | 'input' | 'keypress' | 'touch';
  element: string;
  timestamp: number;
  x?: number;
  y?: number;
  value?: string;
  duration?: number;
}

export interface PerformanceSnapshot {
  timestamp: number;
  url: string;
  metrics: {
    lcp: number | null;
    fid: number | null;
    cls: number | null;
    fcp: number | null;
    ttfb: number | null;
    inp: number | null;
  };
  customMetrics: {
    domContentLoaded: number | null;
    windowLoad: number | null;
    memoryUsage: MemoryInfo | null;
    longTasks: LongTask[];
  };
}

export interface VisibilityChange {
  timestamp: number;
  state: 'visible' | 'hidden';
  duration?: number;
}

export interface DeviceInfo {
  userAgent: string;
  screenResolution: string;
  viewportSize: string;
  devicePixelRatio: number;
  touchEnabled: boolean;
  hardwareConcurrency: number;
  deviceMemory?: number;
  platform: string;
}

export interface NetworkInfo {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  online: boolean;
}

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usedPercent: number;
}

export interface LongTask {
  startTime: number;
  duration: number;
  attribution?: string[];
}

export interface RUMEvent {
  type: 'pageview' | 'interaction' | 'performance' | 'error' | 'custom';
  timestamp: number;
  sessionId: string;
  data: any;
}

/**
 * Real User Monitoring Class
 */
export class RealUserMonitoring {
  private config: RUMConfig;
  private session: UserSession;
  private performanceMonitor: PerformanceMonitor | null = null;
  private eventQueue: RUMEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private visibilityStartTime = 0;
  private currentPageView: PageView | null = null;
  private interactionObservers: any[] = [];

  constructor(config: Partial<RUMConfig> = {}) {
    this.config = {
      enabled: true,
      sampleRate: 1.0,
      trackUserInteractions: true,
      trackPageVisibility: true,
      trackNetworkInfo: true,
      trackMemoryUsage: true,
      trackLongTasks: true,
      trackResourceTiming: true,
      batchSize: 20,
      flushInterval: 30000, // 30 seconds
      ...config
    };

    this.session = this.createNewSession();
    this.init();
  }

  /**
   * Initialize RUM system
   */
  private init(): void {
    if (this.isInitialized || typeof window === 'undefined' || !this.config.enabled) {
      return;
    }

    // Check sampling rate
    if (Math.random() > this.config.sampleRate) {
      console.log('🎯 RUM: User not sampled for monitoring');
      return;
    }

    this.setupPerformanceMonitoring();
    this.setupUserInteractionTracking();
    this.setupVisibilityTracking();
    this.setupNetworkTracking();
    this.setupLongTaskTracking();
    this.setupResourceTiming();
    this.setupErrorTracking();
    this.setupMemoryTracking();
    this.startFlushTimer();
    
    // Track initial page view
    this.trackPageView();

    this.isInitialized = true;
    console.log('🎯 RUM monitoring initialized');

    // Expose RUM instance globally for debugging
    (window as any).rum = this;
  }

  /**
   * Create new user session
   */
  private createNewSession(): UserSession {
    return {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      pageViews: [],
      interactions: [],
      performanceMetrics: [],
      deviceInfo: this.getDeviceInfo(),
      networkInfo: this.getNetworkInfo()
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Setup performance monitoring integration
   */
  private setupPerformanceMonitoring(): void {
    if (typeof window !== 'undefined' && (window as any).performanceMonitor) {
      this.performanceMonitor = (window as any).performanceMonitor;
    }

    // Collect performance snapshots periodically
    setInterval(() => {
      this.capturePerformanceSnapshot();
    }, 10000); // Every 10 seconds
  }

  /**
   * Setup user interaction tracking
   */
  private setupUserInteractionTracking(): void {
    if (!this.config.trackUserInteractions) return;

    // Track clicks
    document.addEventListener('click', (event) => {
      this.trackInteraction({
        type: 'click',
        element: this.getElementPath(event.target as Element),
        timestamp: Date.now(),
        x: event.clientX,
        y: event.clientY
      });
    }, { passive: true });

    // Track scrolling
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackInteraction({
          type: 'scroll',
          element: 'window',
          timestamp: Date.now(),
          value: this.getScrollDepth().toString()
        });
      }, 250);
    }, { passive: true });

    // Track form inputs
    document.addEventListener('input', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        this.trackInteraction({
          type: 'input',
          element: this.getElementPath(target),
          timestamp: Date.now(),
          value: target.getAttribute('type') || 'text'
        });
      }
    }, { passive: true });

    // Track key presses
    document.addEventListener('keydown', (event) => {
      // Only track meaningful keypresses, avoid password fields
      if (event.target && 
          (event.target as HTMLElement).getAttribute('type') !== 'password' &&
          ['Enter', 'Tab', 'Escape'].includes(event.key)) {
        this.trackInteraction({
          type: 'keypress',
          element: this.getElementPath(event.target as Element),
          timestamp: Date.now(),
          value: event.key
        });
      }
    }, { passive: true });

    // Track touch events on mobile
    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', (event) => {
        const touch = event.touches[0];
        this.trackInteraction({
          type: 'touch',
          element: this.getElementPath(event.target as Element),
          timestamp: Date.now(),
          x: touch.clientX,
          y: touch.clientY
        });
      }, { passive: true });
    }
  }

  /**
   * Setup page visibility tracking
   */
  private setupVisibilityTracking(): void {
    if (!this.config.trackPageVisibility) return;

    this.visibilityStartTime = Date.now();

    document.addEventListener('visibilitychange', () => {
      const now = Date.now();
      const duration = now - this.visibilityStartTime;

      if (this.currentPageView) {
        this.currentPageView.visibilityChanges.push({
          timestamp: now,
          state: document.visibilityState as 'visible' | 'hidden',
          duration: duration
        });
      }

      this.visibilityStartTime = now;

      // Track visibility change event
      this.queueEvent({
        type: 'custom',
        timestamp: now,
        sessionId: this.session.sessionId,
        data: {
          eventType: 'visibility_change',
          visibilityState: document.visibilityState,
          duration: duration
        }
      });
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.finalizeCurrentPageView();
      this.flush();
    });

    // Track page focus/blur
    window.addEventListener('focus', () => {
      this.queueEvent({
        type: 'custom',
        timestamp: Date.now(),
        sessionId: this.session.sessionId,
        data: { eventType: 'page_focus' }
      });
    });

    window.addEventListener('blur', () => {
      this.queueEvent({
        type: 'custom',
        timestamp: Date.now(),
        sessionId: this.session.sessionId,
        data: { eventType: 'page_blur' }
      });
    });
  }

  /**
   * Setup network information tracking
   */
  private setupNetworkTracking(): void {
    if (!this.config.trackNetworkInfo) return;

    // Track network changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const trackNetworkChange = () => {
        this.session.networkInfo = this.getNetworkInfo();
        this.queueEvent({
          type: 'custom',
          timestamp: Date.now(),
          sessionId: this.session.sessionId,
          data: {
            eventType: 'network_change',
            networkInfo: this.session.networkInfo
          }
        });
      };

      connection.addEventListener('change', trackNetworkChange);
    }

    // Track online/offline status
    window.addEventListener('online', () => {
      this.queueEvent({
        type: 'custom',
        timestamp: Date.now(),
        sessionId: this.session.sessionId,
        data: { eventType: 'online' }
      });
    });

    window.addEventListener('offline', () => {
      this.queueEvent({
        type: 'custom',
        timestamp: Date.now(),
        sessionId: this.session.sessionId,
        data: { eventType: 'offline' }
      });
    });
  }

  /**
   * Setup long task tracking
   */
  private setupLongTaskTracking(): void {
    if (!this.config.trackLongTasks || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (entry.duration > 50) { // Tasks longer than 50ms
            this.queueEvent({
              type: 'performance',
              timestamp: Date.now(),
              sessionId: this.session.sessionId,
              data: {
                eventType: 'long_task',
                startTime: entry.startTime,
                duration: entry.duration,
                attribution: entry.attribution ? entry.attribution.map((attr: any) => attr.name) : []
              }
            });
          }
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
      this.interactionObservers.push(observer);
    } catch (error) {
      console.warn('Long task observer not supported:', error);
    }
  }

  /**
   * Setup resource timing tracking
   */
  private setupResourceTiming(): void {
    if (!this.config.trackResourceTiming || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: PerformanceResourceTiming) => {
          // Only track resources that took significant time or failed
          if (entry.duration > 100 || entry.transferSize === 0) {
            this.queueEvent({
              type: 'performance',
              timestamp: Date.now(),
              sessionId: this.session.sessionId,
              data: {
                eventType: 'resource_timing',
                name: entry.name,
                duration: entry.duration,
                transferSize: entry.transferSize,
                encodedBodySize: entry.encodedBodySize,
                decodedBodySize: entry.decodedBodySize,
                initiatorType: entry.initiatorType
              }
            });
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
      this.interactionObservers.push(observer);
    } catch (error) {
      console.warn('Resource timing observer not supported:', error);
    }
  }

  /**
   * Setup error tracking
   */
  private setupErrorTracking(): void {
    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      this.queueEvent({
        type: 'error',
        timestamp: Date.now(),
        sessionId: this.session.sessionId,
        data: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        }
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.queueEvent({
        type: 'error',
        timestamp: Date.now(),
        sessionId: this.session.sessionId,
        data: {
          type: 'unhandled_rejection',
          reason: event.reason?.toString(),
          stack: event.reason?.stack
        }
      });
    });
  }

  /**
   * Setup memory tracking
   */
  private setupMemoryTracking(): void {
    if (!this.config.trackMemoryUsage || !('memory' in performance)) return;

    setInterval(() => {
      const memoryInfo = this.getMemoryInfo();
      if (memoryInfo && memoryInfo.usedPercent > 75) {
        this.queueEvent({
          type: 'performance',
          timestamp: Date.now(),
          sessionId: this.session.sessionId,
          data: {
            eventType: 'high_memory_usage',
            memoryInfo
          }
        });
      }
    }, 15000); // Check every 15 seconds
  }

  /**
   * Track page view
   */
  private trackPageView(): void {
    // Finalize previous page view
    this.finalizeCurrentPageView();

    // Create new page view
    this.currentPageView = {
      url: window.location.href,
      title: document.title,
      timestamp: Date.now(),
      referrer: document.referrer,
      loadTime: this.getPageLoadTime(),
      timeToInteractive: this.getTimeToInteractive(),
      visibilityChanges: [],
      scrollDepth: 0,
      timeOnPage: 0
    };

    this.session.pageViews.push(this.currentPageView);

    this.queueEvent({
      type: 'pageview',
      timestamp: Date.now(),
      sessionId: this.session.sessionId,
      data: this.currentPageView
    });
  }

  /**
   * Track user interaction
   */
  private trackInteraction(interaction: UserInteraction): void {
    this.session.interactions.push(interaction);

    this.queueEvent({
      type: 'interaction',
      timestamp: Date.now(),
      sessionId: this.session.sessionId,
      data: interaction
    });
  }

  /**
   * Capture performance snapshot
   */
  private capturePerformanceSnapshot(): void {
    if (!this.performanceMonitor) return;

    const metrics = this.performanceMonitor.getMetrics();
    
    const snapshot: PerformanceSnapshot = {
      timestamp: Date.now(),
      url: window.location.href,
      metrics: metrics.webVitals,
      customMetrics: {
        ...metrics.customMetrics,
        memoryUsage: this.getMemoryInfo(),
        longTasks: [] // This would be populated from long task observer
      }
    };

    this.session.performanceMetrics.push(snapshot);

    this.queueEvent({
      type: 'performance',
      timestamp: Date.now(),
      sessionId: this.session.sessionId,
      data: snapshot
    });
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): DeviceInfo {
    return {
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      devicePixelRatio: window.devicePixelRatio,
      touchEnabled: 'ontouchstart' in window,
      hardwareConcurrency: navigator.hardwareConcurrency || 1,
      deviceMemory: (navigator as any).deviceMemory,
      platform: navigator.platform
    };
  }

  /**
   * Get network information
   */
  private getNetworkInfo(): NetworkInfo {
    const connection = (navigator as any).connection;
    return {
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      saveData: connection?.saveData,
      online: navigator.onLine
    };
  }

  /**
   * Get memory information
   */
  private getMemoryInfo(): MemoryInfo | null {
    if (!('memory' in performance)) return null;

    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usedPercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };
  }

  /**
   * Get element path for interaction tracking
   */
  private getElementPath(element: Element): string {
    const path = [];
    let current = element;

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      if (current.id) {
        selector += `#${current.id}`;
      } else if (current.className) {
        selector += `.${current.className.split(' ').filter(c => c).join('.')}`;
      }

      path.unshift(selector);
      current = current.parentElement as Element;
    }

    return path.join(' > ');
  }

  /**
   * Get scroll depth percentage
   */
  private getScrollDepth(): number {
    const scrolled = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    return Math.round((scrolled / maxScroll) * 100);
  }

  /**
   * Get page load time
   */
  private getPageLoadTime(): number {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;
  }

  /**
   * Get time to interactive (simplified)
   */
  private getTimeToInteractive(): number {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return navigation ? navigation.domInteractive - navigation.fetchStart : 0;
  }

  /**
   * Finalize current page view
   */
  private finalizeCurrentPageView(): void {
    if (this.currentPageView) {
      this.currentPageView.timeOnPage = Date.now() - this.currentPageView.timestamp;
      this.currentPageView.scrollDepth = this.getScrollDepth();
    }
  }

  /**
   * Queue event for batched sending
   */
  private queueEvent(event: RUMEvent): void {
    this.eventQueue.push(event);

    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Start flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);
  }

  /**
   * Flush events to analytics/endpoint
   */
  private flush(): void {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    // Send to analytics
    const analytics = getAnalytics();
    if (analytics) {
      events.forEach(event => {
        analytics.trackEvent({
          action: 'rum_event',
          category: 'RUM',
          label: event.type,
          custom_parameters: {
            sessionId: event.sessionId,
            eventData: event.data
          }
        });
      });
    }

    // Send to custom endpoint if configured
    if (this.config.endpoint) {
      this.sendToEndpoint(events);
    }

    console.log(`🎯 RUM: Flushed ${events.length} events`);
  }

  /**
   * Send events to custom endpoint
   */
  private async sendToEndpoint(events: RUMEvent[]): Promise<void> {
    if (!this.config.endpoint) return;

    try {
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: this.session,
          events: events
        })
      });
    } catch (error) {
      console.error('Failed to send RUM data:', error);
    }
  }

  /**
   * Get session summary
   */
  public getSessionSummary(): any {
    return {
      sessionId: this.session.sessionId,
      duration: Date.now() - this.session.startTime,
      pageViews: this.session.pageViews.length,
      interactions: this.session.interactions.length,
      performanceSnapshots: this.session.performanceMetrics.length,
      deviceInfo: this.session.deviceInfo,
      networkInfo: this.session.networkInfo
    };
  }

  /**
   * Destroy RUM monitoring
   */
  public destroy(): void {
    this.finalizeCurrentPageView();
    this.flush();

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    this.interactionObservers.forEach(observer => observer.disconnect());
    this.interactionObservers = [];

    this.isInitialized = false;
    console.log('🎯 RUM monitoring destroyed');
  }
}

/**
 * Initialize RUM monitoring
 */
export function initializeRUM(config?: Partial<RUMConfig>): RealUserMonitoring {
  return new RealUserMonitoring(config);
}