import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Вид диаграммы: `donut` — кольцо с итогом в центре, `pie` — круг */
export const PIE_CHART_VARIANTS = ['donut', 'pie'] as const

/**
 * Появление диаграммы: `sweep` — части по очереди набегают по кругу, `grow` — круг вырастает из центра,
 * `fade` — проявляется, `none` — сразу. Обновление данных перетекает плавно во всех режимах, кроме `none`
 */
export const PIE_CHART_ANIMATIONS = ['sweep', 'grow', 'fade', 'none'] as const

/**
 * Части диаграммы для пропа `ui` (БЭМ-элементы `.base-pie-chart__<часть>`, `root` — корень `<figure>`):
 * chart — квадрат диаграммы; svg — рисунок; track — кольцо-подложка; segment — дуга части (и уходящая из данных);
 * center — итог и подпись в центре кольца (`variant="donut"`); legend — список легенды; item — строка легенды;
 * swatch — цветной квадрат; name — подпись части; value — значение; percent — доля в процентах.
 */
export const PIE_CHART_PARTS = [
	'chart',
	'svg',
	'track',
	'segment',
	'center',
	'legend',
	'item',
	'swatch',
	'name',
	'value',
	'percent',
] as const

export type BasePieChartPart = (typeof PIE_CHART_PARTS)[number]

/** Часть целого: подпись, значение и свой цвет (по умолчанию — цвет графиков по порядку) */
export interface PieSegment {
	label: string
	value: number
	color?: string
}

/** Часть для разметки: цвет, доля, длина дуги и её начало на окружности */
export interface PieSegmentView {
	label: string
	value: number
	color: string
	percent: number
	/** Начало части на окружности, % от полного круга */
	start: number
	dash: string
	offset: number
}

/** Часть на круге: вместе с ушедшими из данных, которые ещё сжимаются */
export interface PieSegmentRender extends PieSegmentView {
	/**
	 * Как часть появилась: `sweep` — с диаграммой по кругу, `added` — позже, вместе с новыми данными, `static` — сразу.
	 * Не меняется, пока часть на круге: иначе анимация появления запустится заново
	 */
	entry: 'sweep' | 'added' | 'static'
	/** Начало и доля части в момент появления, 0…1: задержка и длительность `sweep` */
	enter: { start: number; share: number }
	/** Части уже нет в данных: она сжимается до нуля и затем удаляется */
	isLeaving: boolean
}

/**
 * Пропсы компонента BasePieChart
 */
export interface BasePieChartProps extends BaseComponentProps<(typeof PIE_CHART_VARIANTS)[number], 'root' | 'legend'> {
	/** Части целого; порядок задаёт цвета, поэтому цвет части не меняется при фильтрации */
	segments: readonly PieSegment[]
	/** Что показывает диаграмма: имя для скринридера и подпись к итогу в центре кольца */
	label: string
	/** Сколько частей показывать; остальные собираются в «Другое». По умолчанию 6 */
	maxSegments?: number
	/** Диаметр в пикселях */
	size?: number
	/** Формат значения в легенде, подсказке и центре кольца */
	formatValue?: (value: number) => string
	/**
	 * Появление: `sweep` — по кругу, `grow` — из центра, `fade` — проявление, `none` — без анимации ни при появлении,
	 * ни при обновлении данных. При «уменьшить движение» в системе — сразу конечный вид. По умолчанию `sweep`
	 */
	animation?: (typeof PIE_CHART_ANIMATIONS)[number]
	/**
	 * Классы частей диаграммы (`root`, `chart`, `segment`, `center`, `legend`, `item`, `value`…) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BasePieChart: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BasePieChart :segments="segments" label="Задачи" :ui="{ legend: 'gap-2', value: 'font-bold' }" />
	 */
	ui?: UiProp<BasePieChartPart>
}
