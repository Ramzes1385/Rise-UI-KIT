import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'top', 'bottom', 'in-container', 'with-shadow', 'theming'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseAffix · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `layout-baseaffix--${story}`, { theme, height: 400 })
				await expectStoryScreenshot(page, `base-affix-${story}-${theme}.png`)
			})
		}
	})
}
