/** Composable: паттерн popup (оверлей, Escape, блокировка скролла) */
import { onUnmounted, watch } from 'vue'
import type { UsePopupOptions } from './types/usePopup.types'
import { useEscapeKey } from '@composables/overlay/useEscapeKey'
import { useScrollLock } from '@composables/overlay/useScrollLock'

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
	const { isOpen, closeOnOverlay, closeOnEscape, onClose, lockScroll } = options
	const shouldLockScroll = () => lockScroll?.() ?? true
	const { lock, unlock } = useScrollLock()

	/**
	 * Закрыть popup. Блокировку скролла здесь не снимаем: родитель может не закрыть окно
	 * (isOpen останется true), и страница прокручивалась бы под открытым оверлеем.
	 * Разблокировка происходит в watch, когда isOpen действительно станет false.
	 */
	function close(): void {
		onClose()
	}

	function handleOverlayClick(): void {
		if (closeOnOverlay()) {
			close()
		}
	}

	useEscapeKey({
		isActive: () => isOpen() && closeOnEscape(),
		callback: close,
	})

	/**
	 * Блокировка скролла следует фактическому состоянию: открыт и нужна блокировка → lock, иначе → unlock.
	 * unlock идемпотентен, поэтому вызывается без проверки lockScroll: смена lockScroll
	 * при открытом окне (например, переход в isContained) не оставит body заблокированным.
	 */
	watch(
		() => Boolean(isOpen()) && shouldLockScroll(),
		shouldLock => {
			if (shouldLock) {
				lock()
			} else {
				unlock()
			}
		},
		{ immediate: true },
	)

	onUnmounted(unlock)

	return { handleOverlayClick, close }
}

export { usePopup }
