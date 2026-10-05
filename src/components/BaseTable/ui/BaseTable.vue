<template>
	<div :class="[ui('root'), classes.root]" :style="[paddingStyle, sizeScaleStyle, variantStyle, customColorStyle]">
		<div :class="[ui('body'), variantClass, classes.body]">
			<div v-if="$slots.header" :class="[ui('header'), classes.header]">
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
				:columns="localColumns"
				:is-settings-open="isSettingsOpen"
				:export-items="exportItems"
				:is-export-open="isExportOpen"
				:size-scale="sizeScale"
				:toolbar-class="classes.toolbar"
				:search-class="classes.search"
				:filters-class="classes.filters"
				:settings-class="classes.settings"
				:export-class="classes.export"
				:active-filters-class="classes.activeFilters"
				:get-filter-label="getFilterLabel"
				@search-input="handleSearchInput"
				@update:filter-column="setFilterColumn"
				@update:filter-operator="setFilterOperator"
				@update:filter-value="filterValue = $event"
				@add-filter="handleAddFilter"
				@remove-filter="handleRemoveFilter"
				@update:is-settings-open="isSettingsOpen = $event"
				@toggle-column-visibility="toggleColumnVisibility"
				@update:is-export-open="isExportOpen = $event">
				<template #toolbar-prepend>
					<slot name="toolbar-prepend"></slot>
				</template>
				<template #toolbar-append>
					<slot name="toolbar-append"></slot>
				</template>
			</BaseTableToolbar>

			<div :class="ui('content')">
				<div
					ref="tableWrapperRef"
					:class="[ui('wrapper'), classes.wrapper, { 'base-table__wrapper--loading': isLoading && rows.length }]"
					:style="height ? { maxHeight: height } : undefined"
					:tabindex="isScrollable ? 0 : undefined"
					@scroll="handleScroll">
					<table
						:class="[
							ui('table'),
							classes.table,
							{ 'base-table__table--fixed': useFixedLayout, 'base-table__table--sticky-service': hasStickyService },
						]"
						:style="stickyServiceStyle"
						:aria-busy="isLoading ? 'true' : undefined"
						:aria-rowcount="isVirtualMode ? displayedRows.length + 1 : undefined">
						<colgroup>
							<col v-if="isSelectable" class="base-table__col base-table__col--check" />
							<col v-if="hasRowNumber" class="base-table__col base-table__col--number" />
							<col v-if="hasExpandableRows" class="base-table__col base-table__col--expand" />
							<col v-for="(column, i) in visibleColumns" :key="column.key" :style="{ width: columnWidths[i] }" />
						</colgroup>
						<BaseTableHeader
							:is-virtual="isVirtualMode"
							:columns="visibleColumns"
							:is-selectable="isSelectable"
							:has-row-number="hasRowNumber"
							:has-expandable-rows="hasExpandableRows"
							:is-all-selected="isAllSelected"
							:is-some-selected="isSomeSelected"
							:is-select-all-disabled="isSelectAllDisabled"
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
							@resize-start="startResize"
							@resize-by="resizeColumnBy">
							<template v-for="column in visibleColumns" #[`header-${column.key}`]="slotProps" :key="column.key">
								<slot v-if="$slots[`header-${column.key}`]" :name="`header-${column.key}`" v-bind="slotProps"></slot>
							</template>
						</BaseTableHeader>

						<BaseTableBody
							:rows="bodyRows"
							:is-virtual="isVirtualMode"
							:index-offset="isVirtualMode ? virtual.range.value.start : 0"
							:padding-start="virtual.paddingStart.value"
							:padding-end="virtual.paddingEnd.value"
							:columns="visibleColumns"
							:empty-text="bodyEmptyText"
							:is-filtered="isFiltered"
							:is-row-interactive="isRowInteractive"
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
							<template v-for="column in visibleColumns" #[`cell-${column.key}`]="slotProps" :key="column.key">
								<slot v-if="$slots[`cell-${column.key}`]" :name="`cell-${column.key}`" v-bind="slotProps"></slot>
							</template>
							<template #empty="slotProps">
								<slot name="empty" v-bind="slotProps"></slot>
							</template>
							<template #expanded-content="slotProps">
								<slot name="expanded-content" v-bind="slotProps"></slot>
							</template>
						</BaseTableBody>
					</table>
				</div>

				<BaseLoader
					v-if="isLoading && rows.length"
					:class="ui('loading-overlay')"
					:custom-class="classes.loadingOverlay"
					is-overlay
					has-label
					:size-scale="sizeScale" />
			</div>

			<div v-if="loadMode === 'button' && hasMoreRows" :class="[ui('load-more'), classes.loadMore]">
				<BaseButton
					variant="outline"
					:is-loading="isLoading"
					:is-disabled="isLoading"
					:size-scale="sizeScale"
					@click="handleLoadMore">
					{{ isLoading ? UI_TEXT.LOADING : UI_TEXT.LOAD_MORE }}
				</BaseButton>
			</div>

			<div v-if="hasPageSizeControl || hasPagination" :class="[ui('footer-bar'), classes.footerBar]">
				<div v-if="hasPageSizeControl" :class="[ui('page-size'), classes.pageSize]">
					<span class="base-table__page-size-label">{{ TABLE_TEXT.PAGE_SIZE }}</span>
					<BaseSelect
						class="base-table__page-size-select"
						:model-value="String(localPageSize)"
						:options="pageSizeSelectOptions"
						:size-scale="sizeScale"
						@update:model-value="handlePageSizeChange" />
				</div>
				<slot
					v-if="hasPagination"
					name="pagination"
					:current-page="currentPage"
					:total-pages="totalPages"
					:visible-pages="visiblePages"
					:page-size="localPageSize"
					:page-size-options="pageSizeOptions"
					:pagination-info="paginationInfo"
					:page-size-select-options="pageSizeSelectOptions"
					:handle-page-size-change="handlePageSizeChange">
					<span :class="[ui('pagination-info'), classes.paginationInfo]">{{ paginationInfo }}</span>
					<BasePagination
						v-model="currentPage"
						:total="processedRows.length"
						:page-size="localPageSize"
						:max-visible="paginationMaxVisible"
						:size-scale="sizeScale" />
				</slot>
			</div>

			<div v-if="$slots.footer" :class="[ui('footer'), classes.footer]">
				<slot name="footer"></slot>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseTable.style.scss'
