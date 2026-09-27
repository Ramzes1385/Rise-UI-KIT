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
				:columns="localColumns"
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

			<!-- Область таблицы: подложка загрузки перекрывает только её, а не тулбар и подвал -->
			<div class="base-table__content">
				<!-- Область с прокруткой получает tabindex, только когда прокручивается: иначе её нельзя прокрутить с клавиатуры -->
				<div
					ref="tableWrapperRef"
					class="base-table__wrapper"
					:class="[classes.wrapper, { 'base-table__wrapper--loading': isLoading && rows.length }]"
					:style="height ? { maxHeight: height } : undefined"
					:tabindex="isScrollable ? 0 : undefined"
					@scroll="handleScroll">
					<table
						class="base-table__table"
						:class="[classes.table, { 'base-table__table--fixed': useFixedLayout }]"
						:aria-busy="isLoading ? 'true' : undefined">
						<colgroup>
							<col v-if="isSelectable" class="base-table__col base-table__col--check" />
							<col v-if="hasRowNumber" class="base-table__col base-table__col--number" />
							<col v-if="hasExpandableRows" class="base-table__col base-table__col--expand" />
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
							<template v-for="column in visibleColumns" #[`header-${column.key}`]="slotProps" :key="column.key">
								<slot v-if="$slots[`header-${column.key}`]" :name="`header-${column.key}`" v-bind="slotProps"></slot>
							</template>
						</BaseTableHeader>

						<BaseTableBody
							:rows="displayedRows"
							:columns="visibleColumns"
							:empty-text="emptyText ?? UI_TEXT.EMPTY"
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
							<template #empty>
								<slot name="empty"></slot>
							</template>
							<template #expanded-content="slotProps">
								<slot name="expanded-content" v-bind="slotProps"></slot>
							</template>
						</BaseTableBody>
					</table>
				</div>

				<BaseLoader
					v-if="isLoading && rows.length"
					class="base-table__loading-overlay"
					:custom-class="classes.loadingOverlay"
					is-overlay
					has-label
					:size-scale="sizeScale" />
			</div>

			<div v-if="loadMode === 'button' && hasMoreRows" class="base-table__load-more" :class="classes.loadMore">
				<BaseButton variant="outline" :is-loading="isLoading" :is-disabled="isLoading" :size-scale="sizeScale" @click="handleLoadMore">
					{{ isLoading ? UI_TEXT.LOADING : UI_TEXT.LOAD_MORE }}
				</BaseButton>
			</div>

			<div v-if="hasPageSizeControl || hasPagination" class="base-table__footer-bar" :class="classes.footerBar">
				<div v-if="hasPageSizeControl" class="base-table__page-size" :class="classes.pageSize">
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
					<span class="base-table__pagination-info" :class="classes.paginationInfo">{{ paginationInfo }}</span>
					<BasePagination
						v-model="currentPage"
						:total="processedRows.length"
						:page-size="localPageSize"
						:max-visible="TABLE.PAGINATION_MAX_VISIBLE"
						:size-scale="sizeScale" />
				</slot>
			</div>

			<div v-if="$slots.footer" class="base-table__footer" :class="classes.footer">
				<slot name="footer"></slot>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref, useSlots } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { BaseLoader } from '@components/BaseLoader'
import { BasePagination } from '@components/BasePagination'
import { BaseSelect } from '@components/BaseSelect'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { kitDefaults } from '@composables/useDefaults'
import { useExpandTransition } from '@composables/useExpandTransition'
import { usePadding } from '@composables/usePadding'
import { useTableComposition } from '@composables/useTableComposition'
import { UI_TEXT, SIZE_SCALE_DEFAULT, DEFAULT_VARIANT, TABLE, TABLE_TEXT } from '@constants'
import '../styles/BaseTable.style.scss'
import { TABLE_EXPAND_TRANSITION_KEY } from '../model/BaseTable.types'
import BaseTableBody from './BaseTableBody.vue'
import BaseTableHeader from './BaseTableHeader.vue'
import BaseTableToolbar from './BaseTableToolbar.vue'
import type { BaseTableEmits, BaseTableProps, BaseTableSlots } from '../model/BaseTable.types'

const props = withDefaults(defineProps<BaseTableProps>(), kitDefaults('BaseTable', {
	variant: DEFAULT_VARIANT,
	isLoading: false,
	height: '',
	pageSize: 0,
	pageSizeOptions: () => [],
	loadMode: 'pagination',
	searchDebounce: TABLE.SEARCH_DEBOUNCE_MS,
	sizeScale: SIZE_SCALE_DEFAULT,
	padding: undefined,
}))

const slots = useSlots()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-table', props, [
	'root', 'body', 'header', 'toolbar', 'search', 'filters', 'settings',
	'activeFilters', 'wrapper', 'loadingOverlay', 'table', 'thead', 'tr',
	'th', 'tbody', 'td', 'loadMore', 'footerBar', 'pageSize', 'paginationInfo', 'footer',
])

const { paddingStyle: explicitPaddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--tbl-pad' })
/** Без пропа padding отступы ячеек берутся из стилей (12px 16px), inline-переменные не пишутся. */
const paddingStyle = computed(() => (props.padding === undefined ? undefined : explicitPaddingStyle.value))

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

/** Выбор размера страницы в подвале */
const hasPageSizeControl = computed(() => hasPageSizeSelector.value && props.pageSizeOptions.length > 0)

/** Пагинация в подвале: режим pagination, задан размер страницы и страниц больше одной */
const hasPagination = computed(() => props.loadMode === 'pagination' && localPageSize.value > 0 && totalPages.value > 1)

const tableWrapperRef = ref<HTMLElement | null>(null)

/**
 * Область таблицы прокручивается (задан height или таблица шире контейнера). Прокручиваемой области без фокусируемых
 * элементов нужен tabindex, иначе её не прокрутить с клавиатуры (WCAG 2.1.1, правило axe scrollable-region-focusable).
 * Постоянный tabindex добавил бы лишнюю остановку Tab, поэтому он ставится только при прокрутке. Признак пересчитывается
 * при изменении размеров области и самой таблицы (новые строки, скрытые колонки).
 */
const isScrollable = ref(false)
let scrollObserver: ResizeObserver | null = null

function updateScrollable(): void {
	const wrapper = tableWrapperRef.value
	isScrollable.value = wrapper !== null && (wrapper.scrollHeight > wrapper.clientHeight || wrapper.scrollWidth > wrapper.clientWidth)
}

onMounted(() => {
	const wrapper = tableWrapperRef.value
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
</script>
