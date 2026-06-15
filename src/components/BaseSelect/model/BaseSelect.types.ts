import type { BaseComponentProps } from '@/types/base.types'

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
export interface BaseSelectProps extends BaseComponentProps<BaseSelectVariant> {
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
}

/**
 * События компонента BaseSelect
 */
export interface BaseSelectEmits {
	(event: 'update:modelValue', value: string | number | (string | number)[]): void
	(event: 'change', value: string | number | (string | number)[]): void
}
