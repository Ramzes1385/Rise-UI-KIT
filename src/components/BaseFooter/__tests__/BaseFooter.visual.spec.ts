/**
 * Visual regression BaseFooter: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['default', 'variants'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseFooter · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `layout-basefooter--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-footer-${story}-${theme}.png`)
			})
		}
	})
}
