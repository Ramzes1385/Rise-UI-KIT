import { ref, watch } from 'vue'
import { useTableExpandTransition } from './useTableExpandTransition'
import type { BaseTableExpandedRowProps } from '../../types/body/BaseTableExpandedRow.types'

export function useBaseTableExpandedRow(props: BaseTableExpandedRowProps) {
	const { ui, getSlot, transitionCallbacks } = useTableExpandTransition()
	const isOpen = (): boolean => props.isExpanded(props.row)
	const isShown = ref(isOpen())
	const shouldAppear = ref(false)

	watch(isOpen, open => {
		if (!open) return
		shouldAppear.value = true
		isShown.value = true
	})

	return {
		ui,
		getSlot,
		isShown,
		shouldAppear,
		isOpen,
		transitionCallbacks,
		onAfterLeave(element: Element): void {
			transitionCallbacks.onCollapseAfterLeave(element)
			isShown.value = isOpen()
		},
	}
}
