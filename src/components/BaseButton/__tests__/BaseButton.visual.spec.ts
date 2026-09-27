/**
 * Visual regression BaseButton: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['variants', 'sizes', 'with-icons', 'disabled', 'loading'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseButton · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-basebutton--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-button-${story}-${theme}.png`)
			})
		}
	})
}
