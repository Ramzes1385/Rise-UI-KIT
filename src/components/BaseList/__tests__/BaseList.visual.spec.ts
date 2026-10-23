import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'disabled', 'with-error'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseList · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-baselist--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-list-${story}-${theme}.png`)
			})
		}
	})
}
