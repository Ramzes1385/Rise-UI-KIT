import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'with-error', 'long-content', 'custom-color'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseCheckbox · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-basecheckbox--${story}`, { theme, height: 360 })
				await expectStoryScreenshot(page, `base-checkbox-${story}-${theme}.png`)
			})
		}
	})
}
