<template>
	<div class="base-table" :class="classes.root" :style="[paddingStyle, sizeScaleStyle, variantStyle, customColorStyle]">
		<!-- Тело таблицы с границами -->
		<div class="base-table__body" :class="[variantClass, classes.body]">
			<!-- Слот header (внутри границ для border-radius) -->
			<div v-if="$slots.header" class="base-table__header" :class="classes.header">
				<slot name="header"></slot>
			</div>
			<BaseTableToolbar
				:show-toolbar="showToolbar"
				:has-search="hasSearch"
				:has-filters="hasFilters"
				:has-column-settings="hasColumnSettings"
				:search-query="searchQuery"
				:filter-column="filterColumn"
				:filter-operator="filterOperator"
				:filter-value="filterValue"
				:filter-column-options="filterColumnOptions"
				:filter-operator-options="filterOperatorOptions"
				:active-filters="activeFilters"
				:columns="columns"
				:is-settings-open="isSettingsOpen"
				:size-scale="sizeScale"
				:settings-max-height="TABLE_SETTINGS_MAX_HEIGHT"
				:toolbar-class="classes.toolbar"
				:search-class="classes.search"
				:filters-class="classes.filters"
				:settings-class="classes.settings"
				:active-filters-class="classes.activeFilters"
				:get-filter-label="getFilterLabel"
				@search-input="handleSearchInput"
				@update:filter-column="setFilterColumn"
				@update:filter-operator="setFilterOperator"
				@update:filter-value="filterValue = $event"
				@add-filter="handleAddFilter"
				@remove-filter="handleRemoveFilter"
				@toggle-settings="isSettingsOpen = !isSettingsOpen"
				@update:is-settings-open="isSettingsOpen = $event"
				@toggle-column-visibility="toggleColumnVisibility">
				<template #toolbar-prepend>
					<slot name="toolbar-prepend"></slot>
				</template>
				<template #toolbar-append>
					<slot name="toolbar-append"></slot>
				</template>
			</BaseTableToolbar>

			<!-- Таблица -->
			<div
				class="base-table__wrapper"
				:class="[classes.wrapper, { 'base-table__wrapper--loading': isLoading && rows.length }]"
				:style="height ? { maxHeight: height } : undefined"
				@scroll="handleScroll"
				ref="tableWrapperRef">
				<!-- Оверлей загрузки -->
				<div v-if="isLoading && rows.length" class="base-table__loading-overlay" :class="classes.loadingOverlay">
					<BaseLoader variant="spinner" :size-scale="calcIconScale('sm', sizeScale)" has-label />
				</div>
				<table class="base-table__table" :class="[classes.table, { 'base-table__table--fixed': useFixedLayout }]">
					<colgroup>
					<col v-if="isSelectable" :style="{ width: TABLE_ROW_SELECTION_WIDTH }" />
					<col v-if="hasRowNumber" :style="{ width: TABLE_ROW_NUMBER_WIDTH }" />
					<col v-if="hasExpandableRows" :style="{ width: TABLE_ROW_EXPAND_WIDTH }" />
						<col v-for="(col, i) in visibleColumns" :key="col.key" :style="{ width: columnWidths[i] }" />
					</colgroup>
					<BaseTableHeader
						:columns="visibleColumns"
						:is-selectable="isSelectable"
						:has-row-number="hasRowNumber"
						:has-expandable-rows="hasExpandableRows"
						:is-all-selected="isAllSelected"
						:size-scale="sizeScale"
						:is-multi-sort="isMultiSort"
						:thead-class="classes.thead"
						:tr-class="classes.tr"
						:th-class="classes.th"
						:get-sort-direction="getSortDirection"
						:get-sort-index="getSortIndex"
						:is-column-resizable="isColResizable"
						:get-column-style="getColStyle"
						@toggle-all="toggleAll"
						@sort="handleSort"
						@resize-start="startResize">
						<template
							v-for="column in visibleColumns"
							#[`header-${column.key}`]="slotProps"
							:key="column.key">
							<slot v-if="$slots[`header-${column.key}`]" :name="`header-${column.key}`" v-bind="slotProps"></slot>
						</template>
					</BaseTableHeader>

					<BaseTableBody
						:rows="displayedRows"
						:columns="visibleColumns"
						:empty-text="emptyText"
						:is-loading="isLoading"
						:skeleton-rows="skeletonRows"
						:is-selectable="isSelectable"
						:has-row-number="hasRowNumber"
						:has-expandable-rows="hasExpandableRows"
						:total-columns="totalCols"
						:size-scale="sizeScale"
						:load-mode="loadMode"
						:nested-config="nestedConfig"
						:tbody-class="classes.tbody"
						:tr-class="classes.tr"
						:td-class="classes.td"
						:is-selected="isSelected"
						:is-expanded="isExpanded"
						:get-row-number="getRowNumber"
						:get-column-style="getColStyle"
						:format-cell-value="formatCellValue"
						:on-expand-before-enter="onExpandBeforeEnter"
						:on-expand-enter="onExpandEnter"
						:on-expand-after-enter="onExpandAfterEnter"
						:on-collapse-before-leave="onCollapseBeforeLeave"
						:on-collapse-leave="onCollapseLeave"
						:on-collapse-after-leave="onCollapseAfterLeave"
						@row-click="handleRowClick"
						@toggle-row="toggleRow"
						@toggle-expand="toggleExpand">
						<template
							v-for="column in visibleColumns"
							#[`cell-${column.key}`]="slotProps"
							:key="column.key">
							<slot v-if="$slots[`cell-${column.key}`]" :name="`cell-${column.key}`" v-bind="slotProps"></slot>
						</template>
						<template #empty>
							<slot name="empty"></slot>
						</template>
						<template #expanded-content="slotProps">
							<slot name="expanded-content" v-bind="slotProps"></slot>
						</template>
					</BaseTableBody>
				</table>
			</div>

			<!-- Кнопка "Загрузить еще" -->
			<div v-if="loadMode === 'button' && hasMoreRows" class="base-table__load-more" :class="classes.loadMore">
				<BaseButton :is-loading="isLoading" :is-disabled="isLoading" :size-scale="sizeScale" @click="handleLoadMore">
					{{ isLoading ? 'Загрузка...' : 'Загрузить еще' }}
				</BaseButton>
			</div>

			<!-- Нижняя панель: селектор размера страницы + пагинация -->
			<div
				v-if="
					(hasPageSizeSelector && pageSizeOptions.length) ||
					(loadMode === 'pagination' && localPageSize && totalPages > 1)
				"
				class="base-table__footer-bar"
				:class="classes.footerBar">
				<!-- Селектор размера страницы — всегда слева -->
				<div
					v-if="hasPageSizeSelector && pageSizeOptions.length"
					class="base-table__page-size"
					:class="classes.pageSize">
					<BaseSelect
						:model-value="String(localPageSize)"
						:options="pageSizeSelectOptions"
						:size-scale="sizeScale - 20"
						@update:model-value="handlePageSizeChange" />
				</div>
				<!-- Пагинация -->
				<slot
					v-if="loadMode === 'pagination' && localPageSize && totalPages > 1"
					name="pagination"
					:current-page="currentPage"
					:total-pages="totalPages"
					:visible-pages="visiblePages"
					:page-size="localPageSize"
					:page-size-options="pageSizeOptions"
					:pagination-info="paginationInfo"
					:page-size-select-options="pageSizeSelectOptions"
					:handle-page-size-change="handlePageSizeChange">
					<BaseText tag="span" class="base-table__pagination-info" :custom-class="classes.paginationInfo">
						{{ paginationInfo }}
					</BaseText>
					<BasePagination
						v-model="currentPage"
						:total="processedRows.length"
						:page-size="localPageSize"
						:max-visible="TABLE_PAGINATION_MAX_VISIBLE"
						variant="ghost"
						:size-scale="sizeScale - 20" />
				</slot>
			</div>
			<!-- Слот footer (внутри границ для border-radius) -->
			<div v-if="$slots.footer" class="base-table__footer" :class="classes.footer">
				<slot name="footer"></slot>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { calcIconScale } from '@components/BaseIcon'
