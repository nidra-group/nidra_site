import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
const BASE = process.env.BASE_URL ?? 'http://localhost:61033'
mkdirSync('.shots2', { recursive: true })
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await ctx.newPage()
page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE ERR:', m.text().slice(0, 200)) })
await page.goto(`${BASE}/es/contacto`, { waitUntil: 'networkidle' })
await page.addStyleTag({ content: 'nextjs-portal,[data-nextjs-toast]{display:none!important}' })

// submit empty form
await page.locator('button[type=submit]').click()
await page.waitForTimeout(2500)
const active = await page.evaluate(() => document.activeElement?.outerHTML?.slice(0, 120))
console.log('focus after submit:', active)
await page.screenshot({ path: '.shots2/contacto-errors.png', fullPage: true })

const err = await page.evaluate(() => {
  const parse = (c) => c.match(/[\d.]+/g).map(Number)
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05) }
  const bg = parse(getComputedStyle(document.body).backgroundColor).slice(0, 3)
  return Array.from(document.querySelectorAll('p')).filter((p) => /error|highlight/.test(p.className) || getComputedStyle(p).color.includes('201')).map((p) => ({
    text: p.textContent.trim().slice(0, 60), color: getComputedStyle(p).color, px: getComputedStyle(p).fontSize,
    ratio: +ratio(parse(getComputedStyle(p).color).slice(0, 3), bg).toFixed(2),
  }))
})
console.log('error msgs:', JSON.stringify(err, null, 1))

// tab order + focus visibility on home
const p2 = await ctx.newPage()
await p2.goto(`${BASE}/es`, { waitUntil: 'networkidle' })
const order = []
for (let i = 0; i < 22; i++) {
  await p2.keyboard.press('Tab')
  const info = await p2.evaluate(() => {
    const el = document.activeElement
    if (!el || el === document.body) return null
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    return { tag: el.tagName, text: (el.textContent || '').trim().slice(0, 34), outline: cs.outlineWidth + ' ' + cs.outlineStyle + ' ' + cs.outlineColor, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
  })
  order.push(info)
}
console.log('\nTAB ORDER /es:')
order.forEach((o, i) => console.log(i + 1, JSON.stringify(o)))
await browser.close()
