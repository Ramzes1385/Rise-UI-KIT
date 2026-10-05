import { expect, test, type Page } from '@playwright/test'

const RENDER_DONE_PHASES = ['played', 'completed', 'finished']

type StorybookWindow = { __STORYBOOK_PREVIEW__?: { currentRender?: { phase?: string } } }

async function openStory(page: Page, id: string, globals = ''): Promise<void> {
	await page.setViewportSize({ width: 1100, height: 700 })
	await page.goto(`/iframe.html?id=${id}&viewMode=story${globals ? `&globals=${globals}` : ''}`)
	await page.locator('#storybook-root > *').first().waitFor({ timeout: 25_000 })
	await page.waitForFunction(
		phases => phases.includes((window as StorybookWindow).__STORYBOOK_PREVIEW__?.currentRender?.phase ?? ''),
		RENDER_DONE_PHASES,
		{ timeout: 25_000 },
	)
}

/** Длительность из текста ячейки в мс: сборка сжимает `200ms` до `.2s`, `0.01ms` — до `.01ms` */
const toMs = (text: string): number => (text.endsWith('ms') ? Number.parseFloat(text) : Number.parseFloat(text) * 1000)

async function rowDurations(page: Page, token: string): Promise<number[]> {
	const texts = await page
		.getByRole('row', { name: new RegExp(`^${token} `) })
		.locator('td')
		.allTextContents()
	return texts.map(text => toMs(text.trim()))
}

const column = (page: Page, preset: string) => page.locator(`.story-motion__preset[data-rise-motion="${preset}"]`)

/**
 * Нажимает «Повторить» и в следующем кадре ставит переходы блока в каждой колонке на середину: состояние «в пути»
 * без гонки с часами. Возвращает сдвиг по Y для каждого пресета
 */
async function replayAtHalf(page: Page, text: string): Promise<Record<string, number>> {
	return page.evaluate(async label => {
		const button = [...document.querySelectorAll('button')].find(item => item.textContent?.trim() === 'Повторить')!
		const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve))
		const blockOf = (preset: HTMLElement) =>
			[...preset.querySelectorAll<HTMLElement>('.base-animation')].find(el => el.textContent?.trim() === label)!
		const presets = [...document.querySelectorAll<HTMLElement>('.story-motion__preset')]
		const moving = presets.filter(preset => preset.dataset.riseMotion !== 'none')
		button.click()
		for (let frame = 0; frame < 30 && !moving.every(preset => blockOf(preset)?.getAnimations().length); frame++) await nextFrame()
		const result: Record<string, number> = {}
		for (const preset of presets) {
			const block = blockOf(preset)
			for (const animation of block.getAnimations()) {
				animation.pause()
				animation.currentTime = Number(animation.effect?.getComputedTiming().duration ?? 0) / 2
			}
			result[preset.dataset.riseMotion!] = new DOMMatrixReadOnly(getComputedStyle(block).transform).m42
		}
		return result
	}, text)
}

test.describe('движение: пресеты и середина перехода', () => {
	test.beforeEach(async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'no-preference' })
	})

	test('пресет на области пересчитывает токены', async ({ page }) => {
		await openStory(page, 'foundations-motion--tokens')

		await expect.poll(() => rowDurations(page, '--rise-duration-slow')).toEqual([0.01, 200, 300, 420])
		await expect.poll(() => rowDurations(page, '--rise-duration-xslow')).toEqual([0.01, 300, 500, 700])
		const spring = page
			.getByRole('row', { name: /--rise-ease-spring/ })
			.locator('td')
			.last()
		await expect(spring).toHaveText(/^linear\(/)
	})

	test('slide-up на середине перехода — между начальным и конечным положением', async ({ page }) => {
		await openStory(page, 'foundations-motion--enter')
		const { none, standard, expressive } = await replayAtHalf(page, 'slide-up')

		expect(none).toBe(0)

		expect(standard).toBeGreaterThan(0)
		expect(standard).toBeLessThan(16)
		expect(expressive).toBeGreaterThan(0)
		expect(expressive).toBeLessThan(32)
		expect(expressive).toBeGreaterThan(standard)
	})

	test('пресет none — сразу конечное состояние', async ({ page }) => {
		await openStory(page, 'foundations-motion--enter')
		await page.getByRole('button', { name: 'Повторить' }).click()

		const block = column(page, 'none').locator('.base-animation', { hasText: 'slide-up' })
		await expect.poll(() => block.evaluate(el => getComputedStyle(el).transform)).toBe('none')
	})

	test('globals=motion:none ставит пресет на <html> (скриншот-тесты)', async ({ page }) => {
		await openStory(page, 'element-baseanimation--default', 'motion:none')

		await expect(page.locator('html')).toHaveAttribute('data-rise-motion', 'none')
		const duration = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--rise-duration').trim())
		expect(duration).toMatch(/^0?\.01ms$/)
	})

	test('«уменьшить движение» главнее пресета области', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' })
		await openStory(page, 'foundations-motion--tokens')

		await expect.poll(() => rowDurations(page, '--rise-duration-slow')).toEqual([0.01, 0.01, 0.01, 0.01])
	})
})
