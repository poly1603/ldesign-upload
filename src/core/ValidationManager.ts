/**
 * Validation Manager - Validate files before upload
 */

import type { ValidationRules } from '../types'
import { validateFile, validateFiles, ValidationError } from '../utils/validation'
import { SimpleEventEmitter } from '../utils/events'

export class ValidationManager extends SimpleEventEmitter {
  private rules: ValidationRules

  constructor(rules: ValidationRules = {}) {
    super()
    this.rules = rules
  }

  /**
   * Update validation rules
   */
  setRules(rules: ValidationRules): void {
    this.rules = { ...this.rules, ...rules }
  }

  /**
   * Get current validation rules
   */
  getRules(): ValidationRules {
    return { ...this.rules }
  }

  /**
   * Validate single file
   */
  async validateSingle(file: File): Promise<{ valid: boolean; error?: ValidationError }> {
    try {
      await validateFile(file, this.rules)
      return { valid: true }
    } catch (error) {
      const validationError = error instanceof ValidationError
        ? error
        : new ValidationError('Validation failed', 'UNKNOWN')

      this.emit('validationError', { file, error: validationError })

      return { valid: false, error: validationError }
    }
  }

  /**
   * Validate multiple files
   */
  async validateMultiple(
    files: File[],
    existingCount: number = 0
  ): Promise<{
    valid: File[]
    invalid: Array<{ file: File; error: ValidationError }>
  }> {
    const result = await validateFiles(files, this.rules, existingCount)

    // Emit validation errors
    for (const { file, error } of result.invalid) {
      this.emit('validationError', { file, error })
    }

    return result
  }

  /**
   * Check if file type is accepted
   */
  isTypeAccepted(file: File): boolean {
    if (!this.rules.accept) {
      return true
    }

    const patterns = Array.isArray(this.rules.accept)
      ? this.rules.accept
      : this.rules.accept.split(',').map(s => s.trim())

    return patterns.some(pattern => {
      if (pattern === file.type) return true
      if (pattern.endsWith('/*')) {
        const prefix = pattern.slice(0, -2)
        return file.type.startsWith(prefix)
      }
      if (pattern.startsWith('.')) {
        const ext = file.name.split('.').pop()?.toLowerCase()
        return ext === pattern.slice(1).toLowerCase()
      }
      return false
    })
  }

  /**
   * Check if file size is acceptable
   */
  isSizeAcceptable(file: File): boolean {
    if (this.rules.maxSize && file.size > this.rules.maxSize) {
      return false
    }

    if (this.rules.minSize && file.size < this.rules.minSize) {
      return false
    }

    return true
  }

  /**
   * Check if adding files would exceed max files limit
   */
  canAddFiles(count: number, existingCount: number): boolean {
    if (!this.rules.maxFiles) {
      return true
    }

    return existingCount + count <= this.rules.maxFiles
  }

  /**
   * Get max allowed file size
   */
  getMaxSize(): number | undefined {
    return this.rules.maxSize
  }

  /**
   * Get accepted file types
   */
  getAcceptedTypes(): string | string[] | undefined {
    return this.rules.accept
  }
}

