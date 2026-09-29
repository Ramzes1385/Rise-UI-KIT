import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = [
	['default', 480],
	['with-error', 240],
	['composition', 560],
	['variants', 560],
	['sizes', 560],
] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseAiMessage · ${theme}`, () => {
		for (const [story, height] of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `chat-baseaimessage--${story}`, { theme, height })
				await expectStoryScreenshot(page, `base-ai-message-${story}-${theme}.png`)
			})
		}
	})
}
