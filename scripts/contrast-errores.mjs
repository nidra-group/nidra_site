/** Contraste de los estados que solo existen tras un envío fallido. */
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:3100'
const browser = await chromium.launch()
const page = await browser.newPage()

await page.goto(`${BASE}/es/contacto`, { waitUntil: 'networkidle' })
await page.waitForTimeout(3500)
await page.click('button[type="submit"]')
await page.waitForTimeout(1500)

const res = await page.evaluate(() => {
  const parse = (s) => s.match(/[\d.]+/g).slice(0, 3).map(Number)
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05) }
  const bgDe = (el) => { let n = el; while (n) { const cs = getComputedStyle(n); const c = cs.backgroundColor; if (c && !c.includes('rgba(0, 0, 0, 0)')) { const p = parse(c); const a = c.match(/[\d.]+/g)[3]; if (a === undefined || +a > 0.95) return p; } n = n.parentElement } return [247, 245, 241] }

  const out = []
  document.querySelectorAll('p, li, span').forEach((el) => {
    const t = el.textContent.trim()
    if (!t || el.children.length) return
    const cs = getComputedStyle(el)
    const px = parseFloat(cs.fontSize)
    const fg = parse(cs.color)
    const bg = bgDe(el)
    const r = ratio(fg, bg)
    const grande = px >= 24 || (px >= 18.66 && +cs.fontWeight >= 700)
    const need = grande ? 3 : 4.5
    if (r < need) out.push({ texto: t.slice(0, 55), color: cs.color, fondo: `rgb(${bg.join(',')})`, px, ratio: +r.toFixed(2), need })
  })
  return out
})

console.log(res.length ? JSON.stringify(res, null, 1) : 'sin fallos de contraste en el estado de error')
await browser.close()
