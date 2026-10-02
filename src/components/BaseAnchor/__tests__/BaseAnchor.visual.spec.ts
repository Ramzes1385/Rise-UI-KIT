import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseAnchor · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `navigation-baseanchor--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-anchor-${story}-${theme}.png`)
			})
		}
	})
}
