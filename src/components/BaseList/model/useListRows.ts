import { computed, type ComputedRef, type Ref } from 'vue'
import { useVirtualList } from '@composables/interaction/useVirtualList'
import type { ListItem, ListProps, ListRow } from '../types/BaseList.types'

const VIRTUAL_HEIGHT = 360

const cssLength = (value: number | string | undefined): string | undefined => (typeof value === 'number' ? `${value}px` : value)

export function useListRows<T extends ListItem>(
	props: ListProps<T>,
	viewportRef: Ref<HTMLElement | null>,
	state: { shown: ComputedRef<readonly T[]>; activeIndex: () => number },
) {
	const virtual = useVirtualList({
		count: () => (props.isVirtual ? state.shown.value.length : 0),
		estimateSize: () => props.itemSize,
		overscan: () => props.overscan,
		scrollElement: viewportRef,
		getKey: index => state.shown.value[index]?.id ?? index,
		pinnedIndex: () => (state.activeIndex() < 0 ? undefined : state.activeIndex()),
	})
	return {
		rows: computed((): ListRow<T>[] => {
			if (!props.isVirtual) return state.shown.value.map((item, index) => ({ item, index }))
			return virtual.items.value.map(entry => ({ item: state.shown.value[entry.index], index: entry.index, start: entry.start }))
		}),
		viewportStyle: computed(() => ({ height: cssLength(props.height ?? (props.isVirtual ? VIRTUAL_HEIGHT : undefined)) })),
		listStyle: computed(() => (props.isVirtual ? { height: `${virtual.totalSize.value}px` } : undefined)),
		rowStyle: (row: ListRow<T>) => (row.start === undefined ? undefined : { transform: `translateY(${row.start}px)` }),
		measureRow(element: unknown, index: number): void {
			if (props.isVirtual) virtual.measureElement(element, index)
		},
		scrollToIndex(index: number): void {
			if (props.isVirtual) virtual.scrollToIndex(index, 'auto')
		},
	}
}
