import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export interface BaseSkeletonProps extends Omit<BaseComponentProps<string, 'root'>, 'color'> {
	/**
	 * Ширина: число — пиксели (0 и больше), строка — любая длина CSS (`'100%'`, `'12rem'`). Масштабируется `sizeScale`;
	 * ключевые слова (`'auto'`, `'fit-content'`) — без масштаба. Отрицательное число и NaN не применяются.
	 */
	width?: string | number
	/**
	 * Высота: число — пиксели, строка — любая длина CSS, правила те же, что у `width`. У `text` по умолчанию 16px;
	 * `circle` без высоты — круг по ширине; `rect` без высоты не виден (растягивается только во flex и grid).
	 */
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

export type BaseSkeletonEmits = Record<string, never>

/** Слотов нет: содержимое строится из props */
export type BaseSkeletonSlots = Record<never, never>

export type SkeletonProps = PropsWithDefaults<BaseSkeletonProps, 'sizeScale'>
