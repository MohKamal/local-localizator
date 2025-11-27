import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  {
    files: ['**/*.{js,jsx}'],
    ignores: ['**/__tests__/**', '**/__test_utils__/**'], // exclude test files
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'no-undef': 'error',
      'no-control-regex': 'off',
      'react-refresh/only-export-components': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['**/__tests__/**/*.{js,jsx}', '**/__test_utils__/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.jest, // adds describe, test, expect, jest, beforeEach, etc.
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
]);
