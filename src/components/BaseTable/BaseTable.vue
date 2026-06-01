<template>
	<div class="base-table" :class="classes.root" :style="[paddingStyle, sizeScaleStyle, variantStyle, customColorStyle]">
		<!-- Тело таблицы с границами -->
		<div class="base-table__body" :class="[variantClass, classes.body]">
			<!-- Слот header (внутри границ для border-radius) -->
			<div v-if="$slots.header" class="base-table__header" :class="classes.header">
				<slot name="header"></slot>
			</div>
			<!-- Панель инструментов -->
			<div
				v-if="hasSearch || hasFilters || hasColumnSettings || $slots['toolbar-prepend'] || $slots['toolbar-append']"
				class="base-table__toolbar"
				:class="classes.toolbar">
				<slot name="toolbar-prepend"></slot>
				<div v-if="hasSearch" class="base-table__search" :class="classes.search">
					<BaseInput
						:model-value="searchQuery"
						placeholder="Поиск..."
						:size-scale="sizeScale - 20"
						@update:model-value="handleSearchInput" />
				</div>
				<div v-if="hasFilters" class="base-table__filters" :class="classes.filters">
					<BaseSelect
						:model-value="filterColumn"
						:options="filterColumnOptions"
						placeholder="Колонка"
						:size-scale="sizeScale - 20"
						@update:model-value="setFilterColumn" />
					<span class="base-table__filter-sep"></span>
					<BaseSelect
						:model-value="filterOperator"
						:options="filterOperatorOptions"
						placeholder="Условие"
						:size-scale="sizeScale - 20"
						@update:model-value="setFilterOperator" />
					<span class="base-table__filter-sep"></span>
					<BaseInput
						:model-value="filterValue"
						placeholder="Значение..."
						:size-scale="sizeScale - 20"
						@update:model-value="filterValue = $event"
						@keydown.enter="handleAddFilter" />
					<BaseButton
						variant="ghost"
						:size-scale="sizeScale - 10"
						class="base-table__filter-add-btn"
						@click="handleAddFilter">
						<BaseIcon name="plus" :size-scale="sizeScale - 20" />
					</BaseButton>
				</div>

				<div v-if="hasColumnSettings" class="base-table__settings" :class="classes.settings">
					<BaseDropdown
						v-model:is-open="isSettingsOpen"
						position="bottom-end"
						panel-class="base-table__settings-panel"
						max-height="min(320px, 50vh)"
						:size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-table__settings-btn"
							:size-scale="sizeScale - 10"
							@click="isSettingsOpen = !isSettingsOpen">
							<BaseIcon name="menu" :size-scale="calcIconScale('xs', sizeScale)" />
						</BaseButton>
						<template #dropdown>
							<div v-for="col in columns" :key="col.key" class="base-table__settings-item">
								<BaseCheckbox
									:model-value="!col.isHidden"
									:label="col.label"
									:size-scale="sizeScale - 20"
									@update:model-value="toggleColumnVisibility(col)" />
							</div>
						</template>
					</BaseDropdown>
				</div>

				<!-- Активные фильтры -->
				<div v-if="activeFilters.length" class="base-table__active-filters" :class="classes.activeFilters">
					<BaseBadge
						v-for="(f, i) in activeFilters"
						:key="i"
						variant="soft"
						:size-scale="sizeScale - 10"
						class="base-table__filter-tag"
						@click="handleRemoveFilter(i)">
						{{ getFilterLabel(f) }} ×
					</BaseBadge>
				</div>
				<slot name="toolbar-append"></slot>
			</div>

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
						<col v-if="isSelectable" style="width: 40px" />
						<col v-if="hasRowNumber" style="width: 40px" />
						<col v-if="hasExpandableRows" style="width: 36px" />
						<col v-for="(col, i) in visibleColumns" :key="col.key" :style="{ width: columnWidths[i] }" />
					</colgroup>
					<thead :class="classes.thead">
						<tr :class="classes.tr">
							<th v-if="isSelectable" class="base-table__th base-table__th--check" :class="classes.th">
								<BaseCheckbox :model-value="isAllSelected" :size-scale="sizeScale" @update:model-value="toggleAll" />
							</th>
							<th v-if="hasRowNumber" class="base-table__th base-table__th--number" :class="classes.th">#</th>
							<th v-if="hasExpandableRows" class="base-table__th base-table__th--expand" :class="classes.th"></th>
							<th
								v-for="col in visibleColumns"
								:key="col.key"
								class="base-table__th"
								:class="[
									`base-table__th--${col.align || 'left'}`,
									{
										'base-table__th--sortable': col.isSortable,
										'base-table__th--sorted': getSortDirection(col.key),
										'base-table__th--resizable': isColResizable(col),
									},
									col.isSticky ? `base-table__th--sticky-${col.isSticky}` : '',
									classes.th,
								]"
								:style="getColStyle(col)"
								@click="handleSort(col)">
								<slot :name="`header-${col.key}`" :column="col">
									<div class="base-table__th-content">
										<BaseTooltip v-if="col.isSortable" text="Сортировать" position="top" :size-scale="sizeScale">
											<BaseText tag="span" class="base-table__th-label">{{ col.label }}</BaseText>
										</BaseTooltip>
										<BaseText v-else tag="span" class="base-table__th-label">{{ col.label }}</BaseText>
										<span v-if="col.isSortable" class="base-table__sort-icon">
											<BaseIcon
												v-if="getSortDirection(col.key) === 'asc'"
												name="chevron-up"
												:size-scale="calcIconScale('xs', sizeScale)" />
											<BaseIcon
												v-else-if="getSortDirection(col.key) === 'desc'"
												name="chevron-down"
												:size-scale="calcIconScale('xs', sizeScale)" />
											<BaseIcon v-else name="sort" :size-scale="calcIconScale('xs', sizeScale)" />
											<span v-if="isMultiSort && getSortIndex(col.key) > 0" class="base-table__sort-index">
												{{ getSortIndex(col.key) }}
											</span>
										</span>
									</div>
								</slot>
								<div
									v-if="isColResizable(col)"
									class="base-table__resizer"
									@mousedown.stop="startResize($event, col)"
									@click.stop></div>
							</th>
						</tr>
					</thead>

					<tbody :class="classes.tbody">
						<!-- Загрузка (скелетон) -->
						<template v-if="isLoading && !rows.length">
							<tr v-for="s in skeletonRows" :key="s" :class="classes.tr">
								<td v-if="isSelectable" class="base-table__td base-table__td--check" :class="classes.td">
									<BaseSkeleton shape="circle" width="16px" height="16px" :size-scale="sizeScale" />
								</td>
								<td v-if="hasRowNumber" class="base-table__td base-table__td--number" :class="classes.td">
									<BaseSkeleton shape="text" width="20px" :size-scale="sizeScale" />
								</td>
								<td v-for="col in visibleColumns" :key="col.key" class="base-table__td" :class="classes.td">
									<BaseSkeleton shape="text" :width="col.width || '80%'" :size-scale="sizeScale" />
								</td>
							</tr>
						</template>

						<!-- Пусто -->
						<tr v-else-if="!isLoading && processedRows.length === 0" :class="classes.tr">
							<td :colspan="totalCols" class="base-table__td base-table__td--empty" :class="classes.td">
								<slot name="empty">
									<BaseText tag="span" class="base-table__empty-text">{{ emptyText }}</BaseText>
								</slot>
							</td>
						</tr>

						<!-- Строки -->
						<template v-else>
							<template v-for="(row, index) in displayedRows" :key="row.id">
								<tr
									class="base-table__tr"
									:class="[
										{
											'base-table__tr--selected': row.isSelected,
											'base-table__tr--disabled': row.isDisabled,
											'base-table__tr--expandable': row.isExpandable || row.children?.length,
										},
										row.rowClass,
										classes.tr,
									]"
									@click="handleRowClick(row)">
									<td v-if="isSelectable" class="base-table__td base-table__td--check" :class="classes.td" @click.stop>
										<BaseCheckbox
											:model-value="!!row.isSelected"
											:is-disabled="!!row.isDisabled"
											:size-scale="sizeScale"
											@update:model-value="toggleRow(row)" />
									</td>
									<td v-if="hasRowNumber" class="base-table__td base-table__td--number" :class="classes.td">
										{{ getRowNumber(index) }}
									</td>
									<td v-if="hasExpandableRows" class="base-table__td base-table__td--expand" :class="classes.td">
										<BaseButton
											v-if="row.isExpandable || row.children?.length"
											variant="ghost"
											:padding="0"
											class="base-table__expand-btn"
											:class="{ 'base-table__expand-btn--open': row.isExpanded }"
											:size-scale="sizeScale"
											@click.stop="toggleExpand(row)">
											<BaseIcon
												name="chevron-right"
												:size-scale="calcIconScale('xs', sizeScale)"
												:rotate="row.isExpanded ? 90 : 0" />
										</BaseButton>
									</td>
									<td
										v-for="col in visibleColumns"
										:key="col.key"
										class="base-table__td"
										:class="[
											`base-table__td--${col.align || 'left'}`,
											col.isSticky ? `base-table__td--sticky-${col.isSticky}` : '',
											col.cellClass,
											classes.td,
										]"
										:style="getColStyle(col)">
										<slot :name="`cell-${col.key}`" :row="row" :value="row.data[col.key]" :column="col" :index="index">
											{{ formatCellValue(col, row) }}
										</slot>
									</td>
								</tr>

								<!-- Дочерние строки или вложенная таблица -->
								<!-- Вложенная таблица -->
								<tr
									v-if="nestedConfig && row.children?.length"
									class="base-table__tr base-table__tr--nested"
									:class="classes.tr">
									<td :colspan="totalCols" class="base-table__td base-table__td--nested" :class="classes.td">
										<Transition
											@before-enter="onBeforeExpand"
											@enter="onExpand"
											@after-enter="onAfterExpand"
											@before-leave="onBeforeCollapse"
											@leave="onCollapse"
											@after-leave="onAfterCollapse">
											<div v-if="row.isExpanded" class="base-table__nested-wrapper">
												<BaseText v-if="nestedConfig.title" tag="h4" class="base-table__nested-title">{{
													nestedConfig.title
												}}</BaseText>
												<BaseTable
													:columns="nestedConfig.columns"
													:rows="row.children"
													variant="bordered"
													:size-scale="sizeScale" />
											</div>
										</Transition>
									</td>
								</tr>
								<!-- Обычные дочерние строки -->
								<template v-else-if="row.children?.length && row.isExpanded">
									<tr
										v-for="child in row.children"
										:key="`${row.id}-${child.id}`"
										class="base-table__tr base-table__tr--child"
										:class="classes.tr">
										<!-- istanbul ignore next -- Пустые служебные ячейки не несут поведения. -->
										<td v-if="isSelectable" class="base-table__td base-table__td--check" :class="classes.td"></td>
										<!-- istanbul ignore next -- Пустые служебные ячейки не несут поведения. -->
										<td v-if="hasRowNumber" class="base-table__td base-table__td--number" :class="classes.td"></td>
										<td class="base-table__td base-table__td--expand" :class="classes.td"></td>
										<td
											v-for="col in visibleColumns"
											:key="`child-${col.key}`"
											class="base-table__td"
											:class="[`base-table__td--${col.align || 'left'}`, col.cellClass, classes.td]"
											:style="getColStyle(col)">
											<slot :name="`cell-${col.key}`" :row="child" :value="child.data[col.key]" :column="col">
												{{ formatCellValue(col, child) }}
											</slot>
										</td>
									</tr>
								</template>
								<!-- Слот для кастомного контента раскрытой строки -->
								<tr
									v-else-if="row.isExpandable"
									class="base-table__tr base-table__tr--expanded-content"
									:class="classes.tr">
									<td :colspan="totalCols" class="base-table__td base-table__td--expanded" :class="classes.td">
										<Transition
											@before-enter="onBeforeExpand"
											@enter="onExpand"
											@after-enter="onAfterExpand"
											@before-leave="onBeforeCollapse"
											@leave="onCollapse"
											@after-leave="onAfterCollapse">
											<div v-if="row.isExpanded" class="base-table__expanded-wrapper">
												<slot name="expanded-content" :row="row"></slot>
											</div>
										</Transition>
									</td>
								</tr>
							</template>
						</template>

						<!-- Индикатор подгрузки (infinite scroll) -->
						<tr v-if="isLoading && processedRows.length && loadMode === 'infinite'" :class="classes.tr">
							<td :colspan="totalCols" class="base-table__td base-table__td--loading-more" :class="classes.td">
								<BaseLoader variant="spinner" :size-scale="calcIconScale('xs', sizeScale)" has-label />
							</td>
						</tr>
					</tbody>
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
						:max-visible="4"
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
import type { BaseTableEmits, BaseTableProps, TableColumn, TableRow } from './BaseTable.types'

