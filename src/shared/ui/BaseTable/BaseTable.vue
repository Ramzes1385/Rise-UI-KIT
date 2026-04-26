<template>
	<div class="base-table" :style="[paddingStyle, sizeScaleStyle, variantStyle, customColorStyle]">
		<!-- Слот header (за пределами границ) -->
		<slot name="header"></slot>

		<!-- Тело таблицы с границами -->
		<div class="base-table__body" :class="variantClass">
			<!-- Панель инструментов -->
			<div
				v-if="hasSearch || hasFilters || hasColumnSettings || $slots['toolbar-prepend'] || $slots['toolbar-append']"
				class="base-table__toolbar">
				<slot name="toolbar-prepend"></slot>
				<div v-if="hasSearch" class="base-table__search">
					<BaseInput
						:model-value="searchQuery"
						placeholder="Поиск..."
						size="sm"
						variant="outline"
						:size-scale="sizeScale - 20"
						@update:model-value="handleSearchInput" />
				</div>
				<div v-if="hasFilters" class="base-table__filters">
					<BaseSelect
						:model-value="filterColumn"
						:options="filterColumnOptions"
						placeholder="Колонка"
						variant="outline"
						size="xs"
						:size-scale="sizeScale - 20"
						@update:model-value="filterColumn = $event" />
					<span class="base-table__filter-sep"></span>
					<BaseSelect
						:model-value="filterOperator"
						:options="filterOperatorOptions"
						placeholder="Условие"
						variant="outline"
						size="xs"
						:size-scale="sizeScale - 20"
						@update:model-value="filterOperator = $event as string" />
					<span class="base-table__filter-sep"></span>
					<BaseInput
						:model-value="filterValue"
						placeholder="Значение..."
						size="xs"
						variant="outline"
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

				<div v-if="hasColumnSettings" class="base-table__settings">
					<BaseDropdown :is-open="isSettingsOpen" :size-scale="sizeScale" @close="isSettingsOpen = false">
						<BaseButton
							variant="ghost"
							class="base-table__settings-btn"
							:size-scale="sizeScale - 10"
							@click="isSettingsOpen = !isSettingsOpen">
							<BaseIcon name="menu" size="xs" :size-scale="sizeScale" />
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
				<div v-if="activeFilters.length" class="base-table__active-filters">
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
				:class="{ 'base-table__wrapper--loading': isLoading && rows.length }"
				:style="height ? { maxHeight: height } : undefined"
				@scroll="handleScroll"
				ref="tableWrapperRef">
				<!-- Оверлей загрузки -->
				<div v-if="isLoading && rows.length" class="base-table__loading-overlay">
					<BaseLoader variant="spinner" size="sm" :size-scale="sizeScale" has-label />
				</div>
				<table class="base-table__table" :class="{ 'base-table__table--fixed': useFixedLayout }">
					<colgroup>
						<col v-if="isSelectable" style="width: 40px" />
						<col v-if="hasRowNumber" style="width: 40px" />
						<col v-if="hasExpandableRows" style="width: 36px" />
						<col v-for="(w, i) in columnWidths" :key="i" :style="{ width: w }" />
					</colgroup>
					<thead>
						<tr>
							<th v-if="isSelectable" class="base-table__th base-table__th--check">
								<BaseCheckbox :model-value="isAllSelected" :size-scale="sizeScale" @update:model-value="toggleAll" />
							</th>
							<th v-if="hasRowNumber" class="base-table__th base-table__th--number">#</th>
							<th v-if="hasExpandableRows" class="base-table__th base-table__th--expand"></th>
							<th
								v-for="col in visibleColumns"
								:key="col.key"
								class="base-table__th"
								:class="[
									`base-table__th--${col.align || 'left'}`,
									{
										'base-table__th--sortable': col.isSortable,
										'base-table__th--sorted': getSortDirection(col.key),
										'base-table__th--resizable': col.isResizable,
									},
									col.isSticky ? `base-table__th--sticky-${col.isSticky}` : '',
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
												size="xs"
												:size-scale="sizeScale" />
											<BaseIcon
												v-else-if="getSortDirection(col.key) === 'desc'"
												name="chevron-down"
												size="xs"
												:size-scale="sizeScale" />
											<BaseIcon v-else name="sort" size="xs" :size-scale="sizeScale" />
											<span v-if="isMultiSort && getSortIndex(col.key) > 0" class="base-table__sort-index">
												{{ getSortIndex(col.key) }}
											</span>
										</span>
									</div>
								</slot>
								<div
									v-if="col.isResizable"
									class="base-table__resizer"
									@mousedown.stop="startResize($event, col)"
									@click.stop></div>
							</th>
						</tr>
					</thead>

					<tbody>
						<!-- Загрузка (скелетон) -->
						<template v-if="isLoading && !rows.length">
							<tr v-for="s in skeletonRows" :key="s">
								<td v-if="isSelectable" class="base-table__td base-table__td--check">
									<BaseSkeleton shape="circle" width="16px" height="16px" :size-scale="sizeScale" />
								</td>
								<td v-if="hasRowNumber" class="base-table__td base-table__td--number">
									<BaseSkeleton shape="text" width="20px" :size-scale="sizeScale" />
								</td>
								<td v-if="hasExpandableRows" class="base-table__td base-table__td--expand"></td>
								<td v-for="col in visibleColumns" :key="col.key" class="base-table__td">
									<BaseSkeleton shape="text" :width="col.width || '80%'" :size-scale="sizeScale" />
								</td>
							</tr>
						</template>

						<!-- Пусто -->
						<tr v-else-if="!isLoading && processedRows.length === 0">
							<td :colspan="totalCols" class="base-table__td base-table__td--empty">
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
									]"
									@click="handleRowClick(row)">
									<td v-if="isSelectable" class="base-table__td base-table__td--check" @click.stop>
										<BaseCheckbox
											:model-value="!!row.isSelected"
											:is-disabled="!!row.isDisabled"
											:size-scale="sizeScale"
											@update:model-value="toggleRow(row)" />
									</td>
									<td v-if="hasRowNumber" class="base-table__td base-table__td--number">
										{{ getRowNumber(index) }}
									</td>
									<td v-if="hasExpandableRows" class="base-table__td base-table__td--expand">
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
												size="xs"
												:size-scale="sizeScale"
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
										]"
										:style="getColStyle(col)">
										<slot :name="`cell-${col.key}`" :row="row" :value="row.data[col.key]" :column="col" :index="index">
											{{ formatCellValue(col, row) }}
										</slot>
									</td>
								</tr>

								<!-- Дочерние строки или вложенная таблица -->
								<!-- Вложенная таблица -->
								<tr v-if="nestedConfig && row.children?.length" class="base-table__tr base-table__tr--nested">
									<td :colspan="totalCols" class="base-table__td base-table__td--nested">
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
										class="base-table__tr base-table__tr--child">
										<td v-if="isSelectable" class="base-table__td base-table__td--check"></td>
										<td v-if="hasRowNumber" class="base-table__td base-table__td--number"></td>
										<td class="base-table__td base-table__td--expand"></td>
										<td
											v-for="col in visibleColumns"
											:key="`child-${col.key}`"
											class="base-table__td"
											:class="[`base-table__td--${col.align || 'left'}`, col.cellClass]"
											:style="getColStyle(col)">
											<slot :name="`cell-${col.key}`" :row="child" :value="child.data[col.key]" :column="col">
												{{ formatCellValue(col, child) }}
											</slot>
										</td>
									</tr>
								</template>
								<!-- Слот для кастомного контента раскрытой строки -->
								<tr v-else-if="row.isExpandable" class="base-table__tr base-table__tr--expanded-content">
									<td :colspan="totalCols" class="base-table__td base-table__td--expanded">
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
						<tr v-if="isLoading && processedRows.length && loadMode === 'infinite'">
							<td :colspan="totalCols" class="base-table__td base-table__td--loading-more">
								<BaseLoader variant="spinner" size="xs" :size-scale="sizeScale" has-label />
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- Кнопка "Загрузить еще" -->
			<div v-if="loadMode === 'button' && hasMoreRows" class="base-table__load-more">
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
				class="base-table__footer-bar">
				<!-- Селектор размера страницы — всегда слева -->
				<div v-if="hasPageSizeSelector && pageSizeOptions.length" class="base-table__page-size">
					<BaseSelect
						:model-value="String(localPageSize)"
						:options="pageSizeSelectOptions"
						variant="outline"
						size="xs"
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
					<BaseText tag="span" class="base-table__pagination-info">
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
		</div>

		<!-- Слот footer (за пределами границ) -->
		<slot name="footer"></slot>
	</div>
