import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'padding', 'with-actions', 'with-footer', 'fixed-height'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseCard · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-basecard--${story}`, { theme, height: 480 })
				await expectStoryScreenshot(page, `base-card-${story}-${theme}.png`)
			})
		}
	})
}
