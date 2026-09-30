import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BasePieChart · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-basepiechart--${story}`, { theme, height: 260 })
				await expectStoryScreenshot(page, `base-pie-chart-${story}-${theme}.png`)
			})
		}
	})
}
