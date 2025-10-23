/**
 * Framework Adapters
 * 
 * This module exports framework-specific adapters for Vue, React, and Angular
 */

// Note: Import these from their respective subpaths:
// - import { VueUploader, useUploader } from '@ldesign/upload/vue'
// - import { ReactUploader, useUploader } from '@ldesign/upload/react'
// - import { AngularUploader } from '@ldesign/upload/angular'

export const FRAMEWORK_ADAPTERS_INFO = {
  vue: '@ldesign/upload/vue',
  react: '@ldesign/upload/react',
  angular: '@ldesign/upload/angular',
} as const

