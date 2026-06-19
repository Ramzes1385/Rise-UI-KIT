/**
 * Stories для компонента BaseLoader.
 * Демонстрирует все варианты, масштабирование и состояния.
 */

import { expect, within } from 'storybook/test'
import { UI_TEXT } from '@constants'
import { buildArgTypes } from '@utils/storybookUtils'
import BaseLoader from '../ui/BaseLoader.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<typeof BaseLoader> = {
	title: 'UI/BaseLoader',
	component: BaseLoader,

	argTypes: buildArgTypes({
		props: {
			variant: {
				control: 'inline-radio',
				options: ['spinner', 'dots', 'pulse', 'bars'],
			},
			color: {
				control: 'object',
				description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
			},
			hasLabel: {
				control: 'boolean',
			},
			label: {
				control: 'text',
			},
			isOverlay: {
				control: 'boolean',
			},
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
			},
			customClass: { control: 'object' },
		},
	}),

	args: {
		variant: 'spinner',
		hasLabel: false,
		label: UI_TEXT.LOADING,
		isOverlay: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseLoader>
/** Базовая story */
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const loader = canvasElement.querySelector('[role="status"]')
		expect(loader).toBeInTheDocument()
		expect(loader?.getAttribute('aria-label')).toBe(UI_TEXT.LOADING_ARIA)
		// Проверяем наличие SVG spinner
		const svg = loader?.querySelector('svg.base-loader__spinner')
		expect(svg).toBeInTheDocument()
	},
}
/** Варианты анимации */
export const Variants: Story = {
	render: args => ({
		components: { BaseLoader },
		setup() {
			return { args }
		},
		template: `
			<div style="display: flex; gap: 40px; align-items: center;">
				<div style="text-align:center;">
					<BaseLoader v-bind="args" variant="spinner" />
					<span style="display:block;margin-top:8px;font-size:12px;color:var(--color-text-muted);">spinner</span>
				</div>
				<div style="text-align:center;">
					<BaseLoader v-bind="args" variant="dots" />
					<span style="display:block;margin-top:8px;font-size:12px;color:var(--color-text-muted);">dots</span>
				</div>
				<div style="text-align:center;">
					<BaseLoader v-bind="args" variant="pulse" />
					<span style="display:block;margin-top:8px;font-size:12px;color:var(--color-text-muted);">pulse</span>
				</div>
				<div style="text-align:center;">
					<BaseLoader v-bind="args" variant="bars" />
					<span style="display:block;margin-top:8px;font-size:12px;color:var(--color-text-muted);">bars</span>
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const loaders = canvasElement.querySelectorAll('[role="status"]')
		expect(loaders).toHaveLength(4)
		// Проверяем наличие нужных элементов для каждого варианта
		expect(loaders[0].querySelector('.base-loader__spinner')).toBeInTheDocument()
		expect(loaders[1].querySelectorAll('.base-loader__dot')).toHaveLength(3)
		expect(loaders[2].querySelector('.base-loader__pulse')).toBeInTheDocument()
		expect(loaders[3].querySelectorAll('.base-loader__bar')).toHaveLength(4)
	},
}
/** Масштабирование через sizeScale */
export const SizeScale: Story = {
	render: args => ({
		components: { BaseLoader },
		setup() {
			return { args }
		},
		template: `
			<div style="display: flex; gap: 32px; align-items: center;">
				<div style="text-align:center;">
					<BaseLoader v-bind="args" :size-scale="50" />
					<span style="display:block;margin-top:8px;font-size:12px;color:var(--color-text-muted);">50%</span>
				</div>
				<div style="text-align:center;">
					<BaseLoader v-bind="args" :size-scale="75" />
					<span style="display:block;margin-top:8px;font-size:12px;color:var(--color-text-muted);">75%</span>
				</div>
				<div style="text-align:center;">
					<BaseLoader v-bind="args" :size-scale="100" />
					<span style="display:block;margin-top:8px;font-size:12px;color:var(--color-text-muted);">100%</span>
				</div>
				<div style="text-align:center;">
					<BaseLoader v-bind="args" :size-scale="150" />
					<span style="display:block;margin-top:8px;font-size:12px;color:var(--color-text-muted);">150%</span>
				</div>
				<div style="text-align:center;">
					<BaseLoader v-bind="args" :size-scale="200" />
					<span style="display:block;margin-top:8px;font-size:12px;color:var(--color-text-muted);">200%</span>
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const loaders = canvasElement.querySelectorAll('[role="status"]')
		expect(loaders).toHaveLength(4)
	},
}
export const WithCustomClass: Story = {
	args: {
		customClass: { root: 'ldr-root', animation: 'ldr-animation', spinner: 'ldr-spinner', label: 'ldr-label' },
	},
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.ldr-root')).toBeTruthy()
	},
}
/** Все варианты с текстом */
export const AllVariantsWithLabel: Story = {
	render: args => ({
		components: { BaseLoader },
		setup() {
			return { args }
		},
		template: `
			<div style="display: flex; gap: 40px; align-items: center;">
				<BaseLoader v-bind="args" variant="spinner" has-label />
				<BaseLoader v-bind="args" variant="dots" has-label />
				<BaseLoader v-bind="args" variant="pulse" has-label />
				<BaseLoader v-bind="args" variant="bars" has-label />
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const labels = canvas.getAllByText(UI_TEXT.LOADING)
		expect(labels).toHaveLength(4)
	},
}
/** Кастомный цвет */
export const CustomColor: Story = {
	render: args => ({
		components: { BaseLoader },
		setup() {
			return { args }
		},
		template: `
			<div style="display: flex; gap: 40px; align-items: center;">
				<BaseLoader v-bind="args" variant="spinner" :color="{ text: { base: '#e74c3c' } }" />
				<BaseLoader v-bind="args" variant="dots" :color="{ text: { base: '#2ecc71' } }" />
				<BaseLoader v-bind="args" variant="pulse" :color="{ text: { base: '#3498db' } }" />
				<BaseLoader v-bind="args" variant="bars" :color="{ text: { base: '#f39c12' } }" />
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const loaders = canvasElement.querySelectorAll('[role="status"]')
		expect(loaders).toHaveLength(4)
	},
}
/** Оверлей */
export const Overlay: Story = {
	render: args => ({
		components: { BaseLoader },
		setup() {
			return { args }
		},
		template: `
			<div style="position: relative; width: 300px; height: 200px; border: 1px solid var(--color-border); border-radius: 8px; padding: 16px;">
				<p style="color: var(--color-text-muted);">Содержимое контейнера за оверлеем</p>
				<BaseLoader v-bind="args" is-overlay />
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const loader = canvasElement.querySelector('.base-loader--overlay')
		expect(loader).toBeInTheDocument()
	},
}
/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 24px; background: var(--color-bg);"><story /></div>',
		}),
	],
	render: args => ({
		components: { BaseLoader },
		setup() {
			return { args }
		},
		template: `
			<div style="display: flex; gap: 40px; align-items: center;">
				<BaseLoader v-bind="args" variant="spinner" has-label />
				<BaseLoader v-bind="args" variant="dots" has-label />
				<BaseLoader v-bind="args" variant="pulse" has-label />
				<BaseLoader v-bind="args" variant="bars" has-label />
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const loaders = canvasElement.querySelectorAll('[role="status"]')
		expect(loaders).toHaveLength(4)
	},
}
