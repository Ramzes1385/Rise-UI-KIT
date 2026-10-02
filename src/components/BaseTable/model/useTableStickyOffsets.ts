import type { Ref } from 'vue'
import type { TableColumn } from '../types/BaseTable.types'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { StickyOffsets, TableStickyOptions } from '../types/BaseTable.types'

function headerCells(wrapper: HTMLElement | null): HTMLElement[] {
	return [...(wrapper?.querySelectorAll<HTMLElement>('thead > tr > th') ?? [])]
}

function measureOffsets(cells: HTMLElement[], columns: TableColumn[], serviceKeys: string[]): StickyOffsets {
	const offsets: StickyOffsets = { service: {}, left: {}, right: {} }
	const widthAt = (index: number): number => cells[index]?.offsetWidth ?? 0
	const serviceCount = serviceKeys.length
	let left = 0
	serviceKeys.forEach((key, index) => {
		offsets.service[key] = left
		left += widthAt(index)
	})
	columns.forEach((column, index) => {
		if (column.isSticky !== 'left') return
		offsets.left[column.key] = left
		left += widthAt(serviceCount + index)
	})
	let right = 0
	for (let index = columns.length - 1; index >= 0; index--) {
		if (columns[index].isSticky !== 'right') continue
		offsets.right[columns[index].key] = right
		right += widthAt(serviceCount + index)
	}
	return offsets
}

function observeHeader(wrapperRef: Ref<HTMLElement | null>, measure: () => void): () => void {
	const cells = headerCells(wrapperRef.value)
	if (!cells.length) return () => undefined
	const observer = new ResizeObserver(measure)
	cells.forEach(cell => observer.observe(cell))
	return () => observer.disconnect()
}

export function useTableStickyOffsets(options: TableStickyOptions) {
	const { wrapperRef, visibleColumns, serviceKeys } = options
	const offsets = ref<StickyOffsets>({ service: {}, left: {}, right: {} })
	const hasSticky = computed(() => visibleColumns.value.some(column => column.isSticky))
	const hasStickyLeft = computed(() => visibleColumns.value.some(column => column.isSticky === 'left'))
	const measure = (): void => {
		offsets.value = measureOffsets(headerCells(wrapperRef.value), visibleColumns.value, serviceKeys.value)
	}
	let stopObserver = (): void => undefined
	const update = (): void => {
		stopObserver()
		stopObserver = () => undefined
		if (!hasSticky.value) return
		measure()
		stopObserver = observeHeader(wrapperRef, measure)
	}
	watch([hasSticky, visibleColumns, serviceKeys], update, { flush: 'post' })
	onMounted(update)
	onBeforeUnmount(() => stopObserver())

	return {
		hasStickyService: hasStickyLeft,
		stickyServiceStyle: computed(() =>
			Object.fromEntries(Object.entries(offsets.value.service).map(([key, offset]) => [`--tbl-sticky-${key}`, `${offset}px`])),
		),
		getStickyStyle(column: TableColumn): Record<string, string> {
			if (column.isSticky === 'left') return { left: `${offsets.value.left[column.key] ?? 0}px` }
			if (column.isSticky === 'right') return { right: `${offsets.value.right[column.key] ?? 0}px` }
			return {}
		},
	}
}
