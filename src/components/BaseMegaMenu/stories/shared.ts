import { placeholderImage } from '@/stories/helpers'
import type { MegaMenuItem } from '../types/BaseMegaMenu.types'

export const ITEMS: MegaMenuItem[] = [
	{
		key: 'products',
		label: 'Продукты',
		groups: [
			{
				title: 'Платформа',
				items: [
					{
						label: 'Аналитика',
						icon: 'star',
						description: 'Отчёты и дашборды в реальном времени',
						to: '/analytics',
						badge: 'Новое',
					},
					{ label: 'Документы', icon: 'file', description: 'Договоры, счета и акты', to: '/docs' },
					{ label: 'Календарь', icon: 'calendar', description: 'Встречи и сроки команды', to: '/calendar' },
				],
			},
			{
				title: 'Интеграции',
				items: [
					{ label: 'Почта', icon: 'send', description: 'Письма клиентам из карточки', to: '/integrations/mail' },
					{ label: 'Мессенджеры', icon: 'comment', description: 'Чаты в одной ленте', to: '/integrations/chats' },
					{ label: 'API', icon: 'code', description: 'REST и вебхуки', to: '/integrations/api' },
				],
			},
		],
		promo: {
			title: 'Rise 2.0',
			description: 'Новые компоненты, тёмная тема и мобильный вид навигации.',
			image: placeholderImage({ width: 560, height: 315, hue: 24 }),
			linkLabel: 'Что нового',
			to: '/changelog',
		},
	},
	{
		key: 'resources',
		label: 'Ресурсы',
		groups: [
			{
				title: 'Изучить',
				items: [
					{ label: 'Справочный центр', icon: 'search', description: 'Ответы на частые вопросы', to: '/help' },
					{ label: 'Блог', icon: 'list-bullet', description: 'Кейсы и новости продукта', to: '/blog' },
					{ label: 'Вебинары', icon: 'video', description: 'Скоро', to: '/webinars', isDisabled: true },
				],
			},
			{
				title: 'Сообщество',
				items: [
					{ label: 'Форум', icon: 'comment', to: '/forum' },
					{ label: 'События', icon: 'calendar', to: '/events' },
				],
			},
		],
	},
	{
		key: 'company',
		label: 'Компания',
		groups: [
			{
				items: [
					{ label: 'О нас', to: '/about' },
					{ label: 'Вакансии', to: '/careers', badge: '12' },
					{ label: 'Контакты', to: '/contacts' },
				],
			},
		],
	},
	{ key: 'pricing', label: 'Цены', to: '/pricing' },
]

export const FRAME_STYLE = 'min-height: 460px;'

export const SLOT_KEYS = ['link', 'promo', 'end']

export const VARIANT_ITEMS: MegaMenuItem[] = [
	{ label: 'Продукты', groups: [{ items: [{ label: 'Аналитика', to: '/analytics' }] }] },
	{ label: 'Ресурсы', groups: [{ items: [{ label: 'Блог', to: '/blog' }] }] },
	{ label: 'Цены', to: '/pricing' },
]

export const DISABLED_ITEMS: MegaMenuItem[] = [
	...ITEMS,
	{ key: 'enterprise', label: 'Для бизнеса', isDisabled: true, groups: [{ items: [{ label: 'Тарифы', to: '/enterprise' }] }] },
	{ key: 'partners', label: 'Партнёрам', to: '/partners', isDisabled: true },
]

export const LONG_ITEMS: MegaMenuItem[] = [
	{
		key: 'catalog',
		label: 'Каталог товаров для дома, дачи и ремонта',
		groups: [
			{
				title: 'Ремонт и строительство',
				items: [
					{
						label: 'Сухие строительные смеси и грунтовки',
						description: 'Штукатурки, шпаклёвки, клей для плитки и наливные полы',
						to: '/c/mixes',
					},
					{ label: 'Лакокрасочные материалы', to: '/c/paint' },
				],
			},
			{
				title: 'Сад',
				items: [
					{ label: 'Семена и рассада', to: '/c/seeds' },
					{ label: 'Садовая техника', to: '/c/tools' },
				],
			},
			{
				title: 'Дом',
				items: [
					{ label: 'Текстиль', to: '/c/textile' },
					{ label: 'Посуда', to: '/c/dishes' },
				],
			},
			{
				title: 'Свет',
				items: [
					{ label: 'Люстры', to: '/c/lamps' },
					{ label: 'Светильники для улицы', to: '/c/outdoor' },
				],
			},
		],
	},
	{ key: 'delivery', label: 'Доставка и самовывоз', to: '/delivery' },
	{ key: 'service', label: 'Сервис и гарантия', to: '/service' },
	{ key: 'stores', label: 'Магазины', to: '/stores' },
	{ key: 'business', label: 'Юридическим лицам', to: '/b2b' },
]
