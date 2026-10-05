import { inject, nextTick, onMounted, ref, watch } from 'vue'
import { CASCADER_PANEL_KEY } from '../types/BaseCascader.types'
import type { CascaderColumn, CascaderPanelContext } from '../types/BaseCascader.types'

function scrollToId(id: string): void {
	document.getElementById(id)?.scrollIntoView?.({ block: 'nearest' })
}

export function useBaseCascaderPanel() {
	const context = inject(CASCADER_PANEL_KEY) as CascaderPanelContext
	const searchRef = ref<HTMLInputElement | null>(null)

	onMounted(() => {
		searchRef.value?.focus({ preventScroll: true })
	})

	watch([context.activeLevel, context.activeId, context.activeResult], async () => {
		await nextTick()
		if (context.isSearching.value) {
			scrollToId(context.resultId(context.activeResult.value))
			return
		}
		const nodes = context.columns.value[context.activeLevel.value]?.nodes ?? []
		const index = nodes.findIndex(node => node.id === context.activeId.value)
		if (index >= 0) scrollToId(context.optionId(context.activeLevel.value, index))
	})

	return {
		...context,
		searchRef,
		columnLabelledBy: (column: CascaderColumn): string | undefined => (column.level === 0 ? context.rootLabelledBy.value : undefined),
		columnLabel(column: CascaderColumn): string | undefined {
			if (column.parent) return column.parent.label
			return context.rootLabelledBy.value ? undefined : context.rootLabel.value
		},
		isActive: (column: CascaderColumn, nodeId: string): boolean =>
			column.level === context.activeLevel.value && nodeId === context.activeId.value,
		isExpanded: (column: CascaderColumn, nodeId: string): boolean => context.expandedPath.value[column.level] === nodeId,
		columnKey: (column: CascaderColumn): string => column.parent?.id ?? '',
		removeColumn: (_: Element, done: () => void): void => done(),
	}
}
