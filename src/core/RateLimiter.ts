/**
 * Rate Limiter - Control upload speed and bandwidth usage
 * 
 * This limiter throttles upload speed to prevent overwhelming the network
 * or to comply with bandwidth restrictions.
 */

export class RateLimiter {
  private maxBytesPerSecond: number
  private bytesTransferred: number = 0
  private windowStart: number = Date.now()
  private windowDuration: number = 1000 // 1 second
  private queue: Array<() => void> = []
  private isThrottling: boolean = false

  constructor(maxBytesPerSecond: number = Infinity) {
    this.maxBytesPerSecond = maxBytesPerSecond
  }

  /**
   * Throttle data transfer
   * Returns a promise that resolves when it's safe to send the data
   */
  async throttle(byteCount: number): Promise<void> {
    if (this.maxBytesPerSecond === Infinity) {
      // No throttling
      return Promise.resolve()
    }

    // Check if we need to reset the window
    const now = Date.now()
    if (now - this.windowStart >= this.windowDuration) {
      this.resetWindow()
    }

    // Check if adding this chunk would exceed the limit
    if (this.bytesTransferred + byteCount > this.maxBytesPerSecond) {
      // Wait until next window
      await this.waitForNextWindow()
      return this.throttle(byteCount) // Retry in next window
    }

    // Update bytes transferred
    this.bytesTransferred += byteCount
  }

  /**
   * Wait until the next time window
   */
  private waitForNextWindow(): Promise<void> {
    return new Promise((resolve) => {
      const now = Date.now()
      const timeUntilNextWindow = this.windowDuration - (now - this.windowStart)
      
      setTimeout(() => {
        this.resetWindow()
        resolve()
      }, Math.max(0, timeUntilNextWindow))
    })
  }

  /**
   * Reset the time window
   */
  private resetWindow(): void {
    this.bytesTransferred = 0
    this.windowStart = Date.now()
  }

  /**
   * Get current transfer rate (bytes per second)
   */
  getCurrentRate(): number {
    const elapsed = Date.now() - this.windowStart
    if (elapsed === 0) return 0
    return (this.bytesTransferred / elapsed) * 1000
  }

  /**
   * Get remaining bandwidth in current window
   */
  getRemainingBandwidth(): number {
    return Math.max(0, this.maxBytesPerSecond - this.bytesTransferred)
  }

  /**
   * Set max bytes per second
   */
  setMaxBytesPerSecond(bytesPerSecond: number): void {
    this.maxBytesPerSecond = Math.max(0, bytesPerSecond)
  }

  /**
   * Get max bytes per second
   */
  getMaxBytesPerSecond(): number {
    return this.maxBytesPerSecond
  }

  /**
   * Disable throttling
   */
  disable(): void {
    this.maxBytesPerSecond = Infinity
  }

  /**
   * Enable throttling with specific rate
   */
  enable(bytesPerSecond: number): void {
    this.maxBytesPerSecond = bytesPerSecond
  }

  /**
   * Calculate optimal chunk size based on rate limit
   */
  getOptimalChunkSize(): number {
    if (this.maxBytesPerSecond === Infinity) {
      return 5 * 1024 * 1024 // 5MB default
    }
    // Return chunk size that takes ~1 second to upload
    return Math.min(this.maxBytesPerSecond, 5 * 1024 * 1024)
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.bytesTransferred = 0
    this.windowStart = Date.now()
    this.queue = []
    this.isThrottling = false
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      maxBytesPerSecond: this.maxBytesPerSecond,
      currentRate: this.getCurrentRate(),
      bytesTransferred: this.bytesTransferred,
      remainingBandwidth: this.getRemainingBandwidth(),
      windowDuration: this.windowDuration,
    }
  }
}

/**
 * Adaptive Rate Limiter - Automatically adjusts rate based on network conditions
 */
export class AdaptiveRateLimiter extends RateLimiter {
  private successfulTransfers: number = 0
  private failedTransfers: number = 0
  private latencyHistory: number[] = []
  private maxLatencyHistory: number = 10
  private adaptiveEnabled: boolean = true

  constructor(initialMaxBytesPerSecond: number = Infinity) {
    super(initialMaxBytesPerSecond)
  }

  /**
   * Record successful transfer
   */
  recordSuccess(latency: number): void {
    this.successfulTransfers++
    this.latencyHistory.push(latency)
    
    if (this.latencyHistory.length > this.maxLatencyHistory) {
      this.latencyHistory.shift()
    }

    if (this.adaptiveEnabled) {
      this.adaptRate()
    }
  }

  /**
   * Record failed transfer
   */
  recordFailure(): void {
    this.failedTransfers++

    if (this.adaptiveEnabled) {
      this.adaptRate()
    }
  }

  /**
   * Adapt rate based on network conditions
   */
  private adaptRate(): void {
    const totalTransfers = this.successfulTransfers + this.failedTransfers
    if (totalTransfers === 0) return

    const successRate = this.successfulTransfers / totalTransfers
    const avgLatency = this.getAverageLatency()

    // Adjust rate based on success rate and latency
    if (successRate > 0.95 && avgLatency < 500) {
      // Network is good, increase rate by 10%
      this.setMaxBytesPerSecond(this.getMaxBytesPerSecond() * 1.1)
    } else if (successRate < 0.8 || avgLatency > 2000) {
      // Network is poor, decrease rate by 20%
      this.setMaxBytesPerSecond(this.getMaxBytesPerSecond() * 0.8)
    }
  }

  /**
   * Get average latency
   */
  private getAverageLatency(): number {
    if (this.latencyHistory.length === 0) return 0
    const sum = this.latencyHistory.reduce((a, b) => a + b, 0)
    return sum / this.latencyHistory.length
  }

  /**
   * Enable/disable adaptive mode
   */
  setAdaptive(enabled: boolean): void {
    this.adaptiveEnabled = enabled
  }

  /**
   * Get network quality estimation
   */
  getNetworkQuality(): 'excellent' | 'good' | 'fair' | 'poor' {
    const avgLatency = this.getAverageLatency()
    const totalTransfers = this.successfulTransfers + this.failedTransfers
    const successRate = totalTransfers > 0 ? this.successfulTransfers / totalTransfers : 1

    if (successRate > 0.95 && avgLatency < 300) return 'excellent'
    if (successRate > 0.85 && avgLatency < 800) return 'good'
    if (successRate > 0.7 && avgLatency < 2000) return 'fair'
    return 'poor'
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    super.reset()
    this.successfulTransfers = 0
    this.failedTransfers = 0
    this.latencyHistory = []
  }
}
