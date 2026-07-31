/** Aísla el comportamiento del <select> de servicio tras un envío fallido. */
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:3100'
const browser = await chromium.launch()
const page = await browser.newPage()

const dump = (etiqueta) =>
  page.evaluate((e) => {
    const s = document.querySelector('select[name="service"]')
    return {
      etiqueta: e,
      valorDOM: s.value,
      indiceSeleccionado: s.selectedIndex,
      textoVisible: s.options[s.selectedIndex]?.textContent.trim(),
      opciones: Array.from(s.options).map((o, i) => `${i}:${o.value || '(vacío)'}`),
    }
  }, etiqueta)

await page.goto(`${BASE}/es/contacto`, { waitUntil: 'networkidle' })
await page.waitForTimeout(3500)

await page.selectOption('select[name="service"]', 'workflow-automation')
await page.waitForTimeout(300)
console.log(JSON.stringify(await dump('1. tras elegir a mano'), null, 1))

await page.fill('input[name="name"]', 'Ana Pérez')
await page.fill('input[name="email"]', 'ana@ejemplo.com')
await page.fill('textarea[name="message"]', 'Quiero automatizar la carga de facturas de proveedores, hoy es manual.')

// qué se envía realmente
page.on('request', (req) => {
  if (req.method() === 'POST') console.log('   POST enviado ->', (req.postData() || '').includes('workflow-automation') ? 'incluye service=workflow-automation' : 'SIN service')
})

await page.click('button[type="submit"]')
await page.waitForTimeout(2500)
console.log(JSON.stringify(await dump('2. tras envío fallido (unavailable)'), null, 1))

// ¿puede el usuario volver a elegir?
await page.selectOption('select[name="service"]', 'ai-roadmap')
await page.waitForTimeout(400)
console.log(JSON.stringify(await dump('3. tras intentar re-elegir ai-roadmap'), null, 1))

// reintento de envío: ¿se pierde el servicio?
await page.click('button[type="submit"]')
await page.waitForTimeout(2500)
console.log(JSON.stringify(await dump('4. tras reintento'), null, 1))
const alerta = await page.evaluate(() => document.querySelector('[role="alert"]')?.textContent.trim().slice(0, 200))
console.log('   alerta:', alerta)

// mismo experimento con estado 'invalid'
await page.goto(`${BASE}/es/contacto`, { waitUntil: 'networkidle' })
await page.waitForTimeout(3500)
await page.selectOption('select[name="service"]', 'workflow-automation')
await page.fill('input[name="name"]', 'A') // fuerza error de validación
await page.fill('input[name="email"]', 'ana@ejemplo.com')
await page.fill('textarea[name="message"]', 'Quiero automatizar la carga de facturas de proveedores, hoy es manual.')
await page.click('button[type="submit"]')
await page.waitForTimeout(2000)
console.log(JSON.stringify(await dump('5. tras error de validación (invalid)'), null, 1))

await browser.close()
