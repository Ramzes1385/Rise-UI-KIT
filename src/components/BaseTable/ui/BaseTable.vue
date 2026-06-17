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
					{{ isLoading ? UI_TEXT.LOADING : UI_TEXT.LOAD_MORE }}
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
import { computed, provide, useSlots, watch } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { calcIconScale } from '@components/BaseIcon'
import '../styles/BaseTable.style.scss'

import { BaseLoader } from '@components/BaseLoader'
import { BasePagination } from '@components/BasePagination'
import { BaseSelect } from '@components/BaseSelect'
import { BaseText } from '@components/BaseText'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useColumnResize } from '@composables/useColumnResize/useColumnResize'
import { useExpandTransition } from '@composables/useExpandTransition'
import { usePadding } from '@composables/usePadding'
import { useTableData } from '@composables/useTableData'
import { useTableSelection } from '@composables/useTableSelection'
import { UI_TEXT, SIZE_SCALE_DEFAULT, DEFAULT_VARIANT} from '@constants'
import { toHTMLElement } from '@utils/domUtils'
import { calcPageInfo } from '@utils/paginationUtils'
import { calcRowNumber } from '@utils/tableUtils'
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
import { TABLE_EXPAND_TRANSITION_KEY } from '../model/BaseTable.types'
import { useTableColumns } from '../model/useTableColumns'
import { useTableExpand } from '../model/useTableExpand'
import { useTableToolbar } from '../model/useTableToolbar'
import BaseTableBody from './BaseTableBody.vue'
import BaseTableHeader from './BaseTableHeader.vue'
import BaseTableToolbar from './BaseTableToolbar.vue'
import type { BaseTableEmits, BaseTableProps, TableColumn, TableRow } from '../model/BaseTable.types'

const props = withDefaults(defineProps<BaseTableProps>(), {
	variant: DEFAULT_VARIANT,
	isLoading: false,
	emptyText: UI_TEXT.EMPTY,
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
	sizeScale: SIZE_SCALE_DEFAULT,
	padding: 10,
})

const slots = useSlots()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-table', props, [
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
	])

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
