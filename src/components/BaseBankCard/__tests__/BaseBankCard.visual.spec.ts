import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'expired', 'without-brand'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseBankCard · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-basebankcard--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-bank-card-${story}-${theme}.png`)
			})
		}
	})
}
