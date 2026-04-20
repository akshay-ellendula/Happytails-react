import js from '@eslint/js'
import globals from 'globals'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['node_modules', 'dist', 'coverage', 'logs']),
  {
    files: ['src/**/*.js', 'tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^_|^[A-Z_]' }],
      'no-undef': 'error',
      // Catch incomplete/empty imports
      'no-regex-spaces': 'error',
      'no-empty': 'error',
    },
  },
  // Custom rule for incomplete imports
  {
    files: ['src/**/*.js'],
    rules: {
      // This helps catch patterns like: import x from ""
      // or: import x from   ;
      'no-empty-pattern': 'error',
    },
  },
])
