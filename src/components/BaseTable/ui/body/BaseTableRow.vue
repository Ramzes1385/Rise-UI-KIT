<template>
	<tr
		:class="[
			ui('tr'),
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
		:tabindex="isInteractive ? tabIndex : undefined"
		:data-row-interactive="isInteractive ? '' : undefined"
		@click="onClick"
		@keydown="onKeydown"
		@focus="emit('row-focus', row)">
		<td v-if="isSelectable" :class="[ui('td'), 'base-table__td--check', tdClass]" @click.stop>
			<BaseCheckbox
				:model-value="isSelected"
				:is-disabled="!!row.isDisabled"
				:aria-label="`${TABLE_TEXT.SELECT_ROW} ${rowNumber}`"
				:size-scale="sizeScale"
				@update:model-value="emit('toggle-row', row)" />
		</td>
		<td v-if="hasRowNumber" :class="[ui('td'), 'base-table__td--number', tdClass]">
			{{ rowNumber }}
		</td>
		<td v-if="hasExpandableRows" :class="[ui('td'), 'base-table__td--expand', tdClass]">
			<BaseButton
				v-if="isExpandable"
				variant="ghost"
				:is-disabled="Boolean(row.isDisabled)"
				:padding="expandButtonPadding"
				:class="ui('expand-btn')"
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
			:class="[
				ui('td'),
				`base-table__td--${column.align || 'left'}`,
				column.isSticky ? `base-table__td--sticky-${column.isSticky}` : '',
				column.cellClass,
				tdClass,
			]"
			:style="getColumnStyle(column)">
			<TableSlot :render="getSlot(`cell-${column.key}`)" :args="{ row, value: row.data[column.key], column, index: rowIndex }">
				{{ formatCellValue(column, row) }}
			</TableSlot>
		</td>
	</tr>
</template>

<script setup lang="ts">
import { TABLE_TEXT } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { TableSlot } from '../../model/TableSlot'
import { BaseButton } from '@components/BaseButton'
import { calcIconScale } from '@utils/media/iconUtils'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { useBaseTableRow } from '../../model/body/useBaseTableRow'
import type { BaseTableRowEmits, BaseTableRowProps } from '../../types/body/BaseTableRow.types'

const props = defineProps<BaseTableRowProps>()

const emit = defineEmits<BaseTableRowEmits>()

const { ui, getSlot, expandButtonPadding, isExpandable, onClick, onKeydown } = useBaseTableRow(props, emit)
</script>
