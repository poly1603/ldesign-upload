/**
 * Progress Tracker - Track upload progress, speed, and time remaining
 */

import type { FileItem, ProgressEvent } from '../types'
import { SimpleEventEmitter } from '../utils/events'

export class ProgressTracker extends SimpleEventEmitter {
  private speeds: Map<string, number[]> = new Map() // Moving average window
  private lastProgress: Map<string, { bytes: number; time: number }> = new Map()
  private readonly SPEED_WINDOW_SIZE = 5 // Number of samples for moving average

  /**
   * Update file progress
   */
  updateProgress(fileId: string, uploadedSize: number, totalSize: number): ProgressEvent {
    const progress = totalSize > 0 ? (uploadedSize / totalSize) * 100 : 0
    const speed = this.calculateSpeed(fileId, uploadedSize)
    const timeRemaining = this.calculateTimeRemaining(uploadedSize, totalSize, speed)

    const event: ProgressEvent = {
      fileId,
      progress: Math.min(progress, 100),
      speed,
      timeRemaining,
      uploadedSize,
      totalSize,
    }

    this.emit('uploadProgress', event)

    return event
  }

  /**
   * Calculate upload speed (bytes per second)
   */
  private calculateSpeed(fileId: string, currentBytes: number): number {
    const now = Date.now()
    const last = this.lastProgress.get(fileId)

    if (!last) {
      this.lastProgress.set(fileId, { bytes: currentBytes, time: now })
      return 0
    }

    const timeDiff = (now - last.time) / 1000 // Convert to seconds
    const bytesDiff = currentBytes - last.bytes

    if (timeDiff === 0) {
      return 0
    }

    const speed = bytesDiff / timeDiff

    // Update for next calculation
    this.lastProgress.set(fileId, { bytes: currentBytes, time: now })

    // Add to moving average window
    if (!this.speeds.has(fileId)) {
      this.speeds.set(fileId, [])
    }

    const speeds = this.speeds.get(fileId)!
    speeds.push(speed)

    // Keep only last N samples
    if (speeds.length > this.SPEED_WINDOW_SIZE) {
      speeds.shift()
    }

    // Return average speed
    return speeds.reduce((sum, s) => sum + s, 0) / speeds.length
  }

  /**
   * Calculate time remaining (seconds)
   */
  private calculateTimeRemaining(uploadedSize: number, totalSize: number, speed: number): number {
    if (speed === 0) {
      return Infinity
    }

    const remainingBytes = totalSize - uploadedSize
    return remainingBytes / speed
  }

  /**
   * Get global progress
   */
  getGlobalProgress(files: FileItem[]): {
    progress: number
    uploadedSize: number
    totalSize: number
    speed: number
    timeRemaining: number
  } {
    let totalUploadedSize = 0
    let totalSize = 0
    let totalSpeed = 0

    for (const file of files) {
      totalUploadedSize += file.uploadedSize
      totalSize += file.totalSize
      totalSpeed += file.speed
    }

    const progress = totalSize > 0 ? (totalUploadedSize / totalSize) * 100 : 0
    const timeRemaining = totalSpeed > 0 ? (totalSize - totalUploadedSize) / totalSpeed : Infinity

    return {
      progress: Math.min(progress, 100),
      uploadedSize: totalUploadedSize,
      totalSize,
      speed: totalSpeed,
      timeRemaining,
    }
  }

  /**
   * Reset tracker for a file
   */
  reset(fileId: string): void {
    this.speeds.delete(fileId)
    this.lastProgress.delete(fileId)
  }

  /**
   * Clear all tracking data
   */
  clear(): void {
    this.speeds.clear()
    this.lastProgress.clear()
  }
}

