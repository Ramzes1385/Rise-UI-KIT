/** Composable: навигация по списку клавишами ArrowUp/ArrowDown/Enter/Escape */
import { ref, type Ref } from 'vue'
import type { UseListNavigationOptions } from './types/useListNavigation.types'

/** Индекс следующего пункта; с последнего — на первый при `isLoop`, иначе остаётся на месте */
function nextIndex(current: number, count: number, isLoop: boolean): number {
	if (current < count - 1) return current + 1
	return isLoop ? 0 : current
}

/** Индекс предыдущего пункта; с первого (и без подсветки) — на последний при `isLoop`, иначе остаётся на месте */
function previousIndex(current: number, count: number, isLoop: boolean): number {
	if (current > 0) return current - 1
	return isLoop ? count - 1 : current
}

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

	/** Перевести подсветку: `getIndex` даёт новый индекс; в пустом списке подсветка не меняется */
	function move(getIndex: (current: number, count: number, isLoop: boolean) => number): void {
		const count = itemCount()
		if (count === 0) return
		highlightedIndex.value = getIndex(highlightedIndex.value, count, isLoop)
	}

	function selectHighlighted(): void {
		if (highlightedIndex.value >= 0 && highlightedIndex.value < itemCount()) {
			onSelect(highlightedIndex.value)
		}
	}

	function reset(): void {
		highlightedIndex.value = -1
	}

	function handleKeydown(e: KeyboardEvent): void {
		if (e.key === 'ArrowDown') {
			e.preventDefault()
			move(nextIndex)
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			move(previousIndex)
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
