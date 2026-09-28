import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'disabled', 'with-error'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseAutocomplete · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-baseautocomplete--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-autocomplete-${story}-${theme}.png`)
			})
		}
	})
}