</template>

<script setup lang="ts">
import type { BaseTableEmits, BaseTableProps, TableColumn, TableRow } from './BaseTable.types'

import './BaseTable.style.scss'

import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useTableData } from '@/shared/composables/useTableData'
import { useVariant } from '@/shared/composables/useVariant'
import { BaseBadge } from '@/shared/ui/BaseBadge'
import { BaseButton } from '@/shared/ui/BaseButton'
import { BaseCheckbox } from '@/shared/ui/BaseCheckbox'
import { BaseDropdown } from '@/shared/ui/BaseDropdown'
import BaseIcon from '@/shared/ui/BaseIcon/BaseIcon.vue'
import { BaseInput } from '@/shared/ui/BaseInput'
import { BaseLoader } from '@/shared/ui/BaseLoader'
import { BasePagination } from '@/shared/ui/BasePagination'
import { BaseSelect } from '@/shared/ui/BaseSelect'
import { BaseSkeleton } from '@/shared/ui/BaseSkeleton'
import BaseText from '@/shared/ui/BaseText/BaseText.vue'
import { BaseTooltip } from '@/shared/ui/BaseTooltip'
import { calcPageInfo } from '@/shared/utils/paginationUtils'
import { calcColumnWidths, calcRowNumber, calcTotalColumns, getColumnStyle } from '@/shared/utils/tableUtils'
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
	sizeScale: 100,
	padding: 10,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-table', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

