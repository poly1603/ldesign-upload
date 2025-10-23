/**
 * Error Handler - Handle upload errors with retry logic
 */

import { DEFAULTS, ERRORS } from '../config/constants'

export class UploadError extends Error {
  constructor(
    message: string,
    public code: string,
    public fileId?: string,
    public retryable: boolean = true
  ) {
    super(message)
    this.name = 'UploadError'
  }
}

export class ErrorHandler {
  private retryCount: Map<string, number> = new Map()
  private maxRetries: number

  constructor(maxRetries: number = DEFAULTS.MAX_RETRIES) {
    this.maxRetries = maxRetries
  }

  /**
   * Handle upload error
   */
  handleError(error: Error, fileId: string): {
    shouldRetry: boolean
    retryDelay: number
    errorMessage: string
  } {
    const retries = this.retryCount.get(fileId) || 0
    const shouldRetry = retries < this.maxRetries

    // Calculate retry delay with exponential backoff
    const retryDelay = this.calculateBackoff(retries)

    // Determine error message
    let errorMessage = error.message
    let code = 'UNKNOWN_ERROR'

    if (error.message.includes('Network')) {
      errorMessage = ERRORS.NETWORK_ERROR
      code = 'NETWORK_ERROR'
    } else if (error.message.includes('timeout')) {
      errorMessage = ERRORS.TIMEOUT
      code = 'TIMEOUT'
    } else if (error.message.includes('abort') || error.message.includes('cancel')) {
      errorMessage = ERRORS.CANCELLED
      code = 'CANCELLED'
    } else if (error.message.includes('status')) {
      errorMessage = ERRORS.UPLOAD_FAILED
      code = 'UPLOAD_FAILED'
    }

    return {
      shouldRetry,
      retryDelay,
      errorMessage,
    }
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoff(retryCount: number): number {
    // Base delay: 1 second
    // Max delay: 30 seconds
    const baseDelay = 1000
    const maxDelay = 30000
    const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay)

    // Add jitter (±25%)
    const jitter = delay * 0.25 * (Math.random() - 0.5)

    return delay + jitter
  }

  /**
   * Increment retry count
   */
  incrementRetry(fileId: string): number {
    const count = (this.retryCount.get(fileId) || 0) + 1
    this.retryCount.set(fileId, count)
    return count
  }

  /**
   * Reset retry count
   */
  resetRetry(fileId: string): void {
    this.retryCount.delete(fileId)
  }

  /**
   * Get retry count
   */
  getRetryCount(fileId: string): number {
    return this.retryCount.get(fileId) || 0
  }

  /**
   * Check if should retry
   */
  shouldRetry(fileId: string): boolean {
    return this.getRetryCount(fileId) < this.maxRetries
  }

  /**
   * Clear all retry counts
   */
  clear(): void {
    this.retryCount.clear()
  }

  /**
   * Set max retries
   */
  setMaxRetries(max: number): void {
    this.maxRetries = Math.max(0, max)
  }

  /**
   * Create error from response
   */
  createError(response: Response, fileId?: string): UploadError {
    let message = ERRORS.UPLOAD_FAILED
    let code = 'UPLOAD_FAILED'
    let retryable = true

    // HTTP status code errors
    if (response.status === 400) {
      message = 'Bad request'
      code = 'BAD_REQUEST'
      retryable = false
    } else if (response.status === 401) {
      message = 'Unauthorized'
      code = 'UNAUTHORIZED'
      retryable = false
    } else if (response.status === 403) {
      message = 'Forbidden'
      code = 'FORBIDDEN'
      retryable = false
    } else if (response.status === 404) {
      message = 'Endpoint not found'
      code = 'NOT_FOUND'
      retryable = false
    } else if (response.status === 413) {
      message = 'File too large'
      code = 'FILE_TOO_LARGE'
      retryable = false
    } else if (response.status >= 500) {
      message = 'Server error'
      code = 'SERVER_ERROR'
      retryable = true
    }

    return new UploadError(message, code, fileId, retryable)
  }

  /**
   * Create network error
   */
  createNetworkError(fileId?: string): UploadError {
    return new UploadError(ERRORS.NETWORK_ERROR, 'NETWORK_ERROR', fileId, true)
  }

  /**
   * Create timeout error
   */
  createTimeoutError(fileId?: string): UploadError {
    return new UploadError(ERRORS.TIMEOUT, 'TIMEOUT', fileId, true)
  }

  /**
   * Create cancelled error
   */
  createCancelledError(fileId?: string): UploadError {
    return new UploadError(ERRORS.CANCELLED, 'CANCELLED', fileId, false)
  }
}

