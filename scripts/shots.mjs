import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:3210'
const OUT = process.env.OUT_DIR ?? '.shots'

const TARGETS = [
  { path: '/es', name: 'home-es' },
  { path: '/es/servicios', name: 'servicios' },
  { path: '/es/integraciones', name: 'integraciones' },
  { path: '/es/contacto', name: 'contacto' },
  { path: '/en', name: 'home-en' },
  { path: '/es/privacidad', name: 'privacidad' },
]

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 375, height: 812 },
]

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    // Sin animaciones: la captura de página completa no hace scroll, así que
    // los revelados quedarían congelados en invisible. Además verifica el
    // estado que ve un usuario con reduced motion.
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()

  for (const target of TARGETS) {
    if (vp.name === 'mobile' && !['home-es', 'contacto', 'servicios'].includes(target.name)) continue
    await page.goto(`${BASE}${target.path}`, { waitUntil: 'networkidle' })
    await page.addStyleTag({ content: 'nextjs-portal, [data-nextjs-toast] { display: none !important }' })
    await page.waitForTimeout(400)
    await page.screenshot({
      path: `${OUT}/${target.name}-${vp.name}.png`,
      fullPage: true,
    })
    console.log(`✓ ${target.name}-${vp.name}`)
  }

  await context.close()
}

await browser.close()
