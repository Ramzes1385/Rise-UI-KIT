import type { InputVariant } from '@components/BaseInput/model/BaseInput.types'
import type { BaseComponentProps } from '@composables/useBaseComponent'
import type { FieldInputAttrs } from '@composables/useFormContext'

/** Варианты оформления — как у BaseInput */
export const TIME_PICKER_VARIANTS = [
	'default',
	'ghost',
	'outline',
	'shadow',
	'soft',
	'filled',
	'underline',
] as const satisfies readonly InputVariant[]

/**
 * Пропсы компонента BaseTimePicker
 */
export interface BaseTimePickerProps extends BaseComponentProps<InputVariant, 'root' | 'field' | 'panel' | 'option'> {
	/** Время `HH:MM` (v-model); `null` — не выбрано */
	modelValue?: string | null
	/** Шаг списка в минутах (по умолчанию 30). Набрать можно любое время */
	step?: number
	/** Самое раннее время `HH:MM`: список начинается с него, раньше набрать нельзя */
	minTime?: string
	/** Самое позднее время `HH:MM` */
	maxTime?: string
	/** Подпись поля */
	label?: string
	/** Подсказка в пустом поле (по умолчанию «чч:мм») */
	placeholder?: string
	/** Текст ошибки: показывается под полем и описывает его */
	error?: string
	/** Отключает поле */
	isDisabled?: boolean
	/** Только чтение */
	isReadonly?: boolean
	/** Обязательное поле: звёздочка и `aria-required` */
	isRequired?: boolean
	/** Имя поля без видимой подписи */
	ariaLabel?: string
	/** Атрибуты нативного поля (`name`, `data-*`, свой `id`) */
	inputAttrs?: FieldInputAttrs
}

/**
 * События компонента BaseTimePicker
 */
export interface BaseTimePickerEmits {
	/** Новое время `HH:MM` или `null` */
	(event: 'update:modelValue', value: string | null): void
	/** То же после действия пользователя */
	(event: 'change', value: string | null): void
	(event: 'blur', e: FocusEvent): void
	(event: 'focus', e: FocusEvent): void
}
