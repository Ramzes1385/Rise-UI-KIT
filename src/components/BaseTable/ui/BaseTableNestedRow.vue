<template>
	<tr v-if="nestedConfig && row.children?.length" class="base-table__tr base-table__tr--nested" :class="trClass">
		<td :colspan="totalColumns" class="base-table__td base-table__td--nested" :class="tdClass">
			<Transition
				@before-enter="transitionCallbacks.onExpandBeforeEnter"
				@enter="transitionCallbacks.onExpandEnter"
				@after-enter="transitionCallbacks.onExpandAfterEnter"
				@before-leave="transitionCallbacks.onCollapseBeforeLeave"
				@leave="transitionCallbacks.onCollapseLeave"
				@after-leave="transitionCallbacks.onCollapseAfterLeave">
				<div v-if="isExpanded(row)" class="base-table__nested-wrapper">
					<BaseText v-if="nestedConfig.title" tag="h4" class="base-table__nested-title">
						{{ nestedConfig.title }}
					</BaseText>
					<BaseTable :columns="nestedConfig.columns" :rows="row.children" variant="bordered" :size-scale="sizeScale" />
				</div>
			</Transition>
		</td>
	</tr>

	<template v-else-if="row.children?.length && isExpanded(row)">
		<tr v-for="child in row.children" :key="`${row.id}-${child.id}`" class="base-table__tr base-table__tr--child" :class="trClass">
			<td v-if="isSelectable" class="base-table__td base-table__td--check" :class="tdClass"></td>
			<td v-if="hasRowNumber" class="base-table__td base-table__td--number" :class="tdClass"></td>
			<td class="base-table__td base-table__td--expand" :class="tdClass"></td>
			<td
				v-for="column in columns"
				:key="`child-${column.key}`"
				class="base-table__td"
				:class="[`base-table__td--${column.align || 'left'}`, column.cellClass, tdClass]"
				:style="getColumnStyle(column)">
				<slot :name="`cell-${column.key}`" :row="child" :value="child.data[column.key]" :column="column">
					{{ formatCellValue(column, child) }}
				</slot>
			</td>
		</tr>
	</template>
</template>

<script setup lang="ts">
import { BaseText } from '@components/BaseText'
import { inject } from 'vue'

import type { NestedTableConfig, TableColumn, TableRow } from '../model/BaseTable.types'
import { TABLE_EXPAND_TRANSITION_KEY } from '../model/BaseTable.types'
import BaseTable from './BaseTable.vue'

defineProps<{
	row: TableRow
	columns: TableColumn[]
	nestedConfig?: NestedTableConfig
	totalColumns: number
	sizeScale: number
	isSelectable: boolean
	hasRowNumber: boolean
	trClass?: string
	tdClass?: string
	isExpanded: (row: TableRow) => boolean
	getColumnStyle: (column: TableColumn) => Record<string, string>
	formatCellValue: (column: TableColumn, row: TableRow) => string
}>()

const transitionCallbacks = inject(TABLE_EXPAND_TRANSITION_KEY)!
</script>
