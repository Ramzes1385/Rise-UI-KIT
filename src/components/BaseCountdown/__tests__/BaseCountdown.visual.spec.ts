import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'layouts', 'finished', 'variants', 'sizes'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseCountdown · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-basecountdown--${story}`, { theme, height: 480 })
				await expectStoryScreenshot(page, `base-countdown-${story}-${theme}.png`)
			})
		}
	})
}
