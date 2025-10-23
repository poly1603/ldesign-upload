/**
 * ChunkManager tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ChunkManager } from '../src/core/ChunkManager'

describe('ChunkManager', () => {
  let chunkManager: ChunkManager

  beforeEach(() => {
    chunkManager = new ChunkManager({
      chunkSize: 1024 * 1024, // 1MB
      concurrent: 3,
      retries: 3,
    })
  })

  describe('splitFile', () => {
    it('should split file into chunks', () => {
      const content = new Uint8Array(3 * 1024 * 1024) // 3MB
      const file = new File([content], 'test.bin')

      const chunks = chunkManager.splitFile(file)

      expect(chunks.length).toBe(3)
      expect(chunks[0].size).toBe(1024 * 1024)
      expect(chunks[1].size).toBe(1024 * 1024)
      expect(chunks[2].size).toBe(1024 * 1024)
    })

    it('should handle files smaller than chunk size', () => {
      const content = new Uint8Array(512 * 1024) // 512KB
      const file = new File([content], 'small.bin')

      const chunks = chunkManager.splitFile(file)

      expect(chunks.length).toBe(1)
      expect(chunks[0].size).toBe(512 * 1024)
    })
  })

  describe('getChunkInfo', () => {
    it('should generate chunk info', () => {
      const content = new Uint8Array(2.5 * 1024 * 1024) // 2.5MB
      const file = new File([content], 'test.bin')

      const chunkInfo = chunkManager.getChunkInfo(file)

      expect(chunkInfo.length).toBe(3) // 1MB + 1MB + 0.5MB
      expect(chunkInfo[0].start).toBe(0)
      expect(chunkInfo[0].end).toBe(1024 * 1024)
      expect(chunkInfo[1].start).toBe(1024 * 1024)
      expect(chunkInfo[2].uploaded).toBe(false)
    })
  })

  describe('needsChunking', () => {
    it('should determine if chunking is needed', () => {
      const smallFile = new File([new Uint8Array(512 * 1024)], 'small.bin')
      const largeFile = new File([new Uint8Array(2 * 1024 * 1024)], 'large.bin')

      expect(chunkManager.needsChunking(smallFile)).toBe(false)
      expect(chunkManager.needsChunking(largeFile)).toBe(true)
    })
  })

  describe('markChunkUploaded', () => {
    it('should track uploaded chunks', () => {
      const file = new File([new Uint8Array(3 * 1024 * 1024)], 'test.bin')
      const fileId = 'test-file-id'

      chunkManager.initChunkUpload(fileId, file)
      chunkManager.markChunkUploaded(fileId, 0)
      chunkManager.markChunkUploaded(fileId, 1)

      const uploaded = chunkManager.getUploadedChunks(fileId)
      const pending = chunkManager.getPendingChunks(fileId)

      expect(uploaded).toEqual([0, 1])
      expect(pending).toEqual([2])
    })
  })

  describe('isComplete', () => {
    it('should check if all chunks are uploaded', () => {
      const file = new File([new Uint8Array(2 * 1024 * 1024)], 'test.bin')
      const fileId = 'test-file-id'

      chunkManager.initChunkUpload(fileId, file)

      expect(chunkManager.isComplete(fileId)).toBe(false)

      chunkManager.markChunkUploaded(fileId, 0)
      chunkManager.markChunkUploaded(fileId, 1)

      expect(chunkManager.isComplete(fileId)).toBe(true)
    })
  })
})

