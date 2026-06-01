import type { CustomClassProp } from '@composables/useCustomClass'
import type { CustomColor } from '@composables/useCustomColor'

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
 * Пропсы компонента BaseText
 */
export interface BaseTextProps {
	/** Семантический HTML-тег */
	tag?: (typeof TEXT_TAGS)[number]
	/** Начертание (100–900) */
	weight?: number
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Текст с переносом или без */
	nowrap?: boolean
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Обрезка текста с многоточием */
	truncate?: boolean
	/** Количество строк перед обрезкой (только с truncate) */
	maxLines?: number
	/** Кастомные классы (строка или объект) */
	customClass?: CustomClassProp
}
