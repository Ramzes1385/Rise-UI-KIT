/**
 * Visual regression BaseSelect: ключевые stories в светлой и тёмной теме.
 * Stories с открытым списком снимаются целой страницей: панель телепортируется в body.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['variants', 'sizes', 'with-error', 'custom-color'] as const
const OPEN_STORIES = ['with-icons', 'multiple'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseSelect · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-baseselect--${story}`, { theme })
				await expectStoryScreenshot(page, `base-select-${story}-${theme}.png`)
			})
		}

		for (const story of OPEN_STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-baseselect--${story}`, { theme })
				await expectStoryScreenshot(page, `base-select-${story}-${theme}.png`, 'page')
			})
		}
	})
}
