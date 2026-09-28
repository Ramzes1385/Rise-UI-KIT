import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['with-label', 'vertical', 'dashed', 'thickness', 'with-slot'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseSeparator · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-baseseparator--${story}`, { theme, height: 300 })
				await expectStoryScreenshot(page, `base-separator-${story}-${theme}.png`)
			})
		}
	})
}
