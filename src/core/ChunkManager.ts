/**
 * Chunk Manager - Handle file chunking, chunk upload, and resume capability
 */

import type { ChunkInfo, ChunkUploadOptions } from '../types'
import { SimpleEventEmitter } from '../utils/events'
import { sliceFile } from '../utils/file'
import { DEFAULTS, STORAGE_KEYS } from '../config/constants'

interface ChunkProgress {
  fileId: string
  fileName: string
  fileSize: number
  chunkSize: number
  totalChunks: number
  uploadedChunks: number[]
  createdAt: number
}

export class ChunkManager extends SimpleEventEmitter {
  private chunkSize: number
  private concurrent: number
  private retries: number
  private progressMap: Map<string, ChunkProgress> = new Map()

  constructor(options: {
    chunkSize?: number
    concurrent?: number
    retries?: number
  } = {}) {
    super()
    this.chunkSize = options.chunkSize || DEFAULTS.CHUNK_SIZE
    this.concurrent = options.concurrent || DEFAULTS.MAX_CONCURRENT_UPLOADS
    this.retries = options.retries || DEFAULTS.MAX_RETRIES

    // Load saved progress from storage
    this.loadProgress()
  }

  /**
   * Split file into chunks
   */
  splitFile(file: File): Blob[] {
    return sliceFile(file, this.chunkSize)
  }

  /**
   * Get chunk info array
   */
  getChunkInfo(file: File): ChunkInfo[] {
    const totalChunks = Math.ceil(file.size / this.chunkSize)
    const chunks: ChunkInfo[] = []

    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.chunkSize
      const end = Math.min(start + this.chunkSize, file.size)

      chunks.push({
        index: i,
        start,
        end,
        uploaded: false,
        retries: 0,
      })
    }

    return chunks
  }

  /**
   * Check if file needs chunking
   */
  needsChunking(file: File): boolean {
    return file.size > this.chunkSize
  }

  /**
   * Initialize chunk upload for a file
   */
  initChunkUpload(fileId: string, file: File): ChunkProgress {
    const totalChunks = Math.ceil(file.size / this.chunkSize)

    const progress: ChunkProgress = {
      fileId,
      fileName: file.name,
      fileSize: file.size,
      chunkSize: this.chunkSize,
      totalChunks,
      uploadedChunks: [],
      createdAt: Date.now(),
    }

    this.progressMap.set(fileId, progress)
    this.saveProgress()

    return progress
  }

  /**
   * Mark chunk as uploaded
   */
  markChunkUploaded(fileId: string, chunkIndex: number): void {
    const progress = this.progressMap.get(fileId)
    if (!progress) {
      return
    }

    if (!progress.uploadedChunks.includes(chunkIndex)) {
      progress.uploadedChunks.push(chunkIndex)
      progress.uploadedChunks.sort((a, b) => a - b)
      this.saveProgress()

      this.emit('chunkProgress', {
        fileId,
        chunkIndex,
        uploadedChunks: progress.uploadedChunks.length,
        totalChunks: progress.totalChunks,
      })
    }
  }

  /**
   * Get uploaded chunks for a file
   */
  getUploadedChunks(fileId: string): number[] {
    const progress = this.progressMap.get(fileId)
    return progress ? [...progress.uploadedChunks] : []
  }

  /**
   * Get pending chunks for a file
   */
  getPendingChunks(fileId: string): number[] {
    const progress = this.progressMap.get(fileId)
    if (!progress) {
      return []
    }

    const all = Array.from({ length: progress.totalChunks }, (_, i) => i)
    return all.filter(i => !progress.uploadedChunks.includes(i))
  }

  /**
   * Check if all chunks are uploaded
   */
  isComplete(fileId: string): boolean {
    const progress = this.progressMap.get(fileId)
    if (!progress) {
      return false
    }

    return progress.uploadedChunks.length === progress.totalChunks
  }

  /**
   * Get upload progress percentage
   */
  getProgress(fileId: string): number {
    const progress = this.progressMap.get(fileId)
    if (!progress || progress.totalChunks === 0) {
      return 0
    }

    return (progress.uploadedChunks.length / progress.totalChunks) * 100
  }

  /**
   * Calculate uploaded size
   */
  getUploadedSize(fileId: string): number {
    const progress = this.progressMap.get(fileId)
    if (!progress) {
      return 0
    }

    return progress.uploadedChunks.length * this.chunkSize
  }

  /**
   * Clear progress for a file
   */
  clearProgress(fileId: string): void {
    this.progressMap.delete(fileId)
    this.saveProgress()
  }

  /**
   * Clear all progress
   */
  clearAllProgress(): void {
    this.progressMap.clear()
    this.saveProgress()
  }

  /**
   * Save progress to localStorage
   */
  private saveProgress(): void {
    try {
      const data = Array.from(this.progressMap.values())
      localStorage.setItem(STORAGE_KEYS.UPLOAD_PROGRESS, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save upload progress:', error)
    }
  }

  /**
   * Load progress from localStorage
   */
  private loadProgress(): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.UPLOAD_PROGRESS)
      if (data) {
        const progress: ChunkProgress[] = JSON.parse(data)

        // Only load recent progress (within 7 days)
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
        progress.forEach(p => {
          if (p.createdAt > sevenDaysAgo) {
            this.progressMap.set(p.fileId, p)
          }
        })
      }
    } catch (error) {
      console.error('Failed to load upload progress:', error)
    }
  }

  /**
   * Find resumable upload by file
   */
  findResumableUpload(file: File): ChunkProgress | null {
    // Find by file name and size
    for (const progress of this.progressMap.values()) {
      if (progress.fileName === file.name && progress.fileSize === file.size) {
        return progress
      }
    }
    return null
  }

  /**
   * Calculate MD5 hash of a file chunk (placeholder - requires @ldesign/crypto)
   */
  async calculateChunkHash(chunk: Blob): Promise<string> {
    // TODO: Integrate with @ldesign/crypto for MD5 calculation
    // For now, return a simple identifier
    return `chunk-${chunk.size}-${Date.now()}`
  }

  /**
   * Set chunk size
   */
  setChunkSize(size: number): void {
    this.chunkSize = Math.max(1024 * 1024, size) // Minimum 1MB
  }

  /**
   * Set concurrent chunk uploads
   */
  setConcurrent(concurrent: number): void {
    this.concurrent = Math.max(1, concurrent)
  }

  /**
   * Set max retries
   */
  setMaxRetries(retries: number): void {
    this.retries = Math.max(0, retries)
  }

  /**
   * Get chunk size
   */
  getChunkSize(): number {
    return this.chunkSize
  }
}

