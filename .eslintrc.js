module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // TS项目必加
  ],
  rules: {
    // 关键：保留注释前的空格
    'no-trailing-spaces': ['error', { ignoreComments: true }],
  },
};
