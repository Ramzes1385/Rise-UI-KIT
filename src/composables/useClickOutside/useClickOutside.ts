/** Composable: отслеживание клика вне заданных элементов */
import { useLayer } from '@composables/useLayerStack'
import type { ComponentPublicInstance } from 'vue'
import type { UseClickOutsideOptions } from './useClickOutside.types'

function isComponentInstance(value: unknown): value is ComponentPublicInstance {
	return typeof value === 'object' && value !== null && '$el' in value
}

function toElement(value: HTMLElement | ComponentPublicInstance | null): HTMLElement | null {
	if (!value) return null
	if (isComponentInstance(value)) {
		const el = value.$el
		return el instanceof HTMLElement ? el : null
	}
	return value
}

/** Элементы цели: один элемент, корень компонента или массив элементов */
function toElements(value: HTMLElement | ComponentPublicInstance | (HTMLElement | null)[] | null): (HTMLElement | null)[] {
	if (Array.isArray(value)) return value
	return [toElement(value)]
}

/**
 * Composable для отслеживания нажатия мыши вне заданных элементов. Компонент становится слоем (`useLayer`):
 * нажатие внутри слоёв, открытых позже (вложенный список, меню в поповере), не считается нажатием вне.
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
	const { targets, callback, isCapture = false, isActive = () => true } = options

	useLayer({
		isActive,
		elements: () => targets.flatMap(target => toElements(target.value)),
		onPointerDownOutside: () => callback(),
		isCapture,
	})
}

export { useClickOutside }
