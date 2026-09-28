/**
 * BaseMegaMenu — stories.
 *
 * Разделы: Default (песочница, раскладка columns) → внешний вид (варианты, размеры, цвет) →
 * состояния (отключённые пункты, пусто, длинные тексты) → сценарии (выпадающее меню, наведение, глубокая вложенность) →
 * клавиатура.
 */

import { expect, fn, waitFor } from 'storybook/test'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, tabTo, useArgsWithoutSlots } from '@/stories/helpers'
import { MEGA_MENU_VARIANTS } from '../model/BaseMegaMenu.types'
import BaseMegaMenu from '../ui/BaseMegaMenu.vue'
import type { MegaMenuColumn, MegaMenuItem } from '../model/BaseMegaMenu.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const COLUMNS: MegaMenuColumn[] = [
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

const DISABLED_ITEMS: MegaMenuItem[] = [
	{
		label: 'Продукты',
		icon: 'folder',
		children: [
			{ label: 'Аналитика', icon: 'star', to: '/analytics' },
			{ label: 'Прогнозы (скоро)', icon: 'calendar', isDisabled: true },
			{ label: 'Документы', icon: 'file', to: '/docs' },
		],
	},
	{ label: 'Маркетплейс', isDisabled: true },
	{ label: 'Контакты', to: '/contacts' },
]

const DEEP_COLUMNS: MegaMenuColumn[] = [
	{
		title: 'Каталог',
		icon: 'folder',
		items: [
			{
				label: 'Электроника',
				children: [
					{
						label: 'Компьютеры',
						children: [
							{
								label: 'Ноутбуки',
								children: [{ label: 'Ультрабуки', to: '/catalog/electronics/computers/laptops/ultrabooks' }],
							},
						],
					},
				],
			},
		],
	},
]

const LONG_COLUMNS: MegaMenuColumn[] = [
	{
		title: 'Услуги для корпоративных клиентов и государственных учреждений',
		items: [
			{
				label: 'Комплексное сопровождение закупок по 44-ФЗ и 223-ФЗ',
				description: 'Подготовка документации, участие в торгах и контроль исполнения контрактов',
				to: '/services/procurement',
			},
			{ label: 'Аудит информационной безопасности', to: '/services/audit' },
		],
	},
]

/** Выпадающие панели лежат поверх страницы: контейнер оставляет им место в области примера. */
const DROPDOWN_FRAME = '<div style="min-height: 320px;">'

