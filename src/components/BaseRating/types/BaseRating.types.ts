import type { PropsWithDefaults } from '@composables/useDefaults'
import type { BaseComponentProps } from '@composables/useBaseComponent'

export const RATING_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export type RatingVariant = (typeof RATING_VARIANTS)[number]

export interface BaseRatingProps extends BaseComponentProps<RatingVariant, 'root' | 'icon' | 'iconFilled'> {
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
	/** Имя иконки заполненной звезды. По умолчанию для `icon="star"` — `star-filled` (сплошная звезда), для остальных — та же icon */
	iconFilled?: string
	/** Только для чтения — без интерактива */
	isReadonly?: boolean
	/** Заблокирован — без интерактива и приглушён */
	isDisabled?: boolean
}

export interface BaseRatingEmits {
	/** Изменение оценки через v-model */
	(event: 'update:modelValue', value: number): void
	/** Выбор оценки пользователем */
	(event: 'change', value: number): void
}

export interface BaseRatingSlots {
	default?: () => unknown
}

export type RatingProps = PropsWithDefaults<BaseRatingProps, 'modelValue' | 'max' | 'step' | 'icon'>
