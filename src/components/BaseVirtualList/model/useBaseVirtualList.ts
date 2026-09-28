import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import { useVirtualList } from '@composables/useVirtualList'
import type { VirtualKey } from '@composables/useVirtualList'
import type { VirtualListProps } from '../types/BaseVirtualList.types'
import { useStandardBaseComponent } from '@composables/useBaseComponent'

function keyOf<T>(props: VirtualListProps<T>, index: number): VirtualKey {
	const item = props.items[index]
	if (typeof props.itemKey === 'function') return props.itemKey(item, index)
	const field = props.itemKey ?? 'id'
	const value = item !== null && typeof item === 'object' ? (item as Record<string, unknown>)[field] : undefined
	return typeof value === 'string' || typeof value === 'number' ? value : index
}

function useFocusedRow(viewportRef: Ref<HTMLElement | null>) {
	const focusedIndex = ref<number>()
	return {
		focusedIndex,
		handleFocusin(event: FocusEvent): void {
			const row = (event.target as HTMLElement).closest<HTMLElement>('.base-virtual-list__item')
			focusedIndex.value = row ? Number(row.dataset.index) : undefined
		},
		handleFocusout(event: FocusEvent): void {
			if (!viewportRef.value?.contains(event.relatedTarget as Node | null)) focusedIndex.value = undefined
		},
	}
}

export function useBaseVirtualList<T>(props: VirtualListProps<T>) {
	const viewportRef = ref<HTMLElement | null>(null)
	const { focusedIndex, handleFocusin, handleFocusout } = useFocusedRow(viewportRef)
	const { items, totalSize, viewportSize, measureElement, scrollToIndex } = useVirtualList({
		count: () => props.items.length,
		estimateSize: () => props.itemSize,
		overscan: () => props.overscan,
		scrollElement: viewportRef,
		getKey: index => keyOf(props, index),
		pinnedIndex: () => focusedIndex.value,
	})

	return {
		...useStandardBaseComponent('base-virtual-list', props, ['root', 'item']),
		viewportRef,
		viewportStyle: computed(() => ({ height: typeof props.height === 'number' ? `${props.height}px` : props.height })),
		handleFocusin,
		handleFocusout,
		virtualItems: items,
		totalSize,
		measureElement,
		isScrollable: computed(() => totalSize.value > viewportSize.value),
		exposed: { scrollToIndex, getViewport: () => viewportRef.value },
	}
}
