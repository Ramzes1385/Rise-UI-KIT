import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = [
	['currencies', 200],
	['with-error', 160],
	['disabled', 140],
	['variants', 300],
	['sizes', 620],
] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseMoneyInput · ${theme}`, () => {
		for (const [story, height] of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-basemoneyinput--${story}`, { theme, height })
				await expectStoryScreenshot(page, `base-money-input-${story}-${theme}.png`)
			})
		}
	})
}
