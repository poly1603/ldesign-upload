/**
 * ValidationManager tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ValidationManager } from '../src/core/ValidationManager'
import { ValidationError } from '../src/utils/validation'

describe('ValidationManager', () => {
  let validationManager: ValidationManager

  beforeEach(() => {
    validationManager = new ValidationManager()
  })

  describe('validateSingle', () => {
    it('should accept valid file', async () => {
      validationManager.setRules({
        accept: 'image/*',
        maxSize: 10 * 1024 * 1024,
      })

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const result = await validationManager.validateSingle(file)

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject invalid type', async () => {
      validationManager.setRules({
        accept: 'image/*',
      })

      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const result = await validationManager.validateSingle(file)

      expect(result.valid).toBe(false)
      expect(result.error).toBeInstanceOf(ValidationError)
      expect(result.error?.code).toBe('INVALID_TYPE')
    })

    it('should reject oversized file', async () => {
      validationManager.setRules({
        maxSize: 1024, // 1KB
      })

      const largeContent = new Uint8Array(2048) // 2KB
      const file = new File([largeContent], 'large.txt')
      const result = await validationManager.validateSingle(file)

      expect(result.valid).toBe(false)
      expect(result.error?.code).toBe('FILE_TOO_LARGE')
    })
  })

  describe('validateMultiple', () => {
    it('should validate multiple files', async () => {
      validationManager.setRules({
        accept: 'image/*',
        maxFiles: 2,
      })

      const files = [
        new File([], 'test1.jpg', { type: 'image/jpeg' }),
        new File([], 'test2.jpg', { type: 'image/jpeg' }),
        new File([], 'test3.txt', { type: 'text/plain' }),
      ]

      const result = await validationManager.validateMultiple(files)

      expect(result.valid.length).toBe(2)
      expect(result.invalid.length).toBe(1)
    })
  })

  describe('isTypeAccepted', () => {
    it('should check if type is accepted', () => {
      validationManager.setRules({ accept: 'image/*' })

      const imageFile = new File([], 'test.jpg', { type: 'image/jpeg' })
      const textFile = new File([], 'test.txt', { type: 'text/plain' })

      expect(validationManager.isTypeAccepted(imageFile)).toBe(true)
      expect(validationManager.isTypeAccepted(textFile)).toBe(false)
    })
  })

  describe('isSizeAcceptable', () => {
    it('should check if size is acceptable', () => {
      validationManager.setRules({
        minSize: 100,
        maxSize: 1000,
      })

      const tooSmall = new File([new Uint8Array(50)], 'small.txt')
      const justRight = new File([new Uint8Array(500)], 'right.txt')
      const tooLarge = new File([new Uint8Array(1500)], 'large.txt')

      expect(validationManager.isSizeAcceptable(tooSmall)).toBe(false)
      expect(validationManager.isSizeAcceptable(justRight)).toBe(true)
      expect(validationManager.isSizeAcceptable(tooLarge)).toBe(false)
    })
  })
})

