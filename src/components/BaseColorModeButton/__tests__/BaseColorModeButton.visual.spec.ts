/**
 * Visual regression BaseColorModeButton: варианты и размеры в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['variants', 'sizes'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseColorModeButton · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-basecolormodebutton--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-color-mode-button-${story}-${theme}.png`)
			})
		}
	})
}
