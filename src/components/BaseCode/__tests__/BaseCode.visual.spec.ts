import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'languages'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseCode · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-basecode--${story}`, { theme, height: 600 })
				await expectStoryScreenshot(page, `base-code-${story}-${theme}.png`)
			})
		}
	})
}
