import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['gallery', 'sizes', 'custom-color', 'transform'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseIcon · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-baseicon--${story}`, { theme, height: story === 'gallery' ? 900 : 240 })
				await expectStoryScreenshot(page, `base-icon-${story}-${theme}.png`)
			})
		}
	})
}
