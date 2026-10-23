import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'selection-modes', 'arrow-right', 'disabled', 'long-content'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseTree · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-basetree--${story}`, { theme, width: 1000, height: 480 })
				await expectStoryScreenshot(page, `base-tree-${story}-${theme}.png`)
			})
		}
	})
}
