import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['shapes', 'sizes', 'custom-color', 'card-placeholder'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseSkeleton · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-baseskeleton--${story}`, { theme, height: 300 })
				await expectStoryScreenshot(page, `base-skeleton-${story}-${theme}.png`)
			})
		}
	})
}
