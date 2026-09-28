/**
 * Visual regression BaseBreadcrumbs: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'separators', 'with-icons', 'long-content'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseBreadcrumbs · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `navigation-basebreadcrumbs--${story}`, { theme })
				await expectStoryScreenshot(page, `base-breadcrumbs-${story}-${theme}.png`)
			})
		}
	})
}
