/**
 * Genera los documentos portátiles del currículum (FR-038, FR-047).
 *
 * Imprime a PDF la propia vista web de impresión (`/{locale}/cv/imprimir`), así
 * que NO hay dos maquetaciones que mantener sincronizadas: el documento es el
 * resultado de imprimir la página. Si la vista se ve bien, el PDF es correcto
 * por definición.
 *
 * ── ESTO SE CORRE EN TU MÁQUINA, NO EN EL SERVIDOR ────────────────────────
 * Antes colgaba de `postbuild` y corría en cada despliegue. No funcionaba:
 * `pnpm install` no descarga el navegador que Playwright necesita —hace falta
 * `playwright install`, que nadie ejecuta en Vercel—, así que la generación
 * fallaba, no quedaba ningún PDF y el build terminaba en código 1.
 *
 * Ahora los documentos se generan acá, se versionan en el repositorio y
 * llegan al servidor ya hechos. El despliegue no necesita ni navegador ni
 * historial de git.
 *
 * El orden importa y no es el evidente:
 *
 *   1. Se lee la versión del historial de git y se CONGELA en version.json.
 *   2. Recién entonces se construye, porque la vista de impresión imprime esa
 *      versión en el pie del documento. Construir antes produciría un PDF que
 *      dice una versión y se llama por otra.
 *   3. Se levanta el servidor de producción y se imprime.
 *
 * Cuándo correrlo: cada vez que cambia `content/cv/profile.yaml`, después de
 * commitear el cambio. Si te olvidás, `tests/unit/cv-version.test.ts` falla y
 * te lo dice antes de que llegue al despliegue.
 */
import { spawn, spawnSync } from 'node:child_process'
import { mkdirSync, rmSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { chromium } from 'playwright'

import { readGitCvVersion, cvFileName } from '../lib/cv/version.ts'

const PORT = process.env.CV_PDF_PORT ?? '4319'
const BASE = `http://127.0.0.1:${PORT}`
const OUT_DIR = join(process.cwd(), 'public', 'downloads')
const LOCALES = [
  { locale: 'es', path: '/es/cv/imprimir' },
  { locale: 'en', path: '/en/cv/print' },
]

async function waitForServer(url, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) return true
    } catch {
      /* todavía no levantó */
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  return false
}

// 1 · Congelar la versión antes de construir.
const version = readGitCvVersion()
mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(
  join(OUT_DIR, 'version.json'),
  `${JSON.stringify(version, null, 2)}\n`,
  'utf8',
)
console.log(`· versión congelada: ${version.date} · ${version.hash}`)

// 2 · Construir, ya con la versión en su sitio.
console.log('· construyendo el sitio…')
const build = spawnSync('pnpm', ['exec', 'next', 'build'], { stdio: 'inherit' })
if (build.status !== 0) {
  console.error('✗ El build falló. Los PDF no se generaron.')
  process.exit(1)
}

// 3 · Imprimir contra el servidor de producción. `next dev` se demoniza en
// Next 16 y no sirve para un script que necesita esperar y después apagarlo.
const server = spawn('pnpm', ['exec', 'next', 'start', '--port', PORT], {
  stdio: 'ignore',
  env: { ...process.env },
})

let ok = false
try {
  if (!(await waitForServer(`${BASE}/es/cv/imprimir`))) {
    throw new Error('el servidor no respondió a tiempo')
  }

  const browser = await chromium.launch()
  const page = await browser.newPage()

  for (const { locale, path } of LOCALES) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
    await page.emulateMedia({ media: 'print' })
    const fileName = cvFileName(locale, version)
    await page.pdf({
      path: join(OUT_DIR, fileName),
      format: 'A4',
      printBackground: false,
      margin: { top: '16mm', bottom: '16mm', left: '16mm', right: '16mm' },
    })
    console.log(`✓ ${fileName}`)
  }

  await browser.close()

  // Recién ahora que los nuevos existen se borran los de versiones anteriores.
  // Borrarlos antes dejaba el sitio sin descargas si la generación fallaba.
  const current = new Set(LOCALES.map(({ locale }) => cvFileName(locale, version)))
  for (const file of readdirSync(OUT_DIR)) {
    if (file.endsWith('.pdf') && !current.has(file)) rmSync(join(OUT_DIR, file))
  }

  ok = true
} catch (error) {
  console.error(`✗ No se generaron los PDF del currículum: ${error.message}`)
  console.error('  Si falta el navegador, instalalo con: pnpm exec playwright install chromium')
} finally {
  server.kill('SIGTERM')
}

// Falla ruidosamente y en tu máquina, que es donde se puede arreglar. El
// despliegue ya no depende de este script.
process.exit(ok ? 0 : 1)
