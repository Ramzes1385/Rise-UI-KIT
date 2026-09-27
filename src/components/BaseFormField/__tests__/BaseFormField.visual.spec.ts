/**
 * Visual regression BaseFormField: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['variants', 'sizes', 'with-error', 'long-content'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseFormField · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-baseformfield--${story}`, { theme, height: 480 })
				await expectStoryScreenshot(page, `base-form-field-${story}-${theme}.png`)
			})
		}
	})
}
