/**
 * Enhanced Analytics with Performance Monitoring
 * Privacy-conscious Google Analytics integration with Core Web Vitals tracking
 */

import { PerformanceMonitor } from './performance';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    enableGoogleAnalytics: () => void;
    disableGoogleAnalytics: () => void;
    performanceMonitor: PerformanceMonitor;
  }
}

/**
 * Analytics Configuration
 */
export interface AnalyticsConfig {
  trackingId: string;
  debug: boolean;
  anonymizeIp: boolean;
  allowGoogleSignals: boolean;
  allowAdPersonalization: boolean;
  performanceTracking: boolean;
  consentMode: boolean;
}

export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

export interface PerformanceEvent {
  metric_name: string;
  metric_value: number;
  page_path: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
  connection_type?: string;
}

/**
 * Enhanced Analytics Class
 */
export class Analytics {
  private config: AnalyticsConfig;
  private performanceMonitor: PerformanceMonitor | null = null;
  private isEnabled = false;
  private consentGiven = false;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      trackingId: 'G-TSMR6G8LLL',
      debug: false,
      anonymizeIp: true,
      allowGoogleSignals: false,
      allowAdPersonalization: false,
      performanceTracking: true,
      consentMode: true,
      ...config
    };

    this.init();
  }

  /**
   * Initialize analytics system
   */
  private init(): void {
    if (typeof window === 'undefined') return;

    this.setupConsentMode();
    this.checkExistingConsent();
    this.setupPerformanceMonitoring();
    
    // Expose analytics instance globally for debugging
    if (this.config.debug) {
      (window as any).analytics = this;
    }
  }

  /**
   * Set up consent mode
   */
  private setupConsentMode(): void {
    if (!this.config.consentMode) return;

    // Initialize dataLayer if not exists
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function() {
      window.dataLayer.push(arguments);
    };

    // Set default consent state
    window.gtag('consent', 'default', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'functionality_storage': 'denied',
      'personalization_storage': 'denied',
      'security_storage': 'granted',
      'wait_for_update': 2000
    });

    // Initialize GA with timestamp
    window.gtag('js', new Date());
  }

  /**
   * Check for existing consent
   */
  private checkExistingConsent(): void {
    const privacyChoice = localStorage.getItem('privacy-choice');
    
    if (privacyChoice === 'accepted') {
      this.enableAnalytics();
    } else if (privacyChoice === 'declined') {
      this.disableAnalytics();
    }
  }

  /**
   * Set up performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if (!this.config.performanceTracking) return;

    // Wait for page load before initializing performance monitoring
    if (document.readyState === 'complete') {
      this.initPerformanceMonitor();
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.initPerformanceMonitor(), 1000);
      });
    }
  }

  /**
   * Initialize performance monitor
   */
  private initPerformanceMonitor(): void {
    try {
      this.performanceMonitor = new PerformanceMonitor(this.config.debug);
      
      // Expose globally for debugging and other components
      window.performanceMonitor = this.performanceMonitor;

      // Send performance report after metrics are collected
      setTimeout(() => {
        if (this.performanceMonitor && this.isEnabled) {
          this.performanceMonitor.sendReport();
        }
      }, 5000); // Wait 5 seconds to collect metrics

      if (this.config.debug) {
        console.log('🚀 Performance monitoring initialized');
      }
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
    }
  }

  /**
   * Enable analytics with consent
   */
  public enableAnalytics(): void {
    this.consentGiven = true;
    this.isEnabled = true;
    
    // Load GA script if not already loaded
    this.loadGoogleAnalytics();
    
    // Update consent
    if (this.config.consentMode) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }

    // Configure GA
    window.gtag('config', this.config.trackingId, {
      'anonymize_ip': this.config.anonymizeIp,
      'allow_google_signals': this.config.allowGoogleSignals,
      'allow_ad_personalization_signals': this.config.allowAdPersonalization,
      'custom_map': {
        'custom_parameter_1': 'performance_metric',
        'custom_parameter_2': 'device_info',
        'custom_parameter_3': 'page_timing'
      }
    });

    // Track page view
    this.trackPageView();

    // Track performance metrics if monitor is ready
    if (this.performanceMonitor) {
      this.performanceMonitor.sendReport();
    }

    if (this.config.debug) {
      console.log('✅ Analytics enabled');
    }
  }

  /**
   * Disable analytics
   */
  public disableAnalytics(): void {
    this.consentGiven = false;
    this.isEnabled = false;
    
    if (this.config.consentMode) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }

    if (this.config.debug) {
      console.log('❌ Analytics disabled');
    }
  }

  /**
   * Load Google Analytics script
   */
  private loadGoogleAnalytics(): void {
    if (document.querySelector('script[src*="googletagmanager.com/gtag"]')) {
      return; // Already loaded
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.trackingId}`;
    document.head.appendChild(script);
  }

  /**
   * Track page view
   */
  public trackPageView(path?: string): void {
    if (!this.isEnabled) return;

    window.gtag('config', this.config.trackingId, {
      'page_path': path || window.location.pathname,
      'page_title': document.title,
      'page_location': window.location.href,
      'custom_map': {
        'device_type': this.getDeviceType(),
        'connection_type': this.getConnectionType(),
        'performance_score': this.getPerformanceScore()
      }
    });

    if (this.config.debug) {
      console.log('📄 Page view tracked:', path || window.location.pathname);
    }
  }

  /**
   * Track custom event
   */
  public trackEvent(event: AnalyticsEvent): void {
    if (!this.isEnabled) return;

    window.gtag('event', event.action, {
      'event_category': event.category,
      'event_label': event.label,
      'value': event.value,
      'custom_map': {
        'timestamp': Date.now(),
        'page_path': window.location.pathname,
        ...event.custom_parameters
      }
    });

    if (this.config.debug) {
      console.log('📊 Event tracked:', event);
    }
  }

  /**
   * Track performance metric
   */
  public trackPerformanceMetric(metric: PerformanceEvent): void {
    if (!this.isEnabled) return;

    window.gtag('event', 'performance_metric', {
      'event_category': 'Performance',
      'event_label': metric.metric_name,
      'value': Math.round(metric.metric_value),
      'custom_map': {
        'metric_name': metric.metric_name,
        'metric_value': metric.metric_value,
        'page_path': metric.page_path,
        'device_type': metric.device_type,
        'connection_type': metric.connection_type
      }
    });

    if (this.config.debug) {
      console.log('⏱️ Performance metric tracked:', metric);
    }
  }

  /**
   * Track Core Web Vitals
   */
  public trackWebVitals(): void {
    if (!this.isEnabled || !this.performanceMonitor) return;

    const metrics = this.performanceMonitor.getMetrics();
    const webVitals = metrics.webVitals;

    // Track each Core Web Vital
    Object.entries(webVitals).forEach(([metric, value]) => {
      if (value !== null) {
        this.trackPerformanceMetric({
          metric_name: metric.toUpperCase(),
          metric_value: value,
          page_path: window.location.pathname,
          device_type: this.getDeviceType(),
          connection_type: this.getConnectionType()
        });
      }
    });
  }

  /**
   * Track user engagement
   */
  public trackEngagement(action: string, element?: string): void {
    if (!this.isEnabled) return;

    this.trackEvent({
      action: action,
      category: 'Engagement',
      label: element,
      custom_parameters: {
        'timestamp': Date.now(),
        'scroll_depth': this.getScrollDepth(),
        'time_on_page': this.getTimeOnPage()
      }
    });
  }

  /**
   * Track scroll depth
   */
  public trackScrollDepth(depth: number): void {
    if (!this.isEnabled) return;

    this.trackEvent({
      action: 'scroll_depth',
      category: 'Engagement',
      label: `${depth}%`,
      value: depth,
      custom_parameters: {
        'page_height': document.documentElement.scrollHeight,
        'viewport_height': window.innerHeight
      }
    });
  }

  /**
   * Track search query
   */
  public trackSearch(query: string, results?: number): void {
    if (!this.isEnabled) return;

    window.gtag('event', 'search', {
      'search_term': query,
      'custom_map': {
        'search_results': results || 0,
        'search_timestamp': Date.now()
      }
    });
  }

  /**
   * Track external link clicks
   */
  public trackExternalLink(url: string, text?: string): void {
    if (!this.isEnabled) return;

    this.trackEvent({
      action: 'click',
      category: 'External Link',
      label: url,
      custom_parameters: {
        'link_text': text,
        'link_domain': new URL(url).hostname
      }
    });
  }

  /**
   * Get device type
   */
  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Get connection type
   */
  private getConnectionType(): string | undefined {
    return (navigator as any).connection?.effectiveType;
  }

  /**
   * Get current performance score (simplified)
   */
  private getPerformanceScore(): number {
    if (!this.performanceMonitor) return 0;

    const metrics = this.performanceMonitor.getMetrics();
    const webVitals = metrics.webVitals;

    let score = 100;
    
    // Penalize based on Core Web Vitals
    if (webVitals.lcp && webVitals.lcp > 2500) score -= 25;
    if (webVitals.fid && webVitals.fid > 100) score -= 25;
    if (webVitals.cls && webVitals.cls > 0.1) score -= 25;
    if (webVitals.fcp && webVitals.fcp > 1800) score -= 25;

    return Math.max(0, score);
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
   * Get time spent on page
   */
  private getTimeOnPage(): number {
    return Date.now() - performance.timing.navigationStart;
  }

  /**
   * Get analytics status
   */
  public getStatus(): { enabled: boolean; consentGiven: boolean; performanceMonitoring: boolean } {
    return {
      enabled: this.isEnabled,
      consentGiven: this.consentGiven,
      performanceMonitoring: !!this.performanceMonitor
    };
  }

  /**
   * Generate analytics report
   */
  public generateReport(): any {
    const status = this.getStatus();
    const performanceMetrics = this.performanceMonitor?.getMetrics();

    return {
      status,
      config: this.config,
      performanceMetrics,
      deviceInfo: {
        type: this.getDeviceType(),
        connection: this.getConnectionType(),
        userAgent: navigator.userAgent
      },
      pageInfo: {
        url: window.location.href,
        title: document.title,
        referrer: document.referrer
      }
    };
  }
}

/**
 * Global Analytics Instance
 */
let analyticsInstance: Analytics | null = null;

/**
 * Initialize analytics (called from BaseLayout)
 */
export function initializeAnalytics(config?: Partial<AnalyticsConfig>): Analytics {
  if (analyticsInstance) {
    return analyticsInstance;
  }

  analyticsInstance = new Analytics(config);
  
  // Expose globally for privacy notice and other components
  if (typeof window !== 'undefined') {
    (window as any).analytics = analyticsInstance;
    
    // Expose enable/disable functions for privacy notice
    window.enableGoogleAnalytics = () => analyticsInstance?.enableAnalytics();
    window.disableGoogleAnalytics = () => analyticsInstance?.disableAnalytics();
  }

  return analyticsInstance;
}

/**
 * Get analytics instance
 */
export function getAnalytics(): Analytics | null {
  return analyticsInstance;
}

/**
 * Utility functions for common tracking scenarios
 */

/**
 * Track button click
 */
export function trackButtonClick(buttonText: string, location?: string): void {
  const analytics = getAnalytics();
  if (!analytics) return;

  analytics.trackEvent({
    action: 'click',
    category: 'Button',
    label: buttonText,
    custom_parameters: { location }
  });
}

/**
 * Track form submission
 */
export function trackFormSubmission(formName: string, success: boolean = true): void {
  const analytics = getAnalytics();
  if (!analytics) return;

  analytics.trackEvent({
    action: success ? 'submit_success' : 'submit_error',
    category: 'Form',
    label: formName
  });
}

/**
 * Track file download
 */
export function trackDownload(fileName: string, fileType?: string): void {
  const analytics = getAnalytics();
  if (!analytics) return;

  analytics.trackEvent({
    action: 'download',
    category: 'File',
    label: fileName,
    custom_parameters: { file_type: fileType }
  });
}

/**
 * Auto-track external links
 */
export function setupAutoTracking(): void {
  if (typeof window === 'undefined') return;

  // Track external links
  document.addEventListener('click', (event) => {
    const link = (event.target as Element)?.closest('a');
    if (!link || !link.href) return;

    const url = new URL(link.href, window.location.origin);
    if (url.hostname !== window.location.hostname) {
      const analytics = getAnalytics();
      if (analytics) {
        analytics.trackExternalLink(url.href, link.textContent || '');
      }
    }
  });

  // Track scroll depth milestones
  let maxScrollDepth = 0;
  const scrollMilestones = [25, 50, 75, 90, 100];

  window.addEventListener('scroll', throttle(() => {
    const scrollDepth = Math.round(
      ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
    );

    if (scrollDepth > maxScrollDepth) {
      maxScrollDepth = scrollDepth;
      
      const milestone = scrollMilestones.find(m => scrollDepth >= m && maxScrollDepth < m);
      if (milestone) {
        const analytics = getAnalytics();
        if (analytics) {
          analytics.trackScrollDepth(milestone);
        }
      }
    }
  }, 250));
}

/**
 * Throttle utility function
 */
function throttle(func: Function, limit: number): (...args: any[]) => void {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}