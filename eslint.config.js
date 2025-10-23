import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: true,
  react: true,
  ignores: [
    'dist',
    'node_modules',
    'coverage',
    '*.d.ts',
  ],
  rules: {
    'no-console': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'vue/multi-word-component-names': 'off',
  },
})

