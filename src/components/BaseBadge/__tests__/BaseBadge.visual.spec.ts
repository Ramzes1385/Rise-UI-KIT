/**
 * Visual regression BaseBadge: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['variants', 'sizes', 'with-icon', 'statuses', 'long-content'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseBadge · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-basebadge--${story}`, { theme, height: 160 })
				await expectStoryScreenshot(page, `base-badge-${story}-${theme}.png`)
			})
		}
	})
}
