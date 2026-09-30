import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = [
	['open', 640],
	['empty', 360],
] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseCommandPalette · ${theme}`, () => {
		for (const [story, height] of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `overlay-basecommandpalette--${story}`, { theme, height })
				await expectStoryScreenshot(page, `base-command-palette-${story}-${theme}.png`)
			})
		}
	})
}
