import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'custom-color', 'disabled', 'with-error'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseCascader · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-basecascader--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-cascader-${story}-${theme}.png`)
			})
		}
	})
}
