/**
 * Stories для компонента BaseSeparator.
 * Демонстрирует ориентации, толщины, отступы и слоты.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, within } from 'storybook/test'

import BaseSeparator from '../ui/BaseSeparator.vue'

const meta: Meta<typeof BaseSeparator> = {
	title: 'UI/BaseSeparator',
	component: BaseSeparator,

	argTypes: {
		orientation: {
			control: 'inline-radio',
			options: ['horizontal', 'vertical'],
		},
		label: { control: 'text' },
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		thickness: {
			control: { type: 'range', min: 1, max: 10, step: 1 },
		},
		isDashed: { control: 'boolean' },
		spacing: {
			control: { type: 'range', min: 0, max: 40, step: 2 },
		},
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
		},
	},

	args: {
		orientation: 'horizontal',
		thickness: 1,
		isDashed: false,
		spacing: 10,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseSeparator>
/** Базовый разделитель */
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const separator = canvas.getByRole('separator')
		expect(separator).toBeInTheDocument()
		expect(separator.getAttribute('aria-orientation')).toBe('horizontal')
	},
}
/** С текстом */
export const WithLabel: Story = {
	args: {
		label: 'Или',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Или')).toBeInTheDocument()
		const separator = canvas.getByRole('separator')
		expect(separator.classList.contains('base-separator--with-content')).toBe(true)
	},
}
/** С кастомным слотом */
export const WithSlot: Story = {
	render: () => ({
		components: { BaseSeparator },
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:400px;">
				<BaseSeparator>
					<span style="color: var(--color-accent);">●</span>
				</BaseSeparator>
				<BaseSeparator>
					<span style="color: var(--color-accent);">✦</span>
				</BaseSeparator>
				<BaseSeparator>
					<span style="letter-spacing: 4px; color: var(--color-text-muted);">• • •</span>
				</BaseSeparator>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('●')).toBeInTheDocument()
		expect(canvas.getByText('✦')).toBeInTheDocument()
		expect(canvas.getByText('• • •')).toBeInTheDocument()
	},
}
/** Разная толщина */
export const Thicknesses: Story = {
	render: args => ({
		components: { BaseSeparator },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:400px;">
				<BaseSeparator v-for="t in [1, 2, 3, 5]"
					:key="t"
					v-bind="args"
					:thickness="t"
				/>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const separators = canvas.getAllByRole('separator')
		expect(separators).toHaveLength(4)
	},
}
/** Разные отступы */
export const Spacings: Story = {
	render: args => ({
		components: { BaseSeparator },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:8px;max-width:400px;">
				<BaseSeparator v-for="s in [0, 4, 10, 20, 40]"
					:key="s"
					v-bind="args"
					:spacing="s"
				/>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const separators = canvas.getAllByRole('separator')
		expect(separators).toHaveLength(5)
	},
}
/** Пунктирный */
export const Dashed: Story = {
	args: {
		isDashed: true,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const separator = canvas.getByRole('separator')
		expect(separator.classList.contains('base-separator--dashed')).toBe(true)
	},
}
/** Пунктирный + метка */
export const DashedWithLabel: Story = {
	args: {
		isDashed: true,
		label: 'Или',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const separator = canvas.getByRole('separator')
		expect(separator.classList.contains('base-separator--dashed')).toBe(true)
		expect(separator.classList.contains('base-separator--with-content')).toBe(true)
		expect(canvas.getByText('Или')).toBeInTheDocument()
	},
}
/** Вертикальный */
export const Vertical: Story = {
	args: {
		orientation: 'vertical',
	},
	render: args => ({
		components: { BaseSeparator },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;align-items:center;height:80px;">
				<span>Слева</span>
				<BaseSeparator v-bind="args" />
				<span>Справа</span>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const separator = canvasElement.querySelector('.base-separator')
		expect(separator).toBeInTheDocument()
		expect(separator?.classList.contains('base-separator--vertical')).toBe(true)
	},
}
/** Вертикальный с текстом */
export const VerticalWithLabel: Story = {
	args: {
		orientation: 'vertical',
		label: 'ИЛИ',
	},
	render: args => ({
		components: { BaseSeparator },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;align-items:center;height:120px;">
				<span>Вариант A</span>
				<BaseSeparator v-bind="args" />
				<span>Вариант B</span>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('ИЛИ')).toBeInTheDocument()
		const separator = canvasElement.querySelector('.base-separator')
		expect(separator?.classList.contains('base-separator--vertical')).toBe(true)
		expect(separator?.classList.contains('base-separator--with-content')).toBe(true)
	},
}
/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	render: () => ({
		components: { BaseSeparator },
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:400px;">
				<BaseSeparator />
				<BaseSeparator :thickness="2" />
				<BaseSeparator label="Или" />
				<BaseSeparator>
					<span style="color: var(--color-accent);">✦</span>
				</BaseSeparator>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Или')).toBeInTheDocument()
		expect(canvas.getByText('✦')).toBeInTheDocument()
	},
}
/** Интерактивный */
export const Interactive: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const separator = canvas.getByRole('separator')
		expect(separator).toBeInTheDocument()
	},
}
