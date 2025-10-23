/**
 * Vue 3 Directive for @ldesign/upload
 */

import type { Directive, DirectiveBinding } from 'vue'
import { Uploader } from '../../core/Uploader'
import type { UploaderOptions } from '../../types'

interface UploaderElement extends HTMLElement {
  _uploader?: Uploader
}

export interface UploaderDirectiveValue extends UploaderOptions {
  // Directive-specific options
}

const uploaderInstances = new WeakMap<HTMLElement, Uploader>()

export const vUploader: Directive<UploaderElement, UploaderDirectiveValue> = {
  mounted(el: UploaderElement, binding: DirectiveBinding<UploaderDirectiveValue>) {
    const options: UploaderOptions = {
      container: el,
      ...binding.value,
    }

    const uploader = new Uploader(options)
    uploaderInstances.set(el, uploader)
    el._uploader = uploader
  },

  updated(el: UploaderElement, binding: DirectiveBinding<UploaderDirectiveValue>) {
    // Recreate uploader if options changed significantly
    const uploader = uploaderInstances.get(el)
    if (uploader && binding.value.endpoint !== binding.oldValue?.endpoint) {
      uploader.destroy()

      const newUploader = new Uploader({
        container: el,
        ...binding.value,
      })

      uploaderInstances.set(el, newUploader)
      el._uploader = newUploader
    }
  },

  beforeUnmount(el: UploaderElement) {
    const uploader = uploaderInstances.get(el)
    if (uploader) {
      uploader.destroy()
      uploaderInstances.delete(el)
      delete el._uploader
    }
  },
}

export const uploaderDirective = vUploader

/**
 * Get uploader instance from element
 */
export function getUploaderInstance(el: HTMLElement): Uploader | undefined {
  return uploaderInstances.get(el)
}

