import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'settings', 'positions', 'long-content'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseCookieConsent · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `overlay-basecookieconsent--${story}`, { theme, height: story === 'positions' ? 1000 : 620 })
				await expectStoryScreenshot(page, `base-cookie-consent-${story}-${theme}.png`)
			})
		}
	})
}
