/**
 * Upload History - Track and persist upload history
 */

import { STORAGE_KEYS } from '../config/constants'

export interface HistoryItem {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  uploadedAt: number
  url?: string
  success: boolean
  error?: string
}

export class UploadHistory {
  private maxItems: number
  private history: HistoryItem[] = []

  constructor(maxItems: number = 100) {
    this.maxItems = maxItems
    this.loadHistory()
  }

  /**
   * Add item to history
   */
  addItem(item: Omit<HistoryItem, 'id' | 'uploadedAt'>): void {
    const historyItem: HistoryItem = {
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      uploadedAt: Date.now(),
      ...item,
    }

    this.history.unshift(historyItem)

    // Keep only max items
    if (this.history.length > this.maxItems) {
      this.history = this.history.slice(0, this.maxItems)
    }

    this.saveHistory()
  }

  /**
   * Get all history
   */
  getHistory(): HistoryItem[] {
    return [...this.history]
  }

  /**
   * Get successful uploads
   */
  getSuccessfulUploads(): HistoryItem[] {
    return this.history.filter(item => item.success)
  }

  /**
   * Get failed uploads
   */
  getFailedUploads(): HistoryItem[] {
    return this.history.filter(item => !item.success)
  }

  /**
   * Get recent uploads (last N items)
   */
  getRecentUploads(count: number = 10): HistoryItem[] {
    return this.history.slice(0, count)
  }

  /**
   * Get uploads by date range
   */
  getUploadsByDateRange(startDate: Date, endDate: Date): HistoryItem[] {
    const start = startDate.getTime()
    const end = endDate.getTime()

    return this.history.filter(
      item => item.uploadedAt >= start && item.uploadedAt <= end
    )
  }

  /**
   * Get uploads by file type
   */
  getUploadsByType(type: string): HistoryItem[] {
    return this.history.filter(item => item.fileType.startsWith(type))
  }

  /**
   * Search history
   */
  searchHistory(query: string): HistoryItem[] {
    const lowerQuery = query.toLowerCase()
    return this.history.filter(item =>
      item.fileName.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.history = []
    this.saveHistory()
  }

  /**
   * Remove item from history
   */
  removeItem(id: string): void {
    this.history = this.history.filter(item => item.id !== id)
    this.saveHistory()
  }

  /**
   * Get statistics
   */
  getStats(): {
    total: number
    successful: number
    failed: number
    totalSize: number
    byType: Record<string, number>
  } {
    const stats = {
      total: this.history.length,
      successful: 0,
      failed: 0,
      totalSize: 0,
      byType: {} as Record<string, number>,
    }

    for (const item of this.history) {
      if (item.success) {
        stats.successful++
      } else {
        stats.failed++
      }

      stats.totalSize += item.fileSize

      const type = item.fileType.split('/')[0] || 'other'
      stats.byType[type] = (stats.byType[type] || 0) + 1
    }

    return stats
  }

  /**
   * Save history to localStorage
   */
  private saveHistory(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.UPLOAD_HISTORY, JSON.stringify(this.history))
    } catch (error) {
      console.error('Failed to save upload history:', error)
    }
  }

  /**
   * Load history from localStorage
   */
  private loadHistory(): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.UPLOAD_HISTORY)
      if (data) {
        this.history = JSON.parse(data)

        // Remove items older than 30 days
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
        this.history = this.history.filter(item => item.uploadedAt > thirtyDaysAgo)

        // Keep only max items
        if (this.history.length > this.maxItems) {
          this.history = this.history.slice(0, this.maxItems)
        }
      }
    } catch (error) {
      console.error('Failed to load upload history:', error)
      this.history = []
    }
  }

  /**
   * Export history as JSON
   */
  exportHistory(): string {
    return JSON.stringify(this.history, null, 2)
  }

  /**
   * Import history from JSON
   */
  importHistory(json: string): void {
    try {
      const imported = JSON.parse(json)
      if (Array.isArray(imported)) {
        this.history = imported.slice(0, this.maxItems)
        this.saveHistory()
      }
    } catch (error) {
      console.error('Failed to import history:', error)
    }
  }
}

