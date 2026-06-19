import type { BaseComponentProps } from '@/types/base.types'

/** Варианты отображения рейтинга */
export const RATING_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export type RatingVariant = (typeof RATING_VARIANTS)[number]

/**
 * Пропсы компонента BaseRating
 */
export interface BaseRatingProps extends BaseComponentProps<RatingVariant> {
	/** Текущая оценка (v-model), допускает дробные значения */
	modelValue?: number
	/** Количество звёзд */
	max?: number
	/** Шаг выбора и округления оценки (1 — целые, 0.5 — половинки, 0.1 — десятые) */
	step?: number
	/** Плавный предпросмотр при наведении: заливка следует за курсором попиксельно, игнорируя step */
	isHoverSmooth?: boolean
	/** Имя иконки пустой звезды */
	icon?: string
	/** Имя иконки заполненной звезды (по умолчанию совпадает с icon) */
	iconFilled?: string
	/** Только для чтения — без интерактива */
	isReadonly?: boolean
	/** Заблокирован — без интерактива и приглушён */
	isDisabled?: boolean
}

/**
 * События компонента BaseRating
 */
export interface BaseRatingEmits {
	/** Изменение оценки через v-model */
	(event: 'update:modelValue', value: number): void
	/** Выбор оценки пользователем */
	(event: 'change', value: number): void
}

/**
 * Слоты компонента BaseRating
 */
export interface BaseRatingSlots {
	default?: () => unknown
}
