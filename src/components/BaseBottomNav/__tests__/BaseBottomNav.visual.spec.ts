import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'badges'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseBottomNav · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `navigation-basebottomnav--${story}`, { theme, height: 400 })
				await expectStoryScreenshot(page, `base-bottom-nav-${story}-${theme}.png`)
			})
		}
	})
}
