import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'fallback', 'online-status', 'group'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseAvatar · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-baseavatar--${story}`, { theme, height: 300 })
				await expectStoryScreenshot(page, `base-avatar-${story}-${theme}.png`)
			})
		}
	})
}
