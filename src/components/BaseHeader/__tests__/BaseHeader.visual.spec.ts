import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'variants'] as const

const LAYOUT_STORIES = ['landing', 'app', 'shop', 'with-search', 'over-cover', 'compact'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseHeader · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `layout-baseheader--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-header-${story}-${theme}.png`)
			})
		}
		for (const story of LAYOUT_STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `layout-baseheader--${story}`, { theme, width: 1200, height: 600 })
				await expectStoryScreenshot(page, `base-header-${story}-${theme}.png`)
			})
		}
	})
}
