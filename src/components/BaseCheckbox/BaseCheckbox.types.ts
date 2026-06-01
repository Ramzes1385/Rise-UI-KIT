import type { CustomClassProp } from '@composables/useCustomClass'
import type { CustomColor } from '@composables/useCustomColor'

/** Варианты отображения чекбокса */
export const CHECKBOX_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseCheckbox
 */
export interface BaseCheckboxProps {
	/**
	 * Кастомные классы. Строка применяется к корню, либо объект с ключами элементов:
	 * `root`, `labelWrapper`, `wrapper`, `input`, `box`, `icon` (вложенный BaseIcon),
	 * `label` (вложенный BaseText с подписью), `errorText` (вложенный BaseText с ошибкой).
	 */
	customClass?: CustomClassProp
	/** Состояние */
	modelValue?: boolean
	/** Заголовок */
	label?: string
	/** Текст ошибки */
	error?: string
	/** Отключенное состояние */
	isDisabled?: boolean
	/** Вариант отображения */
	variant?: (typeof CHECKBOX_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
}

/**
 * События компонента BaseCheckbox
 */
export interface BaseCheckboxEmits {
	(event: 'update:modelValue', value: boolean): void
	(event: 'change', value: boolean): void
}

/**
 * Слоты компонента BaseCheckbox
 */
export interface BaseCheckboxSlots {
	/** Кастомный текст ошибки */
	error?: () => unknown
}
