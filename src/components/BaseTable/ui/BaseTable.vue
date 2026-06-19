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
				:settings-max-height="TABLE.SETTINGS_MAX_HEIGHT"
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
					<col v-if="isSelectable" :style="{ width: TABLE.ROW_SELECTION_WIDTH }" />
					<col v-if="hasRowNumber" :style="{ width: TABLE.ROW_NUMBER_WIDTH }" />
					<col v-if="hasExpandableRows" :style="{ width: TABLE.ROW_EXPAND_WIDTH }" />
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
						:max-visible="TABLE.PAGINATION_MAX_VISIBLE"
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
import { computed, provide, useSlots } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { BaseLoader } from '@components/BaseLoader'
import '../styles/BaseTable.style.scss'

import { BasePagination } from '@components/BasePagination'
import { BaseSelect } from '@components/BaseSelect'
import { BaseText } from '@components/BaseText'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useExpandTransition } from '@composables/useExpandTransition'
import { usePadding } from '@composables/usePadding'
import { useTableComposition } from '@composables/useTableComposition'
import { UI_TEXT, UI_SIZE, SIZE_SCALE_DEFAULT, DEFAULT_VARIANT, TABLE } from '@constants'
import { calcIconScale } from '@utils/iconUtils'
import { TABLE_EXPAND_TRANSITION_KEY } from '../model/BaseTable.types'
import BaseTableBody from './BaseTableBody.vue'
import BaseTableHeader from './BaseTableHeader.vue'
import BaseTableToolbar from './BaseTableToolbar.vue'
import type { BaseTableEmits, BaseTableProps, BaseTableSlots } from '../model/BaseTable.types'

const props = withDefaults(defineProps<BaseTableProps>(), {
	variant: DEFAULT_VARIANT,
	isLoading: false,
	emptyText: UI_TEXT.EMPTY,
	height: '',
	pageSize: 0,
	pageSizeOptions: () => [],
	loadMode: 'pagination',
	searchDebounce: TABLE.SEARCH_DEBOUNCE_MS,
	sizeScale: SIZE_SCALE_DEFAULT,
	padding: 10,
})

const slots = useSlots()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-table', props, [
	'root', 'body', 'header', 'toolbar', 'search', 'filters', 'settings',
	'activeFilters', 'wrapper', 'loadingOverlay', 'table', 'thead', 'tr',
	'th', 'tbody', 'td', 'loadMore', 'footerBar', 'pageSize', 'paginationInfo', 'footer',
])

const { paddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--tbl-pad', defaultPadding: UI_SIZE.PADDING.MD })

const expand = useExpandTransition({ duration: TABLE.EXPAND_TRANSITION_DURATION })

provide(TABLE_EXPAND_TRANSITION_KEY, {
	onExpandBeforeEnter: expand.onBeforeEnter,
	onExpandEnter: expand.onEnter,
	onExpandAfterEnter: expand.onAfterEnter,
	onCollapseBeforeLeave: expand.onBeforeLeave,
	onCollapseLeave: expand.onLeave,
	onCollapseAfterLeave: expand.onAfterLeave,
})

const emit = defineEmits<BaseTableEmits>()
defineSlots<BaseTableSlots>()

const isSelectable = computed(() => props.behavior?.selectable ?? false)
const hasSearch = computed(() => props.features?.search ?? false)
const hasFilters = computed(() => props.features?.filters ?? false)
const isMultiSort = computed(() => props.behavior?.multiSort ?? false)
const hasColumnSettings = computed(() => props.features?.columnSettings ?? false)
const hasRowNumber = computed(() => props.features?.rowNumber ?? false)
const hasPageSizeSelector = computed(() => props.features?.pageSizeSelector ?? false)
const isResizable = computed(() => props.behavior?.resizable ?? false)

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
	visibleColumns,
	columnWidths,
	useFixedLayout,
	totalCols,
	hasExpandableRows,
	skeletonRows,
	isColumnResizable,
	getColumnStyle,
	toggleColumnVisibility,
	formatCellValue,
	isAllSelected,
	isSelected,
	isExpanded,
	toggleExpand,
	handleRowClick,
	getSortDirection,
	getSortIndex,
	handleSort,
	handleSearchInput,
	getFilterLabel,
	handlePageSizeChange,
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
	pageSizeSelectOptions,
	paginationInfo,
	getRowNumber,
	toggleRow,
	toggleAll,
	handleLoadMore,
	handleScroll,
	startResize,
} = useTableComposition({
	rows: computed(() => props.rows),
	columns: computed(() => props.columns),
	loadMode: computed(() => props.loadMode),
	pageSize: computed(() => props.pageSize),
	isMultiSort,
	searchDebounce: computed(() => props.searchDebounce),
	isResizable,
	hasRowNumber,
	isSelectable,
	hasSearch,
	hasFilters,
	hasColumnSettings,
	isLoading: computed(() => props.isLoading),
	pageSizeOptions: computed(() => props.pageSizeOptions),
	infiniteScrollThreshold: TABLE.INFINITE_SCROLL_THRESHOLD,
	emit,
	slots,
})
</script>