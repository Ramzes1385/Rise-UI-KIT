import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = [
	['custom-set', 200],
	['disabled', 260],
	['variants', 560],
] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseEmojiPicker · ${theme}`, () => {
		for (const [story, height] of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `chat-baseemojipicker--${story}`, { theme, height })
				await expectStoryScreenshot(page, `base-emoji-picker-${story}-${theme}.png`)
			})
		}
	})
}
