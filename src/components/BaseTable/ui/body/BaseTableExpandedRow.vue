<template>
	<tr v-if="row.isExpandable" :class="[ui('tr'), 'base-table__tr--expanded-content', trClass]">
		<td :colspan="totalColumns" :class="[ui('td'), 'base-table__td--expanded', tdClass]">
			<Transition
				:css="false"
				@before-enter="transitionCallbacks.onExpandBeforeEnter"
				@enter="transitionCallbacks.onExpandEnter"
				@after-enter="transitionCallbacks.onExpandAfterEnter"
				@before-leave="transitionCallbacks.onCollapseBeforeLeave"
				@leave="transitionCallbacks.onCollapseLeave"
				@after-leave="transitionCallbacks.onCollapseAfterLeave">
				<div v-if="isExpanded(row)" :class="ui('expanded-wrapper')">
					<slot name="expanded-content" :row="row"></slot>
				</div>
			</Transition>
		</td>
	</tr>
</template>

<script setup lang="ts">
import { useTableExpandTransition } from '../../model/body/useTableExpandTransition'
import type { BaseTableExpandedRowProps, BaseTableExpandedRowSlots } from '../../types/body/BaseTableExpandedRow.types'

defineProps<BaseTableExpandedRowProps>()

defineSlots<BaseTableExpandedRowSlots>()

const { ui, transitionCallbacks } = useTableExpandTransition()
</script>
