import { expect, test } from '@playwright/test'

test('отсчёт: roll — цифра в пути между началом и концом перехода', async ({ page }) => {
	await page.goto('/iframe.html?id=data-basecountdown--digit-animations')
	await page.waitForSelector('.base-countdown--digits-roll .base-countdown__digit', { timeout: 25000 })

	const offset = await page.waitForFunction(
		() => {
			const entering = document.querySelector<HTMLElement>('.base-countdown--digits-roll .base-countdown-roll-enter-active')
			if (!entering) return null
			const shift = new DOMMatrixReadOnly(getComputedStyle(entering).transform).m42
			const height = entering.getBoundingClientRect().height
			return shift < 0 && shift > -height ? { shift, height } : null
		},
		undefined,
		{ timeout: 5000, polling: 'raf' },
	)
	const { shift, height } = (await offset.jsonValue()) as { shift: number; height: number }
	expect(shift).toBeLessThan(0)
	expect(shift).toBeGreaterThan(-height)
	await expect(page.locator('.base-countdown-roll-enter-active')).toHaveCount(0)
})

test('отсчёт: при «уменьшить движение» цифры без перехода', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' })
	await page.goto('/iframe.html?id=data-basecountdown--digit-animations')
	await page.waitForSelector('.base-countdown', { timeout: 25000 })
	await expect(page.locator('.base-countdown--digits-none')).toHaveCount(10)
	await expect(page.locator('.base-countdown__slot')).toHaveCount(0)
})
