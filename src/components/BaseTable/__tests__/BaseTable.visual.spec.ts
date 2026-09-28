import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'toolbar', 'selection', 'expandable-rows', 'loading', 'empty'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseTable · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-basetable--${story}`, { theme, width: 1100, height: 600 })
				await expectStoryScreenshot(page, `base-table-${story}-${theme}.png`)
			})
		}
	})
}
