import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = [
	'default',
	'sizes',
	'theming',
	'directions',
	'routing',
	'lanes',
	'compact',
	'rtl',
	'disabled',
	'loading',
	'with-error',
	'empty',
	'long-content',
	'live-status',
	'slots',
	'custom-notation',
	'list-view',
] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseFlowMap · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-baseflowmap--${story}`, { theme, width: 1200, height: 800 })
				await expectStoryScreenshot(page, `base-flow-map-${story}-${theme}.png`)
			})
		}
	})
}
