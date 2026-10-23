import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = [
	['default', 200],
	['error-correction', 200],
	['shapes', 220],
	['logo', 220],
	['custom-color', 240],
] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseQrCode · ${theme}`, () => {
		for (const [story, height] of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-baseqrcode--${story}`, { theme, height })
				await expectStoryScreenshot(page, `base-qr-code-${story}-${theme}.png`)
			})
		}
	})
}
