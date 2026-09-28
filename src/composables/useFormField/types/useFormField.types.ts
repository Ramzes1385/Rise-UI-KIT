export type ValidationRule = {
	validate: (value: unknown) => boolean
	message: string
}

export type UseFormFieldOptions = {
	value: () => unknown
	rules?: ValidationRule[]
	error?: () => string | undefined
	isRequired?: () => boolean
}

export type UseFormFieldReturn = {
	error: string
	isTouched: boolean
	isDirty: boolean
	isValid: boolean
	validate: () => boolean
	reset: () => void
	onBlur: () => void
}

/** Единый контракт defineExpose для form-field компонентов */
export interface FormFieldExpose {
	/** Ref на корневой элемент компонента */
	rootRef: HTMLElement | null
	/** Перевести фокус на элемент */
	focus: () => void
	/** Убрать фокус с элемента */
	blur: () => void
	/** Запустить валидацию, вернуть isValid */
	validate: () => boolean
	/** Сбросить состояние поля (touched, dirty, error) */
	reset: () => void
}

/**
 * Контракт defineExpose для обёрток-контейнеров (BaseFormField, BaseDatePicker),
 * которые не имеют собственного фокусируемого элемента.
 * Намеренно исключает focus/blur — нельзя перевести фокус на обёртку.
 */
export type FormFieldValidateExpose = Omit<FormFieldExpose, 'focus' | 'blur'>
