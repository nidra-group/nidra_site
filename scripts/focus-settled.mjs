/** Foco medido ANTES y DESPUÉS de que termine la transición de 150 ms. */
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:3100'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()

const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05) }
const rgb = (s) => s.match(/\d+/g).slice(0, 3).map(Number)

await page.goto(`${BASE}/es`, { waitUntil: 'networkidle' })

const leer = () =>
  page.evaluate(() => {
    const el = document.activeElement
    const cs = getComputedStyle(el)
    return { txt: el.textContent.trim().slice(0, 28), outlineColor: cs.outlineColor, width: cs.outlineWidth }
  })

for (let i = 0; i < 14; i++) {
  await page.keyboard.press('Tab')
  const inmediato = await leer()
  await page.waitForTimeout(400)
  const asentado = await leer()
  if (!asentado.txt) continue
  const c = ratio(rgb(asentado.outlineColor), [247, 245, 241])
  console.log(
    `${asentado.txt.padEnd(30)} inmediato=${inmediato.outlineColor.padEnd(20)} asentado=${asentado.outlineColor.padEnd(20)} contraste_vs_papel=${c.toFixed(2)}${c < 3 ? '  << FALLA (min 3:1)' : ''}`,
  )
}

// captura del botón primario ya asentado
await page.goto(`${BASE}/es`, { waitUntil: 'networkidle' })
for (let i = 0; i < 8; i++) await page.keyboard.press('Tab')
await page.waitForTimeout(600)
const clip = await page.evaluate(() => { const r = document.activeElement.getBoundingClientRect(); return { x: r.x - 22, y: r.y - 22, width: r.width + 44, height: r.height + 44 } })
await page.screenshot({ path: '.shots2/foco-primario-asentado.png', clip })

await browser.close()
