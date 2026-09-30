import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'vertical', 'variants', 'disabled'] as const

const LAYOUT_STORIES = ['mail', 'ide', 'dashboard'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseSplitter · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `layout-basesplitter--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-splitter-${story}-${theme}.png`)
			})
		}
		for (const story of LAYOUT_STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `layout-basesplitter--${story}`, { theme, width: 1200, height: 600 })
				await expectStoryScreenshot(page, `base-splitter-${story}-${theme}.png`)
			})
		}
	})
}
