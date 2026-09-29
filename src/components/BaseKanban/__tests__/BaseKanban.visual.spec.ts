import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = [
	['wip-limits', 420],
	['custom-card', 420],
	['disabled', 420],
	['variants', 1200],
	['sizes', 1400],
] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseKanban · ${theme}`, () => {
		for (const [story, height] of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-basekanban--${story}`, { theme, height })
				await expectStoryScreenshot(page, `base-kanban-${story}-${theme}.png`)
			})
		}
	})
}
