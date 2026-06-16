<template>
	<div class="base-table" :class="classes.root" :style="[paddingStyle, sizeScaleStyle, variantStyle, customColorStyle]">
		<div class="base-table__body" :class="[variantClass, classes.body]">
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

			<div v-if="isLoading && rows.length" class="base-table__loading-overlay" :class="classes.loadingOverlay">
				<BaseLoader variant="spinner" :size-scale="calcIconScale('sm', sizeScale)" has-label />
			</div>
		<div
			ref="tableWrapperRef"
			class="base-table__wrapper"
			:class="[classes.wrapper, { 'base-table__wrapper--loading': isLoading && rows.length }]"
			:style="height ? { maxHeight: height } : undefined"
			@scroll="handleScroll">
				<table class="base-table__table" :class="[classes.table, { 'base-table__table--fixed': useFixedLayout }]">
					<colgroup>
					<col v-if="isSelectable" :style="{ width: TABLE_ROW_SELECTION_WIDTH }" />
					<col v-if="hasRowNumber" :style="{ width: TABLE_ROW_NUMBER_WIDTH }" />
					<col v-if="hasExpandableRows" :style="{ width: TABLE_ROW_EXPAND_WIDTH }" />
						<col v-for="(column, i) in visibleColumns" :key="column.key" :style="{ width: columnWidths[i] }" />
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
						:is-column-resizable="isColumnResizable"
						:get-column-style="getColumnStyle"
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
					:get-column-style="getColumnStyle"
					:format-cell-value="formatCellValue"
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

			<div v-if="loadMode === 'button' && hasMoreRows" class="base-table__load-more" :class="classes.loadMore">
				<BaseButton :is-loading="isLoading" :is-disabled="isLoading" :size-scale="sizeScale" @click="handleLoadMore">
					{{ isLoading ? 'Загрузка...' : 'Загрузить еще' }}
				</BaseButton>
			</div>

			<div
				v-if="
					(hasPageSizeSelector && pageSizeOptions.length) ||
					(loadMode === 'pagination' && localPageSize && totalPages > 1)
				"
				class="base-table__footer-bar"
				:class="classes.footerBar">
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
import { TABLE_EXPAND_TRANSITION_KEY } from '../model/BaseTable.types'

import '../styles/BaseTable.style.scss'

import { BaseButton } from '@components/BaseButton'
import { BaseLoader } from '@components/BaseLoader'
import { BasePagination } from '@components/BasePagination'
import { BaseSelect } from '@components/BaseSelect'
import { BaseText } from '@components/BaseText'
import { useBaseComponent } from '@composables/useBaseComponent'
import { useColumnResize } from '@composables/useColumnResize/useColumnResize'
import { useExpandTransition } from '@composables/useExpandTransition'
import { usePadding } from '@composables/usePadding'
import { useTableData } from '@composables/useTableData'
import { useTableSelection } from '@composables/useTableSelection'
import { calcPageInfo } from '@utils/paginationUtils'
import { calcRowNumber } from '@utils/tableUtils'
import { computed, provide, useSlots, watch } from 'vue'
import type { PropType } from 'vue'

import { UI_EMPTY_TEXT } from '@constants'
import {
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
import { useTableColumns } from '../model/useTableColumns'
import { useTableExpand } from '../model/useTableExpand'
import { useTableToolbar } from '../model/useTableToolbar'
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

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-table',
	getVariant: () => props.variant,
	getSizeScale: () => sizeScale.value,
	getColor: () => props.color,
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

provide(TABLE_EXPAND_TRANSITION_KEY, {
	onExpandBeforeEnter,
	onExpandEnter,
	onExpandAfterEnter,
	onCollapseBeforeLeave,
	onCollapseLeave,
	onCollapseAfterLeave,
})

const emit = defineEmits<BaseTableEmits>()

const {
	localColumns,
	visibleColumns,
	columnWidths,
	useFixedLayout,
	totalCols,
	filterableColumns,
	hasExpandableRows,
	skeletonRows,
	isColumnResizable,
	getColumnStyle,
	toggleColumnVisibility,
	formatCellValue,
} = useTableColumns({
	columns: computed(() => props.columns),
	rows: computed(() => props.rows),
	isResizable: () => isResizable.value,
	hasRowNumber: () => hasRowNumber.value,
	isSelectable: () => isSelectable.value,
	pageSize: () => pageSize.value,
	emit,
})

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

const { isExpanded, toggleExpand, handleRowClick } = useTableExpand({
	rows: () => props.rows,
	emit,
})

const {
	filterColumn,
	filterOperator,
	filterValue,
	isSettingsOpen,
	filterColumnOptions,
	filterOperatorOptions,
	showToolbar,
	setFilterColumn,
	setFilterOperator,
	handleAddFilter,
	handleRemoveFilter,
} = useTableToolbar({
	filterableColumns: () => filterableColumns.value,
	hasSearch: () => hasSearch.value,
	hasFilters: () => hasFilters.value,
	hasColumnSettings: () => hasColumnSettings.value,
	slots,
	addFilter,
	removeFilter,
})

watch(currentPage, newPage => {
	emit('page-change', newPage)
})

const pageSizeSelectOptions = computed(() => {
	return pageSizeOptions.value.map(size => ({
		value: String(size),
		label: String(size),
	}))
})

const paginationInfo = computed((): string => {
	return calcPageInfo({
		current: currentPage.value,
		pageSize: localPageSize.value,
		total: processedRows.value.length,
	})
})

function getRowNumber(index: number): number {
	return calcRowNumber({
		index,
		currentPage: currentPage.value,
		pageSize: localPageSize.value,
		loadMode: loadMode.value,
	})
}

function toggleRow(row: TableRow): void {
	toggleRowSelection(row)
}

function toggleAll(): void {
	toggleAllRows()
}

function handleLoadMore(): void {
	loadMore()
	emit('load-more')
}

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

watch(
	() => props.rows,
	() => {
		resetPage()
	},
)
</script>
