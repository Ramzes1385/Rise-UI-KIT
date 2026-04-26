/**
 * Stories для компонента BaseProgress.
 * Демонстрирует все вариации, формы, размеры и анимации.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import BaseProgress from './BaseProgress.vue'

const meta: Meta<typeof BaseProgress> = {
	title: 'UI/BaseProgress',
	component: BaseProgress,

	argTypes: {
		value: {
			control: { type: 'range', min: 0, max: 100 },
		},
		max: {
			control: 'number',
		},
		variant: {
			control: 'select',
			options: ['default', 'ghost', 'outline', 'shadow', 'soft'],
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		shape: {
			control: 'inline-radio',
			options: ['line', 'circle'],
		},
		animation: {
			control: 'select',
			options: ['none', 'striped', 'pulse', 'glow'],
		},
		hasLabel: {
			control: 'boolean',
		},
		isIndeterminate: {
			control: 'boolean',
		},
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
	},

	args: {
		value: 60,
		max: 100,
		variant: 'default',
		shape: 'line',
		animation: 'none',
		hasLabel: false,
		isIndeterminate: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseProgress>

// ── Базовая story ──

export const Default: Story = {}

// ── Варианты цветов ──

export const Variants: Story = {
	render: args => ({
		components: { BaseProgress },
		setup() {
			return { args }
		},
		template: `
			<div style="display: flex; flex-direction: column; gap: 16px;">
				<BaseProgress v-for="v in ['default', 'ghost', 'outline', 'shadow', 'soft']"
					:key="v"
					v-bind="args"
					:variant="v"
					:value="60"
				/>
			</div>
		`,
	}),
}

// ── Масштабирование размера ──

export const SizeScale: Story = {
	render: args => ({
		components: { BaseProgress },
		setup() {
			return { args }
		},
		template: `
			<div style="display: flex; flex-direction: column; gap: 16px;">
				<BaseProgress v-for="s in [0.75, 1, 1.5]"
					:key="s"
					v-bind="args"
					:size-scale="s"
					:value="60"
				/>
			</div>
		`,
	}),
}

// ── Круговой прогресс ──

export const Circle: Story = {
	render: args => ({
		components: { BaseProgress },
		setup() {
			return { args }
		},
		template: `
			<div style="display: flex; gap: 24px; align-items: center;">
				<BaseProgress v-for="v in ['default', 'ghost', 'outline', 'shadow', 'soft']"
					:key="v"
					v-bind="args"
					:variant="v"
					shape="circle"
					:value="60"
					has-label
				/>
			</div>
		`,
	}),
}

// ── С меткой ──

export const WithLabel: Story = {
	args: {
		value: 75,
		hasLabel: true,
	},
}

// ── Анимации ──

export const Animations: Story = {
	render: args => ({
		components: { BaseProgress },
		setup() {
			return { args }
		},
		template: `
			<div style="display: flex; flex-direction: column; gap: 16px;">
				<BaseProgress v-for="a in ['none', 'striped', 'pulse', 'glow']"
					:key="a"
					v-bind="args"
					:animation="a"
					:value="60"
				/>
			</div>
		`,
	}),
}

// ── Неопределённый прогресс ──

export const Indeterminate: Story = {
	args: {
		isIndeterminate: true,
	},
}

// ── Интерактивная ──

export const Interactive: Story = {
	args: {
		value: 30,
		hasLabel: true,
	},
	argTypes: {
		value: {
			control: { type: 'range', min: 0, max: 100 },
		},
	},
}

// ── Тёмная тема ──

export const DarkTheme: Story = {
	render: args => ({
		components: { BaseProgress },
		setup() {
			return { args }
		},
		template: `
			<div style="background: #1a1a2e; padding: 24px; border-radius: 8px;">
				<div style="display: flex; flex-direction: column; gap: 16px;">
					<BaseProgress v-for="v in ['default', 'ghost', 'outline', 'shadow', 'soft']"
						:key="v"
						v-bind="args"
						:variant="v"
						:value="60"
						has-label
					/>
				</div>
			</div>
		`,
	}),
}
