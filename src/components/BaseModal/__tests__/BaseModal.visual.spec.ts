/**
 * Visual regression BaseModal: ключевые stories в светлой и тёмной теме.
 * Окно телепортируется в body, поэтому снимается вся страница.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['variants', 'custom-color', 'opened', 'long-content', 'full-screen'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseModal · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `overlay-basemodal--${story}`, { theme, height: 600 })
				await expectStoryScreenshot(page, `base-modal-${story}-${theme}.png`, 'page')
			})
		}
	})
}
