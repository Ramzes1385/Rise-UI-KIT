import { warn } from '@/locales/warn'
import type { ComputedRef, Ref } from 'vue'
import { useUi } from '@composables/base/useUi'
import { provideTableSlots } from './useTableSlots'
import { getLocale, pluralize } from '@/locales/state'
import { useBaseTableExport } from './useBaseTableExport'
import { usePadding } from '@composables/base/usePadding'
import { useTableStickyOffsets } from './useTableStickyOffsets'
import { isolateFormField } from '@composables/form/useFormContext'
import { TABLE_TEXT, UI_TEXT, UI_WARNINGS } from '@/locales/messages'
import { useTableInfinite } from '@composables/table/useTableInfinite'
import { useVirtualList } from '@composables/interaction/useVirtualList'
import { useTableComposition } from '@composables/table/useTableComposition'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { useExpandTransition } from '@composables/interaction/useExpandTransition'
import { useScrollableRegion } from '@composables/interaction/useScrollableRegion'
import { TABLE_EXPAND_TRANSITION_KEY, TABLE_UI_KEY } from '../types/BaseTable.types'
import { computed, getCurrentInstance, onBeforeUnmount, provide, ref, watch } from 'vue'
import type { BaseTableEmits, TableColumn, TableProps, TableRow } from '../types/BaseTable.types'

const PAGINATION_MAX_VISIBLE = 4
const INFINITE_SCROLL_THRESHOLD = 50
const TABLE_ELEMENTS = [
	'root',
	'body',
	'header',
	'toolbar',
	'search',
	'filters',
	'settings',
	'activeFilters',
	'export',
	'wrapper',
	'loadingOverlay',
	'table',
	'thead',
	'tr',
	'th',
	'tbody',
	'td',
	'loadMore',
	'selectionStatus',
	'footerBar',
	'pageSize',
	'paginationInfo',
	'footer',
]

function useRowExpand() {
	const expand = useExpandTransition()
	provide(TABLE_EXPAND_TRANSITION_KEY, {
		onExpandBeforeEnter: expand.onBeforeEnter,
		onExpandEnter: expand.onEnter,
		onExpandAfterEnter: expand.onAfterEnter,
		onCollapseBeforeLeave: expand.onBeforeLeave,
		onCollapseLeave: expand.onLeave,
		onCollapseAfterLeave: expand.onAfterLeave,
	})
	return expand
}

function useTableFeatures(props: TableProps) {
	return {
		isSelectable: computed(() => props.behavior?.selectable ?? false),
		hasSearch: computed(() => props.features?.search ?? false),
		hasFilters: computed(() => props.features?.filters ?? false),
		isMultiSort: computed(() => props.behavior?.multiSort ?? false),
		hasColumnSettings: computed(() => props.features?.columnSettings ?? false),
		hasRowNumber: computed(() => props.features?.rowNumber ?? false),
		hasPageSizeSelector: computed(() => props.features?.pageSizeSelector ?? false),
		isResizable: computed(() => props.behavior?.resizable ?? false),
	}
}

function useComposition(props: TableProps, emit: BaseTableEmits, features: ReturnType<typeof useTableFeatures>) {
	return useTableComposition({
		rows: computed(() => props.rows),
		columns: computed(() => props.columns),
		loadMode: computed(() => props.loadMode),
		pageSize: computed(() => props.pageSize),
		hasMore: computed(() => props.hasMore),
		page: computed(() => props.page),
		totalRows: computed(() => props.totalRows),
		selectedIds: computed(() => props.selectedIds),
		selectAllScope: computed(() => props.selectAllScope),
		isMultiSort: features.isMultiSort,
		searchDebounce: computed(() => props.searchDebounce),
		sortLocale: computed(() => props.sortLocale),
		timeZone: computed(() => props.timeZone),
		isManualFiltering: computed(() => props.isManualFiltering),
		isManualSorting: computed(() => props.isManualSorting),
		expandedIds: computed(() => props.expandedIds),
		isResizable: features.isResizable,
		hasRowNumber: features.hasRowNumber,
		isSelectable: features.isSelectable,
		hasSearch: features.hasSearch,
		hasFilters: features.hasFilters,
		hasColumnSettings: features.hasColumnSettings,
		isLoading: computed(() => props.isLoading),
		pageSizeOptions: computed(() => props.pageSizeOptions),
		infiniteScrollThreshold: INFINITE_SCROLL_THRESHOLD,
		emit,
	})
}

