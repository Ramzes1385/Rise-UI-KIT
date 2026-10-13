import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['types', 'variants', 'sizes', 'with-action', 'long-content', 'sticky'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseBanner · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-basebanner--${story}`, { theme, height: 480 })
				await expectStoryScreenshot(page, `base-banner-${story}-${theme}.png`)
			})
		}
	})
}
