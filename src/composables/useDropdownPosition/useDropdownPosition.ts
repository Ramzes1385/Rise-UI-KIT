import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { UseDropdownPositionOptions } from './useDropdownPosition.types'

/**
 * Composable для позиционирования выпадающей панели.
 * Вынесено из BaseDropdown — ~100 строк расчёта координат.
 *
 * @example
 * ```ts
 * const wrapperRef = ref<HTMLElement | null>(null)
 * const dropdownRef = ref<HTMLElement | null>(null)
 *
 * const { panelStyle, updatePosition } = useDropdownPosition({
 *   wrapperRef,
 *   dropdownRef,
 *   position: () => props.position,
 *   gap: () => props.gap,
 *   matchWidth: () => props.matchWidth,
 *   maxHeight: () => props.maxHeight,
 *   isOpen: () => props.isOpen,
 * })
 * ```
 */
function useDropdownPosition(options: UseDropdownPositionOptions) {
	const { wrapperRef, position, gap, matchWidth, maxHeight, isOpen } = options

	const coords = ref({ top: 0, left: 0 })
	const triggerWidth = ref(0)

	/** Получить rect триггера (первый дочерний элемент) */
	function getTriggerRect(): DOMRect | null {
		if (!wrapperRef.value) return null
		const trigger = wrapperRef.value.firstElementChild
		if (trigger) return trigger.getBoundingClientRect()
		return wrapperRef.value.getBoundingClientRect()
	}

	/** Вычислить позицию панели */
	function updatePosition(): void {
		if (!isOpen()) return

		const rect = getTriggerRect()
		if (!rect) return

		const gapValue = gap()
		triggerWidth.value = rect.width

		switch (position()) {
			case 'bottom-start':
				coords.value = { top: rect.bottom + gapValue, left: rect.left }
				break
			case 'bottom-end':
				coords.value = { top: rect.bottom + gapValue, left: rect.right }
				break
			case 'bottom':
				coords.value = { top: rect.bottom + gapValue, left: rect.left + rect.width / 2 }
				break
			case 'top-start':
				coords.value = { top: rect.top - gapValue, left: rect.left }
				break
			case 'top-end':
				coords.value = { top: rect.top - gapValue, left: rect.right }
				break
			case 'top':
				coords.value = { top: rect.top - gapValue, left: rect.left + rect.width / 2 }
				break
			case 'left-start':
				coords.value = { top: rect.top, left: rect.left - gapValue }
				break
			case 'left-end':
				coords.value = { top: rect.bottom, left: rect.left - gapValue }
				break
			case 'left':
				coords.value = { top: rect.top + rect.height / 2, left: rect.left - gapValue }
				break
			case 'right-start':
				coords.value = { top: rect.top, left: rect.right + gapValue }
				break
			case 'right-end':
				coords.value = { top: rect.bottom, left: rect.right + gapValue }
				break
			case 'right':
				coords.value = { top: rect.top + rect.height / 2, left: rect.right + gapValue }
				break
		}
	}

	/** Стили панели */
	const panelStyle = computed((): Record<string, string> => {
		const style: Record<string, string> = {
			maxHeight: maxHeight(),
		}

		if (matchWidth()) {
			style.width = `${triggerWidth.value}px`
		}

		switch (position()) {
			case 'bottom-start':
				style.top = `${coords.value.top}px`
				style.left = `${coords.value.left}px`
				break
			case 'bottom-end':
				style.top = `${coords.value.top}px`
				style.right = `${window.innerWidth - coords.value.left}px`
				break
			case 'bottom':
				style.top = `${coords.value.top}px`
				style.left = `${coords.value.left}px`
				style.translate = '-50% 0'
				break
			case 'top-start':
				style.bottom = `${window.innerHeight - coords.value.top}px`
				style.left = `${coords.value.left}px`
				break
			case 'top-end':
				style.bottom = `${window.innerHeight - coords.value.top}px`
				style.right = `${window.innerWidth - coords.value.left}px`
				break
			case 'top':
				style.bottom = `${window.innerHeight - coords.value.top}px`
				style.left = `${coords.value.left}px`
				style.translate = '-50% 0'
				break
			case 'left-start':
				style.top = `${coords.value.top}px`
				style.right = `${window.innerWidth - coords.value.left}px`
				break
			case 'left-end':
				style.bottom = `${window.innerHeight - coords.value.top}px`
				style.right = `${window.innerWidth - coords.value.left}px`
				break
			case 'left':
				style.top = `${coords.value.top}px`
				style.right = `${window.innerWidth - coords.value.left}px`
				style.translate = '0 -50%'
				break
			case 'right-start':
				style.top = `${coords.value.top}px`
				style.left = `${coords.value.left}px`
				break
			case 'right-end':
				style.bottom = `${window.innerHeight - coords.value.top}px`
				style.left = `${coords.value.left}px`
				break
			case 'right':
				style.top = `${coords.value.top}px`
				style.left = `${coords.value.left}px`
				style.translate = '0 -50%'
				break
		}

		return style
	})

	/** Обновление позиции при скролле/ресайзе */
	function handleScrollOrResize(): void {
		if (isOpen()) {
			updatePosition()
		}
	}

	/** Обновлять позицию при открытии (с nextTick для полного рендера) */
	watch(isOpen, (open: boolean) => {
		if (open) {
			updatePosition()
			nextTick(updatePosition)
		}
	})

	/** Пересчёт позиции при изменении gap, position, matchWidth */
	watch([gap, position, matchWidth], () => {
		if (isOpen()) {
			updatePosition()
		}
	})

	onMounted(() => {
		window.addEventListener('scroll', handleScrollOrResize, true)
		window.addEventListener('resize', handleScrollOrResize)

		/** Позиция при изначально открытом дропдауне */
		if (isOpen()) {
			updatePosition()
		}
	})

	onBeforeUnmount(() => {
		window.removeEventListener('scroll', handleScrollOrResize, true)
		window.removeEventListener('resize', handleScrollOrResize)
	})

	return {
		coords,
		triggerWidth,
		panelStyle,
		updatePosition,
	}
}

export { useDropdownPosition }
