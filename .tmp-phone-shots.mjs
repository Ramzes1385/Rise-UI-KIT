import { chromium } from 'playwright'
const out = process.argv[2]
const shots = [
	['form-basephoneinput--countries', 'phone-countries', 'light', 440, 480],
	['form-basephoneinput--countries', 'phone-countries-dark', 'dark', 440, 480],
	['form-basephoneinput--variants', 'phone-variants', 'light', 900, 330],
]
const browser = await chromium.launch()
for (const [id, name, theme, width, height] of shots) {
	const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 })
	await page.goto(`http://localhost:6006/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`)
	await page.waitForTimeout(4500)
	await page.screenshot({ path: `${out}/${name}.png` })
	await page.close()
}
await browser.close()
