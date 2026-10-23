import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import { StoryRouterLink } from '@/stories/helpers'
import type BaseSideBar from '../ui/BaseSideBar.vue'
import type { SideBarItem } from '../types/BaseSideBar.types'

const NAVIGATION_ITEMS: SideBarItem[] = [
	{ key: 'dashboard', label: 'Главная', icon: 'home', to: '/dashboard' },
	{
		key: 'catalog',
		label: 'Каталог',
		icon: 'folder',
		to: '/catalog',
		children: [
			{ key: 'products', label: 'Товары', to: '/catalog/products', badge: 12 },
			{ key: 'categories', label: 'Категории', to: '/catalog/categories' },
			{ key: 'archive', label: 'Архив', to: '/catalog/archive', isDisabled: true },
		],
	},
	{ key: 'inbox', label: 'Входящие', icon: 'inbox', to: '/inbox', badge: 4 },
	{ key: 'calendar', label: 'Календарь', icon: 'calendar', to: '/calendar', hasDivider: true },
	{
		key: 'settings',
		label: 'Настройки',
		icon: 'list-bullet',
		children: [
			{ key: 'profile', label: 'Профиль', to: '/settings/profile' },
			{ key: 'security', label: 'Безопасность', to: '/settings/security' },
		],
	},
	{ key: 'locked', label: 'Недоступно', icon: 'x-circle', isDisabled: true },
]

export const args = {
	title: 'Панель управления',
	items: NAVIGATION_ITEMS,
	isCollapsed: false,
	isCollapsible: true,
	isLoading: false,
	activePath: '/catalog/products',
	activeMatch: 'startsWith',
	linkComponent: StoryRouterLink,
	variant: 'default',
	width: 280,
	collapsedWidth: 68,
	gap: 4,
	sizeScale: 100,
	'onUpdate:isCollapsed': fn(),
	onCollapse: fn(),
	onExpand: fn(),
	onItemClick: fn(),
} satisfies Meta<typeof BaseSideBar>['args']
