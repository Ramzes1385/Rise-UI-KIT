import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'with-error', 'disabled', 'prefix-postfix', 'password-rules'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseInput · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-baseinput--${story}`, { theme, height: 360 })
				await expectStoryScreenshot(page, `base-input-${story}-${theme}.png`)
			})
		}
	})
}
