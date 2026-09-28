/**
 * Visual regression BaseDropdown: ключевые stories в светлой и тёмной теме.
 * Панели телепортируются в body, поэтому снимается вся страница.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'custom-color', 'empty', 'long-content', 'positions'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseDropdown · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `overlay-basedropdown--${story}`, { theme })
				await expectStoryScreenshot(page, `base-dropdown-${story}-${theme}.png`, 'page')
			})
		}
	})
}
