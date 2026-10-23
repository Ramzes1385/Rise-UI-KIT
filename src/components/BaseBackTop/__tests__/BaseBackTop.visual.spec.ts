import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'extended'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseBackTop · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `navigation-basebacktop--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-back-top-${story}-${theme}.png`)
			})
		}
	})
}
