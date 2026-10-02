import { nextTick, onMounted, ref, watch } from 'vue'
import type { TreeSelectRow } from '../types/BaseTreeSelect.types'
import type { BaseTreeSelectPanelProps } from '../types/BaseTreeSelectPanel.types'

export function useBaseTreeSelectPanel(props: BaseTreeSelectPanelProps) {
	const treeRef = ref<HTMLElement | null>(null)
	const searchRef = ref<HTMLInputElement | null>(null)

	onMounted(() => {
		searchRef.value?.focus({ preventScroll: true })
	})

	watch(
		() => props.activeIndex,
		async index => {
			if (index < 0) return
			await nextTick()
			treeRef.value?.children.item(index)?.scrollIntoView?.({ block: 'nearest' })
		},
	)

	return {
		treeRef,
		searchRef,
		ariaExpanded: (row: TreeSelectRow): 'true' | 'false' | undefined =>
			row.hasChildren ? (String(row.isExpanded) as 'true' | 'false') : undefined,
		ariaSelected: (id: string): 'true' | 'false' | undefined =>
			props.isMultiple ? undefined : (String(props.selectedSet.has(id)) as 'true' | 'false'),
		ariaChecked(id: string): 'true' | 'false' | 'mixed' | undefined {
			if (!props.isMultiple) return undefined
			if (props.indeterminateSet.has(id)) return 'mixed'
			return props.selectedSet.has(id) ? 'true' : 'false'
		},
	}
}
