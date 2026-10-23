import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'layout-snake', 'layout-list', 'layout-horizontal', 'variants', 'locked'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseRoadmap · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-baseroadmap--${story}`, { theme, width: 1440, height: 1000 })
				await expectStoryScreenshot(page, `base-roadmap-${story}-${theme}.png`)
			})
		}
	})
}
