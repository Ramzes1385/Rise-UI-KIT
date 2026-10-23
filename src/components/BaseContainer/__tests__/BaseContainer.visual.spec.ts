import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'sizes'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseContainer · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `layout-basecontainer--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-container-${story}-${theme}.png`)
			})
		}
	})
}