import type { BaseTableEmits, BaseTableProps, TableColumn, TableRow } from '../model/BaseTable.types'

import '../styles/BaseTable.style.scss'

import { BaseButton } from '@components/BaseButton'
import { BaseLoader } from '@components/BaseLoader'
import { BasePagination } from '@components/BasePagination'
import { BaseSelect } from '@components/BaseSelect'
import { BaseText } from '@components/BaseText'
import { useCustomClass } from '@composables/useCustomClass'
import { useColumnResize } from '@composables/useColumnResize/useColumnResize'
import { useCustomColor } from '@composables/useCustomColor'
import { useExpandTransition } from '@composables/useExpandTransition'
import { usePadding } from '@composables/usePadding'
import { useSizeScale } from '@composables/useSizeScale'
import { useTableData } from '@composables/useTableData'
import { useTableSelection } from '@composables/useTableSelection'
import { useVariant } from '@composables/useVariant'
import { calcPageInfo } from '@utils/paginationUtils'
import { calcColumnWidths, calcRowNumber, calcTotalColumns, getColumnStyle } from '@utils/tableUtils'
import { computed, ref, useSlots, watch } from 'vue'
import type { PropType } from 'vue'

import { UI_EMPTY_TEXT } from '@constants'
import {
	TABLE_DEFAULT_SKELETON_ROWS,
	TABLE_EXPAND_TRANSITION_DURATION,
	TABLE_INFINITE_SCROLL_THRESHOLD,
	TABLE_MIN_COL_WIDTH,
	TABLE_PAGINATION_MAX_VISIBLE,
	TABLE_ROW_EXPAND_WIDTH,
	TABLE_ROW_NUMBER_WIDTH,
	TABLE_ROW_SELECTION_WIDTH,
	TABLE_SEARCH_DEBOUNCE_MS,
	TABLE_SETTINGS_MAX_HEIGHT,
} from '../model/BaseTable.constants'
import BaseTableBody from './BaseTableBody.vue'
import BaseTableHeader from './BaseTableHeader.vue'
import BaseTableToolbar from './BaseTableToolbar.vue'

