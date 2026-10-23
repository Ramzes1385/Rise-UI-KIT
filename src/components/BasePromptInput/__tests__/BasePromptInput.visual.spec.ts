import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = [
	['with-toolbar', 260],
	['generating', 160],
	['with-error', 180],
	['disabled', 160],
	['variants', 620],
	['sizes', 720],
] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BasePromptInput · ${theme}`, () => {
		for (const [story, height] of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `chat-basepromptinput--${story}`, { theme, height })
				await expectStoryScreenshot(page, `base-prompt-input-${story}-${theme}.png`)
			})
		}
	})
}
