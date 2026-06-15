/**
 * Stories для компонента BaseMegaMenu.
 * Демонстрирует рекурсивную вложенность без ограничения глубины,
 * раскладки columns/dropdown и триггеры click/hover.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { playShiftTab } from '@utils/storybookUtils/a11yHelpers'

import BaseMegaMenu from '../ui/BaseMegaMenu.vue'
import { MEGA_MENU_VARIANTS } from '../model/BaseMegaMenu.types'

const COLUMNS = [
	{
		title: 'Каталог',
		icon: 'folder',
		items: [
			{ label: 'Кованые изделия', icon: 'star', description: 'Ручная ковка' },
			{ label: 'Ворота и ограды', icon: 'home', to: '/gates' },
			{ label: 'Лестницы', icon: 'list-number', to: '/stairs', description: 'Винтовые и маршевые' },
		],
	},
	{
		title: 'О компании',
		icon: 'info',
		items: [
			{ label: 'Наша история', icon: 'file' },
			{ label: 'Команда мастеров', icon: 'smile' },
			{ label: 'Сертификаты', icon: 'check-circle' },
		],
	},
	{
		title: 'Услуги',
		icon: 'code',
		items: [
			{
				label: 'Художественная ковка',
				icon: 'star',
				children: [
					{ label: 'Ворота', icon: 'home' },
					{ label: 'Перила', icon: 'list-bullet' },
					{ label: 'Балкон', icon: 'image' },
				],
			},
			{ label: 'Сварочные работы', icon: 'code' },
			{ label: 'Монтаж', icon: 'pin' },
		],
	},
]

const DROPDOWN_ITEMS = [
	{
		label: 'Каталог',
		icon: 'folder',
		children: [
			{
				label: 'Кованые изделия',
				icon: 'star',
				description: 'Ручная ковка',
				children: [
					{ label: 'Ворота', icon: 'home' },
					{ label: 'Перила', icon: 'list-bullet' },
					{ label: 'Балконы', icon: 'image' },
				],
			},
			{
				label: 'Ворота и ограды',
				icon: 'home',
				children: [
					{ label: 'Распашные', icon: 'arrow-left' },
					{ label: 'Откатные', icon: 'arrow-right' },
				],
			},
			{ label: 'Лестницы', icon: 'list-number', to: '/stairs' },
		],
	},
	{
		label: 'Услуги',
		icon: 'code',
		children: [
			{ label: 'Художественная ковка', icon: 'star' },
			{ label: 'Сварочные работы', icon: 'code' },
			{ label: 'Монтаж', icon: 'pin' },
		],
	},
	{ label: 'О компании', icon: 'info', to: '/about' },
	{ label: 'Контакты', icon: 'send', href: 'https://example.com', target: '_blank' as const },
]

/** Глубокое дерево для демонстрации неограниченной вложенности */
const DEEP_TREE = [
	{
		title: 'Каталог',
		icon: 'folder',
		items: [
			{
				label: 'Уровень 1',
				icon: 'star',
				children: [
					{
						label: 'Уровень 2',
						icon: 'folder',
						children: [
							{
								label: 'Уровень 3',
								icon: 'folder',
								children: [
									{
										label: 'Уровень 4',
										icon: 'folder',
										children: [{ label: 'Уровень 5', icon: 'check', to: '/deep' }],
									},
								],
							},
						],
					},
				],
			},
		],
	},
]

