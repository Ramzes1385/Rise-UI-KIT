import type { UiClassFn } from '@composables/base/useUi'
import type { InputVariant } from '@components/BaseInput'
import type { BaseDatePickerPart } from './BaseDatePicker.types'
import type { CustomColor } from '@composables/base/useCustomColor'
import type { CustomClassProp } from '@composables/base/useCustomClass'

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
	/** В поле можно вводить период вручную (диапазон, не только для чтения) */
	isEditable?: boolean
	/** В поле набран текст, который ещё не применён */
	hasDraft?: boolean
	/** Вариант инпута */
	inputVariant?: InputVariant
	/** Кастомный цвет */
	color?: CustomColor
	/** Масштаб размера */
	sizeScale?: number
	/** Кастомные классы */
	customClass?: CustomClassProp
	/** Классы частей дейтпикера: `ui` родителя (`.base-date-picker__<часть>` и классы из пропа `ui`) */
	partClass?: UiClassFn<BaseDatePickerPart>
}

export interface DatePickerFieldEmits {
	(event: 'field-click'): void
	(event: 'clear-click'): void
	(event: 'icon-click'): void
	/** Запрос открытия панели с клавиатуры (Enter / ↓ в поле) */
	(event: 'keyboard-open'): void
	/** Текст в поле изменён вручную */
	(event: 'text-input', value: string): void
	/** Применить набранный текст: Enter или уход из поля */
	(event: 'text-commit'): void
	/** Отменить набранный текст: Escape */
	(event: 'text-cancel'): void
}

export interface DatePickerFieldSlots {
	/** Кастомная иконка */
	icon?: () => unknown
}
