import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'variants', 'sizes', 'with-error'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseAudioPlayer · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `media-baseaudioplayer--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-audio-player-${story}-${theme}.png`)
			})
		}
	})
}
