import type { BottomNavItem } from '../types/BaseBottomNav.types'

export const ITEMS: BottomNavItem[] = [
	{ value: 'home', label: 'Главная', icon: 'home' },
	{ value: 'search', label: 'Поиск', icon: 'search' },
	{ value: 'chats', label: 'Чаты', icon: 'comment' },
	{ value: 'favorites', label: 'Избранное', icon: 'star', activeIcon: 'star-filled' },
	{ value: 'settings', label: 'Настройки', icon: 'settings' },
]

export const LINK_ITEMS: BottomNavItem[] = [
	{ value: 'home', label: 'Главная', icon: 'home', to: '/' },
	{ value: 'calendar', label: 'Календарь', icon: 'calendar', to: '/calendar' },
	{ value: 'inbox', label: 'Входящие', icon: 'inbox', to: '/inbox' },
	{ value: 'help', label: 'Справка', icon: 'info', href: 'https://example.com/help', target: '_blank' },
]

export const BADGE_ITEMS: BottomNavItem[] = [
	{ value: 'home', label: 'Главная', icon: 'home' },
	{ value: 'chats', label: 'Чаты', icon: 'comment', badge: 3 },
	{ value: 'alerts', label: 'Уведомления', icon: 'bell', badge: 120 },
	{ value: 'favorites', label: 'Избранное', icon: 'star', badge: 'new', badgeLabel: 'Есть новое' },
]

export const DISABLED_ITEMS: BottomNavItem[] = [
	{ value: 'home', label: 'Главная', icon: 'home' },
	{ value: 'search', label: 'Поиск', icon: 'search' },
	{ value: 'upload', label: 'Загрузка', icon: 'upload', isDisabled: true },
	{ value: 'settings', label: 'Настройки', icon: 'settings' },
]

export const LONG_ITEMS: BottomNavItem[] = [
	{ value: 'home', label: 'Главная страница приложения', icon: 'home' },
	{ value: 'documents', label: 'Документы и договоры с контрагентами', icon: 'folder' },
	{ value: 'calendar', label: 'Календарь встреч', icon: 'calendar' },
	{ value: 'settings', label: 'Настройки учётной записи', icon: 'settings' },
]
