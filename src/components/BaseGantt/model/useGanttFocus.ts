import { computed, nextTick, ref } from 'vue'
import type { GanttContext, GanttFocusApi } from '../types/BaseGanttModel.types'

export function useGanttFocus(context: GanttContext, ensureRowVisible: (index: number) => void): GanttFocusApi {
	const grid = ref<HTMLElement | null>(null)
	const active = ref(0)
	const lastIndex = (): number => context.rows.value.length - 1

	async function focusAt(index: number, selector: string): Promise<void> {
		const target = Math.max(0, Math.min(index, lastIndex()))
		active.value = target
		ensureRowVisible(target)
		await nextTick()
		grid.value?.querySelector<HTMLElement>(`[data-row-index="${target}"]${selector}`)?.focus()
	}

	return {
		grid,
		lastIndex,
		activeIndex: computed((): number => Math.max(0, Math.min(active.value, lastIndex()))),
		setActive(index: number): void {
			active.value = index
		},
		focusRow: (index: number): Promise<void> => focusAt(index, ''),
		focusBar: (index: number): Promise<void> => focusAt(index, ' [data-gantt-bar]'),
	}
}
