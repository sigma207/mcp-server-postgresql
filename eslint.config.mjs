import globals from 'globals'
import pluginJs from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import customRules from './eslint-custom-rules.mjs'
import tseslint from 'typescript-eslint'

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['dist/**/*'],
  },
  {
    files: ['src/**/*.{js,mjs,cjs,ts}'],

    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      ...customRules.rules,
    },
  },
  {
    languageOptions: { globals: globals.browser },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  stylistic.configs.customize({
    jsx: false,
  }),
]
