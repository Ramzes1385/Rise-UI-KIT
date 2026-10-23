import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['types', 'variants', 'sizes', 'with-actions', 'long-content'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseAlert · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-basealert--${story}`, { theme, height: 480 })
				await expectStoryScreenshot(page, `base-alert-${story}-${theme}.png`)
			})
		}
	})
}
