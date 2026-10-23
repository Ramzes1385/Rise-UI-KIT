import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'with-error', 'disabled', 'long-content'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseRadio · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-baseradio--${story}`, { theme, height: 480 })
				await expectStoryScreenshot(page, `base-radio-${story}-${theme}.png`)
			})
		}
	})
}
