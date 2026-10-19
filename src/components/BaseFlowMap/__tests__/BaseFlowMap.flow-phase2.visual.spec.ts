import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = [
	'epc',
	'sequence',
	'c-4',
	'event-storming',
	'groups-collapse',
	'semantic-zoom',
	'review',
	'review-filters',
	'comments',
	'compare',
	'review-compact',
] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseFlowMap · фаза 2 · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-baseflowmap--${story}`, { theme, width: 1200, height: 800 })
				await expectStoryScreenshot(page, `base-flow-map-${story}-${theme}.png`)
			})
		}
	})
}
