import type { FieldInputAttrs } from '@composables/useFormContext'
import type { BaseComponentProps } from '@composables/useBaseComponent'
import type { InputVariant } from '@components/BaseInput/model/BaseInput.types'

/** Варианты оформления — как у BaseInput: поле числа — BaseInput с кнопками −/+ */
export const INPUT_NUMBER_VARIANTS = [
	'default',
	'ghost',
	'outline',
	'shadow',
	'soft',
	'filled',
	'underline',
] as const satisfies readonly InputVariant[]

/**
 * Пропсы компонента BaseInputNumber
 */
export interface BaseInputNumberProps extends BaseComponentProps<InputVariant, 'root' | 'field' | 'button'> {
	/** Число (v-model); `null` — поле пустое */
	modelValue?: number | null
	/** Наименьшее значение: Home ставит его, ввод меньше него поднимается до него при выходе из поля */
	min?: number
	/** Наибольшее значение: End ставит его */
	max?: number
	/** Шаг кнопок и стрелок; PageUp/PageDown — десять шагов */
	step?: number
	/** Знаков после запятой: значение округляется до них и показывается с ними. По умолчанию — как у шага */
	precision?: number
	/** Подпись поля */
	label?: string
	/** Подсказка в пустом поле */
	placeholder?: string
	/** Текст ошибки: показывается под полем и описывает его */
	error?: string
	/** Отключает поле и кнопки */
	isDisabled?: boolean
	/** Только чтение: значение не меняется, кнопки скрыты */
	isReadonly?: boolean
	/** Обязательное поле: звёздочка и `aria-required` */
	isRequired?: boolean
	/** Кнопки −/+ по краям поля */
	hasControls?: boolean
	/** Имя поля без видимой подписи */
	ariaLabel?: string
	/** Атрибуты нативного поля (`name`, `data-*`, свой `id`) */
	inputAttrs?: FieldInputAttrs
	/** Значение для скринридера (`aria-valuetext`), например «3 гостя» */
	formatValueText?: (value: number) => string
}

/**
 * События компонента BaseInputNumber
 */
export interface BaseInputNumberEmits {
	/** Новое значение: при вводе допустимого числа, кнопками и клавишами, при выходе из поля */
	(event: 'update:modelValue', value: number | null): void
	/** Значение изменено кнопкой, клавишей или при выходе из поля (после округления и границ) */
	(event: 'change', value: number | null): void
	(event: 'blur', e: FocusEvent): void
	(event: 'focus', e: FocusEvent): void
}
