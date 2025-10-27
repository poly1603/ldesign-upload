/**
 * Image Processor - Handle image compression, cropping, rotation, and filters
 * 
 * This processor provides image manipulation capabilities.
 * It can optionally integrate with @ldesign/cropper for advanced cropping.
 */

import type { ImageProcessOptions, ImageFilter } from '../types'
import { compressImage, rotateImage, flipImage, createThumbnail } from '../utils/image'
import { DEFAULTS } from '../config/constants'

export class ImageProcessor {
  private options: ImageProcessOptions

  constructor(options: ImageProcessOptions = {}) {
    this.options = {
      compress: options.compress !== false,
      quality: options.quality || DEFAULTS.IMAGE_QUALITY,
      maxWidth: options.maxWidth || DEFAULTS.IMAGE_MAX_WIDTH,
      maxHeight: options.maxHeight || DEFAULTS.IMAGE_MAX_HEIGHT,
      format: options.format || 'jpeg',
      ...options,
    }
  }

  /**
   * Process image file
   */
  async process(file: File): Promise<File> {
    let processedBlob: Blob = file

    // Compress if enabled
    if (this.options.compress) {
      processedBlob = await this.compress(file)
    }

    // Rotate if specified
    if (this.options.rotate) {
      processedBlob = await this.rotate(new File([processedBlob], file.name, { type: file.type }))
    }

    // Flip if specified
    if (this.options.flipHorizontal || this.options.flipVertical) {
      processedBlob = await this.flip(
        new File([processedBlob], file.name, { type: file.type }),
        this.options.flipHorizontal,
        this.options.flipVertical
      )
    }

    // Apply filters if specified
    if (this.options.filters && this.options.filters.length > 0) {
      processedBlob = await this.applyFilters(
        new File([processedBlob], file.name, { type: file.type }),
        this.options.filters
      )
    }

    // Return as File
    return new File([processedBlob], file.name, { type: processedBlob.type })
  }

  /**
   * Compress image
   */
  async compress(file: File): Promise<Blob> {
    return compressImage(file, {
      quality: this.options.quality,
      maxWidth: this.options.maxWidth,
      maxHeight: this.options.maxHeight,
      format: this.options.format,
    })
  }

  /**
   * Rotate image
   */
  async rotate(file: File, degrees?: number): Promise<Blob> {
    return rotateImage(file, degrees || this.options.rotate || 0)
  }

  /**
   * Flip image
   */
  async flip(file: File, horizontal?: boolean, vertical?: boolean): Promise<Blob> {
    return flipImage(file, horizontal, vertical)
  }

  /**
   * Apply image filters
   */
  async applyFilters(file: File, filters: ImageFilter[]): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          if (!ctx) {
            throw new Error('Failed to get canvas context')
          }

          canvas.width = img.width
          canvas.height = img.height

          // Draw original image
          ctx.drawImage(img, 0, 0)

          // Apply each filter
          for (const filter of filters) {
            this.applyFilter(canvas, ctx, filter)
          }

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(url)
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Failed to apply filters'))
              }
            },
            file.type || 'image/jpeg',
            0.95
          )
        } catch (error) {
          URL.revokeObjectURL(url)
          reject(error)
        }
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load image'))
      }

      img.src = url
    })
  }

  /**
   * Apply single filter
   */
  private applyFilter(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, filter: ImageFilter): void {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    switch (filter.type) {
      case 'grayscale':
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
          data[i] = avg     // R
          data[i + 1] = avg // G
          data[i + 2] = avg // B
        }
        break

      case 'brightness':
        const brightness = (filter.value || 0) * 255
        for (let i = 0; i < data.length; i += 4) {
          data[i] += brightness
          data[i + 1] += brightness
          data[i + 2] += brightness
        }
        break

      case 'contrast':
        const contrast = (filter.value || 1)
        const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255))
        for (let i = 0; i < data.length; i += 4) {
          data[i] = factor * (data[i] - 128) + 128
          data[i + 1] = factor * (data[i + 1] - 128) + 128
          data[i + 2] = factor * (data[i + 2] - 128) + 128
        }
        break

      case 'sepia':
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189))
          data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168))
          data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131))
        }
        break

      case 'blur':
        // Gaussian blur using canvas filter (modern browsers)
        const blurAmount = filter.value || 5
        // Create temporary canvas for blur
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d')
        if (tempCtx) {
          tempCanvas.width = canvas.width
          tempCanvas.height = canvas.height
          tempCtx.filter = `blur(${blurAmount}px)`
          tempCtx.drawImage(canvas, 0, 0)
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(tempCanvas, 0, 0)
          return // Skip putImageData since we used drawImage
        }
        break

      case 'custom':
        if (filter.customFilter) {
          filter.customFilter(canvas)
          return // Custom filter handles everything
        }
        break
    }

    ctx.putImageData(imageData, 0, 0)
  }

  /**
   * Create thumbnail
   */
  async createThumbnail(file: File, size: number = DEFAULTS.THUMBNAIL_SIZE): Promise<string> {
    return createThumbnail(file, size)
  }

  /**
   * Get image dimensions
   */
  async getDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({ width: img.width, height: img.height })
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load image'))
      }

      img.src = url
    })
  }

  /**
   * Crop image (placeholder for @ldesign/cropper integration)
   */
  async crop(file: File, cropData: {
    x: number
    y: number
    width: number
    height: number
  }): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          if (!ctx) {
            throw new Error('Failed to get canvas context')
          }

          canvas.width = cropData.width
          canvas.height = cropData.height

          ctx.drawImage(
            img,
            cropData.x,
            cropData.y,
            cropData.width,
            cropData.height,
            0,
            0,
            cropData.width,
            cropData.height
          )

          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(url)
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Failed to crop image'))
              }
            },
            file.type || 'image/jpeg',
            0.95
          )
        } catch (error) {
          URL.revokeObjectURL(url)
          reject(error)
        }
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load image'))
      }

      img.src = url
    })
  }

  /**
   * Update options
   */
  setOptions(options: Partial<ImageProcessOptions>): void {
    this.options = { ...this.options, ...options }
  }
}

