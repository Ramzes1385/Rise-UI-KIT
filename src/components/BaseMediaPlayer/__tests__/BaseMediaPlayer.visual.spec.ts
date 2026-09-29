import { expect, test, type Page } from '@playwright/test'
import { expectStoryScreenshot, VISUAL_THEMES } from '../../../../build/tests/visual'

type Scenario = { story: string; time?: number; width?: number; prepare?: (page: Page) => Promise<void> }

const STORY_PREFIX = 'media-basemediaplayer--'

const PLAYED_PHASES = ['played', 'completed', 'finished']

type PreviewWindow = { __STORYBOOK_PREVIEW__?: { currentRender?: { phase?: string } } }

async function openPlayerStory(page: Page, story: string, options: { theme: string; width: number }): Promise<void> {
	await page.setViewportSize({ width: options.width, height: 560 })
	await page.goto(`/iframe.html?id=${STORY_PREFIX}${story}&viewMode=story&globals=theme:${options.theme}`)
	await page.waitForFunction(
		phases => phases.includes((window as PreviewWindow).__STORYBOOK_PREVIEW__?.currentRender?.phase ?? ''),
		PLAYED_PHASES,
		{ timeout: 25_000 },
	)
	await page.evaluate(() => document.fonts.ready)
}

const SEEK = { name: 'Перемотка' }

async function freeze(page: Page, seconds: number): Promise<void> {
	await page.evaluate(async time => {
		const video = document.querySelector<HTMLVideoElement>('.base-media-player__media')
		if (!video) return
		video.pause()
		await new Promise(resolve => {
			video.addEventListener('seeked', resolve, { once: true })
			video.currentTime = time
		})
	}, seconds)
	await page.mouse.move(0, 0)
	const whole = Math.floor(seconds)
	await expect(page.getByRole('slider', SEEK)).toHaveAttribute('aria-valuetext', `0:${String(whole).padStart(2, '0')} из 0:12`)
	await page.waitForFunction(() => !document.querySelector('[class*="-enter-active"], [class*="-leave-active"]'))
}

async function closeMenus(page: Page): Promise<void> {
	const menu = page.getByRole('menu')
	for (let attempt = 0; attempt < 3 && (await menu.count()) > 0; attempt++) await page.keyboard.press('Escape')
	await expect(menu).toHaveCount(0)
}

function openMenu(name: string) {
	return async (page: Page): Promise<void> => {
		await page.getByRole('button', { name }).click()
		await expect(page.getByRole('menu').first()).toBeVisible()
		await page.mouse.move(0, 0)
	}
}

function openSpeedPanel(page: Page): Promise<void> {
	return (async () => {
		await page.getByRole('button', { name: 'Скорость воспроизведения' }).click()
		await expect(page.getByRole('group', { name: 'Скорость воспроизведения' })).toBeVisible()
		await page.mouse.move(0, 0)
	})()
}

const SCENARIOS: Scenario[] = [
	{ story: 'default', time: 5 },
	{ story: 'title-and-logo' },
	{ story: 'settings', time: 3, prepare: openSpeedPanel },
	{ story: 'subtitles', time: 4 },
	{ story: 'audio-tracks', time: 3, prepare: openMenu('Озвучка') },
	{ story: 'episodes', time: 3 },
	{ story: 'audio-mode', time: 3 },
	{ story: 'ads', time: 9 },
	{
		story: 'banners-and-achievements',
		time: 3,
		prepare: async page => {
			await expect(page.locator('.base-media-player__achievement')).toHaveCount(0, { timeout: 8000 })
		},
	},
	{ story: 'theater', width: 1000, prepare: page => page.getByRole('button', { name: 'Широкий экран' }).click() },
	{
		story: 'context-menu',
		time: 2,
		prepare: async page => {
			await page.getByRole('button', { name: 'Закрыть', exact: true }).click()
			await page.locator('.base-media-player__media').click({ button: 'right', position: { x: 60, y: 60 } })
			await expect(page.getByRole('menuitem', { name: 'Данные для отладки' })).toBeVisible()
		},
	},
	{ story: 'with-error' },
	{
		story: 'cast',
		prepare: async page => {
			await page.getByRole('button', { name: 'Трансляция на телевизор' }).click()
			await page
				.getByRole('dialog', { name: 'Трансляция' })
				.getByRole('button', { name: /Телевизор в гостиной/ })
				.click()
			const controls = page.locator('.base-media-player__cast-controls')
			await controls.getByRole('button', { name: 'Пауза' }).click()
			await controls.getByRole('slider', SEEK).press('Home')
			await expect(controls.locator('.base-media-player__time')).toHaveText('0:00 / 0:12')
			await page.mouse.move(0, 0)
		},
	},
]

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseMediaPlayer · ${theme}`, () => {
		for (const { story, time, width = 800, prepare } of SCENARIOS) {
			test(story, async ({ page }) => {
				await openPlayerStory(page, story, { theme, width })
				await closeMenus(page)
				if (time !== undefined) await freeze(page, time)
				await prepare?.(page)
				await expect(page.locator('.base-media-player__flash')).toHaveText('')
				await expectStoryScreenshot(page, `base-media-player-${story}-${theme}.png`)
			})
		}
	})
}
