/**
 * Visual regression BaseRange: ключевые stories в светлой и тёмной теме.
 * Подсказка значения телепортируется в body, поэтому story с ней снимается целой страницей.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'range', 'with-marks', 'vertical'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseRange · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-baserange--${story}`, { theme })
				await expectStoryScreenshot(page, `base-range-${story}-${theme}.png`)
			})
		}

		test('with-tooltip', async ({ page }) => {
			await openStory(page, 'form-baserange--with-tooltip', { theme })
			await expectStoryScreenshot(page, `base-range-with-tooltip-${theme}.png`, 'page')
		})
	})
}
