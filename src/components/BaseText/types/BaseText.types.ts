import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const TEXT_TAGS = ['p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label', 'small', 'strong', 'em'] as const

export interface BaseTextProps extends BaseComponentProps<string, 'root'> {
	/** Семантический HTML-тег */
	tag?: (typeof TEXT_TAGS)[number]
	/** Начертание (100–900) */
	weight?: number
	/** Текст с переносом или без */
	nowrap?: boolean
	/** Обрезка текста с многоточием */
	truncate?: boolean
	/** Количество строк перед обрезкой (только с truncate) */
	maxLines?: number
}

export type BaseTextEmits = Record<string, never>

export interface BaseTextSlots {
	default?: () => unknown
}

export type TextProps = PropsWithDefaults<BaseTextProps, 'sizeScale' | 'maxLines'>
