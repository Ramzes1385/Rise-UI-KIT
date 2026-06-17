<template>
	<div class="base-table" :class="classes.root" :style="[paddingStyle, sizeScaleStyle, variantStyle, customColorStyle]">
		<div class="base-table__body" :class="[variantClass, classes.body]">
			<div v-if="$slots.header" class="base-table__header" :class="classes.header">
				<slot name="header"></slot>
			</div>
			<BaseTableToolbar
				:show-toolbar="showToolbar"
				:has-search="props.hasSearch"
				:has-filters="props.hasFilters"
				:has-column-settings="props.hasColumnSettings"
				:search-query="searchQuery"
				:filter-column="filterColumn"
				:filter-operator="filterOperator"
				:filter-value="filterValue"
				:filter-column-options="filterColumnOptions"
				:filter-operator-options="filterOperatorOptions"
				:active-filters="activeFilters"
				:columns="props.columns"
				:is-settings-open="isSettingsOpen"
				:size-scale="props.sizeScale"
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

			<div v-if="props.isLoading && props.rows.length" class="base-table__loading-overlay" :class="classes.loadingOverlay">
				<BaseLoader variant="spinner" :size-scale="calcIconScale('sm', props.sizeScale)" has-label />
			</div>
		<div
			ref="tableWrapperRef"
			class="base-table__wrapper"
			:class="[classes.wrapper, { 'base-table__wrapper--loading': props.isLoading && props.rows.length }]"
			:style="props.height ? { maxHeight: props.height } : undefined"
			@scroll="handleScroll">
				<table class="base-table__table" :class="[classes.table, { 'base-table__table--fixed': useFixedLayout }]">
					<colgroup>
					<col v-if="props.isSelectable" :style="{ width: TABLE_ROW_SELECTION_WIDTH }" />
					<col v-if="props.hasRowNumber" :style="{ width: TABLE_ROW_NUMBER_WIDTH }" />
					<col v-if="hasExpandableRows" :style="{ width: TABLE_ROW_EXPAND_WIDTH }" />
						<col v-for="(column, i) in visibleColumns" :key="column.key" :style="{ width: columnWidths[i] }" />
					</colgroup>
					<BaseTableHeader
						:columns="visibleColumns"
						:is-selectable="props.isSelectable"
						:has-row-number="props.hasRowNumber"
						:has-expandable-rows="hasExpandableRows"
						:is-all-selected="isAllSelected"
						:size-scale="props.sizeScale"
						:is-multi-sort="props.isMultiSort"
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
						:empty-text="props.emptyText"
						:is-loading="props.isLoading"
						:skeleton-rows="skeletonRows"
						:is-selectable="props.isSelectable"
						:has-row-number="props.hasRowNumber"
						:has-expandable-rows="hasExpandableRows"
						:total-columns="totalCols"
						:size-scale="props.sizeScale"
						:load-mode="props.loadMode"
						:nested-config="props.nestedConfig"
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

			<div v-if="props.loadMode === 'button' && hasMoreRows" class="base-table__load-more" :class="classes.loadMore">
				<BaseButton :is-loading="props.isLoading" :is-disabled="props.isLoading" :size-scale="props.sizeScale" @click="handleLoadMore">
					{{ props.isLoading ? UI_LOADING_TEXT : UI_LOAD_MORE_TEXT }}
				</BaseButton>
			</div>

			<div
				v-if="
					(props.hasPageSizeSelector && props.pageSizeOptions.length) ||
					(props.loadMode === 'pagination' && localPageSize && totalPages > 1)
				"
				class="base-table__footer-bar"
				:class="classes.footerBar">
				<div
					v-if="props.hasPageSizeSelector && props.pageSizeOptions.length"
					class="base-table__page-size"
					:class="classes.pageSize">
					<BaseSelect
						:model-value="String(localPageSize)"
						:options="pageSizeSelectOptions"
						:size-scale="props.sizeScale - 20"
						@update:model-value="handlePageSizeChange" />
				</div>
			<slot
					v-if="props.loadMode === 'pagination' && localPageSize && totalPages > 1"
					name="pagination"
					:current-page="currentPage"
					:total-pages="totalPages"
					:visible-pages="visiblePages"
					:page-size="localPageSize"
					:page-size-options="props.pageSizeOptions"
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
						:size-scale="props.sizeScale - 20" />
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
import { toHTMLElement } from '@utils/domUtils'
import { calcRowNumber } from '@utils/tableUtils'
import { computed, provide, useSlots, watch } from 'vue'

import { UI_EMPTY_TEXT, UI_LOAD_MORE_TEXT, UI_LOADING_TEXT } from '@constants'
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

const props = withDefaults(defineProps<BaseTableProps>(), {
	variant: 'default',
	isLoading: false,
	emptyText: UI_EMPTY_TEXT,
	height: '',
	isSelectable: false,
	hasSearch: false,
	hasFilters: false,
	pageSize: 0,
	pageSizeOptions: () => [],
	loadMode: 'pagination',
	searchDebounce: TABLE_SEARCH_DEBOUNCE_MS,
	isMultiSort: false,
	hasColumnSettings: false,
	hasRowNumber: false,
	hasPageSizeSelector: false,
	isResizable: false,
	sizeScale: 100,
	padding: 10,
})

const slots = useSlots()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-table',
	getVariant: () => props.variant,
	getSizeScale: () => props.sizeScale,
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

const { paddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--tbl-pad', defaultPadding: 10 })

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
	isResizable: () => props.isResizable,
	hasRowNumber: () => props.hasRowNumber,
	isSelectable: () => props.isSelectable,
	pageSize: () => props.pageSize,
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
	loadMode: () => props.loadMode,
	pageSize: computed(() => props.pageSize),
	isMultiSort: () => props.isMultiSort,
	searchDebounce: () => props.searchDebounce,
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
	hasSearch: () => props.hasSearch,
	hasFilters: () => props.hasFilters,
	hasColumnSettings: () => props.hasColumnSettings,
	slots,
	addFilter,
	removeFilter,
})

watch(currentPage, newPage => {
	emit('page-change', newPage)
})

const pageSizeSelectOptions = computed(() => {
	return props.pageSizeOptions.map(size => ({
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
		loadMode: props.loadMode,
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
	if (props.loadMode !== 'infinite' || !hasMoreRows.value || props.isLoading) return

	const target = toHTMLElement(e.target)
	if (!target) return
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
