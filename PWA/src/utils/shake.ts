/**
 * Shake detection utility
 * Detects device shake using accelerometer data
 * Ported from Android ShakeEventListener.java
 */

/**
 * Shake detection configuration
 */
interface ShakeConfig {
  /** Minimum force required to trigger shake (g-force) */
  threshold: number;
  /** Minimum time between shake events (ms) */
  timeout: number;
}

/**
 * Default shake detection configuration
 */
const DEFAULT_CONFIG: ShakeConfig = {
  threshold: 2.5, // Android uses 2.7f, we use slightly lower for better sensitivity
  timeout: 500, // 500ms between shakes
};

/**
 * Shake event listener
 */
export type ShakeCallback = () => void;

/**
 * Shake detector class
 */
export class ShakeDetector {
  private config: ShakeConfig;
  private lastShakeTime: number = 0;
  private lastX: number = 0;
  private lastY: number = 0;
  private lastZ: number = 0;
  private lastUpdate: number = 0;
  private callbacks: Set<ShakeCallback> = new Set();
  private isListening: boolean = false;
  private handleMotion: ((event: DeviceMotionEvent) => void) | null = null;

  constructor(config: Partial<ShakeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start listening for shake events
   */
  start(): boolean {
    if (this.isListening) {
      return true;
    }

    if (!this.isSupported()) {
      console.warn('DeviceMotion API not supported');
      return false;
    }

    this.handleMotion = this.onDeviceMotion.bind(this);
    window.addEventListener('devicemotion', this.handleMotion);
    this.isListening = true;
    return true;
  }

  /**
   * Stop listening for shake events
   */
  stop(): void {
    if (!this.isListening || !this.handleMotion) {
      return;
    }

    window.removeEventListener('devicemotion', this.handleMotion);
    this.isListening = false;
    this.handleMotion = null;
  }

  /**
   * Add a shake callback
   */
  addListener(callback: ShakeCallback): void {
    this.callbacks.add(callback);
  }

  /**
   * Remove a shake callback
   */
  removeListener(callback: ShakeCallback): void {
    this.callbacks.delete(callback);
  }

  /**
   * Remove all callbacks
   */
  removeAllListeners(): void {
    this.callbacks.clear();
  }

  /**
   * Check if DeviceMotion API is supported
   */
  isSupported(): boolean {
    return 'DeviceMotionEvent' in window;
  }

  /**
   * Get current listening status
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Request permission for motion sensors (iOS 13+)
   */
  async requestPermission(): Promise<boolean> {
    // Check if we need to request permission (iOS 13+)
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('Failed to request motion permission:', error);
        return false;
      }
    }

    // Permission not required or already granted
    return true;
  }

  /**
   * Handle device motion event
   */
  private onDeviceMotion(event: DeviceMotionEvent): void {
    const now = Date.now();

    // Get acceleration data
    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) {
      return;
    }

    const x = acceleration.x ?? 0;
    const y = acceleration.y ?? 0;
    const z = acceleration.z ?? 0;

    // Initialize on first reading
    if (this.lastUpdate === 0) {
      this.lastX = x;
      this.lastY = y;
      this.lastZ = z;
      this.lastUpdate = now;
      return;
    }

    // Calculate time difference
    const timeDiff = now - this.lastUpdate;
    
    // Only check every 100ms to avoid too many checks
    if (timeDiff < 100) {
      return;
    }

    this.lastUpdate = now;

    // Calculate acceleration deltas
    const deltaX = Math.abs(this.lastX - x);
    const deltaY = Math.abs(this.lastY - y);
    const deltaZ = Math.abs(this.lastZ - z);

    // Calculate total acceleration change (similar to Android implementation)
    const speed = (deltaX + deltaY + deltaZ) / timeDiff * 10000;

    // Check if shake threshold is exceeded
    if (speed > this.config.threshold) {
      // Check if enough time has passed since last shake
      if (now - this.lastShakeTime > this.config.timeout) {
        this.lastShakeTime = now;
        this.notifyListeners();
      }
    }

    // Update last values
    this.lastX = x;
    this.lastY = y;
    this.lastZ = z;
  }

  /**
   * Notify all listeners of shake event
   */
  private notifyListeners(): void {
    this.callbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error('Shake callback error:', error);
      }
    });
  }
}

/**
 * Create a singleton shake detector instance
 */
let defaultDetector: ShakeDetector | null = null;

/**
 * Get the default shake detector instance
 */
export function getShakeDetector(): ShakeDetector {
  if (!defaultDetector) {
    defaultDetector = new ShakeDetector();
  }
  return defaultDetector;
}

/**
 * Convenience function to listen for shake events
 */
export function onShake(callback: ShakeCallback): () => void {
  const detector = getShakeDetector();
  detector.addListener(callback);
  detector.start();

  // Return cleanup function
  return () => {
    detector.removeListener(callback);
    if (detector.getIsListening() && detector['callbacks'].size === 0) {
      detector.stop();
    }
  };
}
