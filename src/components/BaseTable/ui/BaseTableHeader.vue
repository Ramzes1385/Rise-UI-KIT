<template>
	<thead class="base-table__thead" :class="theadClass">
		<tr :class="trClass" :aria-rowindex="isVirtual ? 1 : undefined">
			<th v-if="isSelectable" class="base-table__th base-table__th--check" :class="thClass">
				<BaseCheckbox
					:model-value="isAllSelected"
					:label="TABLE_TEXT.SELECT_ALL"
					:custom-class="HIDDEN_CHECKBOX_LABEL"
					:size-scale="sizeScale"
					@update:model-value="emit('toggle-all')" />
			</th>
			<th v-if="hasRowNumber" class="base-table__th base-table__th--number" :class="thClass">#</th>
			<th v-if="hasExpandableRows" class="base-table__th base-table__th--expand" :class="thClass">
				<span class="base-table__visually-hidden">{{ UI_TEXT.EXPAND }}</span>
			</th>
			<th
				v-for="column in columns"
				:key="column.key"
				class="base-table__th"
				:class="[
					`base-table__th--${column.align || 'left'}`,
					{
						'base-table__th--sortable': column.isSortable,
						'base-table__th--sorted': getSortDirection(column.key),
						'base-table__th--resizable': isColumnResizable(column),
					},
					column.isSticky ? `base-table__th--sticky-${column.isSticky}` : '',
					thClass,
				]"
				:style="getColumnStyle(column)"
				:aria-sort="getAriaSort(column)"
				@click="emit('sort', column)">
				<slot :name="`header-${column.key}`" :column="column">
					<!-- Кнопка без собственного обработчика: Enter/Space вызывают click, который всплывает к th — одна точка сортировки для мыши и клавиатуры -->
					<template v-if="column.isSortable">
						<button
							type="button"
							class="base-table__sort-btn"
							:aria-describedby="getSortPriority(column) ? `${idPrefix}-${column.key}-priority` : undefined">
							<span class="base-table__th-label">{{ column.label }}</span>
							<span class="base-table__sort-icon" aria-hidden="true">
								<BaseIcon :name="getSortIcon(column)" :size-scale="calcIconScale('sm', sizeScale)" />
								<span v-if="getSortPriority(column)" class="base-table__sort-index">{{ getSortPriority(column) }}</span>
							</span>
						</button>
						<!-- Приоритет мультисортировки описывает кнопку (aria-describedby), но не входит в имя кнопки и заголовка -->
						<span v-if="getSortPriority(column)" :id="`${idPrefix}-${column.key}-priority`" hidden>
							{{ TABLE_TEXT.SORT_PRIORITY }}: {{ getSortPriority(column) }}
						</span>
					</template>
					<span v-else class="base-table__th-label">{{ column.label }}</span>
				</slot>
				<BaseTableResizeHandle v-if="isColumnResizable(column)" @resize-start="event => emit('resize-start', event, column)" />
			</th>
		</tr>
	</thead>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/iconUtils'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { TABLE_TEXT, UI_TEXT } from '@/locales/messages'
import BaseTableResizeHandle from './BaseTableResizeHandle.vue'
import type { TableColumn } from '../types/BaseTable.types'
import type { BaseTableHeaderEmits, BaseTableHeaderProps, BaseTableHeaderSlots } from '../types/BaseTableHeader.types'

const props = defineProps<BaseTableHeaderProps>()

const emit = defineEmits<BaseTableHeaderEmits>()

defineSlots<BaseTableHeaderSlots>()

/** Подпись чекбокса «выбрать все» скрыта визуально: она нужна только как доступное имя */
const HIDDEN_CHECKBOX_LABEL = { label: 'base-table__visually-hidden' }

/** Префикс id описаний приоритета сортировки: уникален для каждой таблицы на странице */
const idPrefix = useId()

/** Состояние сортировки для скринридера; у несортируемых колонок атрибут не выводится */
function getAriaSort(column: TableColumn): 'ascending' | 'descending' | 'none' | undefined {
	if (!column.isSortable) return undefined
	const direction = props.getSortDirection(column.key)
	if (direction === 'asc') return 'ascending'
	if (direction === 'desc') return 'descending'
	return 'none'
}

/** Иконка направления: стрелка вверх/вниз у отсортированной колонки, двойная стрелка — у остальных */
function getSortIcon(column: TableColumn): string {
	const direction = props.getSortDirection(column.key)
	if (direction === 'asc') return 'sort-up'
	if (direction === 'desc') return 'sort-down'
	return 'sort'
}

/** Приоритет колонки в мультисортировке (1, 2, …); 0 — без номера: одиночная сортировка, одна колонка или колонка не участвует */
function getSortPriority(column: TableColumn): number {
	return props.isMultiSort ? props.getSortIndex(column.key) : 0
}
</script>
