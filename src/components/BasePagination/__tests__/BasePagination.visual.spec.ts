/**
 * Visual regression BasePagination: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['variants', 'sizes', 'many-pages', 'empty'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BasePagination · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `navigation-basepagination--${story}`, { theme })
				await expectStoryScreenshot(page, `base-pagination-${story}-${theme}.png`)
			})
		}
	})
}
