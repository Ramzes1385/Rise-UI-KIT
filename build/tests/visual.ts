/**
 * Время зафиксировано на STORY_TODAY (15 мая 2025, 10:30), чтобы календари и относительные даты не зависели от дня прогона.
 * Пресет движения — `none`: JS-анимации (твины чисел и графиков) сразу в конечном состоянии; CSS останавливает `animations: 'disabled'`.
 */

import { expect, type Page } from '@playwright/test'

export const VISUAL_THEMES = ['light', 'dark'] as const

type VisualTheme = (typeof VISUAL_THEMES)[number]

interface OpenStoryOptions {
	theme?: VisualTheme
	width?: number
	height?: number
}

/** Фазы рендера Storybook, после которых story отрисована и её play-функция завершилась. */
const RENDER_DONE_PHASES = ['played', 'completed', 'finished', 'errored', 'aborted']

type PreviewWindow = { __STORYBOOK_PREVIEW__?: { currentRender?: { phase?: string } } }

/**
 * Открывает story в iframe Storybook и ждёт, пока она отрисуется, её play-функция завершится
 * (play может открыть оверлей или переключить состояние — снимок должен быть конечным) и загрузятся шрифты.
 */
export async function openStory(
	page: Page,
	id: string,
	{ theme = 'light', width = 800, height = 400 }: OpenStoryOptions = {},
): Promise<void> {
	await page.clock.setFixedTime(new Date(2025, 4, 15, 10, 30))
	await page.setViewportSize({ width, height })
	await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};motion:none`)
	await page.locator('#storybook-root > *').first().waitFor({ timeout: 25_000 })
	await page.waitForFunction(
		phases => phases.includes((window as PreviewWindow).__STORYBOOK_PREVIEW__?.currentRender?.phase ?? ''),
		RENDER_DONE_PHASES,
		{ timeout: 25_000 },
	)
	await page.evaluate(() => document.fonts.ready)
}

/**
 * Скриншот story. `scope: 'root'` — только область компонента; `'page'` — вся страница
 * (для оверлеев, которые телепортируются в body: Modal, Slideover, Dropdown, Tooltip, Notification).
 */
export async function expectStoryScreenshot(page: Page, name: string, scope: 'root' | 'page' = 'root'): Promise<void> {
	const options = { animations: 'disabled', caret: 'hide', scale: 'css' } as const
	if (scope === 'page') await expect(page).toHaveScreenshot(name, options)
	else await expect(page.locator('#storybook-root')).toHaveScreenshot(name, options)
}
