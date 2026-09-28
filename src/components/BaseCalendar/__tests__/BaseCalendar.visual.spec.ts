/**
 * Visual regression BaseCalendar: ключевые stories в светлой и тёмной теме.
 * Время браузера зафиксировано на STORY_TODAY (openStory), поэтому «сегодня» на снимках — 15 мая 2025.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'range-selection', 'time-12-hour', 'events', 'disabled'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseCalendar · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-basecalendar--${story}`, { theme, height: 800 })
				await expectStoryScreenshot(page, `base-calendar-${story}-${theme}.png`)
			})
		}
	})
}
