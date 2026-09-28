<template>
	<tr v-if="row.isExpandable" class="base-table__tr base-table__tr--expanded-content" :class="trClass">
		<td :colspan="totalColumns" class="base-table__td base-table__td--expanded" :class="tdClass">
			<Transition
				@before-enter="transitionCallbacks.onExpandBeforeEnter"
				@enter="transitionCallbacks.onExpandEnter"
				@after-enter="transitionCallbacks.onExpandAfterEnter"
				@before-leave="transitionCallbacks.onCollapseBeforeLeave"
				@leave="transitionCallbacks.onCollapseLeave"
				@after-leave="transitionCallbacks.onCollapseAfterLeave">
				<div v-if="isExpanded(row)" class="base-table__expanded-wrapper">
					<slot name="expanded-content" :row="row"></slot>
				</div>
			</Transition>
		</td>
	</tr>
</template>

<script setup lang="ts">
import { useTableExpandTransition } from '../model/useTableExpandTransition'
import type { BaseTableExpandedRowProps, BaseTableExpandedRowSlots } from '../types/BaseTableExpandedRow.types'

defineProps<BaseTableExpandedRowProps>()

defineSlots<BaseTableExpandedRowSlots>()

const { transitionCallbacks } = useTableExpandTransition()
</script>
