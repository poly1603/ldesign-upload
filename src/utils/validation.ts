/**
 * Validation utility functions
 */

import type { ValidationRules } from '../types'
import { ERRORS } from '../config/constants'
import { getImageDimensions, matchAcceptPattern } from './file'

/**
 * Validation error
 */
export class ValidationError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Validate file against rules
 */
export async function validateFile(file: File, rules: ValidationRules): Promise<void> {
  // Type validation
  if (rules.accept) {
    const accepted = matchAcceptPattern(file, rules.accept)
    if (!accepted) {
      throw new ValidationError(ERRORS.INVALID_TYPE, 'INVALID_TYPE')
    }
  }

  // Size validation
  if (rules.maxSize && file.size > rules.maxSize) {
    throw new ValidationError(ERRORS.FILE_TOO_LARGE, 'FILE_TOO_LARGE')
  }

  if (rules.minSize && file.size < rules.minSize) {
    throw new ValidationError(ERRORS.FILE_TOO_SMALL, 'FILE_TOO_SMALL')
  }

  // Image dimensions validation
  if (file.type.startsWith('image/')) {
    if (rules.minWidth || rules.maxWidth || rules.minHeight || rules.maxHeight) {
      try {
        const { width, height } = await getImageDimensions(file)

        if (rules.minWidth && width < rules.minWidth) {
          throw new ValidationError(ERRORS.INVALID_DIMENSIONS, 'INVALID_DIMENSIONS')
        }

        if (rules.maxWidth && width > rules.maxWidth) {
          throw new ValidationError(ERRORS.INVALID_DIMENSIONS, 'INVALID_DIMENSIONS')
        }

        if (rules.minHeight && height < rules.minHeight) {
          throw new ValidationError(ERRORS.INVALID_DIMENSIONS, 'INVALID_DIMENSIONS')
        }

        if (rules.maxHeight && height > rules.maxHeight) {
          throw new ValidationError(ERRORS.INVALID_DIMENSIONS, 'INVALID_DIMENSIONS')
        }
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error
        }
        // If we can't read dimensions, skip dimension validation
      }
    }
  }

  // Custom validator
  if (rules.validator) {
    const valid = await rules.validator(file)
    if (!valid) {
      throw new ValidationError(ERRORS.INVALID_FILE, 'INVALID_FILE')
    }
  }
}

/**
 * Validate multiple files
 */
export async function validateFiles(
  files: File[],
  rules: ValidationRules,
  existingCount: number = 0
): Promise<{ valid: File[]; invalid: Array<{ file: File; error: ValidationError }> }> {
  const valid: File[] = []
  const invalid: Array<{ file: File; error: ValidationError }> = []

  // Check total file count
  if (rules.maxFiles && files.length + existingCount > rules.maxFiles) {
    const maxAllowed = rules.maxFiles - existingCount
    files = files.slice(0, Math.max(0, maxAllowed))
  }

  // Check total size
  if (rules.maxTotalSize) {
    let totalSize = 0
    const filteredFiles: File[] = []

    for (const file of files) {
      if (totalSize + file.size <= rules.maxTotalSize) {
        filteredFiles.push(file)
        totalSize += file.size
      }
    }

    files = filteredFiles
  }

  // Validate each file
  for (const file of files) {
    try {
      await validateFile(file, rules)
      valid.push(file)
    } catch (error) {
      invalid.push({
        file,
        error: error instanceof ValidationError ? error : new ValidationError(ERRORS.INVALID_FILE, 'INVALID_FILE'),
      })
    }
  }

  return { valid, invalid }
}

