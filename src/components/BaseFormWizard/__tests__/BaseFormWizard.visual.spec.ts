import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'variants', 'sizes', 'disabled', 'loading', 'empty', 'long-content'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseFormWizard · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-baseformwizard--${story}`, {
					theme,
					height: story === 'variants' || story === 'sizes' ? 1500 : 560,
				})
				await expectStoryScreenshot(page, `base-form-wizard-${story}-${theme}.png`)
			})
		}
	})
}
