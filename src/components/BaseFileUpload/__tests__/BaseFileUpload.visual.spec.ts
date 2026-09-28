/** В stories со списком play дожидается статуса «Загружено» (прогресс имитируется, FU-2) — снимок конечный. */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'custom-color', 'with-error', 'disabled', 'multiple'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseFileUpload · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-basefileupload--${story}`, { theme, height: 500 })
				await expectStoryScreenshot(page, `base-file-upload-${story}-${theme}.png`)
			})
		}
	})
}
