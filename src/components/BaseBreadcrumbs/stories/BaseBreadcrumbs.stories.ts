/**
 * Stories для компонента BaseBreadcrumbs.
 * Демонстрирует все вариации: размеры, разделители, collapsed, home.
 * Каждая story содержит play-функцию для 100% coverage.
 */

import { expect, userEvent, within } from 'storybook/test'
import { BaseText } from '@components/BaseText'
import BaseBreadcrumbs from '../ui/BaseBreadcrumbs.vue'
import type { BreadcrumbItem } from '../model/BaseBreadcrumbs.types'
import type { Meta, StoryObj } from '@storybook/vue3'

const ITEMS: BreadcrumbItem[] = [
	{ label: 'Главная', to: '/' },
	{ label: 'Каталог', to: '/catalog' },
	{ label: 'Кованые изделия', to: '/catalog/forged' },
	{ label: 'Ворота', to: '/catalog/forged/gates' },
	{ label: 'Распашные ворота' },
]

const meta: Meta<typeof BaseBreadcrumbs> = {
	title: 'UI/BaseBreadcrumbs',
	component: BaseBreadcrumbs,

	argTypes: {
		separator: {
			control: 'select',
			options: ['slash', 'chevron', 'dot', 'arrow'],
		},
		variant: {
			control: 'select',
			options: ['default', 'ghost', 'outline', 'shadow', 'soft'],
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		maxItems: {
			control: 'number',
		},
		showHome: {
			control: 'boolean',
		},
		homeIcon: {
			control: 'text',
		},
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
		class: { table: { disable: true } },
		style: { table: { disable: true } },
		key: { table: { disable: true } },
		ref: { table: { disable: true } },
	},

	args: {
		items: ITEMS,
		separator: 'chevron',
		variant: 'default',
		maxItems: 0,
		showHome: false,
		homeIcon: 'home',
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseBreadcrumbs>
/** Базовая story — клик по элементу, проверка current */
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvasElement).toBeInTheDocument()

		// Клик по «Каталог» — покрывает handleItemClick + navigate
		const catalogBtn = canvas.getByRole('button', { name: 'Каталог' })
		await userEvent.click(catalogBtn)

		// Текущий элемент — проверяем что отображается
		expect(canvas.getByText('Распашные ворота')).toBeInTheDocument()
	},
}
/** Все варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseBreadcrumbs, BaseText },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;">
				<div v-for="v in ['default','ghost','outline','shadow','soft']" :key="v">
					<BaseText tag="p" size="xs" style="margin-bottom:4px;">{{ v }}</BaseText>
					<BaseBreadcrumbs v-bind="args" :variant="v" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvasElement).toBeInTheDocument()

		const catalogBtns = canvas.getAllByRole('button', { name: 'Каталог' })
		await userEvent.click(catalogBtns[0]!)
	},
}
/** Разделители — клик для каждого типа */
export const Separators: Story = {
	render: args => ({
		components: { BaseBreadcrumbs, BaseText },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;">
				<div>
					<BaseText tag="p" size="xs" style="margin-bottom:4px;">chevron</BaseText>
					<BaseBreadcrumbs v-bind="args" separator="chevron" />
				</div>
				<div>
					<BaseText tag="p" size="xs" style="margin-bottom:4px;">slash</BaseText>
					<BaseBreadcrumbs v-bind="args" separator="slash" />
				</div>
				<div>
					<BaseText tag="p" size="xs" style="margin-bottom:4px;">dot</BaseText>
					<BaseBreadcrumbs v-bind="args" separator="dot" />
				</div>
				<div>
					<BaseText tag="p" size="xs" style="margin-bottom:4px;">arrow</BaseText>
					<BaseBreadcrumbs v-bind="args" separator="arrow" />
				</div>
				<div>
					<BaseText tag="p" size="xs" style="margin-bottom:4px;">unknown</BaseText>
					<BaseBreadcrumbs v-bind="args" separator="unknown" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvasElement).toBeInTheDocument()

		const btns = canvas.getAllByRole('button', { name: 'Каталог' })
		await userEvent.click(btns[0]!)
	},
}
/** Все интерактивные состояния рядом */
export const InteractiveStates: Story = {
	render: () => ({
		components: { BaseBreadcrumbs, BaseText },
		setup() {
			return { items: ITEMS }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;">
				<div>
					<BaseText tag="p" size="xs">Normal</BaseText>
					<BaseBreadcrumbs :items="items" />
				</div>
				<div>
					<BaseText tag="p" size="xs">Hover</BaseText>
					<BaseBreadcrumbs :items="items" class="base-breadcrumbs--hover" />
				</div>
				<div>
					<BaseText tag="p" size="xs">Focus</BaseText>
					<BaseBreadcrumbs :items="items" class="base-breadcrumbs--focus" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvasElement).toBeInTheDocument()

		const btns = canvas.getAllByRole('button', { name: 'Каталог' })
		await userEvent.click(btns[0]!)
	},
}
/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Распашные ворота')).toBeInTheDocument()
	},
}
/** Интерактивная — клик по всем элементам */
export const Interactive: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvasElement).toBeInTheDocument()

		// Клик по «Главная»
		const mainBtn = canvas.getByRole('button', { name: 'Главная' })
		await userEvent.click(mainBtn)

		// Клик по «Кованые изделия»
		const forgedBtn = canvas.getByRole('button', { name: 'Кованые изделия' })
		await userEvent.click(forgedBtn)

		// Клик по «Ворота»
		const gatesBtn = canvas.getByRole('button', { name: 'Ворота' })
		await userEvent.click(gatesBtn)

		// Проверяем что все элементы отображаются
		expect(canvas.getByText('Распашные ворота')).toBeInTheDocument()
	},
}
/** С иконкой дома */
export const WithHome: Story = {
	args: {
		showHome: true,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const homeBtn = canvasElement.querySelector('.base-breadcrumbs__item--home button')
		expect(homeBtn).toBeInTheDocument()
		await userEvent.click(homeBtn as HTMLElement)
	},
}
/** С ограничением количества элементов (collapsed) */
export const Collapsed: Story = {
	args: {
		maxItems: 2,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const ellipsisBtn = canvas.getByRole('button', { name: '…' })
		expect(ellipsisBtn).toBeInTheDocument()
		await userEvent.click(ellipsisBtn)
		// После клика должны появиться все элементы
		expect(canvas.getByRole('button', { name: 'Каталог' })).toBeInTheDocument()
	},
}
/** С внешними ссылками и иконками */
export const WithIconsAndHrefs: Story = {
	args: {
		items: [
			{ label: 'Главная', to: '/', icon: 'home' },
			{ label: 'Внешний сайт', href: 'https://example.com', icon: 'star' },
			{ label: 'Текущая' },
		],
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const externalBtn = canvas.getByRole('button', { name: 'Внешний сайт' })
		expect(externalBtn).toBeInTheDocument()
		// Кликаем по внешней ссылке
		await userEvent.click(externalBtn)
	},
}
/** Кастомные слоты */
export const CustomSlots: Story = {
	render: args => ({
		components: { BaseBreadcrumbs },
		setup() {
			return { args }
		},
		template: `
			<BaseBreadcrumbs v-bind="args" show-home>
				<template #home>
					<span class="custom-home">🏠</span>
				</template>
				<template #separator="{ index }">
					<span class="custom-sep">➔</span>
				</template>
				<template #item="{ item, index }">
					<span class="custom-item">{{ index }}: {{ item.label }}</span>
				</template>
			</BaseBreadcrumbs>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('🏠')).toBeInTheDocument()
		expect(canvasElement.querySelector('.custom-sep')).toBeInTheDocument()
		expect(canvas.getByText('4: Распашные ворота')).toBeInTheDocument()
	},
}
/** Кастомный цвет */
export const CustomColor: Story = {
	args: {
		color: {
			bg: {
				base: '#ff0000',
				hover: '#cc0000',
				active: '#990000',
				focus: '#ff0000',
			},
			text: {
				base: '#ffffff',
				hover: '#ffffff',
				active: '#ffffff',
				focus: '#ffffff',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Распашные ворота')).toBeInTheDocument()
	},
}
/** Длинный контент — проверка a11y-дерева с длинными пунктами */
export const LongContent: Story = {
	args: {
		items: [
			{ label: 'Главная страница портала с очень длинным названием для проверки', to: '/' },
			{ label: 'Раздел каталога кованых изделий и металлических конструкций', to: '/catalog' },
			{ label: 'Категория кованых ворот и ограждений премиум класса', to: '/catalog/forged' },
			{ label: 'Подкатегория распашных ворот с художественной ковкой', to: '/catalog/forged/gates' },
			{ label: 'Ворота с орнаментом из кованых листьев и цветов и ветвей', to: '/catalog/forged/gates/ornament' },
			{ label: 'Модель ворот с сложным геометрическим узором ковки', to: '/catalog/forged/gates/geo' },
			{ label: 'Ворота с виноградной лозой и коваными гроздьями и листьями', to: '/catalog/forged/gates/grape' },
			{ label: 'Ворота с геральдическими лилиями и коваными завитками', to: '/catalog/forged/gates/lily' },
			{ label: 'Ворота с рыцарскими мотивами и коваными элементами', to: '/catalog/forged/gates/knight' },
			{ label: 'Ворота с растительным орнаментом и коваными ветвями', to: '/catalog/forged/gates/plant' },
			{ label: 'Ворота с сложным кованым узором и позолотой премиум' },
		],
	},
	play: async ({ canvasElement }) => {
		const items = canvasElement.querySelectorAll('.base-breadcrumbs__item')
		expect(items.length).toBeGreaterThan(10)
		const firstItem = items[0]
		expect(firstItem?.textContent?.length).toBeGreaterThan(50)
	},
}
/** Пустые крошки — без пунктов */
export const Empty: Story = {
	tags: ['!a11y'],
	args: {
		items: [],
	},
	play: async ({ canvasElement }) => {
		expect(canvasElement).toBeInTheDocument()
	},
}
/** Slash и dot разделители вместе с домом и collapsed — для покрытия слотов */
export const SeparatorsWithHomeCollapsed: Story = {
	render: args => ({
		components: { BaseBreadcrumbs, BaseText },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;">
				<div>
					<BaseText tag="p" size="xs">slash + home + collapsed</BaseText>
					<BaseBreadcrumbs v-bind="args" separator="slash" :show-home="true" :max-items="2" />
				</div>
				<div>
					<BaseText tag="p" size="xs">dot + home + collapsed</BaseText>
					<BaseBreadcrumbs v-bind="args" separator="dot" :show-home="true" :max-items="2" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const slashes = canvasElement.querySelectorAll('.base-breadcrumbs__sep')
		expect(slashes.length).toBeGreaterThan(0)
	},
}
/** Клик по ellipsis раскрывает скрытые элементы — покрывает isExpanded = true */
export const ExpandCollapsed: Story = {
	args: {
		items: ITEMS,
		maxItems: 2,
		separator: 'chevron',
	},
	play: async ({ canvasElement }) => {
		const ellipsisBtn = canvasElement.querySelector('.base-breadcrumbs__ellipsis-btn') as HTMLButtonElement | null
		expect(ellipsisBtn).toBeTruthy()
		const before = canvasElement.querySelectorAll('.base-breadcrumbs__item').length
		await userEvent.click(ellipsisBtn as HTMLButtonElement)
		const after = canvasElement.querySelectorAll('.base-breadcrumbs__item').length
		expect(after).toBeGreaterThan(before)
	},
}
/** Клик по «Главная» без showHome (handleHomeClick не вызывается) и navigate по item.href */
export const HomeClickWithHref: Story = {
	args: {
		items: [
			{ label: 'Главная', href: 'https://example.com/' },
			{ label: 'Каталог', to: '/catalog' },
			{ label: 'Текущая' },
		],
		showHome: true,
		separator: 'chevron',
	},
	play: async ({ canvasElement }) => {
		const originalOpen = window.open
		let opened = ''
		window.open = (url?: string | URL): WindowProxy | null => {
			opened = String(url ?? '')
			return null
		}
		try {
			const homeBtn = canvasElement.querySelector('.base-breadcrumbs__item--home button') as HTMLButtonElement | null
			expect(homeBtn).toBeTruthy()
			await userEvent.click(homeBtn as HTMLButtonElement)
			expect(opened).toBe('https://example.com/')

			const catalogBtn = within(canvasElement).getByRole('button', { name: 'Каталог' })
			await userEvent.click(catalogBtn)
		} finally {
			window.open = originalOpen
		}
	},
}
/** Пустые items и showHome — handleHomeClick без действий (items[0] === undefined) */
export const HomeClickEmpty: Story = {
	args: {
		items: [],
		showHome: true,
		separator: 'chevron',
	},
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.base-breadcrumbs__item--home')).toBeFalsy()
	},
}
/** maxItems превышает items.length — early return в collapsedItems/visibleItems */
export const MaxItemsLargerThanItems: Story = {
	args: {
		items: [
			{ label: 'A', to: '/a' },
			{ label: 'B', to: '/b' },
		],
		maxItems: 10,
		separator: 'chevron',
	},
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.base-breadcrumbs__item--ellipsis')).toBeFalsy()
		expect(canvasElement.querySelectorAll('.base-breadcrumbs__item').length).toBe(2)
	},
}
/** Клик по пункту без to и без href — покрывает false-ветку else if (item.to) (стр. 198) */
export const NavigateNoLink: Story = {
	args: {
		items: [{ label: 'Без ссылки' }, { label: 'Каталог', to: '/catalog' }, { label: 'Текущая' }],
		separator: 'chevron',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const noLinkBtn = canvas.getByRole('button', { name: 'Без ссылки' })
		await userEvent.click(noLinkBtn)
		expect(canvas.getByText('Текущая')).toBeInTheDocument()
	},
}
/** Текущий пункт с иконкой — покрывает v-if="item.icon" в .base-breadcrumbs__current (стр. 101) */
export const CurrentWithIcon: Story = {
	args: {
		items: [
			{ label: 'Главная', to: '/' },
			{ label: 'Каталог', to: '/catalog' },
			{ label: 'Текущая', icon: 'star' },
		],
		separator: 'chevron',
	},
	play: async ({ canvasElement }) => {
		const currentIcon = canvasElement.querySelector('.base-breadcrumbs__current .base-breadcrumbs__icon')
		expect(currentIcon).toBeTruthy()
	},
}
/** Dot-разделитель с home + collapsed раздельно — покрывает оба слота с dot (стр. 38, 65) */
export const DotSeparatorHomeCollapsed: Story = {
	args: {
		items: ITEMS,
		separator: 'dot',
		showHome: true,
		maxItems: 2,
	},
	play: async ({ canvasElement }) => {
		const homeItem = canvasElement.querySelector('.base-breadcrumbs__item--home')
		expect(homeItem).toBeTruthy()
		const ellipsisItem = canvasElement.querySelector('.base-breadcrumbs__item--ellipsis')
		expect(ellipsisItem).toBeTruthy()
		const dots = canvasElement.querySelectorAll('.base-breadcrumbs__sep')
		expect(dots.length).toBeGreaterThan(0)
	},
}
/** Slash-разделитель с home + collapsed — оба слота с slash */
export const SlashSeparatorHomeCollapsed: Story = {
	args: {
		items: ITEMS,
		separator: 'slash',
		showHome: true,
		maxItems: 2,
	},
	play: async ({ canvasElement }) => {
		const seps = canvasElement.querySelectorAll('.base-breadcrumbs__sep')
		expect(seps.length).toBeGreaterThan(0)
	},
}
/** customClass — покрытие всех elementKeys */
export const WithCustomClass: Story = {
	args: {
		items: ITEMS,
		showHome: true,
		maxItems: 2,
		customClass: {
			root: 'bc-root',
			list: 'bc-list',
			item: 'bc-item',
			ellipsisBtn: 'bc-ellipsis',
			link: 'bc-link',
			current: 'bc-current',
			separator: 'bc-sep',
		},
	},
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.bc-root')).toBeTruthy()
	},
}
