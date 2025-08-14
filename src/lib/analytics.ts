// Analytics utility functions
export interface AnalyticsConfig {
  trackingId?: string;
  debug?: boolean;
}

class Analytics {
  private config: AnalyticsConfig;
  private initialized: boolean = false;

  constructor(config: AnalyticsConfig = {}) {
    this.config = config;
  }

  initialize() {
    if (this.initialized) return;
    this.initialized = true;
    
    if (this.config.debug) {
      console.log('Analytics initialized');
    }
  }

  track(event: string, data?: Record<string, any>) {
    if (!this.initialized) return;
    
    if (this.config.debug) {
      console.log('Analytics event:', event, data);
    }
    
    // Track event logic here
  }

  trackEvent(data: Record<string, any>) {
    if (!this.initialized) return;
    
    if (this.config.debug) {
      console.log('Analytics trackEvent:', data);
    }
    
    // Track event logic here
  }

  pageView(path: string) {
    if (!this.initialized) return;
    
    if (this.config.debug) {
      console.log('Page view:', path);
    }
    
    // Page view tracking logic here
  }
}

let analyticsInstance: Analytics | null = null;

export function initializeAnalytics(config?: AnalyticsConfig) {
  if (!analyticsInstance) {
    analyticsInstance = new Analytics(config);
    analyticsInstance.initialize();
  }
  return analyticsInstance;
}

export function getAnalytics(): Analytics {
  if (!analyticsInstance) {
    analyticsInstance = new Analytics();
    analyticsInstance.initialize();
  }
  return analyticsInstance;
}

export function setupAutoTracking() {
  const analytics = getAnalytics();
  
  // Auto-track page views on navigation
  if (typeof window !== 'undefined') {
    analytics.pageView(window.location.pathname);
  }
}
