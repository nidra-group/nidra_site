import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:61033'
const OUT = '.shots2'
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()

const jobs = [
  { path: '/es/cv', name: 'cv', w: 1280 },
  { path: '/es/terminos', name: 'terminos', w: 1280 },
  { path: '/es/privacidad', name: 'privacidad', w: 768 },
  { path: '/es', name: 'home', w: 768 },
  { path: '/es', name: 'home', w: 320 },
  { path: '/es/servicios', name: 'servicios', w: 768 },
  { path: '/es/servicios', name: 'servicios', w: 320 },
  { path: '/es/contacto', name: 'contacto', w: 768 },
  { path: '/es/integraciones', name: 'integraciones', w: 375 },
  { path: '/en', name: 'home-en', w: 375 },
  { path: '/es/cv', name: 'cv', w: 375 },
]

for (const j of jobs) {
  const ctx = await browser.newContext({ viewport: { width: j.w, height: 900 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  await page.goto(`${BASE}${j.path}`, { waitUntil: 'networkidle' })
  await page.addStyleTag({ content: 'nextjs-portal,[data-nextjs-toast]{display:none!important}' })
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT}/${j.name}-${j.w}.png`, fullPage: true })
  console.log('ok', j.name, j.w)
  await ctx.close()
}

// mobile menu open
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
await page.goto(`${BASE}/es`, { waitUntil: 'networkidle' })
await page.addStyleTag({ content: 'nextjs-portal,[data-nextjs-toast]{display:none!important}' })
const btn = page.locator('header button').first()
if (await btn.count()) {
  await btn.click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/menu-open-375.png` })
  console.log('ok menu')
}
await ctx.close()

// 200% zoom (deviceScaleFactor via CSS zoom equivalent: emulate 640px viewport at 1280 layout)
const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const p2 = await ctx2.newPage()
await p2.goto(`${BASE}/es`, { waitUntil: 'networkidle' })
await p2.evaluate(() => { document.documentElement.style.zoom = '2' })
await p2.waitForTimeout(500)
const zoomInfo = await p2.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth }))
console.log('zoom200 /es', JSON.stringify(zoomInfo))
await p2.screenshot({ path: `${OUT}/zoom200-home.png` })
await ctx2.close()

await browser.close()
