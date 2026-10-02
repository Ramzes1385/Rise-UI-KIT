import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseChart · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-basechart--${story}`, { theme, height: 360 })
				await expectStoryScreenshot(page, `base-chart-${story}-${theme}.png`)
			})
		}
	})
}
