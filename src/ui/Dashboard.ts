/**
 * Dashboard - Main UI container
 */

import { createElement, addClass, appendChild, clearChildren } from '../utils/dom'
import { CSS_CLASSES } from '../config/constants'
import { DropZone } from './DropZone'
import { FileItemUI } from './FileItem'
import type { UploaderOptions, FileItem } from '../types'

export class Dashboard {
  private element: HTMLElement
  private dropZone: DropZone | null = null
  private fileListElement: HTMLElement
  private fileItems: Map<string, FileItemUI> = new Map()
  private options: UploaderOptions
  private onAction?: (action: string, fileId: string) => void

  constructor(container: HTMLElement, options: UploaderOptions, onAction?: (action: string, fileId: string) => void) {
    this.options = options
    this.onAction = onAction
    this.element = this.createDashboard()
    this.fileListElement = this.element.querySelector('[data-file-list]') as HTMLElement

    // Create drop zone if drag & drop is enabled
    if (options.dragDrop !== false) {
      this.dropZone = new DropZone(this.element, options)
    }

    appendChild(container, this.element)
  }

  /**
   * Create dashboard element
   */
  private createDashboard(): HTMLElement {
    const dashboard = createElement('div', CSS_CLASSES.DASHBOARD)

    // File list
    const fileList = createElement('div', CSS_CLASSES.FILE_LIST)
    fileList.setAttribute('data-file-list', '')
    appendChild(dashboard, fileList)

    return dashboard
  }

  /**
   * Add file item
   */
  addFileItem(fileData: FileItem): void {
    const fileItem = new FileItemUI(fileData, this.onAction)
    this.fileItems.set(fileData.id, fileItem)
    appendChild(this.fileListElement, fileItem.getElement())
  }

  /**
   * Update file item
   */
  updateFileItem(fileData: FileItem): void {
    const fileItem = this.fileItems.get(fileData.id)
    if (fileItem) {
      fileItem.update(fileData)
    }
  }

  /**
   * Remove file item
   */
  removeFileItem(fileId: string): void {
    const fileItem = this.fileItems.get(fileId)
    if (fileItem) {
      fileItem.destroy()
      this.fileItems.delete(fileId)
    }
  }

  /**
   * Clear all file items
   */
  clearFileItems(): void {
    this.fileItems.forEach(item => item.destroy())
    this.fileItems.clear()
    clearChildren(this.fileListElement)
  }

  /**
   * Set drop zone hover state
   */
  setDropZoneHover(hover: boolean): void {
    if (this.dropZone) {
      this.dropZone.setHoverState(hover)
    }
  }

  /**
   * Get drop zone element
   */
  getDropZoneElement(): HTMLElement | null {
    return this.dropZone?.getElement() || null
  }

  /**
   * Get element
   */
  getElement(): HTMLElement {
    return this.element
  }

  /**
   * Destroy
   */
  destroy(): void {
    this.clearFileItems()

    if (this.dropZone) {
      this.dropZone.destroy()
      this.dropZone = null
    }

    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }
  }
}

