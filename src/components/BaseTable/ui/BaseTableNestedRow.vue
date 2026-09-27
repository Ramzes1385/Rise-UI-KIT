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
					<h4 v-if="nestedConfig.title" class="base-table__nested-title">{{ nestedConfig.title }}</h4>
					<BaseTable :columns="nestedConfig.columns" :rows="row.children" :size-scale="sizeScale" />
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
				:class="[
					`base-table__td--${column.align || 'left'}`,
					column.isSticky ? `base-table__td--sticky-${column.isSticky}` : '',
					column.cellClass,
					tdClass,
				]"
				:style="getColumnStyle(column)">
				<slot :name="`cell-${column.key}`" :row="child" :value="child.data[column.key]" :column="column">
					{{ formatCellValue(column, child) }}
				</slot>
			</td>
		</tr>
	</template>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { TABLE_EXPAND_TRANSITION_KEY } from '../model/BaseTable.types'
import BaseTable from './BaseTable.vue'
import type { BaseTableNestedRowProps, BaseTableNestedRowSlots } from '../model/BaseTableNestedRow.types'

defineProps<BaseTableNestedRowProps>()

defineSlots<BaseTableNestedRowSlots>()

const transitionCallbacks = inject(TABLE_EXPAND_TRANSITION_KEY)!
</script>
