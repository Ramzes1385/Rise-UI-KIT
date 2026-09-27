/**
 * Visual regression BaseChip: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['variants', 'sizes', 'placements', 'custom-color', 'overflow'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseChip · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-basechip--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-chip-${story}-${theme}.png`)
			})
		}
	})
}
