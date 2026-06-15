import { onBeforeUnmount, onMounted } from 'vue'
import type { ComponentPublicInstance } from 'vue'

import type { UseClickOutsideOptions } from './useClickOutside.types'

function isComponentInstance(value: unknown): value is ComponentPublicInstance {
	return typeof value === 'object' && value !== null && '$el' in value
}

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
		const isInside = targets.some(ref => {
			const val = ref.value
			if (!val) return false
			const elements = Array.isArray(val) ? val : [val]
			return elements.some(item => {
				if (!item) return false
				const el = isComponentInstance(item) ? item.$el : item
				return el && typeof el.contains === 'function' && el.contains(target)
			})
		})
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
