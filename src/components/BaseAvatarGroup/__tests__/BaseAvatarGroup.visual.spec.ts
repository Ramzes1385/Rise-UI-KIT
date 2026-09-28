import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'square'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseAvatarGroup · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-baseavatargroup--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-avatar-group-${story}-${theme}.png`)
			})
		}
	})
}
