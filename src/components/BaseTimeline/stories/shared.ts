import type { TimelineItem } from '../types/BaseTimeline.types'

export const ORDER: TimelineItem[] = [
	{
		id: 'created',
		title: 'Заказ оформлен',
		description: 'Оплата картой прошла',
		date: '2026-05-12T10:24:00',
		icon: 'check',
		color: 'success',
	},
	{ id: 'packed', title: 'Собран на складе', description: 'Склад в Подольске', date: '2026-05-13T08:05:00', icon: 'inbox' },
	{
		id: 'shipped',
		title: 'Передан в доставку',
		description: 'Курьер привезёт завтра с 10 до 14',
		date: '2026-05-14T16:40:00',
		icon: 'send',
	},
	{ id: 'delivered', title: 'Доставлен', date: 'ожидается 15 мая', icon: 'home' },
]
