/** Помощники для play-функций: каждая проверка должна утверждать наблюдаемое поведение (роль, доступное имя, атрибут, фокус, событие), а не то, что «элемент есть в DOM». */

import type { UserEvent } from './types/helpers.types'
import { expect, userEvent as defaultUserEvent } from 'storybook/test'

/**
 * Переводит фокус клавишей Tab на element (не больше maxSteps нажатий) и проверяет, что он получил фокус.
 * Нужен для проверок «элемент достижим с клавиатуры» без привязки к числу элементов перед ним.
 */
export async function tabTo(element: Element, userEvent: UserEvent = defaultUserEvent, maxSteps = 20): Promise<void> {
	for (let step = 0; step < maxSteps && document.activeElement !== element; step++) {
		await userEvent.tab()
	}
	await expect(element).toHaveFocus()
}

/** Ожидание по умолчанию для асинхронных проверок (оверлеи с анимацией, ленивые изображения), мс. */
export const STORY_WAIT_TIMEOUT = 3000
