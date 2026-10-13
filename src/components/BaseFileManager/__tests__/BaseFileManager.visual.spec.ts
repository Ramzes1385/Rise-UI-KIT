import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'grid-view', 'variants', 'sizes', 'disabled', 'loading', 'with-error', 'empty', 'long-content'] as const
const TALL_STORIES = new Set<string>(['variants', 'sizes'])

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseFileManager · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-basefilemanager--${story}`, { theme, height: TALL_STORIES.has(story) ? 1500 : 560 })
				await expectStoryScreenshot(page, `base-file-manager-${story}-${theme}.png`)
			})
		}
	})
}
