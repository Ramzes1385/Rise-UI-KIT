import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = [
	['default', 120],
	['variants', 900],
	['sizes', 1100],
] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseReasoning · ${theme}`, () => {
		for (const [story, height] of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `chat-basereasoning--${story}`, { theme, height })
				await expectStoryScreenshot(page, `base-reasoning-${story}-${theme}.png`)
			})
		}
	})
}
