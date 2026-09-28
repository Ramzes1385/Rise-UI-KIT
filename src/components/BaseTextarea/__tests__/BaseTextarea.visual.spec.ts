import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'with-error', 'disabled', 'rows', 'custom-color'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseTextarea · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-basetextarea--${story}`, { theme, height: 480 })
				await expectStoryScreenshot(page, `base-textarea-${story}-${theme}.png`)
			})
		}
	})
}
