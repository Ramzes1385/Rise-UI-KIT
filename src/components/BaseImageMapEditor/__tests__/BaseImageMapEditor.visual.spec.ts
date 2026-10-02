import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'disabled', 'with-error'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseImageMapEditor · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `media-baseimagemapeditor--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-image-map-editor-${story}-${theme}.png`)
			})
		}
	})
}
