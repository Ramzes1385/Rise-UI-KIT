/**
 * Visual regression BaseSwitch: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'with-error', 'disabled', 'reverse', 'long-content'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseSwitch · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-baseswitch--${story}`, { theme, height: 360 })
				await expectStoryScreenshot(page, `base-switch-${story}-${theme}.png`)
			})
		}
	})
}
