import type { PropsWithDefaults } from '@composables/useDefaults'
import type { BaseComponentProps } from '@composables/useBaseComponent'

export const PROGRESS_SHAPES = ['line', 'circle'] as const

export const PROGRESS_ANIMATIONS = ['none', 'striped', 'pulse', 'glow'] as const

export type ProgressShape = (typeof PROGRESS_SHAPES)[number]

export type ProgressAnimation = (typeof PROGRESS_ANIMATIONS)[number]

export interface BaseProgressProps extends BaseComponentProps<
	string,
	'root' | 'track' | 'fill' | 'tooltipTrigger' | 'tooltipAnchor' | 'svg' | 'trackCircle' | 'fillCircle' | 'circleLabel'
> {
	/** Значение от 0 до `max`. Значения за пределами шкалы ограничиваются. */
	value: number
	/** Максимальное значение: процент считается как `value / max`. */
	max?: number
	/** Форма: `line` — полоса, `circle` — кольцо. */
	shape?: ProgressShape
	/** Оформление заливки: `striped` — полосы, `pulse` — мерцание, `glow` — свечение (движение — только без prefers-reduced-motion). */
	animation?: ProgressAnimation
	/** Показывать подпись с процентом: над полосой у линии, в центре у круга. В неопределённом режиме не показывается. */
	hasLabel?: boolean
	/** Неопределённый режим: значение неизвестно, индикатор показывает, что работа идёт; `aria-valuenow` не выставляется. */
	isIndeterminate?: boolean
	/**
	 * Доступное имя индикатора для скринридеров (например «Загрузка файла»).
	 * По умолчанию — «Прогресс»; внешний aria-labelledby имеет приоритет.
	 */
	ariaLabel?: string
}

export interface BaseProgressEmits {
	/** Прогресс достиг 100%. */
	(event: 'complete'): void
}

export interface BaseProgressSlots {
	/** Содержимое подписи при `hasLabel` (по умолчанию «N%»): `value` — значение, `percent` — процент 0–100. */
	default?: (props: { value: number; percent: number }) => unknown
}

export type ProgressProps = PropsWithDefaults<BaseProgressProps, 'max' | 'sizeScale'>
