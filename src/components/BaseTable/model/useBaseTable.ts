/** Composable: логика BaseTable — сортировка, фильтры, поиск, выбор и раскрытие строк, пагинация и виртуальная прокрутка */
import { computed, onBeforeUnmount, onMounted, provide, ref, useSlots, watch } from 'vue'
import { usePadding } from '@composables/usePadding'
import { useVirtualList } from '@composables/useVirtualList'
import { isolateFormField } from '@composables/useFormContext'
import { useExpandTransition } from '@composables/useExpandTransition'
import { useTableComposition } from '@composables/useTableComposition'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { TABLE_EXPAND_TRANSITION_KEY } from '../types/BaseTable.types'
import type { ComputedRef, Ref } from 'vue'
import type { BaseTableEmits, TableProps } from '../types/BaseTable.types'

/** Наибольшая высота панели настроек колонок */
const SETTINGS_MAX_HEIGHT = 'min(320px, 50vh)'
/** Номеров страниц в пагинации, не считая крайних */
const PAGINATION_MAX_VISIBLE = 4
/** Длительность раскрытия и сворачивания строки, мс */
const EXPAND_DURATION_MS = 300
/** Расстояние до низа таблицы, px, с которого подгружаются следующие строки */
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
	'wrapper',
	'loadingOverlay',
	'table',
	'thead',
	'tr',
	'th',
	'tbody',
	'td',
	'loadMore',
	'footerBar',
	'pageSize',
	'paginationInfo',
	'footer',
]

/** Раскрытие строк: одна анимация высоты на всю таблицу, строки берут её колбэки через provide */
function useRowExpand() {
	const expand = useExpandTransition({ duration: EXPAND_DURATION_MS })
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
		isMultiSort: features.isMultiSort,
		searchDebounce: computed(() => props.searchDebounce),
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
		slots: useSlots(),
	})
}

/**
 * Область таблицы прокручивается (задан height или таблица шире контейнера). Прокручиваемой области без фокусируемых
 * элементов нужен tabindex, иначе её не прокрутить с клавиатуры (WCAG 2.1.1, правило axe scrollable-region-focusable).
 * Постоянный tabindex добавил бы лишнюю остановку Tab, поэтому он ставится только при прокрутке. Признак пересчитывается
 * при изменении размеров области и самой таблицы (новые строки, скрытые колонки)
 */
function useScrollable(wrapperRef: Ref<HTMLElement | null>): Ref<boolean> {
	const isScrollable = ref(false)
	let scrollObserver: ResizeObserver | null = null
	const updateScrollable = (): void => {
		const wrapper = wrapperRef.value
		isScrollable.value = wrapper !== null && (wrapper.scrollHeight > wrapper.clientHeight || wrapper.scrollWidth > wrapper.clientWidth)
	}

	onMounted(() => {
		const wrapper = wrapperRef.value
		/* istanbul ignore if -- defensive: обёртка рендерится всегда, ref заполнен к onMounted */
		if (!wrapper) return
		scrollObserver = new ResizeObserver(updateScrollable)
		scrollObserver.observe(wrapper)
		if (wrapper.firstElementChild) scrollObserver.observe(wrapper.firstElementChild)
		updateScrollable()
	})
	onBeforeUnmount(() => {
		scrollObserver?.disconnect()
		scrollObserver = null
	})

	return isScrollable
}

/**
 * Высота строки — от её начала до начала следующей: так в неё входят вложенные и раскрытые строки.
 * У последней отрисованной строки следующей служит нижняя распорка
 */
function measureRows(wrapper: HTMLElement, measure: (index: number, size: number) => void): void {
	const rowElements = [...wrapper.querySelectorAll<HTMLElement>('tr[data-virtual-index]')]
	const end = wrapper.querySelector<HTMLElement>('.base-table__spacer--end') as HTMLElement
	rowElements.forEach((row, position) => {
		const next = rowElements[position + 1] ?? end
		measure(Number(row.dataset.virtualIndex), next.offsetTop - row.offsetTop)
	})
}

/** Замер после каждой отрисовки строк и при изменении высоты tbody (раскрытие строки, загрузка картинок) */
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

/** Виртуальный режим: нужен height — без своей области прокрутки таблица растёт на все строки */
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
	// Строки для tbody: в виртуальном режиме — видимая часть с запасом
	const bodyRows = computed(() =>
		isVirtualMode.value ? displayedRows.value.slice(virtual.range.value.start, virtual.range.value.end) : displayedRows.value,
	)
	useRowMeasure(wrapperRef, [isVirtualMode, bodyRows], virtual.measure)
	return { isVirtualMode, virtual, bodyRows }
}

export function useBaseTable(props: TableProps, emit: BaseTableEmits) {
	// Поиск, фильтры и выбор строк — служебные поля: они не становятся полем BaseFormField вокруг таблицы
	isolateFormField()
	const standard = useStandardBaseComponent('base-table', props, TABLE_ELEMENTS)
	const { paddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--tbl-pad' })
	const expand = useRowExpand()
	const features = useTableFeatures(props)
	const table = useComposition(props, emit, features)
	const tableWrapperRef = ref<HTMLElement | null>(null)
	const isScrollable = useScrollable(tableWrapperRef)

	return {
		...standard,
		settingsMaxHeight: SETTINGS_MAX_HEIGHT,
		paginationMaxVisible: PAGINATION_MAX_VISIBLE,
		// Без пропа padding отступы ячеек берутся из стилей (12px 16px), inline-переменные не пишутся
		paddingStyle: computed(() => (props.padding === undefined ? undefined : paddingStyle.value)),
		expand,
		...features,
		...table,
		hasPageSizeControl: computed(() => features.hasPageSizeSelector.value && props.pageSizeOptions.length > 0),
		hasPagination: computed(() => props.loadMode === 'pagination' && table.localPageSize.value > 0 && table.totalPages.value > 1),
		tableWrapperRef,
		isScrollable,
		...useTableVirtual(props, table.displayedRows, tableWrapperRef),
	}
}
