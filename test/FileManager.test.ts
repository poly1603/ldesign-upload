/**
 * FileManager tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { FileManager } from '../src/core/FileManager'

describe('FileManager', () => {
  let fileManager: FileManager
  let testFile: File

  beforeEach(() => {
    fileManager = new FileManager(3)
    testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
  })

  describe('addFile', () => {
    it('should add file to queue', () => {
      const fileItem = fileManager.addFile(testFile)

      expect(fileItem.file).toBe(testFile)
      expect(fileItem.status).toBe('pending')
      expect(fileItem.progress).toBe(0)
      expect(fileManager.getFileCount()).toBe(1)
    })

    it('should generate unique IDs', () => {
      const item1 = fileManager.addFile(testFile)
      const item2 = fileManager.addFile(testFile)

      expect(item1.id).not.toBe(item2.id)
    })
  })

  describe('removeFile', () => {
    it('should remove file from queue', () => {
      const fileItem = fileManager.addFile(testFile)
      const removed = fileManager.removeFile(fileItem.id)

      expect(removed).toBe(true)
      expect(fileManager.getFileCount()).toBe(0)
    })

    it('should return false for non-existent file', () => {
      const removed = fileManager.removeFile('non-existent')
      expect(removed).toBe(false)
    })
  })

  describe('getFilesByStatus', () => {
    it('should filter files by status', () => {
      const item1 = fileManager.addFile(testFile)
      const item2 = fileManager.addFile(new File([], 'test2.txt'))

      fileManager.updateFileStatus(item2.id, 'uploading')

      const pending = fileManager.getFilesByStatus('pending')
      const uploading = fileManager.getFilesByStatus('uploading')

      expect(pending.length).toBe(1)
      expect(uploading.length).toBe(1)
    })
  })

  describe('canStartUpload', () => {
    it('should respect concurrent limit', () => {
      const item1 = fileManager.addFile(testFile)
      const item2 = fileManager.addFile(new File([], 'test2.txt'))
      const item3 = fileManager.addFile(new File([], 'test3.txt'))
      const item4 = fileManager.addFile(new File([], 'test4.txt'))

      fileManager.updateFileStatus(item1.id, 'uploading')
      fileManager.updateFileStatus(item2.id, 'uploading')
      fileManager.updateFileStatus(item3.id, 'uploading')

      expect(fileManager.canStartUpload()).toBe(false)

      fileManager.updateFileStatus(item1.id, 'success')
      expect(fileManager.canStartUpload()).toBe(true)
    })
  })

  describe('getStats', () => {
    it('should return correct statistics', () => {
      fileManager.addFile(testFile)
      fileManager.addFile(new File([], 'test2.txt'))

      const stats = fileManager.getStats()

      expect(stats.total).toBe(2)
      expect(stats.pending).toBe(2)
      expect(stats.uploading).toBe(0)
    })
  })

  describe('clear', () => {
    it('should clear all files', () => {
      fileManager.addFile(testFile)
      fileManager.addFile(new File([], 'test2.txt'))

      fileManager.clear()

      expect(fileManager.getFileCount()).toBe(0)
    })
  })
})

