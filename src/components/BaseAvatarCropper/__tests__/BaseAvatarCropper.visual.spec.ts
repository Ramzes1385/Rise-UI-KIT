import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'circle', 'variants'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseAvatarCropper · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-baseavatarcropper--${story}`, { theme, height: 360 })
				await expectStoryScreenshot(page, `base-avatar-cropper-${story}-${theme}.png`)
			})
		}
	})
}
