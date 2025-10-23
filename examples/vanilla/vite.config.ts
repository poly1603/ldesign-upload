import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@ldesign/upload': resolve(__dirname, '../../src'),
    },
  },
})

