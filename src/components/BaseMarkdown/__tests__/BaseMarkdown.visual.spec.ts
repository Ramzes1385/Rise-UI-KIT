import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'variants', 'sizes', 'safety'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseMarkdown · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-basemarkdown--${story}`, { theme, height: 700 })
				await expectStoryScreenshot(page, `base-markdown-${story}-${theme}.png`)
			})
		}
	})
}
