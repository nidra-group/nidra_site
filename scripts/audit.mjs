import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:61033'
const ROUTES = ['/es', '/es/servicios', '/es/integraciones', '/es/contacto', '/es/privacidad', '/es/terminos', '/en', '/es/cv']
const WIDTHS = [320, 375, 768, 1280]

const browser = await chromium.launch()
const out = {}

for (const width of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } })
  const page = await ctx.newPage()
  for (const route of ROUTES) {
    const resp = await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' })
    await page.addStyleTag({ content: 'nextjs-portal,[data-nextjs-toast]{display:none!important}' })
    const data = await page.evaluate(() => {
      const parse = (c) => {
        const m = c.match(/[\d.]+/g)
        if (!m) return null
        return [Number(m[0]), Number(m[1]), Number(m[2]), m[3] === undefined ? 1 : Number(m[3])]
      }
      const lum = ([r, g, b]) => {
        const f = (v) => {
          v /= 255
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
        }
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
      }
      const ratio = (a, b) => {
        const l1 = lum(a), l2 = lum(b)
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
      }
      const effBg = (el) => {
        let n = el
        while (n && n !== document.documentElement) {
          const c = parse(getComputedStyle(n).backgroundColor)
          if (c && c[3] > 0.95) return c
          n = n.parentElement
        }
        return [255, 255, 255, 1]
      }

      // contrast on text nodes
      const contrast = []
      const seen = new Set()
      document.querySelectorAll('body *').forEach((el) => {
        const hasText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 1)
        if (!hasText) return
        const cs = getComputedStyle(el)
        if (cs.visibility === 'hidden' || cs.display === 'none') return
        const fg = parse(cs.color)
        const bg = effBg(el)
        if (!fg) return
        const r = ratio(fg, bg)
        const px = parseFloat(cs.fontSize)
        const bold = Number(cs.fontWeight) >= 700
        const large = px >= 24 || (px >= 18.66 && bold)
        const need = large ? 3 : 4.5
        if (r < need + 0.05) {
          const txt = el.textContent.trim().slice(0, 50)
          const key = cs.color + px + txt
          if (seen.has(key)) return
          seen.add(key)
          contrast.push({ ratio: +r.toFixed(2), need, fg: cs.color, bg: `rgb(${bg.slice(0,3).join(',')})`, px, weight: cs.fontWeight, text: txt, sel: el.tagName + '.' + (el.className || '').toString().slice(0, 60) })
        }
      })

      // horizontal overflow
      const docW = document.documentElement.clientWidth
      const overflow = []
      document.querySelectorAll('body *').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.width === 0) return
        if (r.right > docW + 1 || r.left < -1) {
          overflow.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 60), left: Math.round(r.left), right: Math.round(r.right), text: el.textContent.trim().slice(0, 40) })
        }
      })

      // headings
      const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((h) => ({
        level: Number(h.tagName[1]),
        text: h.textContent.trim().slice(0, 60),
        px: parseFloat(getComputedStyle(h).fontSize),
        family: getComputedStyle(h).fontFamily.split(',')[0],
        weight: getComputedStyle(h).fontWeight,
      }))

      // tap targets
      const small = []
      document.querySelectorAll('a,button,input,select,textarea,[role="button"]').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) return
        if (r.height < 44 || r.width < 24) {
          small.push({ tag: el.tagName, text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) })
        }
      })

      // line length in ch for paragraphs
      const lines = []
      document.querySelectorAll('p,li').forEach((el) => {
        const t = el.textContent.trim()
        if (t.length < 60) return
        const cs = getComputedStyle(el)
        const w = el.getBoundingClientRect().width
        // approximate char width = 0.5 * fontSize for sans
        const ch = w / (parseFloat(cs.fontSize) * 0.5)
        if (ch > 82 || ch < 40) lines.push({ ch: Math.round(ch), px: parseFloat(cs.fontSize), text: t.slice(0, 45) })
      })

      const imgs = Array.from(document.images).map((i) => ({ src: i.currentSrc, alt: i.alt }))
      const links = Array.from(document.querySelectorAll('a')).map((a) => ({ href: a.getAttribute('href'), text: a.textContent.trim().slice(0, 40), target: a.target, rel: a.rel }))

      return { contrast, overflow, headings, small, lines, imgs, links, docW, scrollW: document.documentElement.scrollWidth, title: document.title }
    })
    out[`${route}@${width}`] = { status: resp.status(), ...data }
  }
  await ctx.close()
}
await browser.close()
mkdirSync('.shots', { recursive: true })
writeFileSync('.shots/audit.json', JSON.stringify(out, null, 2))
console.log('done')
