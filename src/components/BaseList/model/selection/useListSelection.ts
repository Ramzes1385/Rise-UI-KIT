import { indexOfId } from '../order/listOrder'
import { computed, ref, type ComputedRef } from 'vue'
import type { BaseListEmits, ListItem, ListProps } from '../../types/BaseList.types'

function selectedSet(props: ListProps<ListItem>): Set<string> {
	if (Array.isArray(props.modelValue)) return new Set(props.modelValue)
	return new Set(props.modelValue ? [props.modelValue] : [])
}

const isSelectable = (item: ListItem): boolean => !item.isDisabled

export function useListSelection<T extends ListItem>(props: ListProps<T>, emit: BaseListEmits<T>, shown: ComputedRef<readonly T[]>) {
	const selected = computed(() => selectedSet(props as ListProps<ListItem>))
	const anchorId = ref<string | null>(null)
	const canSelect = (item: T): boolean => props.selectionMode !== 'none' && !props.isDisabled && isSelectable(item)
	const emitMany = (ids: Iterable<string>): void => emit('update:modelValue', [...ids])
	const toggle = (item: T): void => {
		if (!canSelect(item)) return
		anchorId.value = item.id
		if (props.selectionMode === 'single') return emit('update:modelValue', item.id)
		const next = new Set(selected.value)
		if (next.has(item.id)) next.delete(item.id)
		else next.add(item.id)
		emitMany(next)
	}
	const selectRange = (item: T): void => {
		if (props.selectionMode !== 'multiple' || !canSelect(item)) return toggle(item)
		const from = indexOfId(shown.value, anchorId.value ?? item.id)
		const to = indexOfId(shown.value, item.id)
		const range = shown.value.slice(Math.min(from, to), Math.max(from, to) + 1).filter(isSelectable)
		emitMany(new Set([...selected.value, ...range.map(entry => entry.id)]))
	}
	const selectAll = (): void => {
		if (props.selectionMode !== 'multiple' || props.isDisabled) return
		emitMany(new Set([...selected.value, ...shown.value.filter(isSelectable).map(item => item.id)]))
	}
	const clearSelection = (): void => emit('update:modelValue', props.selectionMode === 'multiple' ? [] : null)
	return {
		isSelected: (item: T): boolean => selected.value.has(item.id),
		toggle,
		selectRange,
		selectAll,
		clearSelection,
		toggleAll(): void {
			const available = shown.value.filter(isSelectable)
			if (available.every(item => selected.value.has(item.id)))
				emitMany([...selected.value].filter(id => indexOfId(available, id) < 0))
			else selectAll()
		},
	}
}
