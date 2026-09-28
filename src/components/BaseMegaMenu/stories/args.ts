import { COLUMNS } from './shared'
import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseMegaMenu from '../ui/BaseMegaMenu.vue'
import type { MegaMenuItem } from '../types/BaseMegaMenu.types'

const DROPDOWN_ITEMS: MegaMenuItem[] = [
	{
		label: 'Продукты',
		icon: 'folder',
		children: [
			{
				label: 'Аналитика',
				icon: 'star',
				description: 'Отчёты и дашборды',
				children: [
					{ label: 'Продажи', to: '/analytics/sales' },
					{ label: 'Склад', to: '/analytics/stock' },
				],
			},
			{ label: 'Документы', icon: 'file', description: 'Договоры, счета и акты', to: '/docs' },
			{ label: 'Календарь', icon: 'calendar', to: '/calendar' },
		],
	},
	{
		label: 'Ресурсы',
		icon: 'info',
		children: [
			{ label: 'Справочный центр', icon: 'search', to: '/help' },
			{ label: 'Блог', icon: 'list-bullet', to: '/blog' },
		],
	},
	{ label: 'Цены', to: '/pricing' },
	{ label: 'Контакты', to: '/contacts' },
]

export const args = {
	columns: COLUMNS,
	items: DROPDOWN_ITEMS,
	layout: 'columns',
	trigger: 'click',
	hoverDelay: 200,
	variant: 'default',
	sizeScale: 100,
	onNavigate: fn(),
	'onItem-click': fn(),
	'onColumn-click': fn(),
} satisfies Meta<typeof BaseMegaMenu>['args']
