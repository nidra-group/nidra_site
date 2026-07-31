import { defineConfig, devices } from '@playwright/test'

// El 3000 está reservado para otra aplicación de la máquina.
const PORT = 3210
const BASE_URL = `http://localhost:${PORT}`

/**
 * Pruebas de extremo a extremo.
 *
 * Cubren lo que una prueba unitaria no puede ver: el comportamiento real del
 * formulario en un navegador, con y sin JavaScript. Es deliberadamente corto.
 * El formulario es el único mecanismo de conversión del sitio y ya falló dos
 * veces en revisión; el resto de la interfaz es contenido estático que las
 * pruebas unitarias y el build ya validan.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
