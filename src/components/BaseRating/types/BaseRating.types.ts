import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { SeoComponentProps } from '@composables/seo/useStructuredData'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const RATING_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export type RatingVariant = (typeof RATING_VARIANTS)[number]

export interface BaseRatingProps extends SeoComponentProps, BaseComponentProps<RatingVariant, 'root' | 'icon' | 'iconFilled' | 'value'> {
	/** Текущая оценка (v-model), допускает дробные значения */
	modelValue?: number
	/** Количество звёзд */
	max?: number
	/** Шаг выбора и округления оценки: клик, стрелки и Home/End (1 — целые, 0.5 — половинки, 0.1 — десятые). PageUp/PageDown меняют оценку на целую звезду */
	step?: number
	/** Плавный предпросмотр при наведении: заливка следует за курсором попиксельно, игнорируя step */
	isHoverSmooth?: boolean
	/** Показывать число рядом со звёздами: при наведении — оценка, которую запишет клик, иначе текущая. Знаков после запятой — как у `step` */
	isValueShown?: boolean
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

/** Слотов нет: содержимое строится из props */
export type BaseRatingSlots = Record<never, never>

export type RatingProps = PropsWithDefaults<BaseRatingProps, 'modelValue' | 'max' | 'step' | 'icon'>