const meta: Meta<typeof BaseMegaMenu> = {
	title: 'UI/BaseMegaMenu',
	component: BaseMegaMenu,
	argTypes: {
		trigger: { control: 'select', options: ['click', 'hover'] },
		layout: { control: 'select', options: ['columns', 'dropdown'] },
		variant: { control: 'select', options: MEGA_MENU_VARIANTS },
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		hoverDelay: { control: 'number' },
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
		class: { table: { disable: true } },
		style: { table: { disable: true } },
	},
	args: {
		columns: COLUMNS,
		trigger: 'click',
		layout: 'columns',
		variant: 'default',
		hoverDelay: 200,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseMegaMenu>

/** Базовое состояние — раскладка колонок */
export const Default: Story = {
	play: async ({ canvasElement }) => {
		await userEvent.tab()
		const title = canvasElement.querySelector('.base-mega-menu__title') as HTMLElement | null
		if (title) {
			await waitFor(() => {
				const active = document.activeElement
				expect(active === title || title.contains(active) || title.matches(':focus, :focus-within')).toBeTruthy()
			})
			await playShiftTab(canvasElement, { selector: '.base-mega-menu__title' })
			await userEvent.keyboard('{Enter}')
		}
	},
}

/** Клики по заголовкам и узлам колонок */
export const ColumnsInteractions: Story = {
	args: {
		'onColumn-click': fn(),
		'onItem-click': fn(),
		onNavigate: fn(),
	},
	play: async ({ args, canvasElement }) => {
		const titleBtns = canvasElement.querySelectorAll('.base-mega-menu__title')
		expect(titleBtns.length).toBeGreaterThanOrEqual(3)

		await userEvent.click(titleBtns[0] as HTMLElement)
		await waitFor(() => expect(args['onColumn-click']).toHaveBeenCalled())

		const headers = canvasElement.querySelectorAll('.base-mega-menu__node-header')
		await userEvent.click(headers[1] as HTMLElement)
		await waitFor(() => expect(args['onItem-click']).toHaveBeenCalled())

		await userEvent.click(titleBtns[2] as HTMLElement)
		await waitFor(() => {
			expect(canvasElement.querySelectorAll('.base-mega-menu__node-header').length).toBeGreaterThan(0)
		})

		const serviceHeaders = canvasElement.querySelectorAll('.base-mega-menu__node-header')
		await userEvent.click(serviceHeaders[serviceHeaders.length - 3] as HTMLElement)
		await waitFor(() => {
			expect(canvasElement.querySelectorAll('.base-mega-menu__sub-list').length).toBeGreaterThan(0)
		})
	},
}

/** Открытие колонок по наведению (trigger=hover) */
export const ColumnsHoverTrigger: Story = {
	args: { trigger: 'hover', hoverDelay: 50, 'onColumn-click': fn() },
	play: async ({ canvasElement }) => {
		const columns = canvasElement.querySelectorAll('.base-mega-menu__column')
		expect(columns.length).toBeGreaterThan(0)

		await userEvent.hover(columns[0] as HTMLElement)
		await waitFor(() => {
			expect(canvasElement.querySelectorAll('.base-mega-menu__list').length).toBeGreaterThan(0)
		})

		const nodeWithChildren = columns[2]?.querySelector('.base-mega-menu__node--has-children')
		if (nodeWithChildren instanceof HTMLElement) {
			await userEvent.hover(nodeWithChildren)
			await userEvent.unhover(nodeWithChildren)
		}

		await userEvent.unhover(columns[0] as HTMLElement)
		await new Promise(resolve => setTimeout(resolve, 120))
	},
}

/** Неограниченная вложенность — 5 уровней */
export const DeepNesting: Story = {
	args: { columns: DEEP_TREE, trigger: 'click', onNavigate: fn() },
	play: async ({ args, canvasElement }) => {
		const labels = ['Уровень 1', 'Уровень 2', 'Уровень 3', 'Уровень 4']
		for (const label of labels) {
			await waitFor(() => {
				const node = within(canvasElement).queryByText(label)
				expect(node).toBeTruthy()
			})
			await userEvent.click(within(canvasElement).getByText(label))
		}

		await waitFor(() => expect(within(canvasElement).getByText('Уровень 5')).toBeInTheDocument())
		await userEvent.click(within(canvasElement).getByText('Уровень 5'))
		await waitFor(() => expect(args.onNavigate).toHaveBeenCalledWith('/deep'))
	},
}

/** Взаимодействие с выпадающим меню (click) */
export const DropdownInteractions: Story = {
	args: {
		layout: 'dropdown',
		items: DROPDOWN_ITEMS,
		trigger: 'click',
		'onItem-click': fn(),
		onNavigate: fn(),
	},
	play: async ({ args, canvasElement }) => {
		const navLinks = canvasElement.querySelectorAll('.base-mega-menu__nav-link')
		expect(navLinks.length).toBeGreaterThan(0)

		await userEvent.click(navLinks[0] as HTMLElement)
		await waitFor(() => {
			expect(canvasElement.querySelectorAll('.base-mega-menu__dropdown').length).toBeGreaterThan(0)
		})

		const groupHeaders = canvasElement.querySelectorAll('.base-mega-menu__dropdown .base-mega-menu__node-header')
		await userEvent.click(groupHeaders[0] as HTMLElement)
		await waitFor(() => {
			expect(canvasElement.querySelectorAll('.base-mega-menu__sub-list').length).toBeGreaterThan(0)
		})

		const subHeaders = canvasElement.querySelectorAll('.base-mega-menu__sub-list .base-mega-menu__node-header')
		await userEvent.click(subHeaders[0] as HTMLElement)

		await userEvent.click(navLinks[3] as HTMLElement)
		await waitFor(() => {
			expect(args['onItem-click']).toHaveBeenCalled()
			expect(args.onNavigate).toHaveBeenCalled()
		})
	},
}

/** Выпадающее меню по наведению */
export const DropdownHoverInteractions: Story = {
	args: {
		layout: 'dropdown',
		items: DROPDOWN_ITEMS,
		trigger: 'hover',
		hoverDelay: 50,
		'onItem-click': fn(),
		onNavigate: fn(),
	},
	play: async ({ canvasElement }) => {
		const navItems = canvasElement.querySelectorAll('.base-mega-menu__nav-item')
		expect(navItems.length).toBeGreaterThan(0)

		await userEvent.hover(navItems[0] as HTMLElement)
		await waitFor(() => {
			expect(canvasElement.querySelectorAll('.base-mega-menu__dropdown').length).toBeGreaterThan(0)
		})

		const node = canvasElement.querySelector('.base-mega-menu__dropdown .base-mega-menu__node--has-children')
		if (node instanceof HTMLElement) {
			await userEvent.hover(node)
			await waitFor(() => {
				expect(canvasElement.querySelectorAll('.base-mega-menu__sub-list').length).toBeGreaterThan(0)
			})
			await userEvent.unhover(node)
		}

		await userEvent.unhover(navItems[0] as HTMLElement)
		await new Promise(resolve => setTimeout(resolve, 70))
	},
}

/** Навигация по href с target='_self' */
export const NavigateSelfTarget: Story = {
	args: {
		columns: [
			{
				title: 'Ссылки',
				items: [{ label: 'Внутренний переход', href: '#mega-menu-self-target', target: '_self' as const }],
			},
		],
		onNavigate: fn(),
	},
	play: async ({ args, canvasElement }) => {
		const titleBtn = canvasElement.querySelector('.base-mega-menu__title')
		if (titleBtn instanceof HTMLElement) await userEvent.click(titleBtn)

		await waitFor(() => {
			expect(canvasElement.querySelectorAll('.base-mega-menu__node-header').length).toBeGreaterThan(0)
		})
		const header = canvasElement.querySelector('.base-mega-menu__node-header')
		if (header instanceof HTMLElement) await userEvent.click(header)

		await waitFor(() => expect(args.onNavigate).toHaveBeenCalled())
	},
}

/** Колонки с отключёнными пунктами */
export const ColumnsDisabled: Story = {
	args: {
		columns: [
			{
				title: 'Меню',
				items: [
					{ label: 'Доступно', to: '/ok' },
					{ label: 'Недоступно', isDisabled: true },
					{
						label: 'С подменю',
						children: [{ label: 'Подпункт 1' }, { label: 'Отключён', isDisabled: true }],
					},
				],
			},
		],
		'onItem-click': fn(),
	},
	play: async ({ canvasElement }) => {
		const titleBtn = canvasElement.querySelector('.base-mega-menu__title') as HTMLElement
		await userEvent.click(titleBtn)

		await waitFor(() => {
			expect(canvasElement.querySelectorAll('.base-mega-menu__node').length).toBeGreaterThanOrEqual(3)
		})

		const disabled = canvasElement.querySelector('.base-mega-menu__node--disabled .base-mega-menu__node-header')
		if (disabled instanceof HTMLElement) disabled.click()

		const withChildren = canvasElement.querySelector('.base-mega-menu__node--has-children .base-mega-menu__node-header')
		if (withChildren instanceof HTMLElement) await userEvent.click(withChildren)
	},
}

/** С кастомными классами */
export const WithCustomClass: Story = {
	args: {
		customClass: {
			root: 'custom-mega-root',
			container: 'custom-mega-container',
			column: 'custom-mega-column',
		},
	},
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.custom-mega-root')).toBeTruthy()
	},
}

/** Все визуальные варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseMegaMenu },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:40px;">
				<div v-for="v in ['default','ghost','outline','shadow','soft']" :key="v">
					<p style="margin-bottom:8px;font-size:12px;color:var(--color-text-muted);">Variant: {{ v }}</p>
					<BaseMegaMenu v-bind="args" :variant="v" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelectorAll('.base-mega-menu').length).toBe(5)
	},
}

/** С вложенными элементами */
export const WithChildren: Story = {
	args: {
		columns: [
			{
				title: 'Продукция',
				items: [
					{
						label: 'Кованые ворота',
						description: 'Элитные кованые ворота',
						children: [{ label: 'Распашные' }, { label: 'Откатные' }, { label: 'Автоматические' }],
					},
					{
						label: 'Кованые перила',
						children: [{ label: 'Для лестниц' }, { label: 'Для балконов' }],
					},
					{ label: 'Мебель' },
				],
			},
			{
				title: 'Галерея',
				items: [{ label: 'Ворота' }, { label: 'Перила' }, { label: 'Лестницы' }, { label: 'Мангалы' }],
			},
		],
	},
}

/** Открытие по наведению */
export const HoverTrigger: Story = {
	args: { trigger: 'hover', hoverDelay: 300 },
}

/** Раскладка выпадающего меню */
export const DropdownLayout: Story = {
	args: { layout: 'dropdown', items: DROPDOWN_ITEMS, trigger: 'click' },
}

/** Выпадающее меню по наведению */
export const DropdownHover: Story = {
	args: { layout: 'dropdown', items: DROPDOWN_ITEMS, trigger: 'hover', hoverDelay: 250 },
}

/** С отключёнными элементами */
export const WithDisabled: Story = {
	args: {
		layout: 'dropdown',
		items: [
			{
				label: 'Каталог',
				children: [
					{ label: 'Ворота', to: '/gates' },
					{ label: 'Перила (скоро)', isDisabled: true },
					{ label: 'Лестницы', to: '/stairs' },
				],
			},
			{ label: 'Архив (недоступно)', isDisabled: true },
			{ label: 'Контакты', to: '/contacts' },
		],
	},
}

/** Со ссылками */
export const WithLinks: Story = {
	args: {
		layout: 'dropdown',
		items: [
			{ label: 'Главная', to: '/' },
			{ label: 'Внешний сайт', href: 'https://example.com', target: '_blank' },
			{ label: 'О нас', to: '/about' },
			{
				label: 'Документация',
				children: [
					{ label: 'API', href: 'https://docs.example.com/api', target: '_blank' },
					{ label: 'Гайд', to: '/guide' },
				],
			},
		],
	},
}

/** Минимальная конфигурация */
export const Minimal: Story = {
	args: {
		columns: [{ title: 'Меню', items: [{ label: 'Главная' }, { label: 'О нас' }, { label: 'Контакты' }] }],
	},
}

/** Много колонок */
export const ManyColumns: Story = {
	args: {
		columns: [
			{ title: 'Каталог', items: [{ label: 'Ворота' }, { label: 'Перила' }, { label: 'Лестницы' }] },
			{ title: 'Услуги', items: [{ label: 'Ковка' }, { label: 'Сварка' }, { label: 'Монтаж' }] },
			{ title: 'Компания', items: [{ label: 'О нас' }, { label: 'Команда' }] },
			{ title: 'Поддержка', items: [{ label: 'FAQ' }, { label: 'Контакты' }] },
		],
	},
}

/** Отображение в тёмной теме */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	args: { layout: 'dropdown', items: DROPDOWN_ITEMS, trigger: 'hover' },
}

/** Мега-меню без элементов */
export const Empty: Story = {
	args: { columns: [] },
}

/** Мега-меню с длинными текстами */
export const LongContent: Story = {
	args: {
		columns: [
			{
				title: 'Художественная ковка и металлообработка',
				items: [
					{
						label: 'Кованые ворота премиум-класса',
						description: 'Элитные кованые ворота с художественной резьбой и патинированием',
					},
					{
						label: 'Лестницы винтовые и маршевые',
						description: 'Проектирование и изготовление лестничных конструкций',
					},
					{ label: 'Балконные ограждения и перила' },
				],
			},
		],
	},
}
