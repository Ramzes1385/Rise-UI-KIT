/** Composable: блокировка скролла body с компенсацией скроллбара */
import type { UseScrollLockReturn } from './useScrollLock.types'

/**
 * Состояние блокировки общее для всех экземпляров: модалка, slideover, тур и зум
 * могут быть открыты одновременно и закрываться в любом порядке. Поэтому исходные
 * стили body запоминает только первая блокировка, а восстанавливает — последняя
 * разблокировка; иначе закрытие не в порядке LIFO возвращало бы прокрутку под открытым оверлеем.
 */
let activeLocks = 0
let initialOverflow = ''
let initialPaddingRight = ''

/**
 * Composable для блокировки скролла body.
 * Сохраняет и восстанавливает исходные overflow и padding-right body.
 * Компенсирует ширину скроллбара через padding-right, чтобы body не дёргался.
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

	/** Заблокировать скролл body */
	function lock(): void {
		if (isLocked) return
		isLocked = true
		activeLocks++
		if (activeLocks > 1) return

		initialOverflow = document.body.style.overflow
		initialPaddingRight = document.body.style.paddingRight
		const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
		document.body.style.overflow = 'hidden'
		if (scrollbarWidth > 0) {
			document.body.style.paddingRight = `${scrollbarWidth}px`
		}
	}

	/** Разблокировать скролл body */
	function unlock(): void {
		if (!isLocked) return
		isLocked = false
		activeLocks--
		if (activeLocks > 0) return

		document.body.style.overflow = initialOverflow
		document.body.style.paddingRight = initialPaddingRight
		initialOverflow = ''
		initialPaddingRight = ''
	}

	return { lock, unlock }
}

export { useScrollLock }
