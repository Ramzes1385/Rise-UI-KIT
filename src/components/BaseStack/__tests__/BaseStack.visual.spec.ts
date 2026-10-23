import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['directions', 'gaps', 'align', 'justify', 'wrap', 'sizes'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseStack · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `layout-basestack--${story}`, { theme, height: 500 })
				await expectStoryScreenshot(page, `base-stack-${story}-${theme}.png`)
			})
		}
	})
}
