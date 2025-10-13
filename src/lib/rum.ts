/**
 * Real User Monitoring (RUM) with Service Worker Integration
 * Collects real user experience data including offline usage patterns
 */

export interface RUMConfig {
  enabled: boolean;
  sampleRate: number;
  trackUserInteractions: boolean;
  trackPageVisibility: boolean;
  trackNetworkInfo: boolean;
  trackMemoryUsage: boolean;
  trackLongTasks: boolean;
  trackResourceTiming: boolean;
}

export interface RUMMetrics {
  sessionId: string;
  userId?: string;
  timestamp: number;
  url: string;
  referrer: string;
  userAgent: string;
  viewport: { width: number; height: number };
  deviceType: 'mobile' | 'tablet' | 'desktop';
  connectionType?: string;
  isOffline: boolean;
  performanceMetrics: any;
  userInteractions: UserInteraction[];
  pageVisibility: PageVisibilityEvent[];
  networkEvents: NetworkEvent[];
  serviceWorkerEvents: ServiceWorkerEvent[];
}

export interface UserInteraction {
  type: 'click' | 'scroll' | 'input' | 'touch';
  timestamp: number;
  target?: string;
  x?: number;
  y?: number;
  scrollDepth?: number;
}

export interface PageVisibilityEvent {
  type: 'visible' | 'hidden';
  timestamp: number;
  duration?: number;
}

export interface NetworkEvent {
  type: 'online' | 'offline' | 'slow' | 'fast';
  timestamp: number;
  connectionType?: string;
  effectiveType?: string;
}

export interface ServiceWorkerEvent {
  type: 'install' | 'activate' | 'update' | 'cache_hit' | 'cache_miss' | 'offline_usage';
  timestamp: number;
  url?: string;
  cacheStrategy?: string;
}

/**
 * RUM Monitor Class
 */
import { getAnalytics } from './analytics';

export class RUMMonitor {
  private config: RUMConfig;
  private metrics: RUMMetrics;
  private observers: Map<string, any> = new Map();
  private visibilityStartTime = 0;

  constructor(config: Partial<RUMConfig> = {}) {
    this.config = {
      enabled: true,
      sampleRate: 0.1,
      trackUserInteractions: true,
      trackPageVisibility: true,
      trackNetworkInfo: true,
      trackMemoryUsage: false,
      trackLongTasks: true,
      trackResourceTiming: true,
      ...config
    };

    this.metrics = {
      sessionId: this.generateSessionId(),
      timestamp: Date.now(),
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      deviceType: this.getDeviceType(),
      connectionType: this.getConnectionType(),
      isOffline: !navigator.onLine,
      performanceMetrics: {},
      userInteractions: [],
      pageVisibility: [],
      networkEvents: [],
      serviceWorkerEvents: []
    };

    // Sample rate check
    if (Math.random() > this.config.sampleRate) {
      return;
    }

    this.init();
  }

