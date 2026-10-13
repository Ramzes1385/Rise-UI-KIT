import type { ComputedRef } from 'vue'
import { computed, ref, watch } from 'vue'
import type { Controlled } from '../../types/FileManagerInternal.types'
import type { FileManagerItem } from '../../types/BaseFileManager.types'

function useSelectionDerived(
	entries: ComputedRef<FileManagerItem[]>,
	selected: Controlled<string[]>,
	activeId: ComputedRef<string | null>,
) {
	const ids = computed(() => entries.value.map(entry => entry.id))
	const selectedSet = computed(() => new Set(selected.get()))
	const selectedIds = computed(() => ids.value.filter(id => selectedSet.value.has(id)))
	const tabbableId = computed((): string | null => {
		if (activeId.value && ids.value.includes(activeId.value)) return activeId.value
		return selectedIds.value[0] ?? ids.value[0] ?? null
	})
	const actionIds = computed((): string[] => {
		if (selectedIds.value.length) return selectedIds.value
		return tabbableId.value ? [tabbableId.value] : []
	})
	const primaryId = computed((): string | null => {
		if (tabbableId.value && selectedSet.value.has(tabbableId.value)) return tabbableId.value
		return selectedIds.value[0] ?? tabbableId.value
	})

	return { ids, selectedSet, selectedIds, tabbableId, actionIds, primaryId }
}

function createSelect(selected: Controlled<string[]>): (next: string[]) => void {
	return function select(next: string[]): void {
		const current = selected.get()
		if (next.length === current.length && next.every((id, position) => id === current[position])) return
		selected.set(next)
	}
}

function watchPruned(ids: ComputedRef<string[]>, selected: Controlled<string[]>, isPaused: () => boolean): void {
	watch(ids, list => {
		if (isPaused()) return
		const visible = new Set(list)
		const kept = selected.get().filter(id => visible.has(id))
		if (kept.length !== selected.get().length) createSelect(selected)(kept)
	})
}

export function useFileManagerSelection(entries: ComputedRef<FileManagerItem[]>, selected: Controlled<string[]>, isPaused: () => boolean) {
	const activeId = ref<string | null>(null)
	const anchorId = ref<string | null>(null)
	const derived = useSelectionDerived(
		entries,
		selected,
		computed(() => activeId.value),
	)
	const { ids, selectedSet, tabbableId } = derived

	const select = createSelect(selected)

	function focus(id: string): void {
		activeId.value = id
		anchorId.value = id
	}

	watchPruned(ids, selected, isPaused)

	return {
		tabbableId,
		selectedSet,
		selectedIds: derived.selectedIds,
		actionIds: derived.actionIds,
		primaryId: derived.primaryId,
		selectOnly(id: string): void {
			focus(id)
			select([id])
		},
		toggle(id: string): void {
			focus(id)
			select(selectedSet.value.has(id) ? selected.get().filter(item => item !== id) : [...selected.get(), id])
		},
		selectRange(id: string): void {
			const to = ids.value.indexOf(id)
			anchorId.value = anchorId.value ?? tabbableId.value ?? id
			const anchor = ids.value.indexOf(anchorId.value)
			const from = anchor === -1 ? to : anchor
			activeId.value = id
			select(ids.value.slice(Math.min(from, to), Math.max(from, to) + 1))
		},
		selectAll(): void {
			select([...ids.value])
		},
		clear(): void {
			select([])
		},
		setActive(id: string): void {
			activeId.value = id
		},
	}
}
