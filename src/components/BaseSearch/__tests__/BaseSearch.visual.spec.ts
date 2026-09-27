/**
 * Visual regression BaseSearch: ключевые stories в светлой и тёмной теме.
 * Stories с открытой панелью результатов или окном поиска снимаются целой страницей: они телепортируются в body.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['variants', 'sizes', 'with-error'] as const
const OPEN_STORIES = ['with-images', 'loading', 'modal-mode'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseSearch · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-basesearch--${story}`, { theme })
				await expectStoryScreenshot(page, `base-search-${story}-${theme}.png`)
			})
		}

		for (const story of OPEN_STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-basesearch--${story}`, { theme })
				await expectStoryScreenshot(page, `base-search-${story}-${theme}.png`, 'page')
			})
		}
	})
}
