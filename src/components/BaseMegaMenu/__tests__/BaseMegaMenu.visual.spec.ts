/** Dropdown снимается после play: открыта панель «Продукты» и каскадный уровень «Аналитика» */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'long-content', 'dropdown'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseMegaMenu · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `navigation-basemegamenu--${story}`, { theme, width: 1000, height: 600 })
				await expectStoryScreenshot(page, `base-mega-menu-${story}-${theme}.png`)
			})
		}
	})
}
