import {includeIgnoreFile} from '@eslint/compat'
import oclif from 'eslint-config-oclif'
import prettier from 'eslint-config-prettier'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const gitignorePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.gitignore')

const ourRules = [
  {
    languageOptions: {
      globals: {
        RequestInit: true,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: [
      "./src/commands/new.ts"
    ],
    rules: {
      camelcase: "off",
    },
  },
  {
    files: [
      "./src/lib/sendgrid.ts",
    ],
    rules: {
      'n/no-unsupported-features/node-builtins': 'off',
    },
  },
];

const finalConfig = [includeIgnoreFile(gitignorePath), ...oclif, ...ourRules, prettier]

export default finalConfig
