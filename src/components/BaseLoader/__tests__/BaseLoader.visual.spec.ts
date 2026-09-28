import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'with-label', 'overlay'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseLoader · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-baseloader--${story}`, { theme, height: 300 })
				await expectStoryScreenshot(page, `base-loader-${story}-${theme}.png`)
			})
		}
	})
}
