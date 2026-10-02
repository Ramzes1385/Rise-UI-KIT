import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseEventCalendar · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-baseeventcalendar--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-event-calendar-${story}-${theme}.png`)
			})
		}
	})
}
