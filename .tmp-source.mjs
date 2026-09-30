import { chromium } from 'playwright'
const id = process.argv[2]
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } })
await page.goto(`http://localhost:6006/iframe.html?id=${id}&viewMode=docs`)
await page.waitForTimeout(9000)
const clicked = await page.evaluate(() => {
	const buttons = [...document.querySelectorAll('button')].filter(button => button.textContent.trim() === 'Show code')
	buttons.forEach(button => button.click())
	return buttons.length
})
await page.waitForTimeout(2500)
const blocks = await page.$$eval('pre', nodes => nodes.map(node => node.textContent).filter(Boolean))
console.log('clicked', clicked, 'pre', blocks.length)
blocks.forEach((text, index) => console.log(`--- pre ${index}\n${text.slice(0, 1200)}`))
await browser.close()
