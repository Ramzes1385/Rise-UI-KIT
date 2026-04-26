/**
 * Stories для компонента BasePin.
 * Демонстрирует все вариации, состояния и интерактивные состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

import BasePin from './BasePin.vue'

const meta: Meta<typeof BasePin> = {
	title: 'UI/BasePin',
	component: BasePin,

	argTypes: {
		length: { control: 'number', min: 2, max: 8 },
		type: {
			control: 'inline-radio',
			options: ['text', 'password', 'number'],
		},
		variant: {
			control: 'select',
			options: ['default', 'ghost', 'outline', 'shadow', 'soft'],
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		isDisabled: { control: 'boolean' },
		hasError: { control: 'boolean' },
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
		modelValue: { table: { disable: true } },
		'onUpdate:modelValue': { table: { disable: true } },
		onComplete: { table: { disable: true } },
	},

	args: {
		length: 4,
		type: 'text',
		variant: 'default',
		isDisabled: false,
		hasError: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BasePin>

/** Базовый ввод кода */
export const Default: Story = {
	render: args => ({
		components: { BasePin },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BasePin v-model="value" v-bind="args" />',
	}),
}

/** Скрытый ввод (пароль) */
export const Password: Story = {
	args: {
		type: 'password',
	},
	render: args => ({
		components: { BasePin },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BasePin v-model="value" v-bind="args" />',
	}),
}

/** Числовой ввод */
export const Number: Story = {
	args: {
		type: 'number',
	},
	render: args => ({
		components: { BasePin },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BasePin v-model="value" v-bind="args" />',
	}),
}

/** 6 цифр */
export const SixDigits: Story = {
	args: {
		length: 6,
	},
	render: args => ({
		components: { BasePin },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BasePin v-model="value" v-bind="args" />',
	}),
}

/** 2 цифры */
export const TwoDigits: Story = {
	args: {
		length: 2,
	},
	render: args => ({
		components: { BasePin },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BasePin v-model="value" v-bind="args" />',
	}),
}

/** 8 цифр */
export const EightDigits: Story = {
	args: {
		length: 8,
	},
	render: args => ({
		components: { BasePin },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BasePin v-model="value" v-bind="args" />',
	}),
}

/** С ошибкой */
export const WithError: Story = {
	args: {
		hasError: true,
	},
	render: args => ({
		components: { BasePin },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: `
			<div>
				<BasePin v-model="value" v-bind="args" />
				<p style="margin-top:4px;color:var(--color-error, #ef4444);font-size:12px;">Неверный код</p>
			</div>
		`,
	}),
}

/** Отключенный */
export const Disabled: Story = {
	args: {
		isDisabled: true,
	},
	render: args => ({
		components: { BasePin },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BasePin v-model="value" v-bind="args" />',
	}),
}

/** Все длины */
export const AllLengths: Story = {
	render: () => ({
		components: { BasePin },
		setup() {
			const v2 = ref('')
			const v4 = ref('')
			const v6 = ref('')
			const v8 = ref('')
			return { v2, v4, v6, v8 }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;">
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">2 символа</span>
					<BasePin v-model="v2" :length="2" />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">4 символа</span>
					<BasePin v-model="v4" :length="4" />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">6 символов</span>
					<BasePin v-model="v6" :length="6" />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">8 символов</span>
					<BasePin v-model="v8" :length="8" />
				</div>
			</div>
		`,
	}),
}

/** Все варианты */
export const Variants: Story = {
	render: args => ({
		components: { BasePin },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;">
				<div v-for="v in ['default','ghost','outline','shadow','soft']" :key="v">
					<p style="margin-bottom:8px;font-size:12px;color:var(--color-text-muted);">Variant: {{ v }}</p>
					<BasePin v-model="value" v-bind="args" :variant="v" />
				</div>
			</div>
		`,
	}),
}

// ── Интерактивные состояния (hover / active / focus) ──

export const HoverState: Story = {
	render: () => ({
		components: { BasePin },
		setup() {
			const value = ref('')
			return { value }
		},
		template: `
			<div>
				<span style="font-size:12px;color:var(--color-text-muted);">Hover</span>
				<BasePin v-model="value" :length="4" class="base-pin--hover" />
			</div>
		`,
	}),
}

export const ActiveState: Story = {
	render: () => ({
		components: { BasePin },
		setup() {
			const value = ref('')
			return { value }
		},
		template: `
			<div>
				<span style="font-size:12px;color:var(--color-text-muted);">Active</span>
				<BasePin v-model="value" :length="4" class="base-pin--active" />
			</div>
		`,
	}),
}

export const FocusState: Story = {
	render: () => ({
		components: { BasePin },
		setup() {
			const value = ref('')
			return { value }
		},
		template: `
			<div>
				<span style="font-size:12px;color:var(--color-text-muted);">Focus</span>
				<BasePin v-model="value" :length="4" class="base-pin--focus" />
			</div>
		`,
	}),
}

/** Все интерактивные состояния рядом */
export const InteractiveStates: Story = {
	render: () => ({
		components: { BasePin },
		setup() {
			const v1 = ref('')
			const v2 = ref('')
			const v3 = ref('')
			const v4 = ref('')
			const v5 = ref('')
			const v6 = ref('')
			return { v1, v2, v3, v4, v5, v6 }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;">
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Normal</span>
					<BasePin v-model="v1" :length="4" />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Hover</span>
					<BasePin v-model="v2" :length="4" class="base-pin--hover" />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Active</span>
					<BasePin v-model="v3" :length="4" class="base-pin--active" />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Focus</span>
					<BasePin v-model="v4" :length="4" class="base-pin--focus" />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Error</span>
					<BasePin v-model="v5" :length="4" has-error />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Disabled</span>
					<BasePin v-model="v6" :length="4" is-disabled />
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
		components: { BasePin },
		setup() {
			const value = ref('')
			return { value }
		},
		template: '<BasePin v-model="value" :length="4" />',
	}),
}

/** Интерактивный */
export const Interactive: Story = {
	render: args => ({
		components: { BasePin },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: `
			<div>
				<BasePin v-model="value" v-bind="args" />
				<p style="margin-top:8px;color:var(--color-text-muted);">Значение: {{ value }}</p>
			</div>
		`,
	}),
}
