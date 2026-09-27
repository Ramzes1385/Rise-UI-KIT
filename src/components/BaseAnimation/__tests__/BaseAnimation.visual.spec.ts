/**
 * Visual regression BaseAnimation: конечное состояние примеров в светлой и тёмной теме.
 * Play-функции этих stories переключают видимость (скрыть → показать, добавить → удалить);
 * openStory ждёт завершения play, поэтому в кадр попадает конечное состояние.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['default', 'names', 'list'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseAnimation · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-baseanimation--${story}`, { theme, height: 400 })
				await expectStoryScreenshot(page, `base-animation-${story}-${theme}.png`)
			})
		}
	})
}
