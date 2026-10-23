import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['disabled', 'with-error', 'empty', 'long-content'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseImageMapEditor · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `media-baseimagemapeditor--${story}`, { theme, width: 1100, height: 900 })
				await expectStoryScreenshot(page, `base-image-map-editor-${story}-${theme}.png`)
			})
		}
	})
}
