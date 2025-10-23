/**
 * DOM utility functions
 */

/**
 * Create an element
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  attributes?: Record<string, string>
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag)

  if (className) {
    element.className = className
  }

  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value)
    })
  }

  return element
}

/**
 * Get element by selector or element
 */
export function getElement(target: string | HTMLElement): HTMLElement | null {
  if (typeof target === 'string') {
    return document.querySelector(target)
  }
  return target
}

/**
 * Add class to element
 */
export function addClass(element: HTMLElement, className: string | string[]): void {
  const classes = Array.isArray(className) ? className : [className]
  element.classList.add(...classes)
}

/**
 * Remove class from element
 */
export function removeClass(element: HTMLElement, className: string | string[]): void {
  const classes = Array.isArray(className) ? className : [className]
  element.classList.remove(...classes)
}

/**
 * Toggle class on element
 */
export function toggleClass(element: HTMLElement, className: string, force?: boolean): void {
  element.classList.toggle(className, force)
}

/**
 * Check if element has class
 */
export function hasClass(element: HTMLElement, className: string): boolean {
  return element.classList.contains(className)
}

/**
 * Set element styles
 */
export function setStyle(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
  Object.assign(element.style, styles)
}

/**
 * Set element attribute
 */
export function setAttribute(element: HTMLElement, name: string, value: string): void {
  element.setAttribute(name, value)
}

/**
 * Remove element attribute
 */
export function removeAttribute(element: HTMLElement, name: string): void {
  element.removeAttribute(name)
}

/**
 * Append child element
 */
export function appendChild(parent: HTMLElement, child: HTMLElement): void {
  parent.appendChild(child)
}

/**
 * Remove child element
 */
export function removeChild(parent: HTMLElement, child: HTMLElement): void {
  parent.removeChild(child)
}

/**
 * Remove element from DOM
 */
export function removeElement(element: HTMLElement): void {
  element.parentNode?.removeChild(element)
}

/**
 * Clear element children
 */
export function clearChildren(element: HTMLElement): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
}

/**
 * Insert element before another
 */
export function insertBefore(newElement: HTMLElement, referenceElement: HTMLElement): void {
  referenceElement.parentNode?.insertBefore(newElement, referenceElement)
}

/**
 * Insert element after another
 */
export function insertAfter(newElement: HTMLElement, referenceElement: HTMLElement): void {
  referenceElement.parentNode?.insertBefore(newElement, referenceElement.nextSibling)
}

/**
 * Get element offset
 */
export function getOffset(element: HTMLElement): { top: number; left: number } {
  const rect = element.getBoundingClientRect()
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
  }
}

/**
 * Get element size
 */
export function getSize(element: HTMLElement): { width: number; height: number } {
  return {
    width: element.offsetWidth,
    height: element.offsetHeight,
  }
}

/**
 * Check if element is visible
 */
export function isVisible(element: HTMLElement): boolean {
  return element.offsetWidth > 0 && element.offsetHeight > 0
}

/**
 * Dispatch custom event
 */
export function dispatchEvent(element: HTMLElement, eventName: string, detail?: any): void {
  const event = new CustomEvent(eventName, {
    detail,
    bubbles: true,
    cancelable: true,
  })
  element.dispatchEvent(event)
}

/**
 * Add event listener with auto cleanup
 */
export function addEventListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement | Window | Document,
  type: K,
  listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): () => void {
  element.addEventListener(type as string, listener as EventListener, options)
  return () => element.removeEventListener(type as string, listener as EventListener, options)
}

/**
 * Prevent default event behavior
 */
export function preventDefault(event: Event): void {
  event.preventDefault()
}

/**
 * Stop event propagation
 */
export function stopPropagation(event: Event): void {
  event.stopPropagation()
}

