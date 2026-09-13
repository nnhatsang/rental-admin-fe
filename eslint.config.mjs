
const eslintConfig = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript', 'prettier'],
  }),
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
];

export default eslintConfig;
