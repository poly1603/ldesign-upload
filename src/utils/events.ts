/**
 * Event emitter utility
 */

import type { EventEmitter, EventHandler, UploaderEventType } from '../types'

/**
 * Simple event emitter implementation
 */
export class SimpleEventEmitter implements EventEmitter {
  private events: Map<UploaderEventType, Set<EventHandler>> = new Map()

  on(event: UploaderEventType, handler: EventHandler): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)!.add(handler)
  }

  off(event: UploaderEventType, handler: EventHandler): void {
    const handlers = this.events.get(event)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  emit(event: UploaderEventType, data?: any): void {
    const handlers = this.events.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error)
        }
      })
    }
  }

  once(event: UploaderEventType, handler: EventHandler): void {
    const onceHandler: EventHandler = (data) => {
      handler(data)
      this.off(event, onceHandler)
    }
    this.on(event, onceHandler)
  }

  removeAllListeners(event?: UploaderEventType): void {
    if (event) {
      this.events.delete(event)
    } else {
      this.events.clear()
    }
  }

  listenerCount(event: UploaderEventType): number {
    return this.events.get(event)?.size || 0
  }
}

