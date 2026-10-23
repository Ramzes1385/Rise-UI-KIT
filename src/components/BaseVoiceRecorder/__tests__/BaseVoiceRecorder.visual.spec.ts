import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['disabled', 'denied'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseVoiceRecorder · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `media-basevoicerecorder--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-voice-recorder-${story}-${theme}.png`)
			})
		}
	})
}
