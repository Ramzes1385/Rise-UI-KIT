import { computed } from 'vue'
import { formatMessage } from '@/locales'
import { UI_TAG } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { calcIconScale } from '@utils/media/iconUtils'
import type { BaseTagEmits, TagProps } from '../types/BaseTag.types'
import { useClickable } from '@composables/interaction/useClickable'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'

const REMOVE_KEYS = new Set(['Delete', 'Backspace'])

export function useBaseTag(props: TagProps, emit: BaseTagEmits) {
	const clickable = useClickable({ event: 'click', isDisabled: () => props.isDisabled })
	const isMainFocusable = computed(() => props.isSelectable || clickable.isClickable.value)

	const mainAttributes = computed(() => ({
		...(props.isSelectable
			? { type: 'button', disabled: props.isDisabled, 'aria-pressed': String(props.isSelected) }
			: clickable.clickableAttributes.value),
		'aria-keyshortcuts': props.isRemovable && isMainFocusable.value ? 'Delete Backspace' : undefined,
	}))

	function handleClick(event: MouseEvent): void {
		if (props.isDisabled) return
		if (props.isSelectable) emit('update:isSelected', !props.isSelected)
		emit('click', event)
	}

	function handleRootKeydown(event: KeyboardEvent): void {
		if (!props.isRemovable || props.isDisabled || !REMOVE_KEYS.has(event.key)) return
		event.preventDefault()
		emit('remove', event)
	}

	return {
		...useStandardBaseComponent('base-tag', props, ['root', 'main', 'icon', 'text', 'remove']),
		ui: useUi(props, 'base-tag'),
		iconScale: computed(() => calcIconScale('sm', props.sizeScale)),
		isMainFocusable,
		mainTag: computed(() => (props.isSelectable ? 'button' : 'span')),
		mainAttributes,
		isSelected: computed(() => props.isSelectable && props.isSelected),
		removeTabindex: computed(() => (isMainFocusable.value ? '-1' : undefined)),
		removeButtonLabel: computed(
			() => props.removeLabel ?? (props.label ? formatMessage(UI_TAG.REMOVE, { label: props.label }) : UI_TAG.REMOVE_UNNAMED),
		),
		handleClick,
		handleKeydown: (event: KeyboardEvent) => !props.isSelectable && clickable.handleKeydown(event),
		handleRootKeydown,
		handleRemove: (event: MouseEvent) => emit('remove', event),
	}
}