/* eslint-disable vue/require-default-prop -- intentionally optional props keep Vue runtime behavior unchanged after withDefaults removal */
const props = defineProps({
	columns: { type: Array as PropType<BaseTableProps['columns']>, required: true },
	rows: { type: Array as PropType<BaseTableProps['rows']>, required: true },
	variant: { type: String as PropType<BaseTableProps['variant']>, default: 'default' },
	color: Object as PropType<BaseTableProps['color']>,
	isLoading: { type: Boolean, default: false },
	emptyText: { type: String, default: UI_EMPTY_TEXT },
	height: { type: String, default: '' },
	isSelectable: { type: Boolean, default: false },
	hasSearch: { type: Boolean, default: false },
	hasFilters: { type: Boolean, default: false },
	pageSize: { type: Number, default: 0 },
	pageSizeOptions: { type: Array as PropType<BaseTableProps['pageSizeOptions']>, default: () => [] },
	loadMode: { type: String as PropType<BaseTableProps['loadMode']>, default: 'pagination' },
	searchDebounce: { type: Number, default: TABLE_SEARCH_DEBOUNCE_MS },
	nestedConfig: Object as PropType<BaseTableProps['nestedConfig']>,
	isMultiSort: { type: Boolean, default: false },
	hasColumnSettings: { type: Boolean, default: false },
	hasRowNumber: { type: Boolean, default: false },
	hasPageSizeSelector: { type: Boolean, default: false },
	isResizable: { type: Boolean, default: false },
	sizeScale: { type: Number, default: 100 },
	padding: { type: [Number, Object] as PropType<BaseTableProps['padding']>, default: 10 },
	customClass: [String, Object] as PropType<BaseTableProps['customClass']>,
})
/* eslint-enable vue/require-default-prop */

const variant = computed(() => props.variant ?? 'default')
const isLoading = computed(() => props.isLoading ?? false)
const emptyText = computed(() => props.emptyText ?? UI_EMPTY_TEXT)
const height = computed(() => props.height ?? '')
const isSelectable = computed(() => props.isSelectable ?? false)
const hasSearch = computed(() => props.hasSearch ?? false)
const hasFilters = computed(() => props.hasFilters ?? false)
const pageSize = computed(() => props.pageSize ?? 0)
const pageSizeOptions = computed(() => props.pageSizeOptions ?? [])
const loadMode = computed(() => props.loadMode ?? 'pagination')
const searchDebounce = computed(() => props.searchDebounce ?? TABLE_SEARCH_DEBOUNCE_MS)
const isMultiSort = computed(() => props.isMultiSort ?? false)
const hasColumnSettings = computed(() => props.hasColumnSettings ?? false)
const hasRowNumber = computed(() => props.hasRowNumber ?? false)
const hasPageSizeSelector = computed(() => props.hasPageSizeSelector ?? false)
const isResizable = computed(() => props.isResizable ?? false)
const sizeScale = computed(() => props.sizeScale ?? 100)
const padding = computed(() => props.padding ?? 10)

const slots = useSlots()

const { sizeScaleStyle } = useSizeScale({ getScale: () => sizeScale.value })
const { variantClass, variantStyle } = useVariant({ block: 'base-table', getVariant: () => variant.value })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: [
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
	],
})

const { paddingStyle } = usePadding({ getPadding: () => padding.value, prefix: '--tbl-pad', defaultPadding: 10 })

