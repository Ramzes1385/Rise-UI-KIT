import { onBeforeUnmount, onMounted } from 'vue'
import type { UseClickOutsideOptions } from './useClickOutside.types'
import type { ComponentPublicInstance } from 'vue'

function isComponentInstance(value: unknown): value is ComponentPublicInstance {
	return typeof value === 'object' && value !== null && '$el' in value
}

function toElement(value: HTMLElement | ComponentPublicInstance | (HTMLElement | null)[] | null): HTMLElement | null {
	if (!value) return null
	if (Array.isArray(value)) return null
	if (isComponentInstance(value)) {
		const el = value.$el
		return el instanceof HTMLElement ? el : null
	}
	return value
}

function containsTarget(value: HTMLElement | ComponentPublicInstance | (HTMLElement | null)[] | null, target: Node): boolean {
	if (!value) return false
	if (Array.isArray(value)) {
		return value.some(item => item !== null && item.contains(target))
	}
	const el = toElement(value)
	return el !== null && el.contains(target)
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
			return containsTarget(ref.value, target)
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
