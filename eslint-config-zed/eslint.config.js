// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: true,
    jsx: true,
    commaDangle: 'always-multiline',
    braceStyle: '1tbs',
    blockSpacing: true,
    arrowParens: true,
  }),
  {
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@stylistic/jsx-one-expression-per-line': 'off',
    },
  },
  {
    ignores: ['dist/'],
  },
);
