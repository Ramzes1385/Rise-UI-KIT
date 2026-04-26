/**
 * Stories для компонента BaseLoader.
 * Демонстрирует все варианты, размеры и состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import BaseLoader from './BaseLoader.vue'

const meta: Meta<typeof BaseLoader> = {
	title: 'UI/BaseLoader',
	component: BaseLoader,

	argTypes: {
		variant: {
			control: 'select',
			options: ['spinner', 'dots', 'pulse', 'bars'],
		},
		size: {
			control: 'select',
			options: ['xs', 'sm', 'md', 'lg'],
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
	},

	args: {
		variant: 'spinner',
		size: 'md',
		hasLabel: false,
		label: 'Загрузка...',
		isOverlay: false,
	},
}

export default meta
type Story = StoryObj<typeof BaseLoader>

// ── Базовая story ──

export const Default: Story = {}

// ── Варианты анимации ──

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
}

// ── Размеры ──

export const Sizes: Story = {
	render: args => ({
		components: { BaseLoader },
		setup() {
			return { args }
		},
		template: `
			<div style="display: flex; gap: 32px; align-items: center;">
				<div style="text-align:center;">
					<BaseLoader v-bind="args" size="xs" />
					<span style="display:block;margin-top:8px;font-size:12px;color:var(--color-text-muted);">xs</span>
				</div>
				<div style="text-align:center;">
					<BaseLoader v-bind="args" size="sm" />
					<span style="display:block;margin-top:8px;font-size:12px;color:var(--color-text-muted);">sm</span>
				</div>
				<div style="text-align:center;">
					<BaseLoader v-bind="args" size="md" />
					<span style="display:block;margin-top:8px;font-size:12px;color:var(--color-text-muted);">md</span>
				</div>
				<div style="text-align:center;">
					<BaseLoader v-bind="args" size="lg" />
					<span style="display:block;margin-top:8px;font-size:12px;color:var(--color-text-muted);">lg</span>
				</div>
			</div>
		`,
	}),
}

// ── С текстом ──

export const WithLabel: Story = {
	args: {
		hasLabel: true,
	},
}

// ── Все варианты с текстом ──

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
}

// ── Кастомный цвет ──

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
}

// ── Тёмная тема ──

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
}
