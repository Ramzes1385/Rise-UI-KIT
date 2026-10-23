import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'layouts', 'responsive'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseDescriptions · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-basedescriptions--${story}`, { theme, height: 720 })
				await expectStoryScreenshot(page, `base-descriptions-${story}-${theme}.png`)
			})
		}
	})
}