const {
	onBeforeEnter: onExpandBeforeEnter,
	onEnter: onExpandEnter,
	onAfterEnter: onExpandAfterEnter,
	onBeforeLeave: onCollapseBeforeLeave,
	onLeave: onCollapseLeave,
	onAfterLeave: onCollapseAfterLeave,
} = useExpandTransition({ duration: TABLE_EXPAND_TRANSITION_DURATION })

const emit = defineEmits<BaseTableEmits>()

// Локальная копия колонок для управления видимостью и шириной
const localColumns = ref<TableColumn[]>([...props.columns])

watch(
	() => props.columns,
	newCols => {
		localColumns.value = newCols.map(col => {
			const existing = localColumns.value.find(c => c.key === col.key)
			if (existing) {
				return { ...col, width: existing.width, isHidden: existing.isHidden }
			}
			return col
		})
	},
	{ deep: true },
)

/** Видимые колонки */
const visibleColumns = computed((): TableColumn[] => {
	return localColumns.value.filter(col => !col.isHidden)
})

/** Количество строк скелетона при загрузке */
const skeletonRows = computed((): number => {
	return pageSize.value || TABLE_DEFAULT_SKELETON_ROWS
})

/** Колонки, доступные для фильтрации (все видимые, если isFilterable не задан явно) */
const filterableColumns = computed((): TableColumn[] => {
	return localColumns.value.filter(col => !col.isHidden && col.isFilterable !== false)
})

/** Есть ли раскрываемые строки */
const hasExpandableRows = computed((): boolean => {
	return props.rows.some(row => row.isExpandable || (row.children && row.children.length > 0))
})

/** Общее количество колонок */
const totalCols = computed((): number => {
	return calcTotalColumns(visibleColumns.value.length, isSelectable.value, hasRowNumber.value, hasExpandableRows.value)
})

/** Колонка ресайзимая: пропс таблицы или флаг колонки */
function isColResizable(col: TableColumn): boolean {
	return isResizable.value || !!col.isResizable
}

/** Использовать фиксированный layout */
const useFixedLayout = computed((): boolean => {
	return isResizable.value || visibleColumns.value.some(col => col.flex || col.width)
})

/** Ширины колонок для colgroup */
const columnWidths = computed((): string[] => {
	return calcColumnWidths(visibleColumns.value)
})

// ============================================================
// Данные таблицы (сортировка, фильтрация, пагинация, поиск)
// ============================================================

const filterColumn = ref<string | number>('')
const filterOperator = ref<string | number>('contains')
const filterValue = ref('')
const isSettingsOpen = ref(false)

const {
	searchQuery,
	activeFilters,
	currentPage,
	localPageSize,
	processedRows,
	displayedRows,
	totalPages,
	visiblePages,
	hasMoreRows,
	getSortDirection,
	getSortIndex,
	handleSort,
	handleSearchInput,
	addFilter,
	removeFilter,
	getFilterLabel,
	handlePageSizeChange,
	loadMore,
	resetPage,
} = useTableData({
	rows: computed(() => props.rows),
	columns: localColumns,
	loadMode: () => loadMode.value,
	pageSize,
	isMultiSort: () => isMultiSort.value,
	searchDebounce: () => searchDebounce.value,
	onSearch: (q: string) => emit('search', q),
	onSort: states => emit('sort', states),
	onFilter: filters => emit('filter', filters),
	onPageSizeChange: (size: number) => emit('page-size-change', size),
})

const { isAllSelected, isSelected, toggleRow: toggleRowSelection, toggleAll: toggleAllRows } = useTableSelection({
	rows: computed(() => props.rows),
	onSelect: selectedRows => emit('select', selectedRows),
})

/** ID раскрытых строк */
const expandedIds = ref<Set<string | number>>(new Set())

/** Раскрыта ли строка */
function isExpanded(row: TableRow): boolean {
	return expandedIds.value.has(row.id)
}

/** Синхронизация expandedIds с isExpanded в пропсах (read-only) */
watch(
	() => props.rows,
	() => {
		const next = new Set(expandedIds.value)
		for (const row of props.rows) {
			if (row.isExpanded) next.add(row.id)
		}
		expandedIds.value = next
	},
	{ immediate: true },
)

/** Эмит page-change при смене страницы */
watch(currentPage, newPage => {
	emit('page-change', newPage)
})

/** Опции селекта размера страницы */
const pageSizeSelectOptions = computed(() => {
	return pageSizeOptions.value.map(size => ({
		value: String(size),
		label: String(size),
	}))
})

