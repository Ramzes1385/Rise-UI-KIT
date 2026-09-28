import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['custom-color'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseContextMenu · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `overlay-basecontextmenu--${story}`, { theme, height: 300 })
				await expectStoryScreenshot(page, `base-context-menu-${story}-${theme}.png`)
			})
		}
	})
}
