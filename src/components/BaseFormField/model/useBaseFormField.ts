/** Composable: логика BaseFormField — связь подписи, описания и ошибки с контролом внутри */
import { computed, provide, ref, shallowRef, useId } from 'vue'
import { useFormField } from '@composables/useFormField'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { FORM_FIELD_CONTEXT_KEY, useFormContext } from '@composables/useFormContext'
import type { FormFieldControl, FormFieldProps } from '../types/BaseFormField.types'

const FIELD_ELEMENTS = ['root', 'header', 'label', 'required', 'content', 'description', 'animation', 'error']

/** id подписи, описания и ошибки: по ним содержимое без `for` получает имя и описание группы */
function useFieldIds() {
	const fieldId = useId()
	return { labelId: `${fieldId}-label`, descriptionId: `${fieldId}-description`, errorId: `${fieldId}-error` }
}

/**
 * Ошибка поля: из пропа или из проверки BaseForm по схеме (по `name`). Обёртка не владеет значением контрола, поэтому
 * required здесь не проверяется: проверка «пустого» значения всегда показывала бы ложное «Обязательное поле».
 * isRequired — звёздочка и aria-required у контрола кита внутри; пустоту значения проверяет сам контрол (его validate())
 */
function useFieldError(props: FormFieldProps) {
	const form = useFormContext()
	const formError = computed(() => (props.name ? form?.errors.value[props.name] : undefined))
	const formField = useFormField({ value: () => undefined, error: () => props.error || formError.value })
	return { formField, error: computed(() => formField.error) }
}

/** Первый контрол кита внутри обёртки регистрируется сам; отписка — при его размонтировании */
function useControlRegistry() {
	const control = shallowRef<FormFieldControl | null>(null)
	return {
		control,
		register(getId: () => string, isLabelable: boolean): (() => void) | undefined {
			if (control.value) return undefined
			const entry = { getId, isLabelable }
			control.value = entry
			return () => {
				if (control.value === entry) control.value = null
			}
		},
	}
}

export function useBaseFormField(props: FormFieldProps) {
	const standard = useStandardBaseComponent('base-form-field', props, FIELD_ELEMENTS)
	const rootRef = ref<HTMLElement | null>(null)
	const { labelId, descriptionId, errorId } = useFieldIds()
	const { formField, error } = useFieldError(props)
	const { control, register } = useControlRegistry()
	// Ошибка вытесняет описание так же, как на экране
	const describedBy = computed(() => {
		if (error.value) return errorId
		return props.description ? descriptionId : undefined
	})

	provide(FORM_FIELD_CONTEXT_KEY, {
		labelId,
		hasLabel: computed(() => Boolean(props.label)),
		describedBy,
		hasError: computed(() => Boolean(error.value)),
		isRequired: computed(() => props.isRequired),
		register,
	})

	return {
		...standard,
		rootRef,
		labelId,
		descriptionId,
		errorId,
		error,
		describedBy,
		// С чем связана подпись: `for` из пропа или id подключённого нативного поля
		controlId: computed(() => props.for ?? (control.value?.isLabelable ? control.value.getId() : undefined)),
		// Подпись есть, но связать её не с чем — подпись называет содержимое как группу
		isGroup: computed(() => Boolean(props.label) && !props.for && !control.value),
		exposed: { rootRef, validate: formField.validate, reset: formField.reset },
	}
}
