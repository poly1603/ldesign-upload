/**
 * Duplication Detector - Detect duplicate files based on content fingerprint
 * 
 * This detector uses file metadata and optionally content hash to identify duplicates.
 */

import { SimpleEventEmitter } from '../utils/events'
import { STORAGE_KEYS } from '../config/constants'

interface FileFingerprint {
  hash: string
  name: string
  size: number
  lastModified: number
  uploadedAt: number
}

export class DuplicationDetector extends SimpleEventEmitter {
  private fingerprintCache: Map<string, FileFingerprint> = new Map()
  private useContentHash: boolean
  private maxCacheSize: number
  private cacheDuration: number // milliseconds

  constructor(options: {
    useContentHash?: boolean
    maxCacheSize?: number
    cacheDuration?: number // days
  } = {}) {
    super()
    this.useContentHash = options.useContentHash !== false
    this.maxCacheSize = options.maxCacheSize || 1000
    this.cacheDuration = (options.cacheDuration || 30) * 24 * 60 * 60 * 1000 // default 30 days

    // Load cache from storage
    this.loadCache()
  }

  /**
   * Check if file is duplicate
   */
  async isDuplicate(file: File): Promise<{
    isDuplicate: boolean
    existingFile?: FileFingerprint
  }> {
    const fingerprint = await this.getFileFingerprint(file)

    // Clean expired cache
    this.cleanExpiredCache()

    // Check if fingerprint exists
    const existing = this.fingerprintCache.get(fingerprint)

    if (existing) {
      this.emit('duplicateDetected', { file, existing })
      return { isDuplicate: true, existingFile: existing }
    }

    return { isDuplicate: false }
  }

  /**
   * Get file fingerprint (hash)
   */
  async getFileFingerprint(file: File): Promise<string> {
    if (this.useContentHash) {
      // Use content-based hash for accurate detection
      return this.calculateContentHash(file)
    } else {
      // Use metadata-based fingerprint for fast detection
      return this.calculateMetadataFingerprint(file)
    }
  }

  /**
   * Calculate content-based hash using MD5
   */
  private async calculateContentHash(file: File): Promise<string> {
    try {
      const { hash } = await import('@ldesign/crypto')
      const text = await file.text()
      const result = hash.md5(text)
      return result.hash
    } catch (error) {
      console.warn('Content hash failed, falling back to metadata fingerprint:', error)
      return this.calculateMetadataFingerprint(file)
    }
  }

  /**
   * Calculate metadata-based fingerprint
   */
  private calculateMetadataFingerprint(file: File): string {
    // Combine file metadata to create fingerprint
    return `${file.name}-${file.size}-${file.lastModified}-${file.type}`
  }

  /**
   * Mark file as uploaded (add to cache)
   */
  async markAsUploaded(file: File): Promise<void> {
    const hash = await this.getFileFingerprint(file)
    
    const fingerprint: FileFingerprint = {
      hash,
      name: file.name,
      size: file.size,
      lastModified: file.lastModified,
      uploadedAt: Date.now(),
    }

    this.fingerprintCache.set(hash, fingerprint)
    
    // Enforce max cache size
    if (this.fingerprintCache.size > this.maxCacheSize) {
      this.evictOldest()
    }

    this.saveCache()
  }

  /**
   * Remove file from cache
   */
  async removeFromCache(file: File): Promise<void> {
    const hash = await this.getFileFingerprint(file)
    this.fingerprintCache.delete(hash)
    this.saveCache()
  }

  /**
   * Clear expired cache entries
   */
  private cleanExpiredCache(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [hash, fingerprint] of this.fingerprintCache.entries()) {
      if (now - fingerprint.uploadedAt > this.cacheDuration) {
        expiredKeys.push(hash)
      }
    }

    expiredKeys.forEach(key => this.fingerprintCache.delete(key))

    if (expiredKeys.length > 0) {
      this.saveCache()
    }
  }

  /**
   * Evict oldest cache entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    for (const [hash, fingerprint] of this.fingerprintCache.entries()) {
      if (fingerprint.uploadedAt < oldestTime) {
        oldestTime = fingerprint.uploadedAt
        oldestKey = hash
      }
    }

    if (oldestKey) {
      this.fingerprintCache.delete(oldestKey)
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cacheSize: this.fingerprintCache.size,
      maxCacheSize: this.maxCacheSize,
      useContentHash: this.useContentHash,
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.fingerprintCache.clear()
    this.saveCache()
  }

  /**
   * Save cache to localStorage
   */
  private saveCache(): void {
    try {
      const data = Array.from(this.fingerprintCache.entries())
      localStorage.setItem(STORAGE_KEYS.UPLOAD_HISTORY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save duplication cache:', error)
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadCache(): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.UPLOAD_HISTORY)
      if (data) {
        const entries: Array<[string, FileFingerprint]> = JSON.parse(data)
        this.fingerprintCache = new Map(entries)
        
        // Clean expired on load
        this.cleanExpiredCache()
      }
    } catch (error) {
      console.error('Failed to load duplication cache:', error)
    }
  }

  /**
   * Enable/disable content hash
   */
  setUseContentHash(enabled: boolean): void {
    this.useContentHash = enabled
  }

  /**
   * Set cache duration
   */
  setCacheDuration(days: number): void {
    this.cacheDuration = days * 24 * 60 * 60 * 1000
  }
}
