import { storyDate } from '@/stories/helpers'
import type { ChartSeries } from '../types/BaseChart.types'

export const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

export const REVENUE_SERIES: ChartSeries[] = [
	{ name: 'Выручка', values: [120, 135, 150, 142, 168, 180, 175, 190, 205, 198, 220, 240] },
	{ name: 'Расходы', values: [90, 95, 110, 105, 118, 126, 130, 128, 140, 145, 150, 162] },
]

export const QUARTERS = ['I кв.', 'II кв.', 'III кв.', 'IV кв.']

export const CHANNEL_SERIES: ChartSeries[] = [
	{ name: 'Сайт', values: [320, 410, 380, 520] },
	{ name: 'Приложение', values: [210, 260, 340, 390] },
	{ name: 'Партнёры', values: [140, 120, 160, 180] },
]

export const BALANCE_SERIES: ChartSeries[] = [
	{ name: 'Продажи', values: [42, 48, 51, 46, 55, 60] },
	{ name: 'Подписки', values: [18, 20, 22, 25, 27, 30] },
	{ name: 'Возвраты', values: [-6, -9, -4, -12, -7, -5] },
]

export const TEAM_SERIES: ChartSeries[] = [
	{ name: 'Москва', values: [64, 70, 68, 75, 80, 78] },
	{ name: 'Санкт-Петербург', values: [52, 55, 60, 58, 62, 66] },
	{ name: 'Казань', values: [30, 34, 33, 38, 41, 44] },
	{ name: 'Екатеринбург', values: [28, 27, 31, 35, 34, 37] },
	{ name: 'Новосибирск', values: [22, 25, 24, 26, 30, 31] },
	{ name: 'Самара', values: [15, 18, 20, 19, 22, 24] },
	{ name: 'Краснодар', values: [12, 14, 13, 17, 19, 21] },
	{ name: 'Пермь', values: [8, 9, 11, 10, 12, 14] },
]

export const SENSOR_LABELS = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00']

export const SENSOR_SERIES: ChartSeries[] = [
	{ name: 'Цех 1', values: [18.5, 18.1, null, 21.4, 23.9, 24.2, null, 19.8] },
	{ name: 'Цех 2', values: [17.2, null, 16.8, 19.5, null, 22.1, 21.0, 18.4] },
]

export const SALES_DAYS = Array.from({ length: 14 }, (_, index) => storyDate(index - 13))

export const SALES_SERIES: ChartSeries[] = [
	{ name: 'Продажи', values: [48200, 51900, 47300, 55100, 60400, 38900, 35200, 52700, 56300, 58800, 61200, 64900, 42100, 39800] },
]

export const DENSE_SCRIPT = [
	'const labels = Array.from({ length: 1000 }, (_, index) => index + 1)',
	'const series = [',
	"\t{ name: 'Нагрузка', values: labels.map(day => Math.round(50 + day * 0.04 + Math.sin(day / 12) * 15)) },",
	"\t{ name: 'Среднее', values: labels.map(day => Math.round(50 + day * 0.04)) },",
	']',
].join('\n')

export const DENSE_LABELS = Array.from({ length: 1000 }, (_, index) => index + 1)

export const DENSE_SERIES: ChartSeries[] = [
	{ name: 'Нагрузка', values: DENSE_LABELS.map(day => Math.round(50 + day * 0.04 + Math.sin(day / 12) * 15)) },
	{ name: 'Среднее', values: DENSE_LABELS.map(day => Math.round(50 + day * 0.04)) },
]
