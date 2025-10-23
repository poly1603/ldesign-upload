/**
 * FileItem - File item UI component
 */

import { createElement, addClass, appendChild, setStyle } from '../utils/dom'
import { CSS_CLASSES } from '../config/constants'
import { formatFileSize } from '../utils/file'
import type { FileItem as FileItemData } from '../types'

export class FileItemUI {
  private element: HTMLElement
  private fileData: FileItemData
  private onAction?: (action: string, fileId: string) => void

  constructor(fileData: FileItemData, onAction?: (action: string, fileId: string) => void) {
    this.fileData = fileData
    this.onAction = onAction
    this.element = this.createFileItem()
    this.update(fileData)
  }

  /**
   * Create file item element
   */
  private createFileItem(): HTMLElement {
    const item = createElement('div', CSS_CLASSES.FILE_ITEM)

    // Thumbnail
    const thumbnail = createElement('div', CSS_CLASSES.FILE_THUMBNAIL)
    thumbnail.setAttribute('data-thumbnail', '')
    appendChild(item, thumbnail)

    // Info
    const info = createElement('div', CSS_CLASSES.FILE_INFO)

    const name = createElement('div', CSS_CLASSES.FILE_NAME)
    name.textContent = this.fileData.file.name
    appendChild(info, name)

    const size = createElement('div', CSS_CLASSES.FILE_SIZE)
    size.textContent = formatFileSize(this.fileData.totalSize)
    appendChild(info, size)

    const status = createElement('div', CSS_CLASSES.FILE_STATUS)
    status.setAttribute('data-status', '')
    appendChild(info, status)

    // Progress bar
    const progressContainer = createElement('div', CSS_CLASSES.FILE_PROGRESS)
    const progressBar = createElement('div', CSS_CLASSES.FILE_PROGRESS_BAR)
    appendChild(progressContainer, progressBar)
    appendChild(info, progressContainer)

    appendChild(item, info)

    // Actions
    const actions = createElement('div', CSS_CLASSES.FILE_ACTIONS)
    actions.setAttribute('data-actions', '')
    appendChild(item, actions)

    return item
  }

  /**
   * Update file item
   */
  update(fileData: FileItemData): void {
    this.fileData = fileData

    // Update status class
    const statusClasses = [
      CSS_CLASSES.FILE_ITEM_PENDING,
      CSS_CLASSES.FILE_ITEM_UPLOADING,
      CSS_CLASSES.FILE_ITEM_SUCCESS,
      CSS_CLASSES.FILE_ITEM_ERROR,
      CSS_CLASSES.FILE_ITEM_PAUSED,
    ]
    statusClasses.forEach(cls => this.element.classList.remove(cls))
    addClass(this.element, `${CSS_CLASSES.FILE_ITEM}--${fileData.status}`)

    // Update thumbnail
    const thumbnail = this.element.querySelector('[data-thumbnail]') as HTMLElement
    if (thumbnail && fileData.thumbnail) {
      thumbnail.innerHTML = `<img src="${fileData.thumbnail}" alt="${fileData.file.name}" />`
    }

    // Update status
    const statusEl = this.element.querySelector('[data-status]') as HTMLElement
    if (statusEl) {
      statusEl.className = CSS_CLASSES.FILE_STATUS
      addClass(statusEl, `${CSS_CLASSES.FILE_STATUS}--${fileData.status}`)

      let statusText = ''
      if (fileData.status === 'uploading') {
        statusText = `${fileData.progress.toFixed(1)}% - ${formatFileSize(fileData.speed)}/s`
      } else if (fileData.status === 'success') {
        statusText = '✓ Upload complete'
      } else if (fileData.status === 'error') {
        statusText = `✗ ${fileData.error || 'Upload failed'}`
      } else if (fileData.status === 'paused') {
        statusText = '⏸ Paused'
      } else {
        statusText = 'Waiting...'
      }
      statusEl.textContent = statusText
    }

    // Update progress bar
    const progressBar = this.element.querySelector(`.${CSS_CLASSES.FILE_PROGRESS_BAR}`) as HTMLElement
    if (progressBar) {
      setStyle(progressBar, { width: `${fileData.progress}%` })
    }

    // Update actions
    this.updateActions()
  }

  /**
   * Update action buttons
   */
  private updateActions(): void {
    const actionsEl = this.element.querySelector('[data-actions]') as HTMLElement
    if (!actionsEl) return

    actionsEl.innerHTML = ''

    // Retry button (for error status)
    if (this.fileData.status === 'error') {
      const retryBtn = this.createButton('↻', 'retry')
      appendChild(actionsEl, retryBtn)
    }

    // Pause/Resume button (for uploading/paused status)
    if (this.fileData.status === 'uploading') {
      const pauseBtn = this.createButton('⏸', 'pause')
      appendChild(actionsEl, pauseBtn)
    } else if (this.fileData.status === 'paused') {
      const resumeBtn = this.createButton('▶', 'resume')
      appendChild(actionsEl, resumeBtn)
    }

    // Cancel button (for pending/uploading status)
    if (this.fileData.status === 'pending' || this.fileData.status === 'uploading') {
      const cancelBtn = this.createButton('✕', 'cancel')
      appendChild(actionsEl, cancelBtn)
    }

    // Remove button (always available)
    const removeBtn = this.createButton('🗑', 'remove')
    appendChild(actionsEl, removeBtn)
  }

  /**
   * Create action button
   */
  private createButton(text: string, action: string): HTMLElement {
    const button = createElement('button', `${CSS_CLASSES.BUTTON} ${CSS_CLASSES.BUTTON_ICON}`)
    button.textContent = text
    button.title = action.charAt(0).toUpperCase() + action.slice(1)

    button.addEventListener('click', (e) => {
      e.stopPropagation()
      if (this.onAction) {
        this.onAction(action, this.fileData.id)
      }
    })

    return button
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
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }
  }
}

