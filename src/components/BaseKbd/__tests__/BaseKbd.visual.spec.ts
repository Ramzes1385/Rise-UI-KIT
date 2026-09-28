/**
 * Visual regression BaseKbd: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'special-keys'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseKbd · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-basekbd--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-kbd-${story}-${theme}.png`)
			})
		}
	})
}