import { BaseButton } from '@components/BaseButton'
import { BaseLoader } from '@components/BaseLoader'
import { BaseSelect } from '@components/BaseSelect'
import { useBaseTable } from '../model/useBaseTable'
import BaseTableBody from './body/BaseTableBody.vue'
import { TABLE_TEXT, UI_TEXT } from '@/locales/messages'
import BaseTableHeader from './header/BaseTableHeader.vue'
import { BasePagination } from '@components/BasePagination'
import { kitDefaults } from '@composables/base/useDefaults'
import BaseTableToolbar from './toolbar/BaseTableToolbar.vue'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseTableEmits, BaseTableExpose, BaseTableProps, BaseTableSlots } from '../types/BaseTable.types'

const props = withDefaults(
	defineProps<BaseTableProps>(),
	kitDefaults('BaseTable', {
		variant: DEFAULT_VARIANT,
		isLoading: false,
		height: '',
		pageSize: 0,
		pageSizeOptions: () => [],
		loadMode: 'pagination',
		searchDebounce: 300,
		sizeScale: SIZE_SCALE_DEFAULT,
		padding: undefined,
		isVirtual: false,
		rowHeight: 44,
		hasMore: false,
	}),
)
const emit = defineEmits<BaseTableEmits>()
defineSlots<BaseTableSlots>()

const {
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	paginationMaxVisible,
	paddingStyle,
	isSelectable,
	hasSearch,
	hasFilters,
	isMultiSort,
	hasColumnSettings,
	hasRowNumber,
	searchQuery,
	activeFilters,
	currentPage,
	localPageSize,
	processedRows,
	displayedRows,
	totalPages,
	visiblePages,
	hasMoreRows,
	localColumns,
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
	isSomeSelected,
	isSelectAllDisabled,
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
	resizeColumnBy,
	hasPageSizeControl,
	hasPagination,
	tableWrapperRef,
	isScrollable,
	isVirtualMode,
	virtual,
	bodyRows,
	hasStickyService,
	stickyServiceStyle,
	isFiltered,
	bodyEmptyText,
	isRowInteractive,
	exportItems,
	isExportOpen,
	exportData,
} = useBaseTable(props, emit)

defineExpose<BaseTableExpose>({ exportData })
</script>