import './BaseTable.style.scss'

import { BaseBadge } from '@components/BaseBadge'
import { BaseButton } from '@components/BaseButton'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { BaseDropdown } from '@components/BaseDropdown'
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { BaseLoader } from '@components/BaseLoader'
import { BasePagination } from '@components/BasePagination'
import { BaseSelect } from '@components/BaseSelect'
import { BaseSkeleton } from '@components/BaseSkeleton'
import { BaseText } from '@components/BaseText'
import { BaseTooltip } from '@components/BaseTooltip'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { usePadding } from '@composables/usePadding'
import { useSizeScale } from '@composables/useSizeScale'
import { useTableData } from '@composables/useTableData'
import { useVariant } from '@composables/useVariant'
import { calcPageInfo } from '@utils/paginationUtils'
import { calcColumnWidths, calcRowNumber, calcTotalColumns, getColumnStyle } from '@utils/tableUtils'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(defineProps<BaseTableProps>(), {
	variant: 'default',
	isLoading: false,
	emptyText: 'Нет данных',
	height: '',
	isSelectable: false,
	hasSearch: false,
	hasFilters: false,
	pageSize: 0,
	pageSizeOptions: () => [],
	loadMode: 'pagination',
	searchDebounce: 300,
	isMultiSort: false,
	hasColumnSettings: false,
	hasRowNumber: false,
	hasPageSizeSelector: false,
	isResizable: false,
	sizeScale: 100,
	padding: 10,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-table', getVariant: () => props.variant })
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

const { paddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--tbl-pad', defaultPadding: 10 })

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
	return props.pageSize || 5
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
	return calcTotalColumns(visibleColumns.value.length, props.isSelectable, props.hasRowNumber, hasExpandableRows.value)
})

/** Колонка ресайзимая: пропс таблицы или флаг колонки */
function isColResizable(col: TableColumn): boolean {
	return props.isResizable || !!col.isResizable
}

/** Использовать фиксированный layout */
const useFixedLayout = computed((): boolean => {
	return props.isResizable || visibleColumns.value.some(col => col.flex || col.width)
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
	isAllSelected,
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

/** Эмит page-change при смене страницы */
watch(currentPage, newPage => {
	emit('page-change', newPage)
})

/** Опции селекта размера страницы */
const pageSizeSelectOptions = computed(() => {
	return props.pageSizeOptions.map(size => ({
		value: String(size),
		label: String(size),
	}))
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

// ============================================================
// Состояние ресайза
// ============================================================

const resizeState = ref<{
	isResizing: boolean
	columnKey: string
	nextColumnKey: string
	startX: number
	startWidth: number
	nextStartWidth: number
}>({
	isResizing: false,
	columnKey: '',
	nextColumnKey: '',
	startX: 0,
	startWidth: 0,
	nextStartWidth: 0,
})

/** Получить номер строки */
function getRowNumber(index: number): number {
	return calcRowNumber({
		index,
		currentPage: currentPage.value,
		pageSize: localPageSize.value,
		loadMode: props.loadMode,
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
	row.isSelected = !row.isSelected
	emit(
		'select',
		props.rows.filter(r => r.isSelected),
	)
}

/** Выбрать все */
function toggleAll(): void {
	const shouldSelect = !isAllSelected.value
	props.rows.forEach(r => {
		if (!r.isDisabled) r.isSelected = shouldSelect
	})
	emit(
		'select',
		props.rows.filter(r => r.isSelected),
	)
}

/** Раскрыть строку */
function toggleExpand(row: TableRow): void {
	row.isExpanded = !row.isExpanded
	emit('expand', row)
}

/** Плавное раскрытие — beforeEnter */
function onBeforeExpand(el: Element): void {
	const htmlEl = el as HTMLElement
	htmlEl.style.height = '0'
	htmlEl.style.overflow = 'hidden'
	htmlEl.style.opacity = '0'
}

/** Плавное раскрытие — enter */
function onExpand(el: Element, done: () => void): void {
	const htmlEl = el as HTMLElement
	const height = htmlEl.scrollHeight
	htmlEl.style.transition = 'height 0.3s ease, opacity 0.3s ease'
	requestAnimationFrame(() => {
		htmlEl.style.height = `${height}px`
		htmlEl.style.opacity = '1'
	})
	function onEnd(): void {
		htmlEl.style.height = ''
		htmlEl.style.overflow = ''
		htmlEl.style.opacity = ''
		htmlEl.style.transition = ''
		htmlEl.removeEventListener('transitionend', onEnd)
		done()
	}
	htmlEl.addEventListener('transitionend', onEnd)
}

/** Плавное раскрытие — afterEnter */
function onAfterExpand(el: Element): void {
	const htmlEl = el as HTMLElement
	htmlEl.style.height = ''
	htmlEl.style.overflow = ''
	htmlEl.style.opacity = ''
	htmlEl.style.transition = ''
}

/** Плавное сворачивание — beforeLeave */
function onBeforeCollapse(el: Element): void {
	const htmlEl = el as HTMLElement
	htmlEl.style.height = `${htmlEl.scrollHeight}px`
	htmlEl.style.overflow = 'hidden'
}

/** Плавное сворачивание — leave */
function onCollapse(el: Element, done: () => void): void {
	const htmlEl = el as HTMLElement
	htmlEl.style.transition = 'height 0.3s ease, opacity 0.3s ease'
	requestAnimationFrame(() => {
		htmlEl.style.height = '0'
		htmlEl.style.opacity = '0'
	})
	function onEnd(): void {
		htmlEl.style.height = ''
		htmlEl.style.overflow = ''
		htmlEl.style.opacity = ''
		htmlEl.style.transition = ''
		htmlEl.removeEventListener('transitionend', onEnd)
		done()
	}
	htmlEl.addEventListener('transitionend', onEnd)
}

/** Плавное сворачивание — afterLeave */
function onAfterCollapse(el: Element): void {
	const htmlEl = el as HTMLElement
	htmlEl.style.height = ''
	htmlEl.style.overflow = ''
	htmlEl.style.opacity = ''
	htmlEl.style.transition = ''
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
	if (props.loadMode !== 'infinite' || !hasMoreRows.value || props.isLoading) return

	const target = e.target as HTMLElement
	const { scrollTop, scrollHeight, clientHeight } = target

	if (scrollHeight - scrollTop - clientHeight < 50) {
		handleLoadMore()
	}
}

/** Минимальная ширина колонки при ресайзе */
const MIN_COL_WIDTH = 50

/**
 * Найти соседнюю колонку для компенсации при ресайзе.
 * Для всех кроме последней — следующая, для последней — предыдущая.
 */
function findSiblingCol(col: TableColumn): { key: string; th: HTMLElement | null } {
	const visibleKeys = visibleColumns.value.map(c => c.key)
	const visibleIndex = visibleKeys.indexOf(col.key)

	/** Для последней колонки берём предыдущую */
	if (visibleIndex === visibleKeys.length - 1 && visibleIndex > 0) {
		return { key: visibleKeys[visibleIndex - 1], th: null }
	}

	/** Для остальных — следующую */
	if (visibleIndex < visibleKeys.length - 1) {
		return { key: visibleKeys[visibleIndex + 1], th: null }
	}

	return { key: '', th: null }
}

/** Ресайз колонок */
function startResize(e: MouseEvent, col: TableColumn): void {
	const th = (e.target as HTMLElement).closest('th') as HTMLElement | null
	/* istanbul ignore next -- defensive: resize-handle всегда внутри th */
	if (!th) return

	const sibling = findSiblingCol(col)

	/** Ширина соседней колонки из DOM */
	let siblingWidth = 0
	if (sibling.key) {
		const visibleKeys = visibleColumns.value.map(c => c.key)
		const visibleIndex = visibleKeys.indexOf(col.key)
		const isLast = visibleIndex === visibleKeys.length - 1
		const siblingTh = isLast ? th.previousElementSibling : th.nextElementSibling
		/* istanbul ignore next -- defensive `: 0`: соседний th существует при наличии sibling.key */
		siblingWidth = siblingTh ? (siblingTh as HTMLElement).offsetWidth : 0
	}

	resizeState.value = {
		isResizing: true,
		columnKey: col.key,
		nextColumnKey: sibling.key,
		startX: e.pageX,
		startWidth: th.offsetWidth,
		nextStartWidth: siblingWidth,
	}

	document.addEventListener('mousemove', handleMouseMove)
	document.addEventListener('mouseup', stopResize)
	document.body.style.cursor = 'col-resize'
	document.body.style.userSelect = 'none'
}

function handleMouseMove(e: MouseEvent): void {
	/* istanbul ignore next -- Защитный выход без активного resize. */
	if (!resizeState.value.isResizing) return

	const diff = e.pageX - resizeState.value.startX
	const newWidth = Math.max(MIN_COL_WIDTH, resizeState.value.startWidth + diff)

	/** Ограничение: не шире чем текущая + соседняя - минимум */
	const hasSibling = resizeState.value.nextColumnKey && resizeState.value.nextStartWidth > 0
	const maxWidth = hasSibling
		? resizeState.value.startWidth + resizeState.value.nextStartWidth - MIN_COL_WIDTH
		: Infinity
	const clampedWidth = Math.min(newWidth, maxWidth)

	const colIndex = localColumns.value.findIndex(c => c.key === resizeState.value.columnKey)
	/* istanbul ignore else -- Колонка может исчезнуть только при внешнем обновлении во время resize. */
	if (colIndex !== -1) {
		localColumns.value[colIndex].width = `${clampedWidth}px`
	}

	/** Компенсация: изменить соседнюю колонку */
	if (hasSibling) {
		const actualDiff = clampedWidth - resizeState.value.startWidth
		const siblingWidth = Math.max(MIN_COL_WIDTH, resizeState.value.nextStartWidth - actualDiff)
		const siblingIndex = localColumns.value.findIndex(c => c.key === resizeState.value.nextColumnKey)
		/* istanbul ignore else -- Соседняя колонка синхронизируется с видимыми колонками. */
		if (siblingIndex !== -1) {
			localColumns.value[siblingIndex].width = `${siblingWidth}px`
		}
	}
}

function stopResize(): void {
	/* istanbul ignore next -- Защитный выход при повторном завершении resize. */
	if (!resizeState.value.isResizing) return

	resizeState.value.isResizing = false
	document.removeEventListener('mousemove', handleMouseMove)
	document.removeEventListener('mouseup', stopResize)
	document.body.style.cursor = ''
	document.body.style.userSelect = ''

	const col = localColumns.value.find(c => c.key === resizeState.value.columnKey)
	/* istanbul ignore else -- Колонка существует для пользовательского resize. */
	if (col) {
		emit('column-resize', col.key, parseInt(col.width || '0'))
		emit('columns-change', localColumns.value)
	}
}

/** Очистка слушателей */
onBeforeUnmount(() => {
	document.removeEventListener('mousemove', handleMouseMove)
	document.removeEventListener('mouseup', stopResize)
})

/** Сброс страницы при изменении данных */
watch(
	() => props.rows,
	() => {
		resetPage()
	},
)
</script>
