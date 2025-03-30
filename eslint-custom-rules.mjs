// import stylistic from '@stylistic/eslint-plugin'
export default {
  rules: {
    // "@stylistic/indent": ["error", 2],
    // "@stylistic/comma-dangle": ["error", "always-multiline"],
    '@stylistic/semi': ['error', 'never'],
    '@stylistic/array-bracket-newline': [
      'error',
      { minItems: 2 },
    ],
    '@stylistic/array-element-newline': [
      'error',
      { minItems: 2 },
    ],
    '@stylistic/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'comma',
          requireLast: true,
        },
        singleline: { delimiter: 'comma' },
      },
    ],
    '@stylistic/object-property-newline': 'error',
    '@stylistic/object-curly-newline': [
      'error',
      {
        ImportDeclaration: 'always',
        ObjectPattern: {
          multiline: true,
          consistent: true,
        },
        ObjectExpression: {
          multiline: true,
          consistent: true,
        },
      },
    ],
    '@stylistic/arrow-parens': [
      'error',
      'as-needed',
    ],
    '@stylistic/brace-style': [
      'error',
      '1tbs',
    ],
    'no-param-reassign': [
      'error',
      { props: true },
    ],
    'arrow-body-style': [
      'error',
      'as-needed',
    ],
    'no-unneeded-ternary': 'error',
    'no-nested-ternary': 'error',
    // 'vue/multi-word-component-names': 'off',
    // 'no-console': 'warn',
  },
}
