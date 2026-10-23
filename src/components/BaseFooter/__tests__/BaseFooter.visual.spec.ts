import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'variants'] as const

const LAYOUT_STORIES = ['simple', 'columns', 'with-subscribe', 'with-apps', 'compact'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseFooter · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `layout-basefooter--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-footer-${story}-${theme}.png`)
			})
		}
		for (const story of LAYOUT_STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `layout-basefooter--${story}`, { theme, width: 1200, height: 600 })
				await expectStoryScreenshot(page, `base-footer-${story}-${theme}.png`)
			})
		}
	})
}
