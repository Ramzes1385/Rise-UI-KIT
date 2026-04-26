/**
 * Stories для компонента BaseMenu.
 * Демонстрирует все возможности и интерактивные состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import type { BaseMenuItem } from './BaseMenu.types'
import { MENU_VARIANTS } from './BaseMenu.types'
import BaseMenu from './BaseMenu.vue'

const ITEMS: BaseMenuItem[][] = [
	[
		{ label: 'Профиль', icon: '👤' },
		{ label: 'Настройки', icon: '⚙️' },
	],
	[
		{ label: 'Каталог', icon: '📂' },
		{ label: 'Заказы', icon: '📦', hasDivider: true },
	],
	[{ label: 'Выход', icon: '🚪' }],
]

const SIMPLE_ITEMS: BaseMenuItem[][] = [
	[{ label: 'Редактировать' }, { label: 'Дублировать' }, { label: 'Удалить', hasDivider: true }],
]

const NAV_ITEMS: BaseMenuItem[][] = [
	[
		{ label: 'Главная', icon: '🏠' },
		{ label: 'Каталог', icon: '📂' },
		{ label: 'О нас', icon: 'ℹ️' },
		{ label: 'Контакты', icon: '📞' },
	],
]

const MANY_ITEMS: BaseMenuItem[][] = [
	[
		{ label: 'Пункт 1', icon: '1️⃣' },
		{ label: 'Пункт 2', icon: '2️⃣' },
		{ label: 'Пункт 3', icon: '3️⃣' },
		{ label: 'Пункт 4', icon: '4️⃣' },
		{ label: 'Пункт 5', icon: '5️⃣' },
	],
	[
		{ label: 'Пункт 6', icon: '6️⃣' },
		{ label: 'Пункт 7', icon: '7️⃣' },
	],
]

const meta: Meta<typeof BaseMenu> = {
	title: 'UI/BaseMenu',
	component: BaseMenu,

	argTypes: {
		variant: {
			control: 'select',
			options: MENU_VARIANTS,
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
		items: { table: { disable: true } },
	},

	args: {
		items: ITEMS,
		variant: 'default',
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseMenu>

/** Базовое меню */
export const Default: Story = {
	render: args => ({
		components: { BaseMenu },
		setup() {
			const items = ITEMS
			return { args, items }
		},
		template: '<BaseMenu :items="items" />',
	}),
}

/** Все варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseMenu },
		setup() {
			const items = ITEMS
			return { args, items }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:32px;">
				<div v-for="v in ['default','ghost','outline','shadow','soft']" :key="v">
					<span style="font-size:12px;color:var(--color-text-muted);">{{ v }}</span>
					<BaseMenu :items="items" v-bind="args" :variant="v" />
				</div>
			</div>
		`,
	}),
}

/** Простое меню */
export const Simple: Story = {
	render: args => ({
		components: { BaseMenu },
		setup() {
			const items = SIMPLE_ITEMS
			return { args, items }
		},
		template: '<BaseMenu :items="items" />',
	}),
}

/** С отключенными пунктами */
export const WithDisabled: Story = {
	render: () => ({
		components: { BaseMenu },
		setup() {
			const items: BaseMenuItem[][] = [
				[{ label: 'Действие 1' }, { label: 'Действие 2 (недоступно)', isDisabled: true }, { label: 'Действие 3' }],
			]
			return { items }
		},
		template: '<BaseMenu :items="items" />',
	}),
}

/** Навигационное меню */
export const Navigation: Story = {
	render: args => ({
		components: { BaseMenu },
		setup() {
			const items = NAV_ITEMS
			return { args, items }
		},
		template: '<BaseMenu :items="items" @select="item => console.log(\'select\', item)" />',
	}),
}

/** Много пунктов */
export const ManyItems: Story = {
	render: args => ({
		components: { BaseMenu },
		setup() {
			const items = MANY_ITEMS
			return { args, items }
		},
		template: '<BaseMenu :items="items" />',
	}),
}

/** Без иконок */
export const WithoutIcons: Story = {
	render: () => ({
		components: { BaseMenu },
		setup() {
			const items: BaseMenuItem[][] = [
				[{ label: 'Опция A' }, { label: 'Опция B' }, { label: 'Опция C', hasDivider: true }],
			]
			return { items }
		},
		template: '<BaseMenu :items="items" />',
	}),
}

/** С разделителями */
export const WithDividers: Story = {
	render: () => ({
		components: { BaseMenu },
		setup() {
			const items: BaseMenuItem[][] = [
				[{ label: 'Первая группа' }, { label: 'С разделителем', hasDivider: true }],
				[{ label: 'Вторая группа' }, { label: 'Конец', hasDivider: true }],
				[{ label: 'Третья группа' }],
			]
			return { items }
		},
		template: '<BaseMenu :items="items" />',
	}),
}

// ── Интерактивные состояния (hover / active / focus) ──

export const HoverState: Story = {
	render: () => ({
		components: { BaseMenu },
		setup() {
			const items = ITEMS
			return { items }
		},
		template: `
			<BaseMenu :items="items" class="base-menu--hover" />
		`,
	}),
}

export const ActiveState: Story = {
	render: () => ({
		components: { BaseMenu },
		setup() {
			const items = ITEMS
			return { items }
		},
		template: `
			<BaseMenu :items="items" class="base-menu--active" />
		`,
	}),
}

export const FocusState: Story = {
	render: () => ({
		components: { BaseMenu },
		setup() {
			const items = ITEMS
			return { items }
		},
		template: `
			<BaseMenu :items="items" class="base-menu--focus" />
		`,
	}),
}

/** Все интерактивные состояния рядом */
export const InteractiveStates: Story = {
	render: () => ({
		components: { BaseMenu },
		setup() {
			const items = ITEMS
			return { items }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;">
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Normal</span>
					<BaseMenu :items="items" />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Hover</span>
					<BaseMenu :items="items" class="base-menu--hover" />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Active</span>
					<BaseMenu :items="items" class="base-menu--active" />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Focus</span>
					<BaseMenu :items="items" class="base-menu--focus" />
				</div>
			</div>
		`,
	}),
}

/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	render: () => ({
		components: { BaseMenu },
		setup() {
			const items = ITEMS
			return { items }
		},
		template: '<BaseMenu :items="items" />',
	}),
}

/** Интерактивное */
export const Interactive: Story = {
	render: args => ({
		components: { BaseMenu },
		setup() {
			const items = ITEMS
			return { args, items }
		},
		template: '<BaseMenu :items="items" />',
	}),
}
