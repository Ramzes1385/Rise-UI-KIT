import type { InputVariant } from '@components/BaseInput'
import type { CustomColor } from '@composables/useCustomColor'
import type { CustomClassProp } from '@composables/useCustomClass'

export interface DatePickerFieldProps {
	/** Отображаемое значение в инпуте */
	displayValue: string
	/** Плейсхолдер */
	placeholder: string
	/** Лейбл */
	label?: string
	/** Текст ошибки */
	error?: string
	/** Отключён */
	isDisabled?: boolean
	/** Только для чтения */
	isReadonly?: boolean
	/** Обязательное поле */
	isRequired?: boolean
	/** Панель открыта */
	isOpen?: boolean
	/** Показывать кнопку очистки */
	isClearable?: boolean
	/** Есть выбранное значение */
	hasValue?: boolean
	/** Вариант инпута */
	inputVariant?: InputVariant
	/** Кастомный цвет */
	color?: CustomColor
	/** Масштаб размера */
	sizeScale?: number
	/** Кастомные классы */
	customClass?: CustomClassProp
}

export interface DatePickerFieldEmits {
	(event: 'field-click'): void
	(event: 'clear-click'): void
	(event: 'icon-click'): void
	/** Запрос открытия панели с клавиатуры (Enter / ↓ в поле) */
	(event: 'keyboard-open'): void
}

export interface DatePickerFieldSlots {
	/** Кастомная иконка */
	icon?: () => unknown
}
