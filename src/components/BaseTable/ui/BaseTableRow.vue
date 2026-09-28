<template>
	<tr
		class="base-table__tr"
		:class="[
			{
				'base-table__tr--even': rowIndex % 2 === 1,
				'base-table__tr--selected': isSelected,
				'base-table__tr--disabled': row.isDisabled,
				'base-table__tr--expandable': isExpandable,
			},
			row.rowClass,
			trClass,
		]"
		:aria-disabled="row.isDisabled ? 'true' : undefined"
		@click="emit('row-click', row)">
		<td v-if="isSelectable" class="base-table__td base-table__td--check" :class="tdClass" @click.stop>
			<BaseCheckbox
				:model-value="isSelected"
				:is-disabled="!!row.isDisabled"
				:label="`${TABLE_TEXT.SELECT_ROW} ${rowNumber}`"
				:custom-class="HIDDEN_CHECKBOX_LABEL"
				:size-scale="sizeScale"
				@update:model-value="emit('toggle-row', row)" />
		</td>
		<td v-if="hasRowNumber" class="base-table__td base-table__td--number" :class="tdClass">
			{{ rowNumber }}
		</td>
		<td v-if="hasExpandableRows" class="base-table__td base-table__td--expand" :class="tdClass">
			<BaseButton
				v-if="isExpandable"
				variant="ghost"
				:padding="EXPAND_BUTTON_PADDING"
				class="base-table__expand-btn"
				:aria-label="isExpanded ? TABLE_TEXT.COLLAPSE_ROW : TABLE_TEXT.EXPAND_ROW"
				:aria-expanded="isExpanded ? 'true' : 'false'"
				:size-scale="sizeScale"
				@click.stop="emit('toggle-expand', row)">
				<BaseIcon name="chevron-right" :size-scale="calcIconScale('sm', sizeScale)" :rotate="isExpanded ? 90 : 0" />
			</BaseButton>
		</td>
		<td
			v-for="column in columns"
			:key="column.key"
			class="base-table__td"
			:class="[
				`base-table__td--${column.align || 'left'}`,
				column.isSticky ? `base-table__td--sticky-${column.isSticky}` : '',
				column.cellClass,
				tdClass,
			]"
			:style="getColumnStyle(column)">
			<slot :name="`cell-${column.key}`" :row="row" :value="row.data[column.key]" :column="column" :index="rowIndex">
				{{ formatCellValue(column, row) }}
			</slot>
		</td>
	</tr>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TABLE_TEXT } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/iconUtils'
import type { BaseTableRowEmits, BaseTableRowProps, BaseTableRowSlots } from '../model/BaseTableRow.types'

const props = defineProps<BaseTableRowProps>()

const emit = defineEmits<BaseTableRowEmits>()

defineSlots<BaseTableRowSlots>()

/** Подпись чекбокса строки скрыта визуально: она нужна только как доступное имя «Выбрать строку N» */
const HIDDEN_CHECKBOX_LABEL = { label: 'base-table__visually-hidden' }

/** Квадратная кнопка 24×24: иконка 16px и отступ 3px (плюс рамка 1px) */
const EXPAND_BUTTON_PADDING = { x: 3, y: 3 }

/** Строку можно раскрыть: есть дочерние строки или она помечена isExpandable (содержимое — слот expanded-content) */
const isExpandable = computed(() => Boolean(props.row.isExpandable || props.row.children?.length))
</script>
