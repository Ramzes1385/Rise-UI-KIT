import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'disabled', 'loading'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseSplitButton · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-basesplitbutton--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-split-button-${story}-${theme}.png`)
			})
		}
	})
}
