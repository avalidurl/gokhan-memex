/**
 * TypeScript declarations for performance monitoring
 * Extends global Window interface with performance monitoring properties
 */

import type { PerformanceMonitor } from '../lib/performance';
import type { Analytics } from '../lib/analytics';
import type { PerformanceDashboard } from '../lib/performance-dashboard';
import type { RealUserMonitoring } from '../lib/rum';
import type { PerformanceAlerts } from '../lib/performance-alerts';

declare global {
  interface Window {
    // Performance Monitoring
    performanceMonitor?: PerformanceMonitor;
    performanceDashboard?: {
      toggle: () => void;
      refresh: () => void;
      exportReport: () => void;
      show: () => void;
      hide: () => void;
    };
    performanceAlerts?: PerformanceAlerts;

    // Analytics
    analytics?: Analytics;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    enableGoogleAnalytics?: () => void;
    disableGoogleAnalytics?: () => void;

    // RUM
    rum?: RealUserMonitoring;

    // Debug utilities
    performanceDebug?: {
      logMetrics: () => void;
      logReport: () => void;
      measure: <T>(name: string, fn: () => T) => T;
      startMonitoring: () => void;
      stopMonitoring: () => void;
    };

    // Performance observers
    perfObserver?: PerformanceObserver;
  }

  interface Navigator {
    // Network Information API
    connection?: {
      effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
      addEventListener?: (event: string, handler: () => void) => void;
    };
    
    // Device Memory API
    deviceMemory?: number;
    
    // Hardware Concurrency
    hardwareConcurrency?: number;
  }

  interface Performance {
    // Performance Memory API
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }

  interface PerformanceEventTiming extends PerformanceEntry {
    processingStart?: number;
    processingEnd?: number;
    hadRecentInput?: boolean;
  }

  interface PerformanceNavigationTiming extends PerformanceEntry {
    // Navigation Timing Level 2
    domainLookupStart: number;
    domainLookupEnd: number;
    connectStart: number;
    connectEnd: number;
    secureConnectionStart: number;
    requestStart: number;
    responseStart: number;
    responseEnd: number;
    domInteractive: number;
    domComplete: number;
    loadEventStart: number;
    loadEventEnd: number;
    fetchStart: number;
  }

  interface PerformanceResourceTiming extends PerformanceEntry {
    // Resource Timing Level 2
    transferSize: number;
    encodedBodySize: number;
    decodedBodySize: number;
    initiatorType: string;
  }
}

// Module augmentations
declare module 'astro:env' {
  interface Env {
    NODE_ENV?: 'development' | 'production' | 'test';
  }
}

// Export types for external use
export type {
  WebVitalsMetrics,
  CustomPerformanceMetrics,
  PerformanceReport,
  PerformanceBudgets
} from '../lib/performance';

export type {
  AnalyticsConfig,
  AnalyticsEvent,
  PerformanceEvent
} from '../lib/analytics';

export type {
  DashboardConfig,
  PerformanceBudgetConfig
} from '../lib/performance-dashboard';

export type {
  RUMConfig,
  UserSession,
  PageView,
  UserInteraction,
  DeviceInfo,
  NetworkInfo
} from '../lib/rum';

export type {
  AlertConfig,
  AlertThresholds,
  Alert,
  PerformanceReport as DetailedPerformanceReport
} from '../lib/performance-alerts';

// Utility types
export interface PerformanceMetrics {
  webVitals: WebVitalsMetrics;
  customMetrics: CustomPerformanceMetrics;
}

export interface PerformanceThresholds {
  lcp: { good: number; poor: number };
  fid: { good: number; poor: number };
  cls: { good: number; poor: number };
  fcp: { good: number; poor: number };
  ttfb: { good: number; poor: number };
}

export type PerformanceRating = 'good' | 'needs-improvement' | 'poor' | 'unknown';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export type ConnectionType = 'slow-2g' | '2g' | '3g' | '4g' | undefined;