  /**
   * Initialize RUM monitoring
   */
  private init(): void {
    if (!this.config.enabled) return;

    this.setupEventListeners();
    this.startPerformanceObservation();
    this.trackInitialState();
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // User interactions
    if (this.config.trackUserInteractions) {
      document.addEventListener('click', this.handleClick.bind(this));
      document.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 250));
      document.addEventListener('input', this.handleInput.bind(this));
      document.addEventListener('touchstart', this.handleTouch.bind(this));
    }

    // Page visibility
    if (this.config.trackPageVisibility) {
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
      this.visibilityStartTime = Date.now();
    }

    // Network events
    if (this.config.trackNetworkInfo) {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
      
      // Connection change
      if ('connection' in navigator) {
        (navigator as any).connection.addEventListener('change', this.handleConnectionChange.bind(this));
      }
    }

    // Service worker events
    window.addEventListener('message', (event) => {
      if (event.data?.source === 'service-worker-manager') {
        this.handleServiceWorkerMessage(event.data);
      }
    });

    // Page unload
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    window.addEventListener('pagehide', this.handlePageHide.bind(this));
  }

  /**
   * Start performance observation
   */
  private startPerformanceObservation(): void {
    if (!('PerformanceObserver' in window)) return;

    // Long tasks
    if (this.config.trackLongTasks) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.trackLongTask(entry);
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.set('longtask', longTaskObserver);
      } catch (error) {
        console.log('[RUM] Long task observer not supported');
      }
    }

    // Resource timing
    if (this.config.trackResourceTiming) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.trackResourceTiming(entry as PerformanceResourceTiming);
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      } catch (error) {
        console.log('[RUM] Resource observer not supported');
      }
    }
  }

  /**
   * Track initial state
   */
  private trackInitialState(): void {
    // Track initial network state
    if (!navigator.onLine) {
      this.metrics.networkEvents.push({
        type: 'offline',
        timestamp: Date.now()
      });
    }

    // Track connection type
    if (this.config.trackNetworkInfo) {
      const connection = (navigator as any).connection;
      if (connection) {
        this.metrics.networkEvents.push({
          type: connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' ? 'slow' : 'fast',
          timestamp: Date.now(),
          connectionType: connection.type,
          effectiveType: connection.effectiveType
        });
      }
    }
  }

  /**
   * Event handlers
   */
  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    this.metrics.userInteractions.push({
      type: 'click',
      timestamp: Date.now(),
      target: this.getElementSelector(target),
      x: event.clientX,
      y: event.clientY
    });
  }

  private handleScroll(): void {
    const scrollDepth = Math.round(
      ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
    );

    this.metrics.userInteractions.push({
      type: 'scroll',
      timestamp: Date.now(),
      scrollDepth
    });
  }

  private handleInput(event: Event): void {
    const target = event.target as HTMLElement;
    this.metrics.userInteractions.push({
      type: 'input',
      timestamp: Date.now(),
      target: this.getElementSelector(target)
    });
  }

  private handleTouch(event: TouchEvent): void {
    const touch = event.touches[0];
    const target = event.target as HTMLElement;
    
    this.metrics.userInteractions.push({
      type: 'touch',
      timestamp: Date.now(),
      target: this.getElementSelector(target),
      x: touch.clientX,
      y: touch.clientY
    });
  }

  private handleVisibilityChange(): void {
    const now = Date.now();
    const isVisible = !document.hidden;

    if (!isVisible && this.visibilityStartTime > 0) {
      // Page became hidden
      this.metrics.pageVisibility.push({
        type: 'hidden',
        timestamp: now,
        duration: now - this.visibilityStartTime
      });
    } else if (isVisible) {
      // Page became visible
      this.metrics.pageVisibility.push({
        type: 'visible',
        timestamp: now
      });
      this.visibilityStartTime = now;
    }
  }

  private handleOnline(): void {
    this.metrics.isOffline = false;
    this.metrics.networkEvents.push({
      type: 'online',
      timestamp: Date.now()
    });
  }

  private handleOffline(): void {
    this.metrics.isOffline = true;
    this.metrics.networkEvents.push({
      type: 'offline',
      timestamp: Date.now()
    });
  }

  private handleConnectionChange(): void {
    const connection = (navigator as any).connection;
    if (!connection) return;

    this.metrics.networkEvents.push({
      type: connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' ? 'slow' : 'fast',
      timestamp: Date.now(),
      connectionType: connection.type,
      effectiveType: connection.effectiveType
    });
  }

  private handleServiceWorkerMessage(message: any): void {
    this.metrics.serviceWorkerEvents.push({
      type: message.type,
      timestamp: Date.now(),
      url: message.data?.url,
      cacheStrategy: message.data?.strategy
    });
  }

  private handleBeforeUnload(): void {
    this.sendMetrics();
  }

  private handlePageHide(): void {
    this.sendMetrics();
  }

  /**
   * Performance tracking methods
   */
  private trackLongTask(entry: PerformanceEntry): void {
    // Track long tasks that block the main thread
    const analytics = getAnalytics();
    if (analytics) {
      analytics.trackEvent({
        action: 'long_task',
        category: 'Performance',
        value: entry.duration,
        custom_parameters: {
          duration: entry.duration,
          start_time: entry.startTime,
          url: window.location.pathname
        }
      });
    }
  }

  private trackResourceTiming(entry: PerformanceResourceTiming): void {
    // Track slow loading resources
    if (entry.duration > 1000) { // Resources taking more than 1 second
      const analytics = getAnalytics();
      if (analytics) {
        analytics.trackEvent({
          action: 'slow_resource',
          category: 'Performance',
          label: entry.name,
          value: entry.duration,
          custom_parameters: {
            resource_type: entry.initiatorType,
            duration: entry.duration,
            size: entry.transferSize
          }
        });
      }
    }
  }

  /**
   * Utility methods
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getConnectionType(): string | undefined {
    return (navigator as any).connection?.effectiveType;
  }

  private getElementSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  private throttle(func: Function, limit: number): (...args: any[]) => void {
    let inThrottle: boolean;
    return function(this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Send metrics to analytics
   */
  public sendMetrics(): void {
    if (!this.config.enabled) return;

    const analytics = getAnalytics();
    if (!analytics) return;

    // Send summary metrics
    analytics.trackEvent({
      action: 'rum_metrics',
      category: 'User Experience',
      custom_parameters: {
        session_id: this.metrics.sessionId,
        device_type: this.metrics.deviceType,
        connection_type: this.metrics.connectionType,
        is_offline: this.metrics.isOffline,
        interactions_count: this.metrics.userInteractions.length,
        visibility_changes: this.metrics.pageVisibility.length,
        network_events: this.metrics.networkEvents.length,
        service_worker_events: this.metrics.serviceWorkerEvents.length,
        session_duration: Date.now() - this.metrics.timestamp
      }
    });

    // Send offline usage metrics
    const offlineEvents = this.metrics.serviceWorkerEvents.filter(e => e.type === 'offline_usage');
    if (offlineEvents.length > 0) {
      analytics.trackEvent({
        action: 'offline_usage',
        category: 'Service Worker',
        value: offlineEvents.length,
        custom_parameters: {
          offline_page_views: offlineEvents.length,
          device_type: this.metrics.deviceType
        }
      });
    }
  }

  /**
   * Get current metrics
   */
  public getMetrics(): RUMMetrics {
    return { ...this.metrics };
  }

  /**
   * Destroy monitor
   */
  public destroy(): void {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
  }
}

/**
 * Initialize RUM monitoring
 */
export function initializeRUM(config?: Partial<RUMConfig>): RUMMonitor {
  return new RUMMonitor(config);
}