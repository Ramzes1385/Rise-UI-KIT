import { ref, type Ref } from 'vue'
import type { UseListNavigationOptions } from './useListNavigation.types'

/**
 * Composable для навигации по списку клавишами ArrowUp/ArrowDown/Enter/Escape.
 *
 * @example
 * ```ts
 * const { highlightedIndex, handleKeydown } = useListNavigation({
 *   itemCount: () => visibleResults.value.length,
 *   onSelect: (index) => handleSelect(visibleResults.value[index]),
 *   onEscape: () => emit('close'),
 * })
 * ```
 */
function useListNavigation(options: UseListNavigationOptions): {
	highlightedIndex: Ref<number>
	handleKeydown: (e: KeyboardEvent) => void
	reset: () => void
} {
	const { itemCount, onSelect, onEscape, isLoop = false } = options

	const highlightedIndex = ref(-1)

	/** Подсветить следующий элемент */
	function highlightNext(): void {
		const count = itemCount()
		if (count === 0) return

		if (highlightedIndex.value < count - 1) {
			highlightedIndex.value++
		} else if (isLoop) {
			highlightedIndex.value = 0
		}
	}

	/** Подсветить предыдущий элемент */
	function highlightPrev(): void {
		const count = itemCount()
		if (count === 0) return

		if (highlightedIndex.value > 0) {
			highlightedIndex.value--
		} else if (isLoop) {
			highlightedIndex.value = count - 1
		}
	}

	/** Выбрать подсвеченный элемент */
	function selectHighlighted(): void {
		if (highlightedIndex.value >= 0) {
			onSelect(highlightedIndex.value)
		}
	}

	/** Сбросить подсветку */
	function reset(): void {
		highlightedIndex.value = -1
	}

	/** Обработчик клавиш */
	function handleKeydown(e: KeyboardEvent): void {
		if (e.key === 'ArrowDown') {
			e.preventDefault()
			highlightNext()
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			highlightPrev()
		} else if (e.key === 'Enter') {
			e.preventDefault()
			selectHighlighted()
		} else if (e.key === 'Escape') {
			if (onEscape) onEscape()
		}
	}

	return {
		highlightedIndex,
		handleKeydown,
		reset,
	}
}

export { useListNavigation }
