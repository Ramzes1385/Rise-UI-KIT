import type { CustomClassProp } from '@composables/useCustomClass'
import type { CustomColor } from '@composables/useCustomColor'

/** Варианты отображения селекта */
export const SELECT_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft', 'underline'] as const

/**
 * Опция выбора
 */
export interface BaseSelectOption {
	/** Значение */
	value: string | number
	/** Отображаемый текст */
	label: string
	/** Иконка (опционально) */
	icon?: string
	/** Дополнительное описание */
	description?: string
	/** Отключена ли опция */
	isDisabled?: boolean
}

/**
 * Вариант отображения
 */
export type BaseSelectVariant = (typeof SELECT_VARIANTS)[number]

/**
 * Пропсы компонента BaseSelect
 */
export interface BaseSelectProps {
	/** Выбранное значение (или массив для мультивыбора) */
	modelValue?: string | number | (string | number)[]
	/** Список опций */
	options: BaseSelectOption[]
	/** Плейсхолдер */
	placeholder?: string
	/** Заголовок поля */
	label?: string
	/** Обязательное поле */
	isRequired?: boolean
	/** Мультивыбор */
	isMultiple?: boolean
	/** Возможность поиска */
	isSearchable?: boolean
	/** Отключенное состояние */
	isDisabled?: boolean
	/** Текст ошибки */
	error?: string
	/** Вариант отображения */
	variant?: BaseSelectVariant
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Кастомные классы */
	customClass?: CustomClassProp
}

/**
 * События компонента BaseSelect
 */
export interface BaseSelectEmits {
	(event: 'update:modelValue', value: string | number | (string | number)[]): void
	(event: 'change', value: string | number | (string | number)[]): void
}
