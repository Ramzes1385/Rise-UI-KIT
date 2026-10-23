import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = [
	['statuses', 260],
	['with-error', 320],
	['custom-result', 520],
	['variants', 1100],
	['sizes', 360],
] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseToolCall · ${theme}`, () => {
		for (const [story, height] of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `chat-basetoolcall--${story}`, { theme, height })
				await expectStoryScreenshot(page, `base-tool-call-${story}-${theme}.png`)
			})
		}
	})
}
