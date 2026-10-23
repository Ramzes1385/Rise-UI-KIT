import type { DashboardLayoutItem, DashboardLayouts } from '../types/BaseDashboardGrid.types'

export const WIDGET_LAYOUT: DashboardLayoutItem[] = [
	{ id: 'revenue', label: 'Выручка', x: 0, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
	{ id: 'orders', label: 'Заказы', x: 4, y: 0, w: 4, h: 2 },
	{ id: 'conversion', label: 'Конверсия', x: 8, y: 0, w: 4, h: 1 },
	{ id: 'traffic', label: 'Трафик', x: 8, y: 1, w: 4, h: 1 },
	{ id: 'chart', label: 'Динамика продаж', x: 0, y: 2, w: 8, h: 3, minW: 4, minH: 2 },
	{ id: 'tasks', label: 'Задачи', x: 8, y: 2, w: 4, h: 3 },
]

export const PINNED_LAYOUT: DashboardLayoutItem[] = [
	{ id: 'summary', label: 'Сводка за месяц', x: 0, y: 0, w: 12, h: 1, isStatic: true },
	{ id: 'revenue', label: 'Выручка', x: 0, y: 1, w: 4, h: 2 },
	{ id: 'orders', label: 'Заказы', x: 4, y: 1, w: 4, h: 2 },
	{ id: 'tasks', label: 'Задачи', x: 8, y: 1, w: 4, h: 2 },
]

export const RESPONSIVE_LAYOUTS: DashboardLayouts = {
	lg: [
		{ id: 'revenue', label: 'Выручка', x: 0, y: 0, w: 4, h: 2 },
		{ id: 'orders', label: 'Заказы', x: 4, y: 0, w: 4, h: 2 },
		{ id: 'conversion', label: 'Конверсия', x: 8, y: 0, w: 4, h: 2 },
		{ id: 'chart', label: 'Динамика продаж', x: 0, y: 2, w: 12, h: 3 },
	],
	md: [
		{ id: 'revenue', label: 'Выручка', x: 0, y: 0, w: 3, h: 2 },
		{ id: 'orders', label: 'Заказы', x: 3, y: 0, w: 3, h: 2 },
		{ id: 'conversion', label: 'Конверсия', x: 0, y: 2, w: 6, h: 1 },
		{ id: 'chart', label: 'Динамика продаж', x: 0, y: 3, w: 6, h: 3 },
	],
	sm: [
		{ id: 'revenue', label: 'Выручка', x: 0, y: 0, w: 2, h: 2 },
		{ id: 'orders', label: 'Заказы', x: 0, y: 2, w: 2, h: 2 },
		{ id: 'conversion', label: 'Конверсия', x: 0, y: 4, w: 2, h: 1 },
		{ id: 'chart', label: 'Динамика продаж', x: 0, y: 5, w: 2, h: 3 },
	],
}

export const SMALL_LAYOUT: DashboardLayoutItem[] = [
	{ id: 'revenue', label: 'Выручка', x: 0, y: 0, w: 2, h: 1 },
	{ id: 'orders', label: 'Заказы', x: 2, y: 0, w: 2, h: 1 },
	{ id: 'chart', label: 'Динамика', x: 0, y: 1, w: 4, h: 1 },
]

export const LONG_LAYOUT: DashboardLayoutItem[] = [
	{ id: 'report', label: 'Ежемесячный отчёт по выручке в разрезе направлений и региональных подразделений', x: 0, y: 0, w: 2, h: 2 },
	{ id: 'notes', label: 'Примечания', x: 0, y: 2, w: 2, h: 2 },
]

export const LONG_TEXT =
	'Выручка выросла во всех направлениях, кроме подписок: там клиенты чаще переходили на годовые тарифы, а ежемесячные платежи сократились. Подробный разбор по регионам и каналам привлечения — в приложении к отчёту.'

export const SCROLL_LAYOUT: DashboardLayoutItem[] = Array.from({ length: 12 }, (_, index) => ({
	id: `card-${index + 1}`,
	label: `Виджет ${index + 1}`,
	x: (index % 3) * 4,
	y: Math.floor(index / 3) * 2,
	w: 4,
	h: 2,
}))
