import { STORY_USERS } from '@/stories/helpers'
import type { SideBarItem } from '../types/BaseSideBar.types'

export const BASIC_ITEMS: SideBarItem[] = [
	{ key: 'dashboard', label: 'Главная', icon: 'home', to: '/dashboard' },
	{ key: 'inbox', label: 'Входящие', icon: 'inbox', to: '/inbox', badge: 4 },
	{ key: 'calendar', label: 'Календарь', icon: 'calendar', to: '/calendar' },
]

export const USER = STORY_USERS[0]

export const FRAME_STYLE = 'display: flex; height: 520px;'

export const SLOT_KEYS = ['default', 'header', 'footer', 'navigation', 'collapsedContent', 'item', 'icon', 'label', 'badge']

export const GROUP_ITEMS: SideBarItem[] = [
	{ key: 'overview', label: 'Обзор', icon: 'home', to: '/dashboard' },
	{
		key: 'work',
		type: 'group',
		label: 'Работа',
		children: [
			{ key: 'inbox', label: 'Входящие', icon: 'inbox', to: '/inbox', badge: 4, badgeColor: 'primary' },
			{ key: 'tasks', label: 'Задачи', icon: 'check-circle', to: '/tasks', badge: 'Новое', badgeColor: 'success' },
			{ key: 'calendar', label: 'Календарь', icon: 'calendar', to: '/calendar' },
		],
	},
	{
		key: 'store',
		type: 'group',
		label: 'Магазин',
		children: [
			{
				key: 'catalog',
				label: 'Каталог',
				icon: 'folder',
				to: '/catalog',
				children: [
					{ key: 'products', label: 'Товары', to: '/catalog/products', badge: 12 },
					{ key: 'categories', label: 'Категории', to: '/catalog/categories' },
				],
			},
			{ key: 'orders', label: 'Заказы', icon: 'file', to: '/orders', badge: 3, badgeColor: 'error' },
			{ key: 'reviews', label: 'Отзывы', icon: 'comment', to: '/reviews', badge: 18, badgeColor: 'warning' },
		],
	},
	{ key: 'settings', label: 'Настройки', icon: 'settings', to: '/settings' },
]
