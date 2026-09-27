/**
 * Visual regression BaseTooltip: ключевые stories в светлой и тёмной теме.
 * Подсказки телепортируются в body, поэтому снимается вся страница.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['variants', 'positions', 'sizes', 'custom-color', 'long-content'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseTooltip · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `overlay-basetooltip--${story}`, { theme, height: 240 })
				await expectStoryScreenshot(page, `base-tooltip-${story}-${theme}.png`, 'page')
			})
		}
	})
}
