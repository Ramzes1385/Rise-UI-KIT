/** Утилиты: направление письма элемента и стрелки ← →, которые меняются местами в RTL */

/** Элемент пишется справа налево: решает вычисленный `direction`, поэтому работают `dir` на html и на любом предке */
function isRtl(element: Element | null | undefined): boolean {
	return element !== null && element !== undefined && getComputedStyle(element).direction === 'rtl'
}

/** Знак направления вдоль строки: 1 в LTR, −1 в RTL — для сдвигов и пересчёта положения указателя в значение */
function getDirectionSign(element: Element | null | undefined): 1 | -1 {
	return isRtl(element) ? -1 : 1
}

/** Стрелка с учётом направления: ArrowLeft и ArrowRight в RTL меняются местами, остальные клавиши — как есть */
function mirrorArrowKey(key: string, isRtlDirection: boolean): string {
	if (!isRtlDirection || (key !== 'ArrowLeft' && key !== 'ArrowRight')) return key
	return key === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft'
}

/**
 * Клавиша события для обработчика «вперёд / назад вдоль строки»: в RTL ← — вперёд, → — назад (как у нативных радиокнопок,
 * `<input type="range">` и в APG для вкладок, меню и деревьев). Направление берётся у `element`, иначе у цели события.
 * Обработчик читает `resolveArrowKey(event)` вместо `event.key` и сравнивает с `ArrowRight` как с «вперёд».
 *
 * @example
 * const key = resolveArrowKey(event) // в RTL нажатая ← даёт 'ArrowRight'
 */
function resolveArrowKey(event: Pick<KeyboardEvent, 'key' | 'target' | 'currentTarget'>, element?: Element | null): string {
	if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return event.key
	const source = element ?? (event.target instanceof Element ? event.target : event.currentTarget)
	return mirrorArrowKey(event.key, source instanceof Element && isRtl(source))
}

/**
 * Физическая сторона или позиция панели с учётом направления: `right` → `left`, `right-start` → `left-start` в RTL.
 * `top`, `bottom`, `start`, `end` не меняются — у них нет физического «лево / право».
 *
 * @example
 * mirrorSide('right-start', true) // 'left-start'
 */
function mirrorSide<T extends string>(position: T, isRtlDirection: boolean): T {
	if (!isRtlDirection) return position
	if (position.startsWith('right')) return position.replace('right', 'left') as T
	if (position.startsWith('left')) return position.replace('left', 'right') as T
	return position
}

export { getDirectionSign, isRtl, mirrorArrowKey, mirrorSide, resolveArrowKey }
