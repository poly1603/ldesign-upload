/**
 * Interaction Manager - Handle drag & drop, paste, and file selection
 */

import { SimpleEventEmitter } from '../utils/events'
import { addEventListener, preventDefault, stopPropagation } from '../utils/dom'

export class InteractionManager extends SimpleEventEmitter {
  private element: HTMLElement
  private fileInput: HTMLInputElement | null = null
  private dragCounter: number = 0
  private cleanupFunctions: Array<() => void> = []

  private accept: string = '*'
  private multiple: boolean = true
  private directory: boolean = false
  private enabled: boolean = true

  constructor(element: HTMLElement) {
    super()
    this.element = element
  }

  /**
   * Initialize interactions
   */
  init(options: {
    accept?: string
    multiple?: boolean
    directory?: boolean
    dragDrop?: boolean
    paste?: boolean
  } = {}): void {
    this.accept = options.accept || '*'
    this.multiple = options.multiple !== false
    this.directory = options.directory === true

    // Create file input
    this.createFileInput()

    // Setup drag and drop
    if (options.dragDrop !== false) {
      this.setupDragDrop()
    }

    // Setup paste
    if (options.paste === true) {
      this.setupPaste()
    }
  }

  /**
   * Create hidden file input
   */
  private createFileInput(): void {
    this.fileInput = document.createElement('input')
    this.fileInput.type = 'file'
    this.fileInput.accept = this.accept
    this.fileInput.multiple = this.multiple
    this.fileInput.style.display = 'none'

    if (this.directory) {
      this.fileInput.setAttribute('webkitdirectory', '')
      this.fileInput.setAttribute('directory', '')
    }

    const cleanup = addEventListener(this.fileInput, 'change', () => {
      if (this.fileInput && this.fileInput.files) {
        this.handleFiles(Array.from(this.fileInput.files))
        // Reset input to allow selecting the same file again
        this.fileInput.value = ''
      }
    })

    this.cleanupFunctions.push(cleanup)
    document.body.appendChild(this.fileInput)
  }

  /**
   * Setup drag and drop
   */
  private setupDragDrop(): void {
    // Prevent default drag behaviors on window
    const cleanupWindow1 = addEventListener(window, 'dragover', (e) => {
      preventDefault(e)
    })

    const cleanupWindow2 = addEventListener(window, 'drop', (e) => {
      preventDefault(e)
    })

    // Drag enter
    const cleanupDragEnter = addEventListener(this.element, 'dragenter', (e) => {
      if (!this.enabled) return

      preventDefault(e)
      stopPropagation(e)
      this.dragCounter++

      if (this.dragCounter === 1) {
        this.emit('dragEnter', e)
      }
    })

    // Drag over
    const cleanupDragOver = addEventListener(this.element, 'dragover', (e) => {
      if (!this.enabled) return

      preventDefault(e)
      stopPropagation(e)

      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy'
      }

      this.emit('dragOver', e)
    })

    // Drag leave
    const cleanupDragLeave = addEventListener(this.element, 'dragleave', (e) => {
      if (!this.enabled) return

      preventDefault(e)
      stopPropagation(e)
      this.dragCounter--

      if (this.dragCounter === 0) {
        this.emit('dragLeave', e)
      }
    })

    // Drop
    const cleanupDrop = addEventListener(this.element, 'drop', async (e) => {
      if (!this.enabled) return

      preventDefault(e)
      stopPropagation(e)
      this.dragCounter = 0

      this.emit('drop', e)

      if (e.dataTransfer) {
        const files = await this.getFilesFromDataTransfer(e.dataTransfer)
        this.handleFiles(files)
      }
    })

    this.cleanupFunctions.push(
      cleanupWindow1,
      cleanupWindow2,
      cleanupDragEnter,
      cleanupDragOver,
      cleanupDragLeave,
      cleanupDrop
    )
  }

  /**
   * Setup paste
   */
  private setupPaste(): void {
    const cleanup = addEventListener(window, 'paste', (e) => {
      if (!this.enabled) return

      if (e.clipboardData && e.clipboardData.files.length > 0) {
        preventDefault(e)
        const files = Array.from(e.clipboardData.files)
        this.handleFiles(files)
        this.emit('paste', files)
      }
    })

    this.cleanupFunctions.push(cleanup)
  }

  /**
   * Get files from data transfer (including directories)
   */
  private async getFilesFromDataTransfer(dataTransfer: DataTransfer): Promise<File[]> {
    const files: File[] = []

    // Check for items (supports directories)
    if (dataTransfer.items) {
      const items = Array.from(dataTransfer.items)

      for (const item of items) {
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry?.()
          if (entry) {
            await this.traverseFileTree(entry, files)
          } else {
            const file = item.getAsFile()
            if (file) {
              files.push(file)
            }
          }
        }
      }
    } else if (dataTransfer.files) {
      // Fallback to files
      files.push(...Array.from(dataTransfer.files))
    }

    return files
  }

  /**
   * Traverse file tree (for directory support)
   */
  private async traverseFileTree(entry: any, files: File[]): Promise<void> {
    if (entry.isFile) {
      const file = await new Promise<File>((resolve, reject) => {
        entry.file(resolve, reject)
      })
      files.push(file)
    } else if (entry.isDirectory) {
      const reader = entry.createReader()
      const entries = await new Promise<any[]>((resolve, reject) => {
        reader.readEntries(resolve, reject)
      })

      for (const childEntry of entries) {
        await this.traverseFileTree(childEntry, files)
      }
    }
  }

  /**
   * Handle selected files
   */
  private handleFiles(files: File[]): void {
    if (files.length > 0) {
      this.emit('filesSelected', files)
    }
  }

  /**
   * Open file picker
   */
  openFilePicker(): void {
    if (this.enabled && this.fileInput) {
      this.fileInput.click()
    }
  }

  /**
   * Enable interactions
   */
  enable(): void {
    this.enabled = true
  }

  /**
   * Disable interactions
   */
  disable(): void {
    this.enabled = false
  }

  /**
   * Check if enabled
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Update accept types
   */
  setAccept(accept: string): void {
    this.accept = accept
    if (this.fileInput) {
      this.fileInput.accept = accept
    }
  }

  /**
   * Update multiple selection
   */
  setMultiple(multiple: boolean): void {
    this.multiple = multiple
    if (this.fileInput) {
      this.fileInput.multiple = multiple
    }
  }

  /**
   * Destroy and cleanup
   */
  destroy(): void {
    // Remove all event listeners
    this.cleanupFunctions.forEach(cleanup => cleanup())
    this.cleanupFunctions = []

    // Remove file input
    if (this.fileInput && this.fileInput.parentNode) {
      this.fileInput.parentNode.removeChild(this.fileInput)
      this.fileInput = null
    }

    // Reset state
    this.dragCounter = 0
    this.enabled = false

    // Remove all event emitter listeners
    this.removeAllListeners()
  }
}

