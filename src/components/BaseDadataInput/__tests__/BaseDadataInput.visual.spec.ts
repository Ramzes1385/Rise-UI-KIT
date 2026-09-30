import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = [
	['with-error', 160],
	['disabled', 140],
	['variants', 300],
	['sizes', 620],
] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseDadataInput · ${theme}`, () => {
		for (const [story, height] of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-basedadatainput--${story}`, { theme, height })
				await expectStoryScreenshot(page, `base-dadata-input-${story}-${theme}.png`)
			})
		}
	})
}
