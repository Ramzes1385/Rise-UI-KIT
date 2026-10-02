import { rowElement } from '../order/listOrder'
import type { ListItem } from '../../types/BaseList.types'
import { computed, nextTick, ref, type ComputedRef, type Ref } from 'vue'

const TYPEAHEAD_RESET = 500

function useTypeahead<T extends ListItem>(shown: ComputedRef<readonly T[]>) {
	let query = ''
	let resetTimer: ReturnType<typeof setTimeout> | undefined
	return (key: string, fromId: string | undefined): T | undefined => {
		clearTimeout(resetTimer)
		resetTimer = setTimeout(() => (query = ''), TYPEAHEAD_RESET)
		query += key.toLocaleLowerCase()
		const start = shown.value.findIndex(item => item.id === fromId)
		const ordered = [...shown.value.slice(start + 1), ...shown.value.slice(0, start + 1)]
		const isSame = [...query].every(char => char === query[0])
		const prefix = isSame ? query[0] : query
		return ordered.find(item => item.title.toLocaleLowerCase().startsWith(prefix))
	}
}

export function useListFocus<T extends ListItem>(
	listRef: Ref<HTMLElement | null>,
	shown: ComputedRef<readonly T[]>,
	options: { isSelected: (item: T) => boolean; scrollToIndex: (index: number) => void },
) {
	const activeId = ref<string | null>(null)
	const findTypeahead = useTypeahead(shown)
	const tabbableId = computed(() => {
		const active = shown.value.find(item => item.id === activeId.value)
		return (active ?? shown.value.find(options.isSelected) ?? shown.value[0])?.id
	})
	const focusItem = (id: string): void => {
		const index = shown.value.findIndex(item => item.id === id)
		if (index < 0) return
		activeId.value = id
		options.scrollToIndex(index)
		nextTick(() => rowElement(listRef.value, id)?.focus())
	}
	return {
		activeId,
		tabbableId,
		focusItem,
		activeIndex: computed(() => shown.value.findIndex(item => item.id === tabbableId.value)),
		handleItemFocus(item: T): void {
			activeId.value = item.id
		},
		typeahead(key: string): void {
			const target = findTypeahead(key, tabbableId.value)
			if (target) focusItem(target.id)
		},
	}
}
