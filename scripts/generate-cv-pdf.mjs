/**
 * Genera los documentos portátiles del currículum (FR-038, FR-047).
 *
 * Imprime a PDF la propia vista web de impresión (`/{locale}/cv/imprimir`), así
 * que NO hay dos maquetaciones que mantener sincronizadas: el documento es el
 * resultado de imprimir la página. Si la vista se ve bien, el PDF es correcto
 * por definición.
 *
 * Corre DESPUÉS de `next build`, contra el servidor de producción: `next dev`
 * se demoniza en Next 16 y no sirve para un script que necesita esperar a que
 * el servidor esté listo y después apagarlo.
 *
 * Por eso la página `/cv` se renderiza por petición: el selector comprueba qué
 * archivos existen en `public/downloads/`, y en un render estático esa
 * comprobación ocurriría antes de que los documentos existan.
 *
 * Si algo falla, se avisa y se sigue: el sitio se publica con la versión web
 * imprimible, que siempre funciona. Un build roto por no poder generar un PDF
 * sería peor que un formato menos.
 */
import { spawn, execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { chromium } from 'playwright'

const PORT = process.env.CV_PDF_PORT ?? '4319'
const BASE = `http://127.0.0.1:${PORT}`
const OUT_DIR = join(process.cwd(), 'public', 'downloads')
const LOCALES = [
  { locale: 'es', path: '/es/cv/imprimir' },
  { locale: 'en', path: '/en/cv/print' },
]

function cvVersion() {
  const out = execFileSync('git', ['log', '-1', '--format=%h|%cs', '--', 'content/cv/profile.yaml'], {
    encoding: 'utf8',
  }).trim()
  const [hash, date] = out.split('|')
  if (!hash || !date) throw new Error('content/cv/profile.yaml no tiene commits')
  return { hash, date }
}

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

const version = cvVersion()
mkdirSync(OUT_DIR, { recursive: true })

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
    const fileName = `Juan_Mujica_CV_${locale.toUpperCase()}_${version.date}_${version.hash}.pdf`
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
  const current = new Set(
    LOCALES.map(
      ({ locale }) => `Juan_Mujica_CV_${locale.toUpperCase()}_${version.date}_${version.hash}.pdf`,
    ),
  )
  for (const file of readdirSync(OUT_DIR)) {
    if (file.endsWith('.pdf') && !current.has(file)) rmSync(join(OUT_DIR, file))
  }

  ok = true
} catch (error) {
  console.warn(`⚠ No se generaron los PDF del currículum: ${error.message}`)
  console.warn('  El sitio se publica igual; la versión web imprimible sigue disponible.')
} finally {
  server.kill('SIGTERM')
}

// Falla el build si no quedó ningún documento disponible: publicar un selector
// de descargas vacío incumple la promesa de la página.
process.exit(ok || readdirSync(OUT_DIR).some((f) => f.endsWith('.pdf')) ? 0 : 1)
