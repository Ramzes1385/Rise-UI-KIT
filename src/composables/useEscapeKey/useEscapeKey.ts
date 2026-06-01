import { onBeforeUnmount, onMounted } from 'vue'

import type { UseEscapeKeyOptions } from './useEscapeKey.types'

/**
 * Composable для закрытия по клавише Escape.
 * Автоматически подписывается/отписывается на lifecycle-хуки.
 *
 * @example
 * ```ts
 * useEscapeKey({
 *   isActive: () => props.isOpen,
 *   callback: () => emit('close'),
 * })
 * ```
 */
function useEscapeKey(options: UseEscapeKeyOptions): void {
	const { isActive, callback } = options

	function handleKeydown(event: KeyboardEvent): void {
		if (!isActive()) return
		if (event.key === 'Escape') {
			callback()
		}
	}

	onMounted(() => {
		document.addEventListener('keydown', handleKeydown)
	})

	onBeforeUnmount(() => {
		document.removeEventListener('keydown', handleKeydown)
	})
}

export { useEscapeKey }
