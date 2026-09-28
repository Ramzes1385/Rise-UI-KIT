import type { Ref } from 'vue'
import { toHTMLTextAreaElement } from '@utils/domUtils'
import { useFormField } from '@composables/useFormField'
import { useFieldControl } from '@composables/useFormContext'
/** Composable: логика BaseTextarea — связь с BaseFormField, счётчик символов и высота по тексту */
import { computed, nextTick, onMounted, ref, useId, watch } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseTextareaEmits, TextareaProps } from '../types/BaseTextarea.types'

/** Поле и BaseFormField вокруг: id (подпись связана через for), описания, aria-invalid и aria-required */
function useTextareaControl(props: TextareaProps) {
	// id текста ошибки и счётчика: поле описано ими через aria-describedby
	const ownId = useId()
	const errorId = `${ownId}-error`
	const counterId = `${ownId}-counter`
	const formField = useFormField({ value: () => props.modelValue, error: () => props.error, isRequired: () => props.isRequired })
	const hasCounter = computed(() => Boolean(props.maxlength && props.maxlength > 0))
	const control = useFieldControl({
		id: () => props.inputAttrs?.id as string | undefined,
		// Что описывает поле: текст ошибки, счётчик символов и описание из inputAttrs
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
		// Атрибуты нативного поля: inputAttrs, имя без подписи (ariaLabel) и aria-состояния поля и обёртки
		nativeAttrs: computed(() => ({
			...props.inputAttrs,
			...(props.name ? { name: props.name } : {}),
			...(props.ariaLabel ? { 'aria-label': props.ariaLabel } : {}),
			...control.aria.value,
		})),
	}
}

/**
 * Высота по тексту (isAutosize). Высота сначала сбрасывается в auto: иначе scrollHeight не меньше текущей высоты
 * и поле только растёт. У поля box-sizing: border-box, поэтому к scrollHeight (текст + отступы) добавляются рамки
 */
function useAutosize(props: TextareaProps, textareaRef: Ref<HTMLTextAreaElement | null>) {
	const adjustHeight = (): void => {
		const el = textareaRef.value
		/* istanbul ignore next -- el всегда существует после mount, ветка !el — защитный guard */
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
	// Включение autosize подгоняет высоту сразу, выключение возвращает высоту по rows (и ручное изменение размера)
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
