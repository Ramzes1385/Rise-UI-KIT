import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'scales', 'dependencies', 'milestones', 'variants', 'loading', 'empty'] as const

const HEIGHTS: Partial<Record<(typeof STORIES)[number], number>> = { variants: 1100, scales: 560, dependencies: 560, milestones: 400 }

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseGantt · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-basegantt--${story}`, { theme, height: HEIGHTS[story] ?? 480 })
				await expectStoryScreenshot(page, `base-gantt-${story}-${theme}.png`)
			})
		}
	})
}
