/**
 * Utility functions tests
 */

import { describe, it, expect } from 'vitest'
import {
  formatFileSize,
  formatSpeed,
  formatTimeRemaining,
  getFileExtension,
  isImageFile,
  isVideoFile,
  generateFileId,
  matchAcceptPattern,
} from '../src/utils/file'

describe('File Utilities', () => {
  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(1073741824)).toBe('1 GB')
    })
  })

  describe('formatSpeed', () => {
    it('should format speed correctly', () => {
      expect(formatSpeed(1024)).toBe('1 KB/s')
      expect(formatSpeed(1048576)).toBe('1 MB/s')
    })
  })

  describe('formatTimeRemaining', () => {
    it('should format seconds', () => {
      expect(formatTimeRemaining(30)).toBe('30s')
      expect(formatTimeRemaining(90)).toContain('1m')
      expect(formatTimeRemaining(3700)).toContain('1h')
    })
  })

  describe('getFileExtension', () => {
    it('should extract extension', () => {
      expect(getFileExtension('test.jpg')).toBe('jpg')
      expect(getFileExtension('test.tar.gz')).toBe('gz')
      expect(getFileExtension('noextension')).toBe('')
    })
  })

  describe('isImageFile', () => {
    it('should detect image files', () => {
      const imageFile = new File([], 'test.jpg', { type: 'image/jpeg' })
      const textFile = new File([], 'test.txt', { type: 'text/plain' })

      expect(isImageFile(imageFile)).toBe(true)
      expect(isImageFile(textFile)).toBe(false)
    })
  })

  describe('isVideoFile', () => {
    it('should detect video files', () => {
      const videoFile = new File([], 'test.mp4', { type: 'video/mp4' })
      const imageFile = new File([], 'test.jpg', { type: 'image/jpeg' })

      expect(isVideoFile(videoFile)).toBe(true)
      expect(isVideoFile(imageFile)).toBe(false)
    })
  })

  describe('generateFileId', () => {
    it('should generate unique IDs', () => {
      const file = new File([], 'test.jpg')
      const id1 = generateFileId(file)
      const id2 = generateFileId(file)

      expect(id1).not.toBe(id2)
      expect(id1).toContain('test.jpg')
    })
  })

  describe('matchAcceptPattern', () => {
    it('should match MIME types', () => {
      const file = new File([], 'test.jpg', { type: 'image/jpeg' })

      expect(matchAcceptPattern(file, 'image/jpeg')).toBe(true)
      expect(matchAcceptPattern(file, 'image/*')).toBe(true)
      expect(matchAcceptPattern(file, 'video/*')).toBe(false)
    })

    it('should match extensions', () => {
      const file = new File([], 'test.jpg', { type: 'image/jpeg' })

      expect(matchAcceptPattern(file, '.jpg')).toBe(true)
      expect(matchAcceptPattern(file, '.png')).toBe(false)
    })
  })
})

