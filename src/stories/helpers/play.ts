/** Помощники для play-функций: каждая проверка должна утверждать наблюдаемое поведение (роль, доступное имя, атрибут, фокус, событие), а не то, что «элемент есть в DOM». */

import { isRtl } from '@utils/dom/directionUtils'
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

/** Цвет в том виде, как его вернёт `getComputedStyle` (`var(--rise-primary)` → `rgb(…)`): для сверки цветов в play */
export function resolveColor(value: string): string {
	const probe = document.createElement('span')
	probe.style.color = value
	document.body.append(probe)
	const resolved = getComputedStyle(probe).color
	probe.remove()
	return resolved
}

/** Клавиша ← или → для `userEvent.keyboard` с учётом направления страницы: в RTL они меняются местами, как в самих компонентах */
export function inlineKey(key: '{ArrowLeft}' | '{ArrowRight}'): string {
	if (!isRtl(document.documentElement)) return key
	return key === '{ArrowLeft}' ? '{ArrowRight}' : '{ArrowLeft}'
}

/** Расстояние от начала строки до начального края прямоугольника: `left` в LTR, `-right` в RTL (больше — дальше от начала строки) */
export function inlineStart(rect: DOMRect): number {
	return isRtl(document.documentElement) ? -rect.right : rect.left
}

/** То же для конечного края: `right` в LTR, `-left` в RTL */
export function inlineEnd(rect: DOMRect): number {
	return isRtl(document.documentElement) ? -rect.left : rect.right
}

/** Смещение указателя вдоль строки: положительное значение — к концу строки (вправо в LTR, влево в RTL) */
export function inlineDelta(offset: number): number {
	return isRtl(document.documentElement) ? -offset : offset
}
