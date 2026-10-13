import { useUi } from '@composables/base/useUi'
import { useHoverIntent } from './useHoverIntent'
import { computed, ref, useId, watch } from 'vue'
import { useCustomClass } from '@composables/base/useCustomClass'
import { useTriggerAttributes } from '@composables/overlay/useTriggerAttributes'
import { useScrollableRegion } from '@composables/interaction/useScrollableRegion'
import type { BaseHoverCardEmits, HoverCardProps } from '../types/BaseHoverCard.types'

const FALLBACK_TRIGGER_ATTRIBUTES = { tabindex: '0' }

function useHoverCardOpen(props: HoverCardProps, emit: BaseHoverCardEmits) {
	const isOpenLocal = ref(props.isOpen && !props.isDisabled)
	watch(
		() => props.isOpen,
		isOpen => {
			isOpenLocal.value = isOpen && !props.isDisabled
		},
	)

	function setOpen(value: boolean): void {
		if (value === isOpenLocal.value) return
		isOpenLocal.value = value
		emit('update:isOpen', value)
		if (value) emit('open')
		else emit('close')
	}

	watch(
		() => props.isDisabled,
		isDisabled => {
			if (isDisabled) setOpen(false)
		},
	)
	return { isOpenLocal, setOpen }
}

export function useBaseHoverCard(props: HoverCardProps, emit: BaseHoverCardEmits) {
	const { classes } = useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'trigger', 'arrow', 'inner', 'panel'] })
	const ui = useUi(props, 'base-hover-card')
	const { isOpenLocal, setOpen } = useHoverCardOpen(props, emit)
	const triggerRef = ref<HTMLElement | null>(null)
	const innerRef = ref<HTMLElement | null>(null)
	const cardId = `rise-hover-card-${useId()}`
	const intent = useHoverIntent({
		openDelay: () => props.openDelay,
		closeDelay: () => props.closeDelay,
		isDisabled: () => props.isDisabled,
		isOpen: () => isOpenLocal.value,
		setOpen,
		isWithinCard: node => node instanceof Node && Boolean(triggerRef.value?.contains(node) || innerRef.value?.contains(node)),
	})
	const { isScrollable } = useScrollableRegion({ elementRef: innerRef })
	useTriggerAttributes(
		() => triggerRef.value,
		() => ({ 'aria-describedby': isOpenLocal.value ? cardId : undefined }),
		{ fallbackAttributes: FALLBACK_TRIGGER_ATTRIBUTES },
	)

	return {
		...intent,
		classes,
		ui,
		isOpenLocal,
		triggerRef,
		innerRef,
		isScrollable,
		cardId,
		handleDropdownOpen(value: boolean): void {
			intent.cancel()
			setOpen(value)
		},
		rootClass: computed(() => [ui('root'), classes.value.root].filter(Boolean).join(' ')),
		arrowClass: computed(() => [ui('arrow'), classes.value.arrow].filter(Boolean).join(' ')),
		panelClasses: computed(() => `${ui('panel')} base-hover-card__panel--${props.variant}`),
	}
}
