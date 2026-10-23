import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'variants'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseHeatmap · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-baseheatmap--${story}`, { theme, height: 320 })
				await expectStoryScreenshot(page, `base-heatmap-${story}-${theme}.png`)
			})
		}
	})
}
