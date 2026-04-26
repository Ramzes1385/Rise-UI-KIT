import { onUnmounted, watch } from 'vue'

import { useEscapeKey } from '@/shared/composables/useEscapeKey'
import { useScrollLock } from '@/shared/composables/useScrollLock'

import type { UsePopupOptions } from './usePopup.types'

/**
 * Composable для паттерна popup: оверлей, Escape, блокировка скролла.
 * Работает с внешним состоянием isOpen (из props).
 *
 * @example
 * ```ts
 * const { handleOverlayClick, close } = usePopup({
 *   isOpen: () => props.isOpen,
 *   closeOnOverlay: () => props.closeOnOverlay,
 *   closeOnEscape: () => props.closeOnEscape,
 *   onClose: () => {
 *     emit('update:isOpen', false)
 *     emit('close')
 *   },
 * })
 * ```
 */
function usePopup(options: UsePopupOptions): {
	handleOverlayClick: () => void
	close: () => void
} {
	const { isOpen, closeOnOverlay, closeOnEscape, onClose } = options
	const { lock, unlock } = useScrollLock()

	/** Закрыть popup */
	function close(): void {
		unlock()
		onClose()
	}

	/** Клик по оверлею */
	function handleOverlayClick(): void {
		if (closeOnOverlay()) {
			close()
		}
	}

	/** Закрытие по Escape */
	useEscapeKey({
		isActive: () => isOpen() && closeOnEscape(),
		callback: close,
	})

	/** Блокировка скролла при открытии/закрытии */
	watch(
		isOpen,
		value => {
			if (value) {
				lock()
			} else {
				unlock()
			}
		},
		{ immediate: true },
	)

	onUnmounted(() => {
		unlock()
	})

	return { handleOverlayClick, close }
}

export { usePopup }
