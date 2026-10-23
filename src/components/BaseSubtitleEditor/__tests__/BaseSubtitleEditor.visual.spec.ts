import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['empty', 'disabled'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseSubtitleEditor · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `media-basesubtitleeditor--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-subtitle-editor-${story}-${theme}.png`)
			})
		}
	})
}
