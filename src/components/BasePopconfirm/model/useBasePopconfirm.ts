import type { ComputedRef, Ref } from 'vue'
import { calcIconScale } from '@utils/media/iconUtils'
import { computed, nextTick, ref, useId, watch } from 'vue'
import { useCustomClass } from '@composables/base/useCustomClass'
import type { CustomColor } from '@composables/base/useCustomColor'
import { useTriggerAttributes } from '@composables/overlay/useTriggerAttributes'
import type { BasePopconfirmEmits, PopconfirmProps } from '../types/BasePopconfirm.types'

const DANGER_COLOR: CustomColor = {
	bg: { base: 'var(--rise-error)', hover: 'var(--rise-error-hover)' },
	text: { base: 'var(--rise-on-error)' },
}
const BUTTON_SCALE_RATIO = 0.875

function previousIndex(index: number, count: number): number {
	return index <= 0 ? count - 1 : index - 1
}

function cycleFocus(event: KeyboardEvent, dialog: HTMLElement): void {
	const buttons = [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled)')]
	const index = buttons.indexOf(document.activeElement as HTMLElement)
	const next = event.shiftKey ? previousIndex(index, buttons.length) : (index + 1) % buttons.length
	event.preventDefault()
	buttons[next]?.focus()
}

function usePopconfirmView(props: PopconfirmProps) {
	const { classes } = useCustomClass({
		getClass: () => props.customClass,
		elementKeys: ['root', 'trigger', 'panel', 'arrow', 'title', 'description', 'cancel', 'confirm'],
	})
	return {
		classes,
		dangerColor: DANGER_COLOR,
		hasArrow: computed(() => props.showArrow !== false && props.variant !== 'ghost'),
		rootClass: computed((): string => ['base-popconfirm-root', classes.value.root].filter(Boolean).join(' ')),
		buttonScale: computed(() => props.sizeScale * BUTTON_SCALE_RATIO),
		iconScale: computed(() => calcIconScale('sm', props.sizeScale)),
	}
}

function usePopconfirmOpen(props: PopconfirmProps, emit: BasePopconfirmEmits) {
	const isOpenLocal = ref(props.isOpen ?? false)
	watch(
		() => props.isOpen,
		isOpen => {
			if (isOpen !== undefined) isOpenLocal.value = isOpen
		},
	)
	return {
		isOpenLocal,
		isOpenState: computed(() => isOpenLocal.value),
		setOpen(value: boolean): void {
			isOpenLocal.value = value
			emit('update:isOpen', value)
		},
	}
}

function usePopconfirmTrigger(isOpenState: ComputedRef<boolean>, dialogId: string) {
	const triggerRef = ref<HTMLElement | null>(null)
	const triggerAttributes = computed(() => ({
		'aria-haspopup': 'dialog',
		'aria-expanded': isOpenState.value ? 'true' : 'false',
		'aria-controls': isOpenState.value ? dialogId : undefined,
	}))
	const { getTrigger } = useTriggerAttributes(
		() => triggerRef.value,
		() => triggerAttributes.value,
	)
	return { triggerRef, triggerAttributes, getTrigger }
}

function useAutofocus(isOpen: Ref<boolean>, dialogRef: Ref<HTMLElement | null>): void {
	watch(isOpen, async value => {
		if (!value) return
		await nextTick()
		dialogRef.value?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
	})
}

export function useBasePopconfirm(props: PopconfirmProps, emit: BasePopconfirmEmits) {
	const view = usePopconfirmView(props)
	const dialogId = `rise-popconfirm-${useId()}`
	const dialogRef = ref<HTMLElement | null>(null)
	const { isOpenLocal, isOpenState, setOpen } = usePopconfirmOpen(props, emit)
	const { triggerRef, triggerAttributes, getTrigger } = usePopconfirmTrigger(isOpenState, dialogId)
	useAutofocus(isOpenLocal, dialogRef)

	const finish = (isConfirmed: boolean): void => {
		setOpen(false)
		getTrigger()?.focus()
		if (isConfirmed) emit('confirm')
		else emit('cancel')
	}

	return {
		...view,
		dialogId,
		titleId: `${dialogId}-title`,
		descriptionId: `${dialogId}-description`,
		dialogRef,
		triggerRef,
		triggerAttributes,
		isOpenState,
		finish,
		toggle(): void {
			if (isOpenLocal.value) finish(false)
			else setOpen(true)
		},
		handleDropdownUpdate(value: boolean): void {
			if (!value && isOpenLocal.value) finish(false)
		},
		handleKeydown(event: KeyboardEvent): void {
			if (event.key === 'Tab' && dialogRef.value) cycleFocus(event, dialogRef.value)
		},
	}
}
