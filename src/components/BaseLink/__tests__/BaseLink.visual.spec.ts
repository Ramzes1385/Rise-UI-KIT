/**
 * Visual regression BaseLink: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['variants', 'sizes', 'external'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseLink · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `navigation-baselink--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-link-${story}-${theme}.png`)
			})
		}
	})
}
