import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'tones', 'sizes', 'with-icon'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseTag · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-basetag--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-tag-${story}-${theme}.png`)
			})
		}
	})
}
