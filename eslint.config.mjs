import js from '@eslint/js';
import globals from 'globals';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import-x';
import unicornPlugin from 'eslint-plugin-unicorn';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default [
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      'coverage/**',
      '**/*.config.js',
      '**/*.config.ts',
    ],
  },

  // Core ESLint recommended rules (replaces oxlint's auto-enabled "correctness" for core)
  js.configs.recommended,

  // Base config for all TS files
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'import-x': importPlugin,
      unicorn: unicornPlugin,
      prettier: eslintPluginPrettier,
    },
    // Tell eslint-plugin-import-x how to resolve TypeScript paths/extensions
    settings: {
      'import-x/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
        node: true,
      },
    },
    rules: {
      // Recommended rule sets (replaces oxlint's auto-enabled "correctness" for these plugins)
      ...tsPlugin.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,
      ...unicornPlugin.configs.recommended.rules,

      // --- Custom overrides below (take precedence over recommended rules above) ---

      // Turn off base rules that are replaced by @typescript-eslint versions
      'no-unused-vars': 'off',
      'no-shadow': 'off',
      'no-redeclare': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-redeclare': 'off',
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'with-single-extends' },
      ],

      'max-lines': [
        'error',
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
      'max-lines-per-function': ['warn', { max: 60 }],
      'max-params': ['warn', 4],
      'max-depth': ['warn', 3],
      complexity: ['warn', 10],

      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'consistent-return': 'warn',

      // Unicorn rules that are often too opinionated for NestJS projects: relax them
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/name-replacements': 'off',
      'prettier/prettier': 'error',
      'unicorn/prefer-module': 'off',
      'unicorn/import-style': 'off',
      'unicorn/no-top-level-side-effects': 'off',
      'unicorn/no-anonymous-default-export': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/consistent-class-member-order': 'off',
      'unicorn/prefer-logical-operator-over-ternary': 'off',
      'unicorn/prefer-iterator-to-array': 'off',
      'unicorn/no-non-function-verb-prefix': 'off',
      'unicorn/numeric-separators-style': 'off',
    },
  },

  // Test files: add Jest globals (describe, it, expect, beforeEach, afterEach, jest, ...)
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts', 'test/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },

  // Domain layer (module-specific)
  {
    files: ['src/modules/*/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@nestjs/*',
                'typeorm',
                'typeorm/*',
                'express',
                'class-validator',
                'class-transformer',
              ],
              message:
                'Domain must be pure TypeScript: no framework or ORM imports.',
            },
            {
              group: [
                '**/application/**',
                '**/infrastructure/**',
                '**/presentation/**',
              ],
              message:
                'Domain may only import domain code (its own module or shared/domain).',
            },
            {
              group: ['**/error-codes.js'],
              message:
                'Only the composition root and specs may use the error catalog; domain knows error keys only.',
            },
          ],
        },
      ],
    },
  },

  // Application layer (module-specific)
  {
    files: ['src/modules/*/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['typeorm', 'typeorm/*', '@nestjs/typeorm', 'express'],
              message:
                'Application must not depend on persistence or HTTP details.',
            },
            {
              group: ['**/infrastructure/**', '**/presentation/**'],
              message:
                'Application may only import domain and application code.',
            },
          ],
        },
      ],
    },
  },

  // Presentation layer (module-specific)
  {
    files: ['src/modules/*/presentation/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'typeorm',
                'typeorm/*',
                '@nestjs/typeorm',
                '**/infrastructure/**',
              ],
              message:
                'Presentation talks to use cases only, never to persistence.',
            },
          ],
        },
      ],
    },
  },

  // Shared domain
  {
    files: ['src/shared/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@nestjs/*',
                'typeorm',
                'typeorm/*',
                'express',
                'class-validator',
                'class-transformer',
              ],
              message:
                'Domain must be pure TypeScript: no framework or ORM imports.',
            },
            {
              group: [
                '**/application/**',
                '**/infrastructure/**',
                '**/presentation/**',
              ],
              message:
                'Domain may only import domain code (its own module or shared/domain).',
            },
            {
              group: ['**/modules/**', '**/error-codes.js'],
              message:
                'Shared kernel must not depend on modules or the composition root (error-codes.ts).',
            },
          ],
        },
      ],
    },
  },

  // Shared application
  {
    files: ['src/shared/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['typeorm', 'typeorm/*', '@nestjs/typeorm', 'express'],
              message:
                'Application must not depend on persistence or HTTP details.',
            },
            {
              group: ['**/infrastructure/**', '**/presentation/**'],
              message:
                'Application may only import domain and application code.',
            },
            {
              group: ['**/modules/**', '**/error-codes.js'],
              message:
                'Shared kernel must not depend on modules or the composition root (error-codes.ts).',
            },
          ],
        },
      ],
    },
  },

  // Shared infrastructure
  {
    files: ['src/shared/infrastructure/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/modules/**', '**/error-codes.js'],
              message:
                'Shared kernel must not depend on modules or the composition root (error-codes.ts).',
            },
          ],
        },
      ],
    },
  },

  // Shared presentation
  {
    files: ['src/shared/presentation/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'typeorm',
                'typeorm/*',
                '@nestjs/typeorm',
                '**/infrastructure/**',
              ],
              message:
                'Presentation talks to use cases only, never to persistence.',
            },
            {
              group: ['**/modules/**', '**/error-codes.js'],
              message:
                'Shared kernel must not depend on modules or the composition root (error-codes.ts).',
            },
          ],
        },
      ],
    },
  },

  // Controllers: allow more params (NestJS DI-heavy constructors)
  {
    files: ['src/**/*.controller.ts'],
    rules: {
      'max-params': 'off',
    },
  },

  // Test files: relax length limits
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts', 'src/**/testing/**/*.ts'],
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
    },
  },

  // Must be last: turns off ESLint rules that conflict with Prettier
  eslintConfigPrettier,
];
