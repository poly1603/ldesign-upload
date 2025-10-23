/**
 * Video Processor - Handle video thumbnail extraction and metadata
 */

import type { VideoProcessOptions } from '../types'
import { getVideoInfo } from '../utils/file'
import { DEFAULTS } from '../config/constants'

export class VideoProcessor {
  private options: VideoProcessOptions

  constructor(options: VideoProcessOptions = {}) {
    this.options = {
      thumbnail: options.thumbnail !== false,
      thumbnailTime: options.thumbnailTime || DEFAULTS.VIDEO_THUMBNAIL_TIME,
      ...options,
    }
  }

  /**
   * Extract video thumbnail at specified time
   */
  async extractThumbnail(file: File, timeInSeconds?: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      const url = URL.createObjectURL(file)

      video.preload = 'metadata'
      video.muted = true

      video.onloadedmetadata = () => {
        // Seek to specified time
        const time = timeInSeconds !== undefined ? timeInSeconds : this.options.thumbnailTime || 0
        video.currentTime = Math.min(time, video.duration)
      }

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            throw new Error('Failed to get canvas context')
          }

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

          const dataURL = canvas.toDataURL('image/jpeg', 0.8)

          URL.revokeObjectURL(url)
          resolve(dataURL)
        } catch (error) {
          URL.revokeObjectURL(url)
          reject(error)
        }
      }

      video.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load video'))
      }

      video.src = url
    })
  }

  /**
   * Get video information
   */
  async getInfo(file: File): Promise<{
    width: number
    height: number
    duration: number
  }> {
    return getVideoInfo(file)
  }

  /**
   * Get video duration
   */
  async getDuration(file: File): Promise<number> {
    const info = await this.getInfo(file)
    return info.duration
  }

  /**
   * Get video dimensions
   */
  async getDimensions(file: File): Promise<{ width: number; height: number }> {
    const info = await this.getInfo(file)
    return { width: info.width, height: info.height }
  }

  /**
   * Format duration to readable string
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  /**
   * Update options
   */
  setOptions(options: Partial<VideoProcessOptions>): void {
    this.options = { ...this.options, ...options }
  }
}

