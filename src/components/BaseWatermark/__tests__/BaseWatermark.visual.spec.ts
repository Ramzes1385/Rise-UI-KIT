import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'text', 'multi-line', 'image', 'protected'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseWatermark · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-basewatermark--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-watermark-${story}-${theme}.png`)
			})
		}
	})
}
