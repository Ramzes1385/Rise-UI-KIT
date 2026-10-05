import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const PROGRESS_SHAPES = ['line', 'circle'] as const

export const PROGRESS_ANIMATIONS = ['none', 'striped', 'pulse', 'glow', 'flow'] as const

/** Заливка: `solid` — цвет, `gradient` — от светлого к цвету, `rainbow` — радуга по всей шкале, `segments` — полоса из делений. */
export const PROGRESS_FILLS = ['solid', 'gradient', 'rainbow', 'segments'] as const

/**
 * Части индикатора для пропа `ui` (БЭМ-элементы `.base-progress__<часть>`, `root` — корень с `role="progressbar"`):
 * status — строка подписи над полосой, status-text — текст подписи, track — дорожка, bar — слой заливки (на нём свечение `glow`),
 * fill — заливка полосы, svg — кольцо, track-circle — дорожка кольца, fill-circle — заливка кольца, circle-label — подпись в центре кольца.
 */
export const PROGRESS_PARTS = [
	'status',
	'status-text',
	'track',
	'bar',
	'fill',
	'svg',
	'track-circle',
	'fill-circle',
	'circle-label',
] as const

export type BaseProgressPart = (typeof PROGRESS_PARTS)[number]

export type ProgressShape = (typeof PROGRESS_SHAPES)[number]

export type ProgressAnimation = (typeof PROGRESS_ANIMATIONS)[number]

export type ProgressFill = (typeof PROGRESS_FILLS)[number]

export interface ProgressGradientStop {
	/** Положение, 0–1 */
	offset: number
	/** Цвет — токен `var(--rise-…)` или его смесь */
	color: string
}

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
	/**
	 * Движение заливки: `striped` — полосы, `pulse` — мерцание, `glow` — свечение, `flow` — перелив бежит вдоль полосы
	 * (у кольца `flow` неподвижен). Движение — только без prefers-reduced-motion.
	 */
	animation?: ProgressAnimation
	/**
	 * Заливка: `solid` — цвет `color`; `gradient` — от светлого оттенка к цвету; `rainbow` — радуга по всей шкале, заливка
	 * открывает её по мере роста; `segments` — полоса из делений (у кольца — как `solid`).
	 */
	fill?: ProgressFill
	/** Показывать подпись с процентом: над полосой у линии, в центре у круга. В неопределённом режиме не показывается. */
	hasLabel?: boolean
	/** Неопределённый режим: значение неизвестно, индикатор показывает, что работа идёт; `aria-valuenow` не выставляется. */
	isIndeterminate?: boolean
	/**
	 * Доступное имя индикатора для скринридеров (например «Загрузка файла»).
	 * По умолчанию — «Прогресс»; внешний aria-labelledby имеет приоритет.
	 */
	ariaLabel?: string
	/**
	 * Классы частей индикатора (`root`, `status`, `status-text`, `track`, `bar`, `fill`, `svg`, `track-circle`, `fill-circle`,
	 * `circle-label`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseProgress: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseProgress :value="40" :ui="{ track: 'shadow-inner', fill: 'bg-emerald-500' }" />
	 */
	ui?: UiProp<BaseProgressPart>
}

export interface BaseProgressEmits {
	/**
	 * Значение достигло `max` (не по округлению процента). Срабатывает при каждом переходе на максимум и один раз при монтировании,
	 * если значение уже на максимуме; в неопределённом режиме не срабатывает.
	 */
	(event: 'complete'): void
}

export interface BaseProgressSlots {
	/** Содержимое подписи при `hasLabel` (по умолчанию «N%»): `value` — значение, `percent` — процент 0–100. */
	default?: (props: { value: number; percent: number }) => unknown
}

export type ProgressProps = PropsWithDefaults<BaseProgressProps, 'max' | 'sizeScale' | 'fill'>
