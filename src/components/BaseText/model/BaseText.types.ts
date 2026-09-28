import type { BaseComponentProps } from '@composables/useBaseComponent'

/** Семантические HTML-теги */
export const TEXT_TAGS = [
	'p',
	'span',
	'div',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'label',
	'small',
	'strong',
	'em',
] as const

/**
 * Начертания кита: 400 — текст, 500 — подписи и кнопки, 600 — заголовки, 700 — акценты.
 * Проп `weight` принимает и другие значения 100–900
 */
export const TEXT_WEIGHT = {
	REGULAR: 400,
	MEDIUM: 500,
	SEMIBOLD: 600,
	BOLD: 700,
} as const

/**
 * Пропсы компонента BaseText
 */
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

/**
 * События компонента BaseText
 */
export type BaseTextEmits = Record<string, never>

/**
 * Слоты компонента BaseText
 */
export interface BaseTextSlots {
	default?: () => unknown
}
