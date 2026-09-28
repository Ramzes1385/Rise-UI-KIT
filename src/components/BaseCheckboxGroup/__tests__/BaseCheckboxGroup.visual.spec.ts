import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'disabled', 'with-error', 'select-all'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseCheckboxGroup · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-basecheckboxgroup--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-checkbox-group-${story}-${theme}.png`)
			})
		}
	})
}
