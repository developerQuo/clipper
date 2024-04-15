/* eslint-env node */
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', "next/core-web-vitals"
  , "plugin:react/recommended"],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier', 'unused-imports', 'eslint-plugin-react'],
  rules: {
    'no-unused-vars': 'off',
    'prettier/prettier': 'error',
    'unused-imports/no-unused-imports': 'error',
  },
  root: true,
};