import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'thumbnails', 'arrow-positions', 'slides-per-view', 'vertical', 'coverflow', 'cards'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseSlider · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-baseslider--${story}`, { theme, height: 600 })
				await expectStoryScreenshot(page, `base-slider-${story}-${theme}.png`)
			})
		}
	})
}
