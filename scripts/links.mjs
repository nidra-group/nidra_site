import { chromium } from 'playwright'
const browser = await chromium.launch()
const ctx = await browser.newContext()
const page = await ctx.newPage()
for (const url of ['https://cal.com/nidra/30min', 'https://jmujica.nidra.cloud', 'https://www.linkedin.com/in/-jmujica']) {
  try {
    const r = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 })
    const title = await page.title()
    const body = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 220)
    console.log(`\n${url}\n  status=${r?.status()} final=${page.url()}\n  title=${title}\n  body=${body}`)
  } catch (e) {
    console.log(`\n${url}\n  ERROR ${e.message.split('\n')[0]}`)
  }
}
await browser.close()
