import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'basic', 'responsive', 'spans', 'gaps'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseGrid · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `layout-basegrid--${story}`, { theme, height: 500 })
				await expectStoryScreenshot(page, `base-grid-${story}-${theme}.png`)
			})
		}
	})
}
