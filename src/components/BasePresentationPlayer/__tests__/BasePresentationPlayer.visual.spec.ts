import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'linear', 'custom-slide', 'captions'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BasePresentationPlayer · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `media-basepresentationplayer--${story}`, { theme, height: 480 })
				await expectStoryScreenshot(page, `base-presentation-player-${story}-${theme}.png`)
			})
		}
	})
}
