import type { Ref } from 'vue'
import { toHTMLTextAreaElement } from '@utils/domUtils'
import { useFormField } from '@composables/useFormField'
import { useFieldControl } from '@composables/useFormContext'
import { computed, nextTick, onMounted, ref, useId, watch } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseTextareaEmits, TextareaProps } from '../types/BaseTextarea.types'

function useTextareaControl(props: TextareaProps) {
	const ownId = useId()
	const errorId = `${ownId}-error`
	const counterId = `${ownId}-counter`
	const formField = useFormField({ value: () => props.modelValue, error: () => props.error, isRequired: () => props.isRequired })
	const hasCounter = computed(() => Boolean(props.maxlength && props.maxlength > 0))
	const control = useFieldControl({
		id: () => props.inputAttrs?.id as string | undefined,
		describedBy: () =>
			[formField.error ? errorId : '', hasCounter.value ? counterId : '', props.inputAttrs?.['aria-describedby']]
				.filter(Boolean)
				.join(' ') || undefined,
		hasError: () => Boolean(formField.error),
		isRequired: () => props.isRequired,
	})

	return {
		errorId,
		counterId,
		formField,
		hasCounter,
		control,
		textareaId: control.id,
		characterCount: computed(() => props.modelValue?.length ?? 0),
		nativeAttrs: computed(() => ({
			...props.inputAttrs,
			...(props.name ? { name: props.name } : {}),
			...(props.ariaLabel ? { 'aria-label': props.ariaLabel } : {}),
			...control.aria.value,
		})),
	}
}

function useAutosize(props: TextareaProps, textareaRef: Ref<HTMLTextAreaElement | null>) {
	const adjustHeight = (): void => {
		const el = textareaRef.value
		if (!el || !props.isAutosize) return
		el.style.height = 'auto'
		const { borderTopWidth, borderBottomWidth } = getComputedStyle(el)
		const borders = (Number.parseFloat(borderTopWidth) || 0) + (Number.parseFloat(borderBottomWidth) || 0)
		el.style.height = `${el.scrollHeight + borders}px`
	}
	const scheduleAdjust = (): void => {
		if (props.isAutosize) nextTick(adjustHeight)
	}

	watch(() => props.modelValue, scheduleAdjust)
	watch(
		() => props.isAutosize,
		isAutosize => {
			if (isAutosize) nextTick(adjustHeight)
			else if (textareaRef.value) textareaRef.value.style.height = ''
		},
	)
	onMounted(scheduleAdjust)

	return { adjustHeight, scheduleAdjust }
}

export function useBaseTextarea(props: TextareaProps, emit: BaseTextareaEmits) {
	const standard = useStandardBaseComponent('base-textarea', props, ['root', 'label', 'required', 'field', 'errorText'])
	const field = useTextareaControl(props)
	const textareaRef = ref<HTMLTextAreaElement | null>(null)
	const { adjustHeight, scheduleAdjust } = useAutosize(props, textareaRef)

	return {
		...standard,
		...field,
		textareaRef,
		handleInput(e: Event): void {
			const target = toHTMLTextAreaElement(e.target)
			if (!target) return
			emit('update:modelValue', target.value)
			scheduleAdjust()
		},
		handleBlur(e: FocusEvent): void {
			field.formField.onBlur()
			emit('blur', e)
		},
		handleFocus(e: FocusEvent): void {
			emit('focus', e)
		},
		exposed: {
			rootRef: textareaRef,
			textareaRef,
			adjustHeight,
			focus: () => textareaRef.value?.focus(),
			blur: () => textareaRef.value?.blur(),
			validate: field.formField.validate,
			reset: field.formField.reset,
		},
	}
}
