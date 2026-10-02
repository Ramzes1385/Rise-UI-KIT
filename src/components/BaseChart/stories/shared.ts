import type { ChartSeries } from '../types/BaseChart.types'

export const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

export const REVENUE_SERIES: ChartSeries[] = [
	{ name: 'Выручка', values: [120, 135, 150, 142, 168, 180, 175, 190, 205, 198, 220, 240] },
	{ name: 'Расходы', values: [90, 95, 110, 105, 118, 126, 130, 128, 140, 145, 150, 162] },
]
