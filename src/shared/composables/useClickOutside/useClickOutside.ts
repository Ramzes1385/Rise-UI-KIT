import { onBeforeUnmount, onMounted } from 'vue'

import type { UseClickOutsideOptions } from './useClickOutside.types'

/**
 * Composable для отслеживания клика вне заданных элементов.
 * Автоматически подписывается/отписывается на lifecycle-хуки.
 *
 * @example
 * ```ts
 * const wrapperRef = ref<HTMLElement | null>(null)
 * const dropdownRef = ref<HTMLElement | null>(null)
 *
 * useClickOutside({
 *   targets: [wrapperRef, dropdownRef],
 *   callback: () => emit('close'),
 *   isActive: () => props.isOpen,
 * })
 * ```
 */
function useClickOutside(options: UseClickOutsideOptions): void {
	const { targets, callback, isCapture = false, isActive } = options

	function handleClick(event: MouseEvent): void {
		if (isActive && !isActive()) return

		const target = event.target as Node
		const isInside = targets.some(ref => ref.value?.contains(target))
		if (isInside) return

		callback()
	}

	onMounted(() => {
		document.addEventListener('mousedown', handleClick, isCapture)
	})

	onBeforeUnmount(() => {
		document.removeEventListener('mousedown', handleClick, isCapture)
	})
}

export { useClickOutside }
