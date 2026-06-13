<template>
	<tr v-if="row.isExpandable" class="base-table__tr base-table__tr--expanded-content" :class="trClass">
		<td :colspan="totalColumns" class="base-table__td base-table__td--expanded" :class="tdClass">
			<Transition
				@before-enter="onExpandBeforeEnter"
				@enter="onExpandEnter"
				@after-enter="onExpandAfterEnter"
				@before-leave="onCollapseBeforeLeave"
				@leave="onCollapseLeave"
				@after-leave="onCollapseAfterLeave">
				<div v-if="isExpanded(row)" class="base-table__expanded-wrapper">
					<slot name="expanded-content" :row="row"></slot>
				</div>
			</Transition>
		</td>
	</tr>
</template>

<script setup lang="ts">
import type { TableRow } from '../model/BaseTable.types'

defineProps<{
	row: TableRow
	totalColumns: number
	trClass?: string
	tdClass?: string
	isExpanded: (row: TableRow) => boolean
	onExpandBeforeEnter: (element: Element) => void
	onExpandEnter: (element: Element, done: () => void) => void
	onExpandAfterEnter: (element: Element) => void
	onCollapseBeforeLeave: (element: Element) => void
	onCollapseLeave: (element: Element, done: () => void) => void
	onCollapseAfterLeave: (element: Element) => void
}>()
</script>
