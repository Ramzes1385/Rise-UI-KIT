/** Composable: логика BasePopconfirm — открытие, фокус в панели и ответ */
import { computed, nextTick, ref, useId, watch } from 'vue'
import { calcIconScale } from '@utils/iconUtils'
import { useCustomClass } from '@composables/useCustomClass'
import { useTriggerAttributes } from '@composables/useTriggerAttributes'
import type { ComputedRef, Ref } from 'vue'
import type { CustomColor } from '@composables/useCustomColor'
import type { BasePopconfirmEmits, PopconfirmProps } from '../types/BasePopconfirm.types'

/** Кнопка необратимого действия — цвет ошибки из токенов темы, как у BaseConfirm */
const DANGER_COLOR: CustomColor = {
	bg: { base: 'var(--rise-error)', hover: 'var(--rise-error-hover)' },
	text: { base: 'var(--rise-on-error)' },
}
/** Кнопки в панели компактнее основных: размер sm при sizeScale = 100 */
const BUTTON_SCALE_RATIO = 0.875

/** Предыдущая кнопка по кругу; без фокуса на кнопке — последняя */
function previousIndex(index: number, count: number): number {
	return index <= 0 ? count - 1 : index - 1
}

/** Tab и Shift+Tab ходят между кнопками по кругу: панель в конце body, и фокус не должен уйти за неё */
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
		elementKeys: ['root', 'trigger', 'panel', 'title', 'description', 'cancel', 'confirm'],
	})
	return {
		classes,
		dangerColor: DANGER_COLOR,
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

/** При открытии фокус — на «Отмене» для необратимых действий, иначе на подтверждении (кнопка с data-autofocus) */
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

	/** Ответ: закрыть панель, вернуть фокус на кнопку и сообщить результат */
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
		/** Escape и клик снаружи — отмена */
		handleDropdownUpdate(value: boolean): void {
			if (!value && isOpenLocal.value) finish(false)
		},
		handleKeydown(event: KeyboardEvent): void {
			if (event.key === 'Tab' && dialogRef.value) cycleFocus(event, dialogRef.value)
		},
	}
}