/** Стиль padding ячеек: Y = значение, X = значение × 2 */
const paddingStyle = computed(() => ({
	'--tbl-pad-y': `${props.padding}px`,
	'--tbl-pad-x': `${props.padding * 2}px`,
}))

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

/** Использовать фиксированный layout */
const useFixedLayout = computed((): boolean => {
	return visibleColumns.value.some(col => col.flex || col.width)
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
	startX: number
	startWidth: number
}>({
	isResizing: false,
	columnKey: '',
	startX: 0,
	startWidth: 0,
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

/** Ресайз колонок */
function startResize(e: MouseEvent, col: TableColumn): void {
	const th = (e.target as HTMLElement).closest('th')
	if (!th) return

	resizeState.value = {
		isResizing: true,
		columnKey: col.key,
		startX: e.pageX,
		startWidth: th.offsetWidth,
	}

	document.addEventListener('mousemove', handleMouseMove)
	document.addEventListener('mouseup', stopResize)
	document.body.style.cursor = 'col-resize'
	document.body.style.userSelect = 'none'
}

function handleMouseMove(e: MouseEvent): void {
	if (!resizeState.value.isResizing) return

	const diff = e.pageX - resizeState.value.startX
	const newWidth = Math.max(50, resizeState.value.startWidth + diff)

	const colIndex = localColumns.value.findIndex(c => c.key === resizeState.value.columnKey)
	if (colIndex !== -1) {
		localColumns.value[colIndex].width = `${newWidth}px`
	}
}

function stopResize(): void {
	if (!resizeState.value.isResizing) return

	resizeState.value.isResizing = false
	document.removeEventListener('mousemove', handleMouseMove)
	document.removeEventListener('mouseup', stopResize)
	document.body.style.cursor = ''
	document.body.style.userSelect = ''

	const col = localColumns.value.find(c => c.key === resizeState.value.columnKey)
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
