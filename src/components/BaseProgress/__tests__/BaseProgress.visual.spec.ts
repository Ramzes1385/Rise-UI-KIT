import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['sizes', 'circle', 'with-label', 'indeterminate', 'animations'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseProgress · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-baseprogress--${story}`, { theme, height: 300 })
				await expectStoryScreenshot(page, `base-progress-${story}-${theme}.png`)
			})
		}
	})
}
