import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'empty'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseNotificationCenter · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `overlay-basenotificationcenter--${story}`, { theme, height: 520 })
				await expectStoryScreenshot(page, `base-notification-center-${story}-${theme}.png`)
			})
		}
	})
}
