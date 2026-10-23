import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'horizontal'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseTimeline · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-basetimeline--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-timeline-${story}-${theme}.png`)
			})
		}
	})
}
