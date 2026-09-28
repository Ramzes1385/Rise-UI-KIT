/**
 * Visual regression BaseChat: ключевые stories в светлой и тёмной теме.
 * Варианты оформления, групповой чат (play открывает профиль отправителя), вложения (коллаж, файлы, отправленный
 * файл), пустая лента, панель «Информация» (play оставляет её открытой). openStory ждёт окончания play.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'group', 'attachments', 'empty', 'info-panel'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseChat · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `chat-basechat--${story}`, { theme, width: 1100, height: 640 })
				await expectStoryScreenshot(page, `base-chat-${story}-${theme}.png`)
			})
		}
	})
}
