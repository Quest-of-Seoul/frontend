module.exports = {
  root: true,
  extends: '@react-native',
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  globals: {
    btoa: 'readonly',
    atob: 'readonly',
    WebSocket: 'readonly',
    FileReader: 'readonly',
  },
  rules: {
    'react-native/no-inline-styles': 'off',
    'prettier/prettier': 'off',
    'curly': 'off',
    'comma-dangle': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'no-shadow': 'off',
    'no-catch-shadow': 'off',
  },
};

