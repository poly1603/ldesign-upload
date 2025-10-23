/**
 * Batch Processor - Handle batch operations for multiple files
 */

import { ImageProcessor } from '../processors/ImageProcessor'
import type { ImageProcessOptions } from '../types'

export class BatchProcessor {
  private imageProcessor: ImageProcessor

  constructor() {
    this.imageProcessor = new ImageProcessor()
  }

  /**
   * Batch compress images
   */
  async batchCompress(
    files: File[],
    options: ImageProcessOptions = {}
  ): Promise<Array<{ original: File; processed: File }>> {
    const results: Array<{ original: File; processed: File }> = []

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        try {
          const processed = await this.imageProcessor.process(file)
          results.push({ original: file, processed })
        } catch (error) {
          console.error(`Failed to compress ${file.name}:`, error)
          // Keep original file if compression fails
          results.push({ original: file, processed: file })
        }
      } else {
        // Non-image files pass through unchanged
        results.push({ original: file, processed: file })
      }
    }

    return results
  }

  /**
   * Batch process with callback for progress
   */
  async batchProcessWithProgress(
    files: File[],
    processor: (file: File) => Promise<File>,
    onProgress?: (current: number, total: number) => void
  ): Promise<File[]> {
    const results: File[] = []

    for (let i = 0; i < files.length; i++) {
      const processedFile = await processor(files[i])
      results.push(processedFile)

      if (onProgress) {
        onProgress(i + 1, files.length)
      }
    }

    return results
  }

  /**
   * Create ZIP from files (requires JSZip - optional dependency)
   */
  async createZip(files: File[], zipName: string = 'files.zip'): Promise<Blob> {
    // This is a placeholder - actual implementation would require JSZip
    // For now, throw error to indicate missing dependency
    throw new Error('ZIP creation requires JSZip library. Install it as optional dependency.')
  }

  /**
   * Calculate total size
   */
  getTotalSize(files: File[]): number {
    return files.reduce((sum, file) => sum + file.size, 0)
  }

  /**
   * Group files by type
   */
  groupFilesByType(files: File[]): Map<string, File[]> {
    const groups = new Map<string, File[]>()

    for (const file of files) {
      const type = file.type.split('/')[0] || 'other'
      if (!groups.has(type)) {
        groups.set(type, [])
      }
      groups.get(type)!.push(file)
    }

    return groups
  }

  /**
   * Filter files by type
   */
  filterFilesByType(files: File[], type: string): File[] {
    return files.filter(file => file.type.startsWith(type))
  }

  /**
   * Sort files by size
   */
  sortFilesBySize(files: File[], ascending: boolean = true): File[] {
    return [...files].sort((a, b) => {
      return ascending ? a.size - b.size : b.size - a.size
    })
  }

  /**
   * Sort files by name
   */
  sortFilesByName(files: File[], ascending: boolean = true): File[] {
    return [...files].sort((a, b) => {
      return ascending
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    })
  }
}

