/**
 * DropZone - Simple drop zone UI component
 */

import { createElement, addClass, removeClass, appendChild } from '../utils/dom'
import { CSS_CLASSES } from '../config/constants'
import type { UploaderOptions } from '../types'

export class DropZone {
  private element: HTMLElement
  private options: UploaderOptions

  constructor(container: HTMLElement, options: UploaderOptions) {
    this.options = options
    this.element = this.createDropZone()
    appendChild(container, this.element)
  }

  /**
   * Create drop zone element
   */
  private createDropZone(): HTMLElement {
    const dropzone = createElement('div', CSS_CLASSES.DROPZONE)

    // Icon
    if (this.options.placeholder?.icon) {
      const icon = createElement('div', CSS_CLASSES.DROPZONE + '-icon')
      icon.innerHTML = this.options.placeholder.icon
      appendChild(dropzone, icon)
    } else {
      // Default upload icon
      const icon = createElement('div', CSS_CLASSES.DROPZONE + '-icon')
      icon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      `
      appendChild(dropzone, icon)
    }

    // Text
    const text = createElement('div', CSS_CLASSES.DROPZONE + '-text')
    text.textContent = this.options.placeholder?.text || 'Click or drag files here'
    appendChild(dropzone, text)

    // Subtext
    if (this.options.placeholder?.subtext) {
      const subtext = createElement('div', CSS_CLASSES.DROPZONE + '-subtext')
      subtext.textContent = this.options.placeholder.subtext
      appendChild(dropzone, subtext)
    }

    return dropzone
  }

  /**
   * Show hover state
   */
  setHoverState(hover: boolean): void {
    if (hover) {
      addClass(this.element, CSS_CLASSES.DROPZONE_HOVER)
    } else {
      removeClass(this.element, CSS_CLASSES.DROPZONE_HOVER)
    }
  }

  /**
   * Set disabled state
   */
  setDisabled(disabled: boolean): void {
    if (disabled) {
      addClass(this.element, CSS_CLASSES.DROPZONE_DISABLED)
    } else {
      removeClass(this.element, CSS_CLASSES.DROPZONE_DISABLED)
    }
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

