# Performance Monitoring and Analytics System

A comprehensive performance monitoring suite with Core Web Vitals tracking, real user monitoring (RUM), and privacy-conscious analytics integration.

## Features

### ⚡ Core Web Vitals Tracking
- **LCP** (Largest Contentful Paint)
- **FID** (First Input Delay) 
- **CLS** (Cumulative Layout Shift)
- **FCP** (First Contentful Paint)
- **TTFB** (Time to First Byte)
- **INP** (Interaction to Next Paint)

### 📊 Custom Performance Metrics
- DOM Content Loaded time
- Window Load time
- Font loading performance
- Image loading performance
- Lazy loading effectiveness
- Navigation timing breakdown

### 👥 Real User Monitoring (RUM)
- User interaction tracking
- Page visibility monitoring
- Network information tracking
- Memory usage monitoring
- Long task detection
- Resource timing analysis
- Error tracking

### 🚨 Performance Alerts
- Automated performance budget monitoring
- Real-time alerts for performance regressions
- Configurable thresholds and notifications
- Performance reporting and insights

### 📈 Enhanced Analytics
- Privacy-conscious Google Analytics integration
- Performance metrics integration
- Custom event tracking
- User engagement tracking
- Automatic external link tracking
- Scroll depth monitoring

### 🎛️ Performance Dashboard
- Real-time performance metrics display
- Visual performance score
- Budget status indicators
- Debug mode for development
- Exportable performance reports

## Quick Start

### Automatic Initialization (Recommended)

The performance monitoring system is automatically initialized in `BaseLayout.astro`. It detects debug mode and configures appropriate settings for development vs production.

Debug mode is enabled when:
- `hostname === 'localhost'`
- URL contains `?debug=performance`

### Manual Initialization

```typescript
import { initializePerformanceMonitoringSuite } from '@/lib';

// Initialize complete suite
const suite = await initializePerformanceMonitoringSuite({
  analytics: {
    enabled: true,
    trackingId: 'G-YOUR-ID',
    debug: false
  },
  performance: {
    enabled: true,
    debug: false
  },
  dashboard: {
    enabled: false, // Enable in development
    position: 'bottom-right'
  },
  rum: {
    enabled: true,
    sampleRate: 0.1 // 10% of users
  },
  alerts: {
    enabled: true,
    console: false,
    analytics: true
  }
});
```

### Development Mode

```typescript
import { initializeDevMode } from '@/lib';

// Quick setup for development
await initializeDevMode();
```

### Production Mode

```typescript
import { initializeProductionMode } from '@/lib';

// Quick setup for production
await initializeProductionMode();
```

## Individual Components

### Performance Monitor

```typescript
import { createPerformanceMonitor } from '@/lib/performance';

const monitor = createPerformanceMonitor(true); // Enable debug mode

// Get current metrics
const metrics = monitor.getMetrics();
console.log('Web Vitals:', metrics.webVitals);
console.log('Custom Metrics:', metrics.customMetrics);

// Generate report
const report = monitor.generateReport();
monitor.sendReport(); // Send to analytics
```

### Enhanced Analytics

```typescript
import { initializeAnalytics, trackButtonClick } from '@/lib/analytics';

const analytics = initializeAnalytics({
  trackingId: 'G-YOUR-ID',
  performanceTracking: true,
  consentMode: true
});

// Track custom events
analytics.trackEvent({
  action: 'click',
  category: 'Button',
  label: 'Subscribe'
});

// Track performance metrics
analytics.trackWebVitals();

// Utility functions
trackButtonClick('Newsletter Subscribe', 'Header');
```

### Performance Dashboard

```typescript
import { initializePerformanceDashboard } from '@/lib/performance-dashboard';

const dashboard = initializePerformanceDashboard(performanceMonitor, {
  position: 'bottom-right',
  minimized: false,
  autoUpdate: true,
  showAlerts: true
});

// Control dashboard
window.performanceDashboard.toggle();
window.performanceDashboard.exportReport();
```

### Real User Monitoring (RUM)

```typescript
import { initializeRUM } from '@/lib/rum';

const rum = initializeRUM({
  sampleRate: 0.1, // Sample 10% of users
  trackUserInteractions: true,
  trackPageVisibility: true,
  trackNetworkInfo: true,
  trackMemoryUsage: true,
  trackLongTasks: true,
  trackResourceTiming: true
});

// Get session summary
const summary = rum.getSessionSummary();
```

### Performance Alerts

