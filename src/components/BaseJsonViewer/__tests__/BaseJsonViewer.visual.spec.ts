import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'variants'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseJsonViewer · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-basejsonviewer--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-json-viewer-${story}-${theme}.png`)
			})
		}
	})
}
