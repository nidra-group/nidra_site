#!/usr/bin/env node
/**
 * Banco de pruebas de paletas.
 *
 * Instala una paleta candidata en `app/globals.css`, verifica sus contrastes
 * contra las reglas del propio bloque y fotografía la portada real con ella.
 *
 * Comparar paletas mirando muestras de color no sirve: un color se comporta
 * distinto según cuánta superficie ocupa y qué tiene al lado. La única
 * comparación honesta es ver la misma página, con el mismo texto, en cada una.
 *
 *   node scripts/try-palette.mjs candidatas/umbral.json
 *   node scripts/try-palette.mjs --restore
 *
 * El archivo de paleta es un objeto con una clave por token de marca, sin el
 * prefijo `--brand-`. Ejemplo:
 *
 *   { "nombre": "umbral", "paper": "#07090f", "accent": "#e8b64c", ... }
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright'

const CSS = join(process.cwd(), 'app/globals.css')
const BACKUP = join(process.cwd(), '.palette-backup.css')
const OUT = join(process.cwd(), '.palettes')
const BASE = process.env.BASE_URL ?? 'http://localhost:3210'

/** Luminancia relativa de WCAG 2.1. */
function luminance(hex) {
  const channel = (value) => {
    const c = value / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const r = channel(parseInt(hex.slice(1, 3), 16))
  const g = channel(parseInt(hex.slice(3, 5), 16))
  const b = channel(parseInt(hex.slice(5, 7), 16))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** Las mismas reglas que verifica tests/unit/palette.test.ts. */
const RULES = [
  ['ink', 'paper', 7],
  ['ink', 'surface', 7],
  ['muted', 'paper', 4.5],
  ['muted', 'surface', 4.5],
  ['critical', 'paper', 4.5],
  ['accent', 'paper', 4.5],
  ['accent', 'surface', 4.5],
  ['paper', 'accent', 4.5],
  ['paper', 'accent-deep', 4.5],
  ['line-strong', 'paper', 3],
  ['line-strong', 'surface', 3],
]

function check(palette) {
  let failed = 0
  for (const [fg, bg, min] of RULES) {
    if (!palette[fg] || !palette[bg]) {
      console.log(`  ✗ falta ${!palette[fg] ? fg : bg}`)
      failed++
      continue
    }
    const ratio = contrast(palette[fg], palette[bg])
    const ok = ratio >= min
    if (!ok) failed++
    console.log(
      `  ${ok ? '✓' : '✗'} ${fg} sobre ${bg}: ${ratio.toFixed(2)}:1 (mínimo ${min})`,
    )
  }
  return failed
}

/** Reemplaza los valores del bloque `:root` conservando comentarios y orden. */
function install(palette) {
  if (!existsSync(BACKUP)) copyFileSync(CSS, BACKUP)
  const original = readFileSync(BACKUP, 'utf8')
  const rootStart = original.indexOf(':root {')
  const rootEnd = original.indexOf('}', rootStart)
  const block = original.slice(rootStart, rootEnd)

  const updated = block.replace(
    /--brand-([\w-]+):\s*#[0-9a-fA-F]{6}/g,
    (match, token) => (palette[token] ? `--brand-${token}: ${palette[token]}` : match),
  )

  writeFileSync(CSS, original.slice(0, rootStart) + updated + original.slice(rootEnd))
}

async function shoot(name) {
  mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  await page.goto(`${BASE}/es`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
  await page.screenshot({ path: join(OUT, `${name}-hero.png`) })

  // La sección de tarjetas es donde una paleta se rompe: ahí conviven
  // superficie, borde, texto secundario y acento en poco espacio.
  const y = await page.evaluate(() => {
    const heading = [...document.querySelectorAll('h2')].find((el) =>
      el.textContent?.includes('ya estás pagando'),
    )
    return heading ? window.scrollY + heading.getBoundingClientRect().top - 110 : 1400
  })
  await page.evaluate((n) => window.scrollTo(0, n), y)
  await page.waitForTimeout(600)
  await page.screenshot({ path: join(OUT, `${name}-tarjetas.png`) })

  await browser.close()
}

const arg = process.argv[2]

if (arg === '--restore') {
  if (!existsSync(BACKUP)) {
    console.error('No hay copia de seguridad que restaurar.')
    process.exit(1)
  }
  copyFileSync(BACKUP, CSS)
  console.log('Paleta original restaurada.')
  process.exit(0)
}

if (!arg) {
  console.error('Uso: node scripts/try-palette.mjs <archivo.json> | --restore')
  process.exit(1)
}

const palette = JSON.parse(readFileSync(arg, 'utf8'))
const name = palette.nombre ?? 'candidata'

console.log(`\nPaleta «${name}»`)
const failures = check(palette)

if (failures > 0) {
  console.error(`\n${failures} regla(s) de contraste sin cumplir. No se instala.`)
  process.exit(1)
}

install(palette)
console.log('\nInstalada. Esperando al servidor de desarrollo…')
await new Promise((resolve) => setTimeout(resolve, 2500))
await shoot(name)
console.log(`Capturas en .palettes/${name}-*.png`)
