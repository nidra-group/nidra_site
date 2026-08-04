import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
      /**
       * `next-intl` importa `next/navigation` sin extensión. Next lo sirve como
       * `navigation.js` y el resolvedor de Node lo rechaza, así que cualquier
       * prueba que toque los ayudantes de navegación —y por lo tanto el mapa
       * del sitio— fallaba al importar, antes de ejecutar un solo caso.
       *
       * Un `vi.mock` no alcanza: la resolución ocurre dentro de `next-intl`, no
       * en el archivo de prueba, y la clave del doble nunca coincide.
       */
      'next/navigation': 'next/navigation.js',
    },
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    // El alias de arriba solo se aplica a los módulos que vitest transforma, y
    // por defecto deja `node_modules` intacto. Sin esto, el alias no llega al
    // import que falla, que está dentro de `next-intl`.
    server: { deps: { inline: ['next-intl'] } },
  },
})
