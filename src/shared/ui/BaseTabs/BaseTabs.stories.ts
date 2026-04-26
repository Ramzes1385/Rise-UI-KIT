/**
 * Stories для компонента BaseTabs.
 * Демонстрирует все варианты, состояния и интерактивные состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

import type { TabItem } from './BaseTabs.types'
import BaseTabs from './BaseTabs.vue'

const TABS: TabItem[] = [
	{ id: 'info', label: 'Информация' },
	{ id: 'specs', label: 'Характеристики' },
	{ id: 'reviews', label: 'Отзывы' },
	{ id: 'delivery', label: 'Доставка', isDisabled: true },
]

const ICON_TABS: TabItem[] = [
	{ id: 'home', label: 'Главная', icon: '🏠' },
	{ id: 'catalog', label: 'Каталог', icon: '📂' },
	{ id: 'cart', label: 'Корзина', icon: '🛒' },
	{ id: 'profile', label: 'Профиль', icon: '👤' },
]

const MANY_TABS: TabItem[] = [
	{ id: 'tab1', label: 'Вкладка 1' },
	{ id: 'tab2', label: 'Вкладка 2' },
	{ id: 'tab3', label: 'Вкладка 3' },
	{ id: 'tab4', label: 'Вкладка 4' },
	{ id: 'tab5', label: 'Вкладка 5' },
	{ id: 'tab6', label: 'Вкладка 6' },
]

const meta: Meta<typeof BaseTabs> = {
	title: 'UI/BaseTabs',
	component: BaseTabs,

	argTypes: {
		variant: {
			control: 'radio',
			options: ['underline', 'pills', 'rounded', 'arc'],
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		isFullWidth: { control: 'boolean' },
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
		modelValue: { table: { disable: true } },
		items: {
			control: 'object',
			description: 'Массив табов [{ id, label, icon?, isDisabled? }]',
		},
		'onUpdate:modelValue': { table: { disable: true } },
		onChange: { table: { disable: true } },
	},

	args: {
		items: TABS,
		variant: 'underline',
		isFullWidth: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseTabs>

/** Вариант underline (по умолчанию) */
export const Underline: Story = {
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
}

/** Вариант pills */
export const Pills: Story = {
	args: {
		variant: 'pills',
	},
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
}

/** Вариант rounded */
export const Rounded: Story = {
	args: {
		variant: 'rounded',
	},
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
}

/** Вариант arc */
export const Arc: Story = {
	args: {
		variant: 'arc',
	},
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
}

/** Все варианты */
export const Variants: Story = {
	render: () => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			const items = TABS
			return { tab, items }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:32px;">
				<div v-for="v in ['underline','pills','rounded','arc']" :key="v">
					<span style="font-size:12px;color:var(--color-text-muted);">{{ v }}</span>
					<BaseTabs v-model="tab" :items="items" :variant="v" />
				</div>
			</div>
		`,
	}),
}

/** На всю ширину */
export const FullWidth: Story = {
	args: {
		isFullWidth: true,
	},
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
}

/** Pills на всю ширину */
export const PillsFullWidth: Story = {
	args: {
		variant: 'pills',
		isFullWidth: true,
	},
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
}

/** Rounded на всю ширину */
export const RoundedFullWidth: Story = {
	args: {
		variant: 'rounded',
		isFullWidth: true,
	},
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
}

/** Arc на всю ширину */
export const ArcFullWidth: Story = {
	args: {
		variant: 'arc',
		isFullWidth: true,
	},
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
}

/** С иконками */
export const WithIcons: Story = {
	args: {
		items: ICON_TABS,
	},
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('home')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
}

/** С иконками + pills */
export const WithIconsPills: Story = {
	args: {
		items: ICON_TABS,
		variant: 'pills',
	},
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('home')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
}

/** С иконками + rounded */
export const WithIconsRounded: Story = {
	args: {
		items: ICON_TABS,
		variant: 'rounded',
	},
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('home')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
}

/** С иконками + arc */
export const WithIconsArc: Story = {
	args: {
		items: ICON_TABS,
		variant: 'arc',
	},
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('home')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
}

/** Много табов */
export const ManyTabs: Story = {
	args: {
		items: MANY_TABS,
	},
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('tab1')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
}

/** С отключённым табом */
export const WithDisabled: Story = {
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
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
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			const items = TABS
			return { tab, items }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;">
				<BaseTabs v-model="tab" :items="items" variant="underline" />
				<BaseTabs v-model="tab" :items="items" variant="pills" />
				<BaseTabs v-model="tab" :items="items" variant="rounded" />
				<BaseTabs v-model="tab" :items="items" variant="arc" />
			</div>
		`,
	}),
}

/** Интерактивные */
export const Interactive: Story = {
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			return { args, tab }
		},
		template: `
			<div>
				<BaseTabs v-model="tab" v-bind="args" />
				<p style="margin-top:8px;color:var(--color-text-muted);">Активный: {{ tab }}</p>
			</div>
		`,
	}),
}
