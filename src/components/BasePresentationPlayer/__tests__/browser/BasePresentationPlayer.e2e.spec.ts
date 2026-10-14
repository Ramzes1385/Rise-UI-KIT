import { expect, test, type Page } from '@playwright/test'

const STORY = 'media-basepresentationplayer--default'

const PLAYED_PHASES = ['played', 'completed', 'finished']

type StorybookWindow = {
	__STORYBOOK_PREVIEW__?: { currentRender?: { phase?: string } }
	__STORYBOOK_ADDONS_CHANNEL__?: { emit: (event: string, payload: unknown) => void }
}

async function openLinear(page: Page): Promise<void> {
	await page.setViewportSize({ width: 800, height: 560 })
	await page.goto(`/iframe.html?id=${STORY}&viewMode=story`)
	await page.waitForFunction(
		phases => phases.includes((window as StorybookWindow).__STORYBOOK_PREVIEW__?.currentRender?.phase ?? ''),
		PLAYED_PHASES,
		{ timeout: 25_000 },
	)
	await page.evaluate(storyId => {
		const slides = [{ duration: 1, minDuration: 4 }, { duration: 1, minDuration: 4 }, {}]
		;(window as StorybookWindow).__STORYBOOK_ADDONS_CHANNEL__?.emit('updateStoryArgs', {
			storyId,
			updatedArgs: { navigation: 'linear', slides },
		})
	}, STORY)
}

test('linear: «Следующий слайд» недоступна до minDuration, затем показ переходит дальше', async ({ page }) => {
	await openLinear(page)
	const player = page.getByRole('region', { name: 'Знакомство с компанией' })
	const counter = player.locator('.base-media-player__time')
	const next = player.getByRole('button', { name: 'Следующий слайд' })

	await player.getByRole('button', { name: 'Предыдущий слайд' }).click()
	await expect(counter).toHaveText('1 / 3')
	await player.getByRole('button', { name: 'Воспроизвести' }).click()

	await expect(next).toHaveAttribute('aria-disabled', 'true')
	const describedBy = ((await next.getAttribute('aria-describedby')) ?? '').split(/\s+/).filter(Boolean)
	expect(describedBy.length).toBeGreaterThan(0)
	expect(new Set(describedBy).size).toBe(describedBy.length)
	const texts: string[] = []
	for (const id of describedBy) {
		await expect(page.locator(`[id="${id}"]`)).toHaveCount(1)
		texts.push((await page.locator(`[id="${id}"]`).innerText()).trim())
	}
	expect(texts.filter(text => /^Доступно через [1-4] с$/.test(text))).toHaveLength(1)
	await expect(player.locator('.base-presentation-player__ring')).toBeVisible()

	await next.click({ force: true })
	await next.focus()
	await page.keyboard.press('Enter')
	await page.keyboard.press('ArrowRight')
	await expect(player.getByRole('status').last()).toHaveText(/^Доступно через [1-4] с$/)
	await page.waitForTimeout(1500)
	await expect(counter).toHaveText('1 / 3')
	await expect(next).toHaveAttribute('aria-disabled', 'true')

	await expect(counter).toHaveText('2 / 3', { timeout: 6000 })
	await expect(next).toHaveAttribute('aria-disabled', 'true')
})
