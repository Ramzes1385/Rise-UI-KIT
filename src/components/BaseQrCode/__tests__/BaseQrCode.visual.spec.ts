import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'error-correction'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseQrCode · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-baseqrcode--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-qr-code-${story}-${theme}.png`)
			})
		}
	})
}
