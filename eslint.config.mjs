import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

/**
 * `next lint` desapareció en Next 16, así que el script `lint` llama a `eslint`
 * directamente y la configuración vive acá, en formato plano.
 */
const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'public/**', 'playwright-report/**', '.shots*/**'],
  },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // Convención habitual: el guion bajo marca lo que se descarta a
      // propósito, como el primer argumento de una acción de servidor.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
]

export default config
