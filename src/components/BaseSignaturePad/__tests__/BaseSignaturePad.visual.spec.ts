import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['signed', 'variants', 'with-error'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseSignaturePad · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-basesignaturepad--${story}`, { theme, height: 280 })
				await expectStoryScreenshot(page, `base-signature-pad-${story}-${theme}.png`)
			})
		}
	})
}
