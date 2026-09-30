import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Вид диаграммы: `donut` — кольцо с итогом в центре, `pie` — круг */
export const PIE_CHART_VARIANTS = ['donut', 'pie'] as const

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
	dash: string
	offset: number
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
}
