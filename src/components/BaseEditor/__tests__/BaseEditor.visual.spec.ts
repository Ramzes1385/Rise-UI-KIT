/** Витрины с несколькими редакторами высокие, поэтому окно выше стандартного. */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'custom-color', 'readonly', 'formatted-content', 'toolbar-modes'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseEditor · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `editor-baseeditor--${story}`, { theme, height: 900 })
				await expectStoryScreenshot(page, `base-editor-${story}-${theme}.png`)
			})
		}
	})
}
