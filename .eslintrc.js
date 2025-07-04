module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'jest'],
  extends: ['eslint:recommended', 'prettier', 'plugin:jest/recommended'],
  rules: {
    // Reglas generales
    'no-console': 'off', // Permitir console.log en desarrollo
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-vars': 'off', // Desactivar para usar la version de TypeScript

    // Reglas basicas de TypeScript
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  env: {
    node: true,
    es6: true,
  },
  globals: {
    Express: 'readonly',
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.js', '.eslintrc.js'],
  overrides: [
    {
      files: ['**/__tests__/**/*.test.ts', '**/*.spec.ts', '**/*.test.ts'],
      env: {
        jest: true,
      },
    },
  ],
};
