<template>
	<tr v-if="nestedConfig && row.children?.length" :class="[ui('tr'), 'base-table__tr--nested', trClass]">
		<td :colspan="totalColumns" :class="[ui('td'), 'base-table__td--nested', tdClass]">
			<Transition
				:css="false"
				@before-enter="transitionCallbacks.onExpandBeforeEnter"
				@enter="transitionCallbacks.onExpandEnter"
				@after-enter="transitionCallbacks.onExpandAfterEnter"
				@before-leave="transitionCallbacks.onCollapseBeforeLeave"
				@leave="transitionCallbacks.onCollapseLeave"
				@after-leave="transitionCallbacks.onCollapseAfterLeave">
				<div v-if="isExpanded(row)" :class="ui('nested-wrapper')">
					<h4 v-if="nestedConfig.title" class="base-table__nested-title">{{ nestedConfig.title }}</h4>
					<BaseTable :columns="nestedConfig.columns" :rows="row.children" :size-scale="sizeScale" />
				</div>
			</Transition>
		</td>
	</tr>

	<template v-else-if="row.children?.length && isExpanded(row)">
		<tr v-for="child in row.children" :key="`${row.id}-${child.id}`" :class="[ui('tr'), 'base-table__tr--child', trClass]">
			<td v-if="isSelectable" :class="[ui('td'), 'base-table__td--check', tdClass]"></td>
			<td v-if="hasRowNumber" :class="[ui('td'), 'base-table__td--number', tdClass]"></td>
			<td :class="[ui('td'), 'base-table__td--expand', tdClass]"></td>
			<td
				v-for="column in columns"
				:key="`child-${column.key}`"
				:class="[
					ui('td'),
					`base-table__td--${column.align || 'left'}`,
					column.isSticky ? `base-table__td--sticky-${column.isSticky}` : '',
					column.cellClass,
					tdClass,
				]"
				:style="getColumnStyle(column)">
				<TableSlot :render="getSlot(`cell-${column.key}`)" :args="{ row: child, value: child.data[column.key], column }">
					{{ formatCellValue(column, child) }}
				</TableSlot>
			</td>
		</tr>
	</template>
</template>

<script setup lang="ts">
import BaseTable from '../BaseTable.vue'
import { TableSlot } from '../../model/TableSlot'
import { useTableExpandTransition } from '../../model/body/useTableExpandTransition'
import type { BaseTableNestedRowProps } from '../../types/body/BaseTableNestedRow.types'

defineProps<BaseTableNestedRowProps>()

const { ui, getSlot, transitionCallbacks } = useTableExpandTransition()
</script>
