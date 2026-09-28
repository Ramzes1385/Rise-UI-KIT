import type { MegaMenuColumn } from '../types/BaseMegaMenu.types'

export const COLUMNS: MegaMenuColumn[] = [
	{
		title: 'Продукты',
		icon: 'folder',
		items: [
			{ label: 'Аналитика', icon: 'star', description: 'Отчёты и дашборды', to: '/analytics' },
			{ label: 'Документы', icon: 'file', description: 'Договоры, счета и акты', to: '/docs' },
			{ label: 'Календарь', icon: 'calendar', description: 'Планирование задач', to: '/calendar' },
		],
	},
	{
		title: 'Ресурсы',
		icon: 'info',
		items: [
			{ label: 'Справочный центр', icon: 'search', to: '/help' },
			{ label: 'Блог', icon: 'list-bullet', to: '/blog' },
			{
				label: 'Интеграции',
				icon: 'link',
				children: [
					{ label: 'Почта', to: '/integrations/mail' },
					{ label: 'Мессенджеры', to: '/integrations/messengers' },
				],
			},
		],
	},
	{
		title: 'Компания',
		icon: 'home',
		items: [
			{ label: 'О нас', to: '/about' },
			{ label: 'Вакансии', to: '/careers' },
			{ label: 'Контакты', to: '/contacts' },
		],
	},
]
