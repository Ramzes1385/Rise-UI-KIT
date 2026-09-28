import type { BaseComponentProps } from '@composables/useBaseComponent'

/**
 * Пропсы компонента BaseSkeleton
 */
export interface BaseSkeletonProps extends Omit<BaseComponentProps<string, 'root'>, 'color'> {
	/** Ширина: число — пиксели, строка — любая длина CSS (`'100%'`, `'12rem'`). Масштабируется `sizeScale`. */
	width?: string | number
	/** Высота: число — пиксели, строка — любая длина CSS. У `text` по умолчанию 16px; `rect` и `circle` без высоты не видны. */
	height?: string | number
	/** Форма: `text` — строка текста, `rect` — блок со скруглением, `circle` — круг (аватар). */
	shape?: 'text' | 'circle' | 'rect'
	/** Полоса-шиммер (по умолчанию включена). Отключается при системной настройке «уменьшить движение». */
	isAnimated?: boolean
	/** Свой цвет фона вместо `--rise-bg-elevated` (любой цвет CSS, например токен `var(--rise-primary-soft)`). */
	color?: string
	/** Мерцание прозрачностью. Отключается при системной настройке «уменьшить движение». */
	isPulse?: boolean
}

/**
 * События компонента BaseSkeleton
 */
export type BaseSkeletonEmits = Record<string, never>

/**
 * Слоты компонента BaseSkeleton
 */
export interface BaseSkeletonSlots {
	default?: () => unknown
}
