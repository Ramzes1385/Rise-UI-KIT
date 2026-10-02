import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'tones', 'long-content'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseTagGroup · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-basetaggroup--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-tag-group-${story}-${theme}.png`)
			})
		}
	})
}
