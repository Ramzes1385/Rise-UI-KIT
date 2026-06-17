<template>
	<tr
		class="base-table__tr"
		:class="[
			{
				'base-table__tr--selected': isSelected,
				'base-table__tr--disabled': row.isDisabled,
				'base-table__tr--expandable': row.isExpandable || row.children?.length,
			},
			row.rowClass,
			trClass,
		]"
		@click="emit('row-click', row)">
		<td v-if="isSelectable" class="base-table__td base-table__td--check" :class="tdClass" @click.stop>
			<BaseCheckbox
				:model-value="isSelected"
				:is-disabled="!!row.isDisabled"
				:size-scale="sizeScale"
				@update:model-value="emit('toggle-row', row)" />
		</td>
		<td v-if="hasRowNumber" class="base-table__td base-table__td--number" :class="tdClass">
			{{ rowNumber }}
		</td>
		<td v-if="hasExpandableRows" class="base-table__td base-table__td--expand" :class="tdClass">
			<BaseButton
				v-if="row.isExpandable || row.children?.length"
				variant="ghost"
				:padding="0"
				class="base-table__expand-btn"
				:class="{ 'base-table__expand-btn--open': isExpanded }"
				:size-scale="sizeScale"
				@click.stop="emit('toggle-expand', row)">
				<BaseIcon name="chevron-right" :size-scale="calcIconScale('xs', sizeScale)" :rotate="isExpanded ? 90 : 0" />
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
import { BaseButton } from '@components/BaseButton'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'

import type { TableRow } from '../model/BaseTable.types'
import type { BaseTableRowProps } from './BaseTableRow.types'

defineProps<BaseTableRowProps>()

const emit = defineEmits<{
	(event: 'row-click', row: TableRow): void
	(event: 'toggle-row', row: TableRow): void
	(event: 'toggle-expand', row: TableRow): void
}>()
</script>
