/**
 * Image utility functions
 */

import { DEFAULTS } from '../config/constants'

/**
 * Create image thumbnail
 */
export async function createThumbnail(
  file: File,
  size: number = DEFAULTS.THUMBNAIL_SIZE
): Promise<string> {
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

        // Calculate dimensions
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > size) {
            height = (height * size) / width
            width = size
          }
        } else {
          if (height > size) {
            width = (width * size) / height
            height = size
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw image
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to data URL
        const dataURL = canvas.toDataURL('image/jpeg', 0.8)

        URL.revokeObjectURL(url)
        resolve(dataURL)
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
 * Compress image
 */
export async function compressImage(
  file: File,
  options: {
    quality?: number
    maxWidth?: number
    maxHeight?: number
    format?: 'jpeg' | 'png' | 'webp'
  } = {}
): Promise<Blob> {
  const {
    quality = DEFAULTS.IMAGE_QUALITY,
    maxWidth = DEFAULTS.IMAGE_MAX_WIDTH,
    maxHeight = DEFAULTS.IMAGE_MAX_HEIGHT,
    format = 'jpeg',
  } = options

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

        // Calculate dimensions
        let width = img.width
        let height = img.height

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        // Draw image
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url)
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          `image/${format}`,
          quality
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
 * Rotate image
 */
export async function rotateImage(file: File, degrees: number): Promise<Blob> {
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

        // Swap dimensions for 90 or 270 degrees
        const swap = degrees % 180 !== 0
        canvas.width = swap ? img.height : img.width
        canvas.height = swap ? img.width : img.height

        // Rotate
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((degrees * Math.PI) / 180)
        ctx.drawImage(img, -img.width / 2, -img.height / 2)

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url)
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to rotate image'))
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
 * Flip image
 */
export async function flipImage(
  file: File,
  horizontal: boolean = false,
  vertical: boolean = false
): Promise<Blob> {
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

        // Flip
        ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1)
        ctx.drawImage(
          img,
          horizontal ? -img.width : 0,
          vertical ? -img.height : 0,
          img.width,
          img.height
        )

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url)
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to flip image'))
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

