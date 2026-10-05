import { nextTick, ref } from 'vue'
import { UI_TAG } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseTagGroupEmits, TagGroupItem, TagGroupProps, TagValue } from '../types/BaseTagGroup.types'

const TAG = '.base-tag-group__tag:not(.base-tag-group__tag-leave-active)'
const FOCUSABLE = '.base-tag__main[tabindex="0"], button.base-tag__main:not(:disabled), .base-tag__remove:not(:disabled)'

function findFocusable(tags: HTMLElement[], index: number): HTMLElement | undefined {
	const order = [...tags.slice(index), ...tags.slice(0, index).reverse()]
	for (const tag of order) {
		const target = tag.querySelector<HTMLElement>(FOCUSABLE)
		if (target) return target
	}
	return undefined
}

function toList(value: TagGroupProps['modelValue']): TagValue[] {
	if (Array.isArray(value)) return value
	return value === null || value === undefined ? [] : [value]
}

function holdLeavingPlace(element: Element): void {
	const tag = element as HTMLElement
	tag.style.left = `${tag.offsetLeft}px`
	tag.style.top = `${tag.offsetTop}px`
}

export function useBaseTagGroup(props: TagGroupProps, emit: BaseTagGroupEmits) {
	const rootRef = ref<HTMLElement | null>(null)

	function isItemSelected(item: TagGroupItem): boolean {
		return props.selectionMode !== 'none' && toList(props.modelValue).includes(item.value)
	}

	function handleSelect(item: TagGroupItem, isSelected: boolean): void {
		if (props.selectionMode === 'single') {
			emit('update:modelValue', isSelected ? item.value : null)
			return
		}
		const list = toList(props.modelValue).filter(value => value !== item.value)
		emit('update:modelValue', isSelected ? [...list, item.value] : list)
	}

	function focusAfterRemove(index: number): void {
		const tags = [...(rootRef.value?.querySelectorAll<HTMLElement>(TAG) ?? [])]
		const target = findFocusable(tags, Math.min(index, tags.length - 1)) ?? rootRef.value
		target?.focus()
	}

	async function handleRemove(item: TagGroupItem, index: number): Promise<void> {
		const length = props.items.length
		emit('remove', item, index)
		await nextTick()
		if (props.items.length < length) focusAfterRemove(index)
	}

	return {
		...useStandardBaseComponent('base-tag-group', props, ['root', 'tag']),
		ui: useUi(props, 'base-tag-group'),
		rootRef,
		holdLeavingPlace,
		groupLabel: () => props.label ?? UI_TAG.GROUP,
		isItemSelected,
		isItemRemovable: (item: TagGroupItem) => item.isRemovable ?? props.isRemovable,
		isItemDisabled: (item: TagGroupItem) => props.isDisabled || Boolean(item.isDisabled),
		handleSelect,
		handleRemove,
	}
}
