/**
 * Service Worker Management
 * Handles registration, updates, and integration with performance monitoring
 */

import { getAnalytics } from './analytics';

export interface ServiceWorkerConfig {
  enabled: boolean;
  debug: boolean;
  updateInterval: number;
  respectPrivacy: boolean;
  cacheStrategy: 'conservative' | 'aggressive';
}

export interface CacheStatus {
  version: string;
  caches: Record<string, { count: number; urls: string[] }>;
  totalSize: number;
  lastUpdate: number;
}

export interface ServiceWorkerMessage {
  type: string;
  data?: any;
  timestamp: number;
}

/**
 * Service Worker Manager
 */
export class ServiceWorkerManager {
  private config: ServiceWorkerConfig;
  private registration: ServiceWorkerRegistration | null = null;
  private isOnline = true;
  private updateCheckInterval: number | null = null;

  constructor(config: Partial<ServiceWorkerConfig> = {}) {
    this.config = {
      enabled: true,
      debug: false,
      updateInterval: 60000, // 1 minute
      respectPrivacy: true,
      cacheStrategy: 'conservative',
      ...config
    };

    this.init();
  }

  /**
   * Initialize service worker
   */
  private async init(): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('[SW Manager] Service Worker not supported');
      return;
    }

    if (!this.config.enabled) {
      console.log('[SW Manager] Service Worker disabled');
      return;
    }

    try {
      await this.registerServiceWorker();
      this.setupEventListeners();
      this.startUpdateChecker();
      
      if (this.config.debug) {
        console.log('[SW Manager] Initialized successfully');
      }
    } catch (error) {
      console.error('[SW Manager] Initialization failed:', error);
    }
  }

  /**
   * Register service worker
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'imports'
      });

      if (this.config.debug) {
        console.log('[SW Manager] Registration successful:', this.registration);
      }

      // Handle registration state changes
      this.registration.addEventListener('updatefound', () => {
        this.handleUpdateFound();
      });

      // Check for immediate updates
      if (this.registration.waiting) {
        this.handleWaitingServiceWorker();
      }

      if (this.registration.installing) {
        this.trackInstallProgress(this.registration.installing);
      }

      // Track registration success
      this.trackEvent('sw_registered', { scope: this.registration.scope });

    } catch (error) {
      console.error('[SW Manager] Registration failed:', error);
      this.trackEvent('sw_registration_failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.trackEvent('network_online');
      this.notifyNetworkStatus('online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.trackEvent('network_offline');
      this.notifyNetworkStatus('offline');
    });

    // Service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleServiceWorkerMessage(event.data);
    });

    // Control change (new service worker took control)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (this.config.debug) {
        console.log('[SW Manager] New service worker took control');
      }
      this.trackEvent('sw_controller_changed');
    });
  }

  /**
   * Handle update found
   */
  private handleUpdateFound(): void {
    if (!this.registration || !this.registration.installing) return;

    const newWorker = this.registration.installing;
    
    if (this.config.debug) {
      console.log('[SW Manager] New service worker installing');
    }

    this.trackInstallProgress(newWorker);
  }

  /**
   * Track service worker install progress
   */
  private trackInstallProgress(worker: ServiceWorker): void {
    worker.addEventListener('statechange', () => {
      if (this.config.debug) {
        console.log('[SW Manager] Service worker state changed:', worker.state);
      }

      switch (worker.state) {
        case 'installed':
          if (navigator.serviceWorker.controller) {
            // New service worker installed, show update notification
            this.notifyUpdate();
          } else {
            // First install
            this.notifyInstalled();
          }
          this.trackEvent('sw_installed');
          break;
          
        case 'activated':
          this.trackEvent('sw_activated');
          break;
          
        case 'redundant':
          this.trackEvent('sw_redundant');
          break;
      }
    });
  }

  /**
   * Handle waiting service worker
   */
  private handleWaitingServiceWorker(): void {
    if (this.config.debug) {
      console.log('[SW Manager] Service worker waiting to activate');
    }
    this.notifyUpdate();
  }

  /**
   * Handle service worker messages
   */
  private handleServiceWorkerMessage(message: ServiceWorkerMessage): void {
    if (this.config.debug) {
      console.log('[SW Manager] Message from SW:', message);
    }

    switch (message.type) {
      case 'post-cached':
        this.notifyClients('post-cached', message.data);
        this.trackEvent('post_cached', { url: message.data?.url });
        break;
        
      case 'offline-post-served':
        this.notifyClients('offline-post-served', message.data);
        this.trackEvent('offline_reading', { url: message.data?.url });
        break;
    }
  }

  /**
   * Start update checker
   */
  private startUpdateChecker(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
    }

    this.updateCheckInterval = window.setInterval(() => {
      this.checkForUpdates();
    }, this.config.updateInterval);
  }

  /**
   * Check for service worker updates
   */
  public async checkForUpdates(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      await this.registration.update();
      return true;
    } catch (error) {
      if (this.config.debug) {
        console.error('[SW Manager] Update check failed:', error);
      }
      return false;
    }
  }

  /**
   * Apply pending update
   */
  public async applyUpdate(): Promise<void> {
    if (!this.registration || !this.registration.waiting) {
      throw new Error('No update available');
    }

    // Tell the waiting service worker to skip waiting and become active
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    this.trackEvent('sw_update_applied');
  }

  /**
   * Get cache status
   */
  public async getCacheStatus(): Promise<CacheStatus | null> {
    if (!this.registration || !this.registration.active) {
      return null;
    }

    try {
      const response = await this.sendMessage('get-cache-status');
      return response;
    } catch (error) {
      console.error('[SW Manager] Failed to get cache status:', error);
      return null;
    }
  }

  /**
   * Clear all caches
   */
  public async clearCache(): Promise<boolean> {
    if (!this.registration || !this.registration.active) {
      return false;
    }

    try {
      const response = await this.sendMessage('clear-cache');
      this.trackEvent('cache_cleared');
      return response.success;
    } catch (error) {
      console.error('[SW Manager] Failed to clear cache:', error);
      return false;
    }
  }

  /**
   * Cache a specific post for offline reading
   */
  public async cachePost(url: string): Promise<boolean> {
    if (!this.registration || !this.registration.active) {
      return false;
    }

    try {
      const response = await this.sendMessage('cache-post', { url });
      if (response.success) {
        this.trackEvent('manual_cache_post', { url });
      }
      return response.success;
    } catch (error) {
      console.error('[SW Manager] Failed to cache post:', error);
      return false;
    }
  }

  /**
   * Get list of offline-available posts
   */
  public async getOfflinePosts(): Promise<Array<{ url: string; cached: boolean }>> {
    if (!this.registration || !this.registration.active) {
      return [];
    }

    try {
      const response = await this.sendMessage('get-offline-posts');
      return response || [];
    } catch (error) {
      console.error('[SW Manager] Failed to get offline posts:', error);
      return [];
    }
  }

  /**
   * Send message to service worker
   */
  private async sendMessage(type: string, data?: any): Promise<any> {
    if (!this.registration || !this.registration.active) {
      throw new Error('No active service worker');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      messageChannel.port1.onmessageerror = (error) => {
        reject(error);
      };

      this.registration!.active!.postMessage(
        { type, data },
        [messageChannel.port2]
      );
    });
  }

  /**
   * Notify clients of events
   */
  private notifyClients(type: string, data?: any): void {
    window.postMessage({
      source: 'service-worker-manager',
      type,
      data,
      timestamp: Date.now()
    }, '*');
  }

  /**
   * Notify about installation
   */
  private notifyInstalled(): void {
    this.notifyClients('sw-installed');
    if (this.config.debug) {
      console.log('[SW Manager] ✅ Offline reading is now available!');
    }
  }

  /**
   * Notify about updates
   */
  private notifyUpdate(): void {
    this.notifyClients('sw-update-available');
    if (this.config.debug) {
      console.log('[SW Manager] 🔄 App update available');
    }
  }

  /**
   * Notify about network status changes
   */
  private notifyNetworkStatus(status: 'online' | 'offline'): void {
    this.notifyClients('network-status-changed', { status });
  }

  /**
   * Track events (respecting privacy settings)
   */
  private trackEvent(action: string, data?: any): void {
    if (!this.config.respectPrivacy) return;

    const analytics = getAnalytics();
    if (analytics) {
      analytics.trackEvent({
        action,
        category: 'Service Worker',
        label: data?.url || undefined,
        custom_parameters: data
      });
    }
  }

  /**
   * Check if offline reading is available
   */
  public isOfflineReadingAvailable(): boolean {
    return !!(this.registration && this.registration.active);
  }

  /**
   * Get network status
   */
  public getNetworkStatus(): 'online' | 'offline' {
    return this.isOnline ? 'online' : 'offline';
  }

  /**
   * Get service worker status
   */
  public getStatus(): {
    registered: boolean;
    active: boolean;
    waiting: boolean;
    networkStatus: 'online' | 'offline';
    offlineReading: boolean;
  } {
    return {
      registered: !!this.registration,
      active: !!(this.registration && this.registration.active),
      waiting: !!(this.registration && this.registration.waiting),
      networkStatus: this.getNetworkStatus(),
      offlineReading: this.isOfflineReadingAvailable()
    };
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
    }
  }
}

/**
 * Global instance
 */
let serviceWorkerManager: ServiceWorkerManager | null = null;

/**
 * Initialize service worker manager
 */
export function initializeServiceWorker(config?: Partial<ServiceWorkerConfig>): ServiceWorkerManager {
  if (serviceWorkerManager) {
    return serviceWorkerManager;
  }

  serviceWorkerManager = new ServiceWorkerManager(config);
  
  // Expose globally for debugging and other components
  if (typeof window !== 'undefined') {
    (window as any).serviceWorkerManager = serviceWorkerManager;
  }

  return serviceWorkerManager;
}

/**
 * Get service worker manager instance
 */
export function getServiceWorkerManager(): ServiceWorkerManager | null {
  return serviceWorkerManager;
}