const meta = {
	title: 'Navigation/BaseMegaMenu',
	component: BaseMegaMenu,
	parameters: {
		docs: {
			description: {
				component: [
					'Многоуровневое меню сайта: панель с колонками ссылок (`layout="columns"`) или горизонтальная навигация',
					'с выпадающими панелями (`layout="dropdown"`). Вложенность узлов не ограничена.',
					'',
					'- Узлы с `children` раскрываются по клику (`trigger="click"`) или наведению (`trigger="hover"`); в columns —',
					'  вниз, в dropdown — каскадом вбок. На узком экране меню становится аккордеоном.',
					'- Лист с `to` или `href` — ссылка (`BaseLink`): RouterLink приложения или `<a href>`, открывается и в новой',
					'  вкладке. Клик эмитит `navigate(url)`, `item-click` — клик по любому узлу.',
					'- Узлы с детьми — кнопки (`role="button"`, Enter/Space, `aria-expanded`), пункты навигации — `BaseButton`.',
					'  Закрытия по Escape и клику вне меню пока нет.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: MEGA_MENU_VARIANTS }),
		columns: { control: 'object', table: propGroup(ARG_GROUP.content) },
		items: { control: 'object', table: propGroup(ARG_GROUP.content) },
		layout: { control: 'inline-radio', options: ['columns', 'dropdown'], table: propGroup(ARG_GROUP.appearance) },
		trigger: { control: 'inline-radio', options: ['click', 'hover'], table: propGroup(ARG_GROUP.behavior) },
		hoverDelay: { control: { type: 'number', min: 0, step: 50 }, table: propGroup(ARG_GROUP.behavior) },
		'column-title': { control: false },
		'nav-item': { control: false },
		item: { control: false },
	},
	args: {
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
	},
	render: args => ({
		components: { BaseMegaMenu },
		setup: () => ({ props: useArgsWithoutSlots(args, ['column-title', 'nav-item', 'item']) }),
		template: `${DROPDOWN_FRAME}<BaseMegaMenu v-bind="props" /></div>`,
	}),
} satisfies Meta<typeof BaseMegaMenu>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/**
 * Песочница: раскладка columns. Пункты с адресом — ссылки (BaseLink: RouterLink приложения или `<a href>`), клик
 * эмитит `navigate` с адресом; узел «Интеграции» раскрывает вложенный уровень.
 */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('link', { name: 'Документы' }))
		await expect(args.onNavigate).toHaveBeenCalledWith('/docs')

		const integrations = canvas.getByRole('button', { name: 'Интеграции' })
		await userEvent.click(integrations)
		await expect(integrations).toHaveAttribute('aria-expanded', 'true')
		await expect(canvas.getByRole('link', { name: 'Почта' })).toBeVisible()
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Варианты панели columns: `default` — плавающая панель; `ghost` — без фона и рамки (меню внутри другой поверхности);
 * `outline` — выразительная рамка; `shadow` — крупная тень; `soft` — мягкий нейтральный фон.
 */
export const Variants: Story = {
	argTypes: { variant: { control: false } },
	parameters: {
		docs: {
			source: { code: MEGA_MENU_VARIANTS.map(variant => `<BaseMegaMenu :columns="columns" variant="${variant}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseMegaMenu },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['column-title', 'nav-item', 'item']),
			variants: MEGA_MENU_VARIANTS,
			columns: COLUMNS.slice(0, 2),
		}),
		template: `
			<div class="story-stack">
				<div v-for="variant in variants" :key="variant" class="story-col">
					<span class="story-label">{{ variant }}</span>
					<BaseMegaMenu v-bind="props" :columns="columns" layout="columns" :variant="variant" />
				</div>
			</div>
		`,
	}),
}

/** Размеры через `sizeScale` (здесь — навигация dropdown): пункты 24–40px, текст и иконки масштабируются пропорционально. */
export const Sizes: Story = {
	args: { layout: 'dropdown' },
	argTypes: { sizeScale: { control: false } },
	parameters: {
		docs: {
			source: {
				code: SIZE_PRESETS.map(p => `<BaseMegaMenu layout="dropdown" :items="items" :size-scale="${p.sizeScale}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseMegaMenu },
		setup: () => ({ props: useArgsWithoutSlots(args, ['column-title', 'nav-item', 'item']), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-stack">
				<div v-for="preset in presets" :key="preset.name" class="story-col">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseMegaMenu v-bind="props" :size-scale="preset.sizeScale" />
				</div>
			</div>
		`,
	}),
}

/**
 * Кастомный цвет через `color`: `bg.base` — фон панелей, `text.base` — текст пунктов, заголовков и описаний,
 * `bg.hover` и `text.hover` — пункт под курсором и раскрытый узел.
 */
export const CustomColor: Story = {
	args: {
		columns: COLUMNS.slice(0, 2),
		color: {
			bg: { base: '#eff6ff', hover: '#dbeafe' },
			text: { base: '#1e3a8a', hover: '#172554' },
		},
	},
	play: async ({ canvas }) => {
		const link = canvas.getByRole('link', { name: 'Документы' })
		await expect(getComputedStyle(link).color).toBe('rgb(30, 58, 138)')
		await expect(getComputedStyle(link.closest('.base-mega-menu') as HTMLElement).backgroundColor).toBe('rgb(239, 246, 255)')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Отключённые пункты приглушены и помечены `aria-disabled`: не раскрываются и не выполняют переход. */
export const Disabled: Story = {
	args: { layout: 'dropdown', items: DISABLED_ITEMS },
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('button', { name: 'Маркетплейс' })).toBeDisabled()
		await userEvent.click(canvas.getByRole('button', { name: 'Продукты' }))
		await expect(canvas.getByRole('button', { name: 'Прогнозы (скоро)' })).toHaveAttribute('aria-disabled', 'true')
	},
}

/** Без колонок и пунктов меню пустое. */
export const Empty: Story = {
	args: { columns: [] },
	play: async ({ canvas }) => {
		await expect(canvas.queryAllByRole('button')).toHaveLength(0)
	},
}

/** Длинные заголовки, названия и описания переносятся по словам внутри колонки. */
export const LongContent: Story = {
	args: { columns: LONG_COLUMNS },
	render: args => ({
		components: { BaseMegaMenu },
		setup: () => ({ props: useArgsWithoutSlots(args, ['column-title', 'nav-item', 'item']) }),
		template: '<div class="story-narrow"><BaseMegaMenu v-bind="props" /></div>',
	}),
	play: async ({ canvas }) => {
		const link = canvas.getByRole('link', { name: /Комплексное сопровождение/ })
		await expect(link.scrollWidth).toBeLessThanOrEqual(link.clientWidth)
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * `layout="dropdown"`: пункт с `children` открывает плавающую панель, вложенные уровни раскрываются каскадом вбок
 * (панель переносится влево, если справа нет места).
 */
export const Dropdown: Story = {
	args: { layout: 'dropdown' },
	play: async ({ canvas, userEvent }) => {
		const products = canvas.getByRole('button', { name: 'Продукты' })
		await userEvent.click(products)
		await expect(products).toHaveAttribute('aria-expanded', 'true')

		await userEvent.click(canvas.getByRole('button', { name: 'Аналитика' }))
		await expect(await canvas.findByRole('link', { name: 'Продажи' })).toBeVisible()
	},
}

/** `trigger="hover"`: панели открываются при наведении и закрываются через `hoverDelay` после ухода курсора. */
export const HoverTrigger: Story = {
	args: { layout: 'dropdown', trigger: 'hover', hoverDelay: 100 },
	play: async ({ canvas, userEvent }) => {
		const products = canvas.getByRole('button', { name: 'Продукты' })
		await userEvent.hover(products)
		await expect(products).toHaveAttribute('aria-expanded', 'true')

		await userEvent.unhover(products)
		await waitFor(() => expect(products).toHaveAttribute('aria-expanded', 'false'))
	},
}

/** Вложенность не ограничена: в раскладке columns уровни раскрываются вниз, каждый с линией слева. */
export const DeepNesting: Story = {
	args: { columns: DEEP_COLUMNS },
	play: async ({ canvas, userEvent, args }) => {
		for (const label of ['Электроника', 'Компьютеры', 'Ноутбуки']) {
			await userEvent.click(await canvas.findByRole('button', { name: label }))
		}
		await userEvent.click(await canvas.findByRole('link', { name: 'Ультрабуки' }))
		await expect(args.onNavigate).toHaveBeenCalledWith('/catalog/electronics/computers/laptops/ultrabooks')
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: Tab переводит фокус на пункт навигации, Enter открывает панель; следующий Tab — на узел панели,
 * Enter раскрывает его вложенный уровень. Закрытия по Escape пока нет.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	args: { layout: 'dropdown' },
	play: async ({ canvas, userEvent }) => {
		const products = canvas.getByRole('button', { name: 'Продукты' })
		await tabTo(products, userEvent)
		await expect(getComputedStyle(products).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await expect(products).toHaveAttribute('aria-expanded', 'true')

		await userEvent.tab()
		const analytics = canvas.getByRole('button', { name: 'Аналитика' })
		await expect(analytics).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await expect(analytics).toHaveAttribute('aria-expanded', 'true')
	},
}
