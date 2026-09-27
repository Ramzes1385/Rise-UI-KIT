/**
 * Visual regression BasePin: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['variants', 'sizes', 'with-error', 'disabled', 'password'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BasePin · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-basepin--${story}`, { theme, height: 360 })
				await expectStoryScreenshot(page, `base-pin-${story}-${theme}.png`)
			})
		}
	})
}
