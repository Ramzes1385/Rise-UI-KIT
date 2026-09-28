/**
 * Visual regression BaseToolbar: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'variants', 'vertical', 'disabled'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseToolbar · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `navigation-basetoolbar--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-toolbar-${story}-${theme}.png`)
			})
		}
	})
}
