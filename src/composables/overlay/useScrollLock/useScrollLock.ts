/** Composable: блокировка скролла body с компенсацией скроллбара */
import type { UseScrollLockReturn } from './types/useScrollLock.types'

/**
 * Состояние блокировки общее для всех экземпляров: модалка, slideover, тур и зум
 * могут быть открыты одновременно и закрываться в любом порядке. Поэтому исходные
 * стили body запоминает только первая блокировка, а восстанавливает — последняя
 * разблокировка; иначе закрытие не в порядке LIFO возвращало бы прокрутку под открытым оверлеем.
 */
let activeLocks = 0
let initialOverflow = ''
let initialPaddingEnd = ''

/**
 * Composable для блокировки скролла body.
 * Сохраняет и восстанавливает исходные overflow и padding-inline-end body.
 * Компенсирует ширину скроллбара через padding-inline-end (в RTL полоса слева), чтобы body не дёргался.
 * Идемпотентный: повторный lock/unlock одного экземпляра не меняет общий счётчик.
 *
 * @example
 * ```ts
 * const { lock, unlock } = useScrollLock()
 *
 * watch(() => props.isOpen, (value) => {
 *   value ? lock() : unlock()
 * })
 * ```
 */
function useScrollLock(): UseScrollLockReturn {
	let isLocked = false

	function lock(): void {
		if (isLocked) return
		isLocked = true
		activeLocks++
		if (activeLocks > 1) return

		initialOverflow = document.body.style.overflow
		initialPaddingEnd = document.body.style.paddingInlineEnd
		const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
		document.body.style.overflow = 'hidden'
		if (scrollbarWidth > 0) {
			document.body.style.paddingInlineEnd = `${scrollbarWidth}px`
		}
	}

	function unlock(): void {
		if (!isLocked) return
		isLocked = false
		activeLocks--
		if (activeLocks > 0) return

		document.body.style.overflow = initialOverflow
		document.body.style.paddingInlineEnd = initialPaddingEnd
		initialOverflow = ''
		initialPaddingEnd = ''
	}

	return { lock, unlock }
}

export { useScrollLock }
