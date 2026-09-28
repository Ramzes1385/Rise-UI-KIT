import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['sizes', 'disabled', 'trigger-slot'] as const
const OPEN_STORIES = ['presets', 'minimal'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseColorPicker · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-basecolorpicker--${story}`, { theme })
				await expectStoryScreenshot(page, `base-color-picker-${story}-${theme}.png`)
			})
		}

		for (const story of OPEN_STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-basecolorpicker--${story}`, { theme })
				await expectStoryScreenshot(page, `base-color-picker-${story}-${theme}.png`, 'page')
			})
		}
	})
}
