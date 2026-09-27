import type { BaseComponentProps } from '../../../types/base.types'

/**
 * Варианты оформления:
 * default — дорожка bg-elevated, выбранный сегмент — фон страницы с тенью;
 * soft — выбранный сегмент в мягком основном цвете; outline — дорожка с рамкой, выбранный сегмент с рамкой основного цвета
 */
export const SEGMENTED_VARIANTS = ['default', 'soft', 'outline'] as const

/** Сегмент */
export interface SegmentedOption {
	/** Значение: уходит в v-model при выборе */
	value: string | number
	/** Подпись сегмента */
	label: string
	/** Иконка перед подписью */
	icon?: string
	/** Сегмент нельзя выбрать */
	isDisabled?: boolean
}

/**
 * Пропсы компонента BaseSegmented
 */
export interface BaseSegmentedProps extends BaseComponentProps<(typeof SEGMENTED_VARIANTS)[number], 'root' | 'label' | 'track' | 'segment' | 'error'> {
	/** Выбранное значение (v-model) */
	modelValue?: string | number | null
	/** Сегменты */
	options: SegmentedOption[]
	/** Заголовок группы — её имя для скринридера */
	label?: string
	/** Имя группы без видимого заголовка */
	ariaLabel?: string
	/** Имя нативных radio (по умолчанию уникальное) */
	name?: string
	/** Отключает все сегменты */
	isDisabled?: boolean
	/** Во всю ширину: сегменты делят её поровну */
	isBlock?: boolean
	/** Текст ошибки под группой */
	error?: string
}

/**
 * События компонента BaseSegmented
 */
export interface BaseSegmentedEmits {
	/** Выбран сегмент (кликом, стрелками или пробелом) */
	(event: 'update:modelValue', value: string | number): void
	/** То же после действия пользователя */
	(event: 'change', value: string | number): void
}
