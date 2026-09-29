import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'selection', 'variants', 'sizes'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseWaveform · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `media-basewaveform--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-waveform-${story}-${theme}.png`)
			})
		}
	})
}
