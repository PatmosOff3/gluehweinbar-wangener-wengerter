import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
      'node_modules/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^(?!\\./)[\\s\\S]*',
              message: 'Die Domäne importiert ausschließlich eigene Module.',
            },
          ],
        },
      ],
    },
  },
)
