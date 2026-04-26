/**
 * Stories для компонента BaseRange.
 * Демонстрирует все вариации, размеры, тултипы и метки.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

import BaseRange from './BaseRange.vue'

const meta: Meta<typeof BaseRange> = {
	title: 'UI/BaseRange',
	component: BaseRange,

	argTypes: {
		modelValue: {
			control: { type: 'range', min: 0, max: 100 },
		},
		min: {
			control: 'number',
		},
		max: {
			control: 'number',
		},
		step: {
			control: 'number',
		},
		variant: {
			control: 'select',
			options: ['primary', 'accent', 'success', 'warning', 'error'],
		},
		isDisabled: {
			control: 'boolean',
		},
		hasTooltip: {
			control: 'boolean',
		},
		isVertical: {
			control: 'boolean',
		},
		hasLabel: {
			control: 'boolean',
		},
		sizeScale: {
			control: 'number',
			description: 'Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%)',
		},
	},

	args: {
		modelValue: 40,
		min: 0,
		max: 100,
		step: 1,
		variant: 'primary',
		isDisabled: false,
		hasTooltip: false,
		isVertical: false,
		hasLabel: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseRange>

// ── Базовая story ──

export const Default: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const value = ref(40)
			return { args, value }
		},
		template: '<BaseRange v-model="value" v-bind="args" />',
	}),
}

// ── Варианты цветов ──

export const Variants: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v1 = ref(40)
			const v2 = ref(40)
			const v3 = ref(40)
			const v4 = ref(40)
			const v5 = ref(40)
			return { args, v1, v2, v3, v4, v5 }
		},
		template: `
			<div style="display: flex; flex-direction: column; gap: 24px;">
				<BaseRange v-model="v1" v-bind="args" variant="primary" />
				<BaseRange v-model="v2" v-bind="args" variant="accent" />
				<BaseRange v-model="v3" v-bind="args" variant="success" />
				<BaseRange v-model="v4" v-bind="args" variant="warning" />
				<BaseRange v-model="v5" v-bind="args" variant="error" />
			</div>
		`,
	}),
}

// ── Масштабирование размера ──

export const SizeScale: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const s1 = ref(40)
			const s2 = ref(40)
			const s3 = ref(40)
			return { args, s1, s2, s3 }
		},
		template: `
			<div style="display: flex; flex-direction: column; gap: 24px;">
				<BaseRange v-model="s1" v-bind="args" :size-scale="75" />
				<BaseRange v-model="s2" v-bind="args" :size-scale="100" />
				<BaseRange v-model="s3" v-bind="args" :size-scale="150" />
			</div>
		`,
	}),
}

// ── С тултипом ──

export const WithTooltip: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const value = ref(50)
			return { args, value }
		},
		template: '<BaseRange v-model="value" v-bind="args" has-tooltip />',
	}),
}

// ── С меткой ──

export const WithLabel: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const value = ref(50)
			return { args, value }
		},
		template: '<BaseRange v-model="value" v-bind="args" has-label />',
	}),
}

// ── С метками на шкале ──

export const WithMarks: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const value = ref(50)
			return { args, value }
		},
		template: `
			<BaseRange
				v-model="value"
				v-bind="args"
				has-label
				:marks="[
					{ value: 0, label: '0' },
					{ value: 25, label: '25' },
					{ value: 50, label: '50' },
					{ value: 75, label: '75' },
					{ value: 100, label: '100' },
				]"
			/>
		`,
	}),
}

// ── Отключенный ──

export const Disabled: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const value = ref(40)
			return { args, value }
		},
		template: '<BaseRange v-model="value" v-bind="args" is-disabled />',
	}),
}

// ── Диапазон (двойной ползунок) ──

export const Range: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const value = ref(40)
			const range = ref<[number, number]>([20, 70])
			return { args, value, range }
		},
		template: `
			<div style="display: flex; flex-direction: column; gap: 24px;">
				<BaseRange v-model="value" v-bind="args" />
				<BaseRange v-model="value" v-bind="args" :range-value="range" @update:range-value="range = $event" has-tooltip />
			</div>
		`,
	}),
}

// ── Тёмная тема ──

export const DarkTheme: Story = {
	decorators: [
		() => ({
			template:
				'<div data-theme="dark" style="padding: 24px; background: var(--color-bg); border-radius: 8px;"><story /></div>',
		}),
	],
	render: args => ({
		components: { BaseRange },
		setup() {
			const v1 = ref(50)
			const v2 = ref(50)
			const v3 = ref(50)
			const v4 = ref(50)
			return { args, v1, v2, v3, v4 }
		},
		template: `
			<div style="display: flex; flex-direction: column; gap: 24px;">
				<BaseRange v-model="v1" v-bind="args" variant="primary" has-tooltip />
				<BaseRange v-model="v2" v-bind="args" variant="accent" has-tooltip />
				<BaseRange v-model="v3" v-bind="args" variant="success" has-tooltip />
				<BaseRange v-model="v4" v-bind="args" variant="warning" has-tooltip />
			</div>
		`,
	}),
}
