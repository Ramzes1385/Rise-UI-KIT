import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { FieldInputAttrs } from '@composables/form/useFormContext'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { InputVariant } from '@components/BaseInput/types/BaseInput.types'
import type { BaseAutocompletePart } from '@components/BaseAutocomplete/types/BaseAutocomplete.types'

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
 * Части поля времени для пропа `ui` (`root` — корень). Своих БЭМ-элементов у обёртки нет: части принадлежат внутреннему
 * BaseAutocomplete и передаются ему — dropdown, panel — панель списка, panel-content, options — список, option — пункт,
 * option-label, match — совпадение с набранным, empty — «Ничего не найдено», status — скрытый live-регион; части поля
 * BaseInput — label, required — звёздочка, wrapper — рамка поля, field — `<input>`, error-text.
 */
export const TIME_PICKER_PARTS = [
	'dropdown',
	'panel',
	'panel-content',
	'options',
	'option',
	'option-label',
	'match',
	'empty',
	'status',
	'label',
	'required',
	'wrapper',
	'field',
	'error-text',
] as const satisfies readonly BaseAutocompletePart[]

export type BaseTimePickerPart = (typeof TIME_PICKER_PARTS)[number]

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
	/**
	 * Классы частей поля (`root`, `wrapper`, `field`, `option`, `panel`… — см. `TIME_PICKER_PARTS`) — добавляются к классам кита
	 * на элементах внутренних BaseAutocomplete, BaseInput и BaseDropdown. Глобально — `defaults.BaseTimePicker.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseTimePicker :ui="{ wrapper: 'shadow-sm', option: 'font-mono' }" />
	 */
	ui?: UiProp<BaseTimePickerPart>
}

export interface BaseTimePickerEmits {
	/** Новое время `HH:MM` или `null` */
	(event: 'update:modelValue', value: string | null): void
	/** То же после действия пользователя */
	(event: 'change', value: string | null): void
	(event: 'blur', e: FocusEvent): void
	(event: 'focus', e: FocusEvent): void
}

export type TimePickerProps = PropsWithDefaults<BaseTimePickerProps, 'step'>
