import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Варианты оформления: `default` — ячейки со скруглением, `square` — квадратные ячейки */
export const HEATMAP_VARIANTS = ['default', 'square'] as const

/**
 * Части календаря для пропа `ui` (БЭМ-элементы `.base-heatmap__<часть>`, `root` — корень):
 * scroll — прокручиваемая область с `role="img"`, svg — холст, caption — подписи месяцев и дней недели, cell — ячейка дня,
 * footer — строка под календарём, tooltip — значение и дата наведённого дня, scale — легенда «Меньше … Больше»,
 * swatch — образец уровня в легенде.
 */
export const HEATMAP_PARTS = ['scroll', 'svg', 'caption', 'cell', 'footer', 'tooltip', 'scale', 'swatch'] as const

export type BaseHeatmapPart = (typeof HEATMAP_PARTS)[number]

/** Значение за день: дата (`ГГГГ-ММ-ДД` или Date) и число */
export interface HeatmapDay {
	date: string | Date
	value: number
}

/** Ячейка календаря: дата, значение, уровень насыщенности 0–4 и положение */
export interface HeatmapCell {
	key: string
	date: Date
	value: number
	level: number
	week: number
	weekday: number
}

/** Подпись месяца над первой неделей, где он начинается */
export interface HeatmapMonth {
	key: string
	label: string
	week: number
}

/**
 * Пропсы компонента BaseHeatmap
 */
export interface BaseHeatmapProps extends BaseComponentProps<(typeof HEATMAP_VARIANTS)[number], 'root'> {
	/** Значения по дням; дни без значения считаются нулевыми */
	data: readonly HeatmapDay[]
	/** Что показывает календарь: имя для скринридера («Коммиты за год») */
	label: string
	/** Последний день календаря; по умолчанию — сегодня */
	endDate?: string | Date
	/** Сколько недель показывать; по умолчанию 53 — год */
	weeks?: number
	/** Цвет насыщенных дней: токен или CSS-цвет. По умолчанию — бирюзовый цвет графиков `--rise-chart-3` */
	markColor?: string
	/** Формат значения в подсказке и описании */
	formatValue?: (value: number) => string
	/**
	 * Классы частей календаря (`root`, `scroll`, `svg`, `caption`, `cell`, `footer`, `tooltip`, `scale`, `swatch`) — добавляются
	 * к классам кита. Глобально — `createUiKitPlugin({ defaults: { BaseHeatmap: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseHeatmap label="Коммиты" :data="days" :ui="{ cell: 'cursor-pointer', footer: 'text-sm' }" />
	 */
	ui?: UiProp<BaseHeatmapPart>
}
