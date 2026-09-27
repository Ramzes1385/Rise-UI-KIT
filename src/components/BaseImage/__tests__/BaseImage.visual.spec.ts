/**
 * Visual regression BaseImage: ключевые stories в светлой и тёмной теме.
 * Изображения — SVG data URI из фикстур stories: снимки не зависят от сети. Галерея снимается с открытым
 * просмотром (телепорт в body), поэтому для неё — вся страница.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['fits', 'border-radius', 'custom-color', 'with-error'] as const
const PAGE_STORIES = ['gallery'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseImage · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-baseimage--${story}`, { theme, height: 300 })
				await expectStoryScreenshot(page, `base-image-${story}-${theme}.png`)
			})
		}

		for (const story of PAGE_STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-baseimage--${story}`, { theme, height: 600 })
				await expectStoryScreenshot(page, `base-image-${story}-${theme}.png`, 'page')
			})
		}
	})
}
