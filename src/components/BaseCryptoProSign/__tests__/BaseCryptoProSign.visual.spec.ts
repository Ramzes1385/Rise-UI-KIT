import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseCryptoProSign · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-basecryptoprosign--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-crypto-pro-sign-${story}-${theme}.png`)
			})
		}
	})
}
