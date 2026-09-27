/**
 * Visual regression BaseAccordion: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['default', 'variants', 'disabled', 'with-icons', 'long-content'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseAccordion · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-baseaccordion--${story}`, { theme, height: 600 })
				await expectStoryScreenshot(page, `base-accordion-${story}-${theme}.png`)
			})
		}
	})
}
