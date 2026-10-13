import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['placement', 'variants', 'sizes', 'custom-color', 'long-content', 'theming'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseHoverCard · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `overlay-basehovercard--${story}`, { theme, height: 500 })
				await expectStoryScreenshot(page, `base-hover-card-${story}-${theme}.png`, 'page')
			})
		}
	})
}
