<template>
	<tr v-if="row.isExpandable && isShown" :class="[ui('tr'), 'base-table__tr--expanded-content', trClass]">
		<td :colspan="totalColumns" :class="[ui('td'), 'base-table__td--expanded', tdClass]">
			<Transition
				:css="false"
				:appear="shouldAppear"
				@before-enter="transitionCallbacks.onExpandBeforeEnter"
				@enter="transitionCallbacks.onExpandEnter"
				@after-enter="transitionCallbacks.onExpandAfterEnter"
				@before-leave="transitionCallbacks.onCollapseBeforeLeave"
				@leave="transitionCallbacks.onCollapseLeave"
				@after-leave="onAfterLeave">
				<div v-if="isOpen()" :class="ui('expanded-wrapper')">
					<TableSlot :render="getSlot('expanded-content')" :args="{ row }" />
				</div>
			</Transition>
		</td>
	</tr>
</template>

<script setup lang="ts">
import { TableSlot } from '../../model/TableSlot'
import { useBaseTableExpandedRow } from '../../model/body/useBaseTableExpandedRow'
import type { BaseTableExpandedRowProps } from '../../types/body/BaseTableExpandedRow.types'

const props = defineProps<BaseTableExpandedRowProps>()

const { ui, getSlot, isShown, shouldAppear, isOpen, transitionCallbacks, onAfterLeave } = useBaseTableExpandedRow(props)
</script>
