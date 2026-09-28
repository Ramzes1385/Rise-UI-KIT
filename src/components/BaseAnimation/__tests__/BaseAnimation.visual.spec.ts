import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'names', 'list'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseAnimation · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-baseanimation--${story}`, { theme, height: 400 })
				await expectStoryScreenshot(page, `base-animation-${story}-${theme}.png`)
			})
		}
	})
}
