import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['trends', 'with-sparkline', 'variants', 'sizes', 'loading'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseStat · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-basestat--${story}`, { theme, height: 320 })
				await expectStoryScreenshot(page, `base-stat-${story}-${theme}.png`)
			})
		}
	})
}
