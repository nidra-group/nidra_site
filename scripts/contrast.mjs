import { chromium } from 'playwright'
const BASE = process.env.BASE_URL ?? 'http://localhost:61033'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await ctx.newPage()

for (const route of ['/es', '/es/integraciones', '/es/contacto', '/es/servicios']) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' })
  const res = await page.evaluate(() => {
    const parse = (c) => c.match(/[\d.]+/g).map(Number)
    const lum = ([r, g, b]) => {
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
    }
    const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05) }
    const effBg = (el) => {
      let n = el
      while (n) { const c = parse(getComputedStyle(n).backgroundColor); if (c[3] === undefined || c[3] > 0.95) return c.slice(0, 3); n = n.parentElement }
      return [255, 255, 255]
    }
    const rows = []
    const seen = new Set()
    const walk = (root) => {
      const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      let n
      while ((n = tw.nextNode())) {
        const t = n.textContent.trim()
        if (t.length < 2) continue
        const el = n.parentElement
        const cs = getComputedStyle(el)
        if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue
        const fg = parse(cs.color).slice(0, 3)
        const bg = effBg(el)
        const r = +ratio(fg, bg).toFixed(2)
        const px = +parseFloat(cs.fontSize).toFixed(1)
        const key = cs.color + px + cs.fontWeight
        if (seen.has(key)) continue
        seen.add(key)
        rows.push({ r, px, w: cs.fontWeight, color: cs.color, bg: `rgb(${bg.join(',')})`, sample: t.slice(0, 40) })
      }
    }
    walk(document.body)
    return rows.sort((a, b) => a.r - b.r)
  })
  console.log('\n===', route)
  for (const x of res) console.log(String(x.r).padStart(6), `${x.px}px/${x.w}`.padEnd(12), x.color.padEnd(20), 'on', x.bg.padEnd(18), x.sample)
}
await browser.close()
