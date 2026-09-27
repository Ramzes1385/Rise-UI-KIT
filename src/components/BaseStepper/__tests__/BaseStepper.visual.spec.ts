/**
 * Visual regression BaseStepper: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['shapes', 'vertical', 'sizes', 'disabled', 'with-icons', 'long-content'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseStepper · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `navigation-basestepper--${story}`, { theme, height: 600 })
				await expectStoryScreenshot(page, `base-stepper-${story}-${theme}.png`)
			})
		}
	})
}
