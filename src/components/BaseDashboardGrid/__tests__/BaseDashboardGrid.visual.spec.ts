import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'static-items', 'responsive', 'variants', 'sizes', 'disabled', 'empty', 'long-content'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseDashboardGrid · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `layout-basedashboardgrid--${story}`, { theme, height: 560 })
				await expectStoryScreenshot(page, `base-dashboard-grid-${story}-${theme}.png`)
			})
		}
	})
}
