import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseSparkline · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-basesparkline--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-sparkline-${story}-${theme}.png`)
			})
		}
	})
}
