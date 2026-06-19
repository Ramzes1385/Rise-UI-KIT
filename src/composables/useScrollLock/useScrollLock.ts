/** Composable: блокировка скролла body с компенсацией скроллбара */
import type { UseScrollLockReturn } from './useScrollLock.types'

/**
 * Composable для блокировки скролла body.
 * Сохраняет и восстанавливает предыдущее значение overflow.
 * Компенсирует ширину скроллбара через padding-right, чтобы body не дёргался.
 * Идемпотентный: повторный lock/unlock безопасен.
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
	let previousOverflow = ''
	let previousPaddingRight = ''
	let isLocked = false

	/** Заблокировать скролл body */
	function lock(): void {
		if (isLocked) return
		previousOverflow = document.body.style.overflow
		previousPaddingRight = document.body.style.paddingRight
		const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
		document.body.style.overflow = 'hidden'
		if (scrollbarWidth > 0) {
			document.body.style.paddingRight = `${scrollbarWidth}px`
		}
		isLocked = true
	}

	/** Разблокировать скролл body */
	function unlock(): void {
		if (!isLocked) return
		document.body.style.overflow = previousOverflow
		document.body.style.paddingRight = previousPaddingRight
		previousOverflow = ''
		previousPaddingRight = ''
		isLocked = false
	}

	return { lock, unlock }
}

export { useScrollLock }
