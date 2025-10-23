import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        adapters: resolve(__dirname, 'src/adapters/index.ts'),
        processors: resolve(__dirname, 'src/processors/index.ts'),
        vue: resolve(__dirname, 'src/framework-adapters/vue/index.ts'),
        react: resolve(__dirname, 'src/framework-adapters/react/index.tsx'),
      },
      name: 'LDesignUpload',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'js' : 'cjs'
        return `${entryName}.${ext}`
      },
    },
    rollupOptions: {
      external: [
        'vue',
        'react',
        'react-dom',
        '@angular/core',
        '@ldesign/shared',
        '@ldesign/file',
        '@ldesign/http',
        '@ldesign/crypto',
        '@ldesign/cropper',
      ],
      output: {
        globals: {
          vue: 'Vue',
          react: 'React',
          'react-dom': 'ReactDOM',
          '@angular/core': 'ng.core',
        },
        exports: 'named',
      },
    },
    sourcemap: true,
    minify: 'esbuild',
  },
  plugins: [
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
      rollupTypes: true,
    }),
  ],
})

