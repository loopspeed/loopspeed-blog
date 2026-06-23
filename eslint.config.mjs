import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },

    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/immutability': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'error',
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
    },
  },
]

export default config
