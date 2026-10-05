import type { PieSegment } from '../types/BasePieChart.types'

export const TASKS_BY_STATUS: PieSegment[] = [
	{ label: 'Готово', value: 42 },
	{ label: 'В работе', value: 18 },
	{ label: 'На проверке', value: 9 },
	{ label: 'К выполнению', value: 27 },
]

export const TRAFFIC: PieSegment[] = [
	{ label: 'Поиск', value: 4210 },
	{ label: 'Прямые заходы', value: 2830 },
	{ label: 'Соцсети', value: 1940 },
	{ label: 'Рассылка', value: 1120 },
	{ label: 'Реклама', value: 860 },
	{ label: 'Партнёры', value: 410 },
	{ label: 'Мессенджеры', value: 330 },
	{ label: 'Прочие сайты', value: 190 },
]

export const TASKS_NEXT_WEEK: PieSegment[] = [
	{ label: 'Готово', value: 58 },
	{ label: 'В работе', value: 22 },
	{ label: 'К выполнению', value: 14 },
]

export const CANCELLED: PieSegment = { label: 'Отменено', value: 12 }