```typescript
import { initializePerformanceAlerts } from '@/lib/performance-alerts';

const alerts = initializePerformanceAlerts(performanceMonitor, {
  thresholds: {
    lcp: { warning: 2500, critical: 4000 },
    fid: { warning: 100, critical: 300 },
    cls: { warning: 0.1, critical: 0.25 }
  },
  notifications: {
    console: true,
    analytics: true,
    webhook: 'https://your-webhook-url.com'
  },
  reporting: {
    enabled: true,
    interval: 300000, // 5 minutes
    includeUserMetrics: true
  }
});

// Get current alerts
const currentAlerts = alerts.getAlerts();

// Export data
const data = alerts.exportData();
```

## Debug Mode Features

When debug mode is enabled:

1. **Performance Dashboard** - Visual real-time metrics
2. **Console Logging** - Detailed performance logs
3. **Global Debug Objects** - Access via browser console:
   ```javascript
   window.performanceMonitor.getMetrics()
   window.analytics.generateReport()
   window.rum.getSessionSummary()
   window.performanceDebug.logMetrics()
   ```

## Performance Budgets

Default performance budgets:
- **LCP**: 2.5s (warning) / 4.0s (critical)
- **FID**: 100ms (warning) / 300ms (critical)  
- **CLS**: 0.1 (warning) / 0.25 (critical)
- **FCP**: 1.8s (warning) / 3.0s (critical)
- **TTFB**: 800ms (warning) / 1.8s (critical)

## Privacy Considerations

The system respects user privacy through:

1. **Consent Mode** - Waits for user consent before tracking
2. **IP Anonymization** - Anonymizes user IP addresses
3. **No Personal Data** - Only tracks performance metrics
4. **Sampling** - Uses statistical sampling to reduce tracking
5. **Local Storage** - Stores preferences locally

## Browser Support

- **Core Web Vitals**: Modern browsers with PerformanceObserver API
- **RUM Features**: Progressive enhancement based on API availability
- **Fallback**: Graceful degradation for older browsers

## Configuration Files

Key files in the system:
- `performance.ts` - Core Web Vitals and performance monitoring
- `analytics.ts` - Enhanced Google Analytics integration  
- `rum.ts` - Real user monitoring system
- `performance-dashboard.ts` - Visual performance dashboard
- `performance-alerts.ts` - Alerting and reporting system
- `index.ts` - Main exports and suite initialization

## Development

### Adding Custom Metrics

```typescript
// In your component
import { measurePerformance } from '@/lib/performance';

const result = measurePerformance('My Custom Operation', () => {
  // Your expensive operation
  return expensiveFunction();
});
```

### Custom Event Tracking

```typescript
import { getAnalytics } from '@/lib/analytics';

const analytics = getAnalytics();
analytics?.trackEvent({
  action: 'custom_action',
  category: 'Custom',
  label: 'My Custom Event',
  custom_parameters: {
    customData: 'value'
  }
});
```

### Performance Testing

1. Enable debug mode: Add `?debug=performance` to URL
2. Open browser console
3. Use `window.performanceDebug.startMonitoring()`
4. Interact with the page
5. Use `window.performanceDebug.logMetrics()` to see results

## Troubleshooting

### Common Issues

1. **Modules not loading**: Check browser console for import errors
2. **No metrics**: Ensure PerformanceObserver API is supported
3. **Analytics not working**: Check consent mode and privacy settings
4. **Dashboard not showing**: Verify debug mode is enabled

### Browser Console Commands

```javascript
// Check system status
window.performanceMonitor?.getMetrics()
window.analytics?.getStatus()
window.rum?.getSessionSummary()

// Export data
window.performanceAlerts?.exportData()
window.performanceDashboard?.exportReport()

// Debug utilities  
window.performanceDebug?.logReport()
window.performanceDebug?.startMonitoring()
```

## Contributing

When adding new performance metrics:

1. Add metric collection in `performance.ts`
2. Update TypeScript types in `performance.d.ts` 
3. Add dashboard visualization in `performance-dashboard.ts`
4. Configure alerts in `performance-alerts.ts`
5. Update this documentation

## Performance Impact

The monitoring system is designed to be lightweight:
- **Initial load**: ~15KB gzipped
- **Runtime overhead**: <1ms per interaction
- **Memory usage**: <1MB additional heap
- **Network**: Batched analytics requests

The system uses performance-conscious patterns:
- Lazy loading of modules
- Throttled event handlers  
- Efficient batching
- Statistical sampling
- Graceful degradation