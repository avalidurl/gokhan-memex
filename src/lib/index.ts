/**
 * Performance Monitoring and Analytics Library
 * Main entry point for all performance and analytics utilities
 */

// Core Performance Monitoring
export {
  PerformanceMonitor,
  createPerformanceMonitor,
  measurePerformance,
  measureAsyncPerformance,
  isPerformanceSupported,
  getRating
} from './performance';

export type {
  WebVitalsMetrics,
  CustomPerformanceMetrics,
  NavigationTimingMetrics,
  PerformanceBudgets,
  PerformanceReport
} from './performance';

// Enhanced Analytics
export {
  Analytics,
  initializeAnalytics,
  getAnalytics,
  trackButtonClick,
  trackFormSubmission,
  trackDownload,
  setupAutoTracking
} from './analytics';

export type {
  AnalyticsConfig,
  AnalyticsEvent,
  PerformanceEvent
} from './analytics';

// Performance Dashboard
export {
  PerformanceDashboard,
  initializePerformanceDashboard,
  performanceDebug
} from './performance-dashboard';

export type {
  DashboardConfig,
  PerformanceBudgetConfig,
  AlertConfig as DashboardAlertConfig
} from './performance-dashboard';

// Real User Monitoring (RUM)
export {
  RealUserMonitoring,
  initializeRUM
} from './rum';

export type {
  RUMConfig,
  UserSession,
  PageView,
  UserInteraction,
  PerformanceSnapshot,
  DeviceInfo,
  NetworkInfo,
  RUMEvent
} from './rum';

// Performance Alerts and Reporting
export {
  PerformanceAlerts,
  initializePerformanceAlerts
} from './performance-alerts';

export type {
  AlertConfig,
  AlertThresholds,
  NotificationConfig,
  ReportingConfig,
  Alert,
  PerformanceReport as DetailedPerformanceReport,
  WebVitalsReport,
  MetricReport
} from './performance-alerts';

// Utility functions
export {
  cn,
  formatDate,
  slugify
} from './utils';

/**
 * Initialize complete performance monitoring suite
 */
export interface PerformanceMonitoringSuiteConfig {
  analytics: {
    enabled: boolean;
    trackingId?: string;
    debug?: boolean;
  };
  performance: {
    enabled: boolean;
    debug?: boolean;
  };
  dashboard: {
    enabled: boolean;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    minimized?: boolean;
  };
  rum: {
    enabled: boolean;
    sampleRate?: number;
  };
  alerts: {
    enabled: boolean;
    console?: boolean;
    analytics?: boolean;
  };
}

export async function initializePerformanceMonitoringSuite(
  config: Partial<PerformanceMonitoringSuiteConfig> = {}
): Promise<{
  analytics: Analytics | null;
  performanceMonitor: PerformanceMonitor | null;
  dashboard: PerformanceDashboard | null;
  rum: RealUserMonitoring | null;
  alerts: PerformanceAlerts | null;
}> {
  const defaultConfig: PerformanceMonitoringSuiteConfig = {
    analytics: {
      enabled: true,
      trackingId: 'G-TSMR6G8LLL',
      debug: false
    },
    performance: {
      enabled: true,
      debug: false
    },
    dashboard: {
      enabled: false,
      position: 'bottom-right',
      minimized: true
    },
    rum: {
      enabled: true,
      sampleRate: 0.1
    },
    alerts: {
      enabled: true,
      console: false,
      analytics: true
    }
  };

  const finalConfig = {
    analytics: { ...defaultConfig.analytics, ...config.analytics },
    performance: { ...defaultConfig.performance, ...config.performance },
    dashboard: { ...defaultConfig.dashboard, ...config.dashboard },
    rum: { ...defaultConfig.rum, ...config.rum },
    alerts: { ...defaultConfig.alerts, ...config.alerts }
  };

  let analytics: Analytics | null = null;
  let performanceMonitor: PerformanceMonitor | null = null;
  let dashboard: PerformanceDashboard | null = null;
  let rum: RealUserMonitoring | null = null;
  let alerts: PerformanceAlerts | null = null;

  try {
    // Initialize performance monitor first
    if (finalConfig.performance.enabled) {
      performanceMonitor = createPerformanceMonitor(finalConfig.performance.debug);
      console.log('✅ Performance monitor initialized');
    }

    // Initialize analytics
    if (finalConfig.analytics.enabled) {
      analytics = initializeAnalytics({
        trackingId: finalConfig.analytics.trackingId,
        debug: finalConfig.analytics.debug,
        performanceTracking: true
      });
      console.log('✅ Analytics initialized');
    }

    // Initialize RUM
    if (finalConfig.rum.enabled && performanceMonitor) {
      rum = initializeRUM({
        enabled: true,
        sampleRate: finalConfig.rum.sampleRate,
        trackUserInteractions: true,
        trackPageVisibility: true,
        trackNetworkInfo: true,
        trackMemoryUsage: true,
        trackLongTasks: true,
        trackResourceTiming: true
      });
      console.log('✅ RUM initialized');
    }

    // Initialize alerts and reporting
    if (finalConfig.alerts.enabled && performanceMonitor) {
      alerts = initializePerformanceAlerts(performanceMonitor, {
        enabled: true,
        notifications: {
          console: finalConfig.alerts.console,
          analytics: finalConfig.alerts.analytics
        },
        reporting: {
          enabled: true,
          interval: 300000, // 5 minutes
          includeUserMetrics: true,
          includeResourceTiming: true,
          includeErrorLogs: true
        }
      }, rum);
      console.log('✅ Performance alerts initialized');
    }

    // Initialize dashboard (typically only in development)
    if (finalConfig.dashboard.enabled && performanceMonitor) {
      dashboard = initializePerformanceDashboard(performanceMonitor, {
        enabled: true,
        position: finalConfig.dashboard.position,
        minimized: finalConfig.dashboard.minimized,
        autoUpdate: true,
        showAlerts: true
      });
      console.log('✅ Performance dashboard initialized');
    }

    // Setup automatic tracking
    if (analytics) {
      setupAutoTracking();
    }

    console.log('🚀 Performance monitoring suite fully initialized');

  } catch (error) {
    console.error('❌ Failed to initialize performance monitoring suite:', error);
  }

  return {
    analytics,
    performanceMonitor,
    dashboard,
    rum,
    alerts
  };
}

/**
 * Quick setup for development mode
 */
export function initializeDevMode(): Promise<any> {
  return initializePerformanceMonitoringSuite({
    analytics: { debug: true },
    performance: { debug: true },
    dashboard: { enabled: true, minimized: false },
    rum: { sampleRate: 1.0 },
    alerts: { console: true }
  });
}

/**
 * Quick setup for production mode
 */
export function initializeProductionMode(): Promise<any> {
  return initializePerformanceMonitoringSuite({
    analytics: { debug: false },
    performance: { debug: false },
    dashboard: { enabled: false },
    rum: { sampleRate: 0.1 },
    alerts: { console: false, analytics: true }
  });
}