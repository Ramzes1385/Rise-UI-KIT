import type { BreadcrumbItem, BreadcrumbSeparator } from '../types/BaseBreadcrumbs.types'

export const ITEMS: BreadcrumbItem[] = [
	{ label: 'Главная', to: '/' },
	{ label: 'Каталог', to: '/catalog' },
	{ label: 'Электроника', to: '/catalog/electronics' },
	{ label: 'Ноутбуки', to: '/catalog/electronics/laptops' },
	{ label: 'Ультрабук 13"' },
]

export const SEPARATORS: BreadcrumbSeparator[] = ['chevron', 'arrow', 'slash', 'dot']

export const SLOT_KEYS = ['item', 'home']
