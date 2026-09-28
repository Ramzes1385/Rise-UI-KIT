import type { Ref } from 'vue'
import type { PropsWithDefaults } from '@composables/useDefaults'
import type { FieldInputAttrs } from '@composables/useFormContext'
import type { BaseComponentProps } from '@composables/useBaseComponent'
import type { InputVariant } from '@components/BaseInput/types/BaseInput.types'

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

/** Пропсы BaseInputNumber после значений по умолчанию */
export type InputNumberProps = PropsWithDefaults<BaseInputNumberProps, 'modelValue' | 'step' | 'isDisabled' | 'isReadonly' | 'hasControls'>

/** Текст поля и его формат */
export interface NumberDraft {
	/** Текст в поле: пока пользователь печатает — его текст, иначе — значение в формате языка */
	draft: Ref<string>
	/** Знаков после запятой: из пропа или по шагу */
	precision: Readonly<Ref<number>>
	/** Число в формате языка без разделителей разрядов: `1,5` по-русски */
	format: (value: number | null) => string
}

/** Запись значения: округление, границы, v-model и `change` */
export interface NumberCommit {
	commit: (value: number | null) => void
	/** Набранный текст: число округляется и ограничивается, нечисло возвращает прежнее значение */
	commitDraft: () => void
	/** Шаг кнопкой или клавишей */
	stepBy: (multiplier: number) => void
	/** Фокус в поле: `change` сравнивается со значением на входе */
	rememberCommitted: () => void
}
