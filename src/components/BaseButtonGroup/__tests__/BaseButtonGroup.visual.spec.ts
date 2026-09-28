/**
 * Visual regression BaseButtonGroup: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'variants', 'vertical'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseButtonGroup · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-basebuttongroup--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-button-group-${story}-${theme}.png`)
			})
		}
	})
}