const showToolbar = computed((): boolean => {
	return hasSearch.value || hasFilters.value || hasColumnSettings.value || !!slots['toolbar-prepend'] || !!slots['toolbar-append']
})

/** Опции селекта колонок для фильтра */
const filterColumnOptions = computed(() => {
	return filterableColumns.value.map(col => ({
		value: col.key,
		label: col.label,
	}))
})

/** Опции селекта оператора фильтра */
const filterOperatorOptions = [
	{ value: 'contains', label: 'Содержит' },
	{ value: 'eq', label: '=' },
	{ value: 'ne', label: '≠' },
	{ value: 'gt', label: '>' },
	{ value: 'gte', label: '≥' },
	{ value: 'lt', label: '<' },
	{ value: 'lte', label: '≤' },
]

/** Информация о пагинации («1–10 из 100») */
const paginationInfo = computed((): string => {
	return calcPageInfo({
		current: currentPage.value,
		pageSize: localPageSize.value,
		total: processedRows.value.length,
	})
})

/** Получить номер строки */
function getRowNumber(index: number): number {
	return calcRowNumber({
		index,
		currentPage: currentPage.value,
		pageSize: localPageSize.value,
		loadMode: loadMode.value,
	})
}

/** Стиль колонки */
function getColStyle(col: TableColumn): Record<string, string> {
	return getColumnStyle({ minWidth: col.minWidth, maxWidth: col.maxWidth })
}

/** Форматирование значения ячейки */
function formatCellValue(col: TableColumn, row: TableRow): string {
	const value = row.data[col.key]
	if (col.formatter) return col.formatter(value, row)
	return String(value ?? '')
}

function getSelectValue(value: string | number | (string | number)[]): string | number {
	/* istanbul ignore next -- defensive: BaseSelect emit'ит одиночное значение, array-ветка недостижима */
	return Array.isArray(value) ? value[0] : value
}

function setFilterColumn(value: string | number | (string | number)[]): void {
	filterColumn.value = getSelectValue(value)
}

function setFilterOperator(value: string | number | (string | number)[]): void {
	filterOperator.value = getSelectValue(value)
}

/** Добавить фильтр (обёртка) */
function handleAddFilter(): void {
	addFilter(filterColumn, filterOperator, filterValue)
}

/** Удалить фильтр (обёртка) */
function handleRemoveFilter(index: number): void {
	removeFilter(index)
}

/** Переключить строку */
function toggleRow(row: TableRow): void {
	toggleRowSelection(row)
}

/** Выбрать все */
function toggleAll(): void {
	toggleAllRows()
}

/** Раскрыть строку */
function toggleExpand(row: TableRow): void {
	const isCurrentlyExpanded = expandedIds.value.has(row.id)
	const next = new Set(expandedIds.value)
	if (isCurrentlyExpanded) {
		next.delete(row.id)
	} else {
		next.add(row.id)
	}
	expandedIds.value = next
	emit('expand', { ...row, isExpanded: !isCurrentlyExpanded })
}

/** Клик по строке */
function handleRowClick(row: TableRow): void {
	emit('row-click', row)
	if (row.isExpandable || row.children?.length) {
		toggleExpand(row)
	}
}

/** Переключение видимости колонки */
function toggleColumnVisibility(col: TableColumn): void {
	const index = localColumns.value.findIndex(c => c.key === col.key)
	/* istanbul ignore else -- Защитная ветка при рассинхронизации внешних колонок. */
	if (index !== -1) {
		localColumns.value[index].isHidden = !localColumns.value[index].isHidden
		emit('columns-change', localColumns.value)
	}
}

/** Подгрузить ещё данные */
function handleLoadMore(): void {
	loadMore()
	emit('load-more')
}

/** Infinite scroll */
function handleScroll(e: Event): void {
	if (loadMode.value !== 'infinite' || !hasMoreRows.value || isLoading.value) return

	const target = e.target as HTMLElement
	const { scrollTop, scrollHeight, clientHeight } = target

	if (scrollHeight - scrollTop - clientHeight < TABLE_INFINITE_SCROLL_THRESHOLD) {
		handleLoadMore()
	}
}

const { startResize: startColumnResize } = useColumnResize({
	columns: localColumns,
	visibleColumns,
	minWidth: TABLE_MIN_COL_WIDTH,
	onColumnResize: (key, width) => emit('column-resize', key, width),
	onColumnsChange: columns => emit('columns-change', columns),
})

function startResize(event: MouseEvent, column: TableColumn): void {
	startColumnResize(event, column.key)
}

/** Сброс страницы при изменении данных */
watch(
	() => props.rows,
	() => {
		resetPage()
	},
)
</script>