function measureRows(wrapper: HTMLElement, measure: (index: number, size: number) => void): void {
	const rowElements = [...wrapper.querySelectorAll<HTMLElement>('tr[data-virtual-index]')]
	const end = wrapper.querySelector<HTMLElement>('.base-table__spacer--end') as HTMLElement
	rowElements.forEach((row, position) => {
		const next = rowElements[position + 1] ?? end
		measure(Number(row.dataset.virtualIndex), next.offsetTop - row.offsetTop)
	})
}

function useRowMeasure(
	wrapperRef: Ref<HTMLElement | null>,
	sources: [ComputedRef<boolean>, ComputedRef<unknown[]>],
	measure: (index: number, size: number) => void,
): void {
	let rowsObserver: ResizeObserver | null = null
	const measureAll = (): void => measureRows(wrapperRef.value as HTMLElement, measure)
	watch(
		sources,
		([isVirtual]) => {
			rowsObserver?.disconnect()
			rowsObserver = null
			if (!isVirtual) return
			measureAll()
			rowsObserver = new ResizeObserver(measureAll)
			rowsObserver.observe((wrapperRef.value as HTMLElement).querySelector('.base-table__tbody') as HTMLElement)
		},
		{ flush: 'post' },
	)
	onBeforeUnmount(() => rowsObserver?.disconnect())
}

function useTableVirtual(
	props: TableProps,
	displayedRows: ReturnType<typeof useTableComposition>['displayedRows'],
	wrapperRef: Ref<HTMLElement | null>,
) {
	const isVirtualMode = computed(() => props.isVirtual && Boolean(props.height))
	const virtual = useVirtualList({
		count: () => (isVirtualMode.value ? displayedRows.value.length : 0),
		estimateSize: () => props.rowHeight,
		scrollElement: computed(() => (isVirtualMode.value ? wrapperRef.value : null)),
		getKey: index => displayedRows.value[index].id,
	})
	const bodyRows = computed(() =>
		isVirtualMode.value ? displayedRows.value.slice(virtual.range.value.start, virtual.range.value.end) : displayedRows.value,
	)
	useRowMeasure(wrapperRef, [isVirtualMode, bodyRows], virtual.measure)
	return { isVirtualMode, virtual, bodyRows }
}

function useTableSticky(
	wrapperRef: Ref<HTMLElement | null>,
	table: ReturnType<typeof useTableComposition>,
	features: ReturnType<typeof useTableFeatures>,
) {
	const serviceKeys = computed(() =>
		[features.isSelectable.value && 'check', features.hasRowNumber.value && 'number', table.hasExpandableRows.value && 'expand'].filter(
			(key): key is string => Boolean(key),
		),
	)
	const sticky = useTableStickyOffsets({ wrapperRef, visibleColumns: table.visibleColumns, serviceKeys })
	return {
		hasStickyService: sticky.hasStickyService,
		stickyServiceStyle: sticky.stickyServiceStyle,
		getColumnStyle: (column: TableColumn): Record<string, string> => ({
			...table.getColumnStyle(column),
			...sticky.getStickyStyle(column),
		}),
	}
}

function useEmptyState(props: TableProps, table: ReturnType<typeof useTableComposition>) {
	const hasQuery = computed(() => table.searchQuery.value !== '' || table.activeFilters.value.length > 0)
	const isFiltered = computed(
		() => table.processedRows.value.length === 0 && (props.rows.length > 0 || (props.isManualFiltering && hasQuery.value)),
	)
	return {
		isFiltered,
		bodyEmptyText: computed(() =>
			isFiltered.value ? (props.emptyFilteredText ?? TABLE_TEXT.EMPTY_FILTERED) : (props.emptyText ?? UI_TEXT.EMPTY),
		),
	}
}

