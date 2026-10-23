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
