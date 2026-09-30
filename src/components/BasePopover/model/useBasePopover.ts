import { computed, ref, useId, watch } from 'vue'
import { useCustomClass } from '@composables/base/useCustomClass'
import type { BasePopoverEmits, PopoverProps } from '../types/BasePopover.types'
import { useTriggerAttributes } from '@composables/overlay/useTriggerAttributes'

function usePopoverOpen(props: PopoverProps, emit: BasePopoverEmits) {
	const isOpenLocal = ref(props.isOpen)
	watch(
		() => props.isOpen,
		isOpen => {
			isOpenLocal.value = isOpen
		},
	)

	return {
		isOpenLocal,
		toggle(): void {
			isOpenLocal.value = !isOpenLocal.value
			emit('update:isOpen', isOpenLocal.value)
			if (!isOpenLocal.value) emit('close')
		},
		handleClose(): void {
			emit('update:isOpen', false)
			emit('close')
		},
	}
}

export function useBasePopover(props: PopoverProps, emit: BasePopoverEmits) {
	const { classes } = useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'trigger', 'arrow', 'inner', 'panel'] })
	const open = usePopoverOpen(props, emit)
	const triggerRef = ref<HTMLElement | null>(null)
	const panelId = `rise-popover-${useId()}`
	const triggerAttributes = computed(() => ({
		'aria-haspopup': 'dialog',
		'aria-expanded': open.isOpenLocal.value ? 'true' : 'false',
		'aria-controls': open.isOpenLocal.value ? panelId : undefined,
	}))
	const { triggerId } = useTriggerAttributes(
		() => triggerRef.value,
		() => triggerAttributes.value,
		{ withId: true },
	)

	return {
		...open,
		classes,
		triggerRef,
		panelId,
		triggerAttributes,
		triggerId,
		rootClass: computed(() => ['base-popover', classes.value.root].filter(Boolean).join(' ')),
		arrowClass: computed(() => ['base-popover__arrow', classes.value.arrow].filter(Boolean).join(' ')),
		panelClasses: computed(() => `base-popover__panel base-popover__panel--${props.variant}`),
	}
}
