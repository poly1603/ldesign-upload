/**
 * ProgressTracker tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ProgressTracker } from '../src/core/ProgressTracker'

describe('ProgressTracker', () => {
  let progressTracker: ProgressTracker

  beforeEach(() => {
    progressTracker = new ProgressTracker()
    vi.useFakeTimers()
  })

  describe('updateProgress', () => {
    it('should calculate progress percentage', () => {
      const event = progressTracker.updateProgress('file1', 5000, 10000)

      expect(event.progress).toBe(50)
      expect(event.uploadedSize).toBe(5000)
      expect(event.totalSize).toBe(10000)
    })

    it('should cap progress at 100%', () => {
      const event = progressTracker.updateProgress('file1', 15000, 10000)

      expect(event.progress).toBe(100)
    })
  })

  describe('speed calculation', () => {
    it('should calculate upload speed', () => {
      // First update
      const event1 = progressTracker.updateProgress('file1', 1000, 10000)
      expect(event1.speed).toBe(0) // No previous data

      // Advance time by 1 second
      vi.advanceTimersByTime(1000)

      // Second update (2000 bytes more)
      const event2 = progressTracker.updateProgress('file1', 3000, 10000)
      expect(event2.speed).toBeGreaterThan(0)
    })
  })

  describe('getGlobalProgress', () => {
    it('should calculate global progress', () => {
      const files = [
        {
          id: '1',
          uploadedSize: 5000,
          totalSize: 10000,
          speed: 1000,
        },
        {
          id: '2',
          uploadedSize: 3000,
          totalSize: 6000,
          speed: 500,
        },
      ]

      const global = progressTracker.getGlobalProgress(files as any)

      expect(global.uploadedSize).toBe(8000)
      expect(global.totalSize).toBe(16000)
      expect(global.progress).toBe(50)
      expect(global.speed).toBe(1500)
    })
  })

  describe('reset', () => {
    it('should reset tracker for file', () => {
      progressTracker.updateProgress('file1', 5000, 10000)
      progressTracker.reset('file1')

      const event = progressTracker.updateProgress('file1', 1000, 10000)
      expect(event.speed).toBe(0) // Reset, so no previous data
    })
  })
})