function useInfiniteLoad(props: TableProps, table: ReturnType<typeof useTableComposition>, wrapperRef: Ref<HTMLElement | null>) {
	const sentinelRef = ref<HTMLElement | null>(null)
	const { isObserving } = useTableInfinite({
		sentinelRef,
		rootRef: wrapperRef,
		isActive: () => props.loadMode === 'infinite',
		hasOwnScroll: () => Boolean(props.height),
		distance: INFINITE_SCROLL_THRESHOLD,
		onReach: table.handleReach,
		rearm: () => table.displayedRows.value.length,
	})
	return { sentinelRef, isObserving }
}

function useDuplicateIdWarning(props: TableProps): void {
	watch(
		() => props.rows,
		rows => {
			const seen = new Set<TableRow['id']>()
			const reported = new Set<TableRow['id']>()
			for (const row of rows) {
				if (seen.has(row.id) && !reported.has(row.id)) {
					reported.add(row.id)
					warn(UI_WARNINGS.TABLE_DUPLICATE_ROW_ID, { id: row.id })
				}
				seen.add(row.id)
			}
		},
		{ immediate: true },
	)
}

function useSelectionStatus(table: ReturnType<typeof useTableComposition>) {
	return computed(() => {
		const count = table.hiddenSelectedCount.value
		return count > 0 ? pluralize(getLocale().plural.TABLE_HIDDEN_SELECTED, count) : ''
	})
}

function useRowInteractive(props: TableProps) {
	const instance = getCurrentInstance()
	return (): boolean => {
		if (props.isRowInteractive !== undefined) return props.isRowInteractive
		const vnodeProps = instance?.vnode.props ?? {}
		return Boolean(vnodeProps.onRowClick || vnodeProps['onRow-click'])
	}
}

export function useBaseTable(props: TableProps, emit: BaseTableEmits) {
	isolateFormField()
	useDuplicateIdWarning(props)
	const standard = useStandardBaseComponent('base-table', props, TABLE_ELEMENTS)
	const ui = useUi(props, 'base-table')
	provide(TABLE_UI_KEY, ui)
	const { slotsVersion } = provideTableSlots()
	const { paddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--tbl-pad' })
	const expand = useRowExpand()
	const features = useTableFeatures(props)
	const table = useComposition(props, emit, features)
	const tableWrapperRef = ref<HTMLElement | null>(null)
	const { isScrollable } = useScrollableRegion({ elementRef: tableWrapperRef, orientation: 'both' })
	const infinite = useInfiniteLoad(props, table, tableWrapperRef)
	const exporter = useBaseTableExport(props, emit, table)

	return {
		...standard,
		ui,
		paginationMaxVisible: PAGINATION_MAX_VISIBLE,
		paddingStyle: computed(() => (props.padding === undefined ? undefined : paddingStyle.value)),
		expand,
		...features,
		...table,
		...exporter,
		sentinelRef: infinite.sentinelRef,
		slotsVersion,
		handleScroll: (event: Event): void => {
			if (!infinite.isObserving.value) table.handleScroll(event)
		},
		showToolbar: computed(() => table.showToolbar.value || exporter.hasExport.value),
		hasPageSizeControl: computed(() => features.hasPageSizeSelector.value && props.pageSizeOptions.length > 0),
		hasPagination: computed(() => props.loadMode === 'pagination' && table.localPageSize.value > 0 && table.totalPages.value > 1),
		tableWrapperRef,
		isScrollable,
		...useTableVirtual(props, table.displayedRows, tableWrapperRef),
		...useTableSticky(tableWrapperRef, table, features),
		...useEmptyState(props, table),
		selectionStatusText: useSelectionStatus(table),
		getIsRowInteractive: useRowInteractive(props),
	}
}
