/**
 * Stories для компонента BaseSkeleton.
 * Демонстрирует все формы, анимации и кастомный цвет фона.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import BaseSkeleton from './BaseSkeleton.vue'

const meta: Meta<typeof BaseSkeleton> = {
	title: 'UI/BaseSkeleton',
	component: BaseSkeleton,

	argTypes: {
		width: { control: 'text' },
		height: { control: 'text' },
		shape: {
			control: 'inline-radio',
			options: ['text', 'circle', 'rect'],
		},
		color: {
			control: 'color',
			description: 'Кастомный цвет фона',
		},
		isAnimated: { control: 'boolean' },
		isPulse: { control: 'boolean' },
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
	},

	args: {
		width: '100%',
		height: '20px',
		shape: 'text',
		isAnimated: true,
		isPulse: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseSkeleton>

/** Текстовая заглушка */
export const Default: Story = {}

/** Все формы */
export const Shapes: Story = {
	render: args => ({
		components: { BaseSkeleton },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
				<BaseSkeleton v-bind="args" shape="text" width="100%" height="16px" />
				<BaseSkeleton v-bind="args" shape="rect" width="100%" height="120px" />
				<BaseSkeleton v-bind="args" shape="circle" width="64px" height="64px" />
			</div>
		`,
	}),
}

/** Пульсация */
export const Pulse: Story = {
	args: {
		isPulse: true,
	},
}

/** Без анимации */
export const NoAnimation: Story = {
	args: {
		isAnimated: false,
	},
}

/** Кастомный цвет фона */
export const CustomColor: Story = {
	args: {
		color: '#e0e7ff',
	},
	render: args => ({
		components: { BaseSkeleton },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;max-width:320px;">
				<BaseSkeleton v-bind="args" shape="text" width="100%" height="16px" />
				<BaseSkeleton v-bind="args" shape="rect" width="100%" height="80px" />
				<BaseSkeleton v-bind="args" shape="circle" width="48px" height="48px" />
			</div>
		`,
	}),
}

/** Масштабирование sizeScale */
export const SizeScale: Story = {
	render: () => ({
		components: { BaseSkeleton },
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
				<BaseSkeleton shape="text" width="100%" height="16px" :size-scale="75" />
				<BaseSkeleton shape="text" width="100%" height="16px" :size-scale="100" />
				<BaseSkeleton shape="text" width="100%" height="16px" :size-scale="150" />
			</div>
		`,
	}),
}

/** Разные размеры текста */
export const TextSizes: Story = {
	render: () => ({
		components: { BaseSkeleton },
		template: `
			<div style="display:flex;flex-direction:column;gap:8px;max-width:320px;">
				<BaseSkeleton shape="text" width="100%" height="12px" />
				<BaseSkeleton shape="text" width="90%" height="14px" />
				<BaseSkeleton shape="text" width="80%" height="16px" />
				<BaseSkeleton shape="text" width="70%" height="20px" />
				<BaseSkeleton shape="text" width="60%" height="24px" />
			</div>
		`,
	}),
}

/** Карточка-заглушка */
export const CardSkeleton: Story = {
	render: () => ({
		components: { BaseSkeleton },
		template: `
			<div style="max-width:320px;display:flex;flex-direction:column;gap:12px;">
				<BaseSkeleton shape="rect" width="100%" height="180px" />
				<BaseSkeleton shape="text" width="80%" height="20px" />
				<BaseSkeleton shape="text" width="60%" height="16px" />
				<div style="display:flex;gap:8px;">
					<BaseSkeleton shape="circle" width="32px" height="32px" />
					<BaseSkeleton shape="text" width="120px" height="16px" />
				</div>
			</div>
		`,
	}),
}

/** Карточка товара */
export const ProductCardSkeleton: Story = {
	render: () => ({
		components: { BaseSkeleton },
		template: `
			<div style="display:flex;gap:16px;flex-wrap:wrap;">
				<div v-for="i in 3" :key="i" style="max-width:240px;display:flex;flex-direction:column;gap:8px;">
					<BaseSkeleton shape="rect" width="240px" height="180px" />
					<BaseSkeleton shape="text" width="70%" height="18px" />
					<BaseSkeleton shape="text" width="40%" height="14px" />
					<BaseSkeleton shape="text" width="30%" height="20px" />
				</div>
			</div>
		`,
	}),
}

/** Профиль-заглушка */
export const ProfileSkeleton: Story = {
	render: () => ({
		components: { BaseSkeleton },
		template: `
			<div style="display:flex;gap:16px;align-items:center;max-width:400px;">
				<BaseSkeleton shape="circle" width="64px" height="64px" />
				<div style="display:flex;flex-direction:column;gap:8px;flex:1;">
					<BaseSkeleton shape="text" width="50%" height="18px" />
					<BaseSkeleton shape="text" width="80%" height="14px" />
					<BaseSkeleton shape="text" width="60%" height="14px" />
				</div>
			</div>
		`,
	}),
}

/** Список-заглушка */
export const ListSkeleton: Story = {
	render: () => ({
		components: { BaseSkeleton },
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;max-width:400px;">
				<div v-for="i in 5" :key="i" style="display:flex;gap:12px;align-items:center;">
					<BaseSkeleton shape="circle" width="40px" height="40px" />
					<div style="display:flex;flex-direction:column;gap:4px;flex:1;">
						<BaseSkeleton shape="text" width="60%" height="14px" />
						<BaseSkeleton shape="text" width="40%" height="12px" />
					</div>
				</div>
			</div>
		`,
	}),
}

/** Таблица-заглушка */
export const TableSkeleton: Story = {
	render: () => ({
		components: { BaseSkeleton },
		template: `
			<div style="max-width:600px;">
				<div style="display:flex;gap:16px;margin-bottom:12px;">
					<BaseSkeleton shape="text" width="60px" height="14px" />
					<BaseSkeleton shape="text" width="120px" height="14px" />
					<BaseSkeleton shape="text" width="100px" height="14px" />
					<BaseSkeleton shape="text" width="80px" height="14px" />
				</div>
				<div v-for="i in 4" :key="i" style="display:flex;gap:16px;margin-bottom:8px;">
					<BaseSkeleton shape="text" width="60px" height="14px" />
					<BaseSkeleton shape="text" width="120px" height="14px" />
					<BaseSkeleton shape="text" width="100px" height="14px" />
					<BaseSkeleton shape="text" width="80px" height="14px" />
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
		components: { BaseSkeleton },
		template: `
			<div style="max-width:320px;display:flex;flex-direction:column;gap:12px;">
				<BaseSkeleton shape="rect" width="100%" height="180px" />
				<BaseSkeleton shape="text" width="80%" height="20px" />
				<BaseSkeleton shape="text" width="60%" height="16px" />
			</div>
		`,
	}),
}

/** Интерактивная */
export const Interactive: Story = {}
