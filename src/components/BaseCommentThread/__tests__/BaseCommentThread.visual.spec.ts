import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'readonly', 'deep-nesting'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseCommentThread · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `chat-basecommentthread--${story}`, { theme, height: 720 })
				await expectStoryScreenshot(page, `base-comment-thread-${story}-${theme}.png`)
			})
		}
	})
}
