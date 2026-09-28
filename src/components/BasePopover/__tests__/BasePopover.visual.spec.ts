/** Поповер телепортируется в body, поэтому снимается вся страница. */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'positions', 'custom-color', 'long-content'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BasePopover · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `overlay-basepopover--${story}`, { theme, height: 500 })
				await expectStoryScreenshot(page, `base-popover-${story}-${theme}.png`, 'page')
			})
		}
	})
}
