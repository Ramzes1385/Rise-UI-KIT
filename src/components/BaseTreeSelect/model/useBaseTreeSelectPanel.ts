import { nextTick, onMounted, ref, watch } from 'vue'
import type { TreeSelectRow } from '../types/BaseTreeSelect.types'
import type { BaseTreeSelectPanelProps } from '../types/BaseTreeSelectPanel.types'

function pinLeavingRow(element: Element): void {
	const row = element as HTMLElement
	Object.assign(row.style, { top: `${row.offsetTop}px`, left: `${row.offsetLeft}px`, width: `${row.offsetWidth}px` })
	row.removeAttribute('id')
	row.setAttribute('aria-hidden', 'true')
}

export function useBaseTreeSelectPanel(props: BaseTreeSelectPanelProps) {
	const searchRef = ref<HTMLInputElement | null>(null)

	onMounted(() => {
		searchRef.value?.focus({ preventScroll: true })
	})

	watch(
		() => props.activeIndex,
		async index => {
			if (index < 0) return
			await nextTick()
			document.getElementById(props.getRowId(index))?.scrollIntoView?.({ block: 'nearest' })
		},
	)

	return {
		searchRef,
		pinLeavingRow,
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
