import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['fallback-2-d', 'with-error'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseRoadmap3D · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-baseroadmap3d--${story}`, { theme, height: 760 })
				await expectStoryScreenshot(page, `base-roadmap-3d-${story}-${theme}.png`)
			})
		}
	})
}
