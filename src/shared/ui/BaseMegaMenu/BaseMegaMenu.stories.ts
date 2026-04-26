/**
 * Stories для компонента BaseMegaMenu.
 * Демонстрирует все вариации: columns, dropdown, hover, click.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import BaseMegaMenu from './BaseMegaMenu.vue'

const COLUMNS = [
	{
		title: 'Каталог',
		items: [
			{ label: 'Кованые изделия', description: 'Ручная ковка' },
			{ label: 'Ворота и ограды', to: '/gates' },
			{ label: 'Лестницы', to: '/stairs', description: 'Винтовые и маршевые' },
		],
	},
	{
		title: 'О компании',
		items: [{ label: 'Наша история' }, { label: 'Команда мастеров' }, { label: 'Сертификаты' }],
	},
	{
		title: 'Услуги',
		items: [
			{
				label: 'Художественная ковка',
				children: [{ label: 'Ворота' }, { label: 'Перила' }, { label: 'Балкон' }],
			},
			{ label: 'Сварочные работы' },
			{ label: 'Монтаж' },
		],
	},
]

const DROPDOWN_ITEMS = [
	{
		label: 'Каталог',
		children: [
			{
				label: 'Кованые изделия',
				description: 'Ручная ковка',
				children: [{ label: 'Ворота' }, { label: 'Перила' }, { label: 'Балконы' }],
			},
			{
				label: 'Ворота и ограды',
				children: [{ label: 'Распашные' }, { label: 'Откатные' }],
			},
			{ label: 'Лестницы', to: '/stairs' },
		],
	},
	{
		label: 'Услуги',
		children: [{ label: 'Художественная ковка' }, { label: 'Сварочные работы' }, { label: 'Монтаж' }],
	},
	{ label: 'О компании', to: '/about' },
	{ label: 'Контакты', href: 'https://example.com', target: '_blank' as const },
]

import { MEGA_MENU_VARIANTS } from './BaseMegaMenu.types'

const meta: Meta<typeof BaseMegaMenu> = {
	title: 'UI/BaseMegaMenu',
	component: BaseMegaMenu,
	argTypes: {
		trigger: {
			control: 'select',
			options: ['click', 'hover'],
		},
		layout: {
			control: 'select',
			options: ['columns', 'dropdown'],
		},
		variant: {
			control: 'select',
			options: MEGA_MENU_VARIANTS,
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		hoverDelay: {
			control: 'number',
		},
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

// ── Базовая story (columns) ──

export const Default: Story = {}

/** Все варианты */
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
}

// ── С вложенными пунктами ──

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

// ── Hover режим ──

export const HoverTrigger: Story = {
	args: {
		trigger: 'hover',
		hoverDelay: 300,
	},
}

// ── Dropdown layout ──

export const DropdownLayout: Story = {
	args: {
		layout: 'dropdown',
		items: DROPDOWN_ITEMS,
		trigger: 'click',
	},
}

// ── Dropdown с hover ──

export const DropdownHover: Story = {
	args: {
		layout: 'dropdown',
		items: DROPDOWN_ITEMS,
		trigger: 'hover',
		hoverDelay: 250,
	},
}

// ── С отключёнными элементами ──

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

// ── Ссылки и target ──

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

// ── Минимальное меню ──

export const Minimal: Story = {
	args: {
		columns: [
			{
				title: 'Меню',
				items: [{ label: 'Главная' }, { label: 'О нас' }, { label: 'Контакты' }],
			},
		],
	},
}

// ── Много колонок ──

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

// ── Тёмная тема ──

export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	args: {
		layout: 'dropdown',
		items: DROPDOWN_ITEMS,
		trigger: 'hover',
	},
}

// ── Интерактивная ──

export const Interactive: Story = {
	args: {
		layout: 'dropdown',
		items: DROPDOWN_ITEMS,
	},
}
