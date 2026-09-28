/**
 * Visual regression BaseConfirm: открытое окно, необратимое действие и длинный текст в светлой и тёмной теме.
 * Окно телепортируется в body, поэтому снимается вся страница.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['opened', 'danger', 'long-content'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseConfirm · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `overlay-baseconfirm--${story}`, { theme, height: 600 })
				await expectStoryScreenshot(page, `base-confirm-${story}-${theme}.png`, 'page')
			})
		}
	})
}
