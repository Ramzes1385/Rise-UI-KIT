/**
 * Stories для компонента BaseFormField.
 * Демонстрирует все состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import BaseFormField from './BaseFormField.vue'

const meta: Meta<typeof BaseFormField> = {
	title: 'UI/BaseFormField',
	component: BaseFormField,

	argTypes: {
		label: { control: 'text' },
		description: { control: 'text' },
		error: { control: 'text' },
		isRequired: { control: 'boolean' },
	},

	args: {
		label: 'Email',
		description: '',
		error: '',
		isRequired: false,
	},
}

export default meta
type Story = StoryObj<typeof BaseFormField>

/** Базовое поле */
export const Default: Story = {
	render: args => ({
		components: { BaseFormField },
		setup() {
			return { args }
		},
		template: `
			<BaseFormField v-bind="args">
				<input style="padding:8px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);width:100%;" placeholder="email@example.com" />
			</BaseFormField>
		`,
	}),
}

/** С описанием */
export const WithDescription: Story = {
	args: {
		description: 'Мы не будем передавать ваш email третьим лицам',
	},
	render: args => ({
		components: { BaseFormField },
		setup() {
			return { args }
		},
		template: `
			<BaseFormField v-bind="args">
				<input style="padding:8px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);width:100%;" placeholder="email@example.com" />
			</BaseFormField>
		`,
	}),
}

/** С ошибкой */
export const WithError: Story = {
	args: {
		error: 'Введите корректный email',
	},
	render: args => ({
		components: { BaseFormField },
		setup() {
			return { args }
		},
		template: `
			<BaseFormField v-bind="args">
				<input style="padding:8px;border:1px solid var(--color-error);border-radius:var(--border-radius-base);width:100%;" value="bad-email" />
			</BaseFormField>
		`,
	}),
}

/** Обязательное */
export const Required: Story = {
	args: {
		isRequired: true,
	},
	render: args => ({
		components: { BaseFormField },
		setup() {
			return { args }
		},
		template: `
			<BaseFormField v-bind="args">
				<input style="padding:8px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);width:100%;" placeholder="Обязательное поле" />
			</BaseFormField>
		`,
	}),
}

/** Интерактивное */
export const Interactive: Story = {
	render: args => ({
		components: { BaseFormField },
		setup() {
			return { args }
		},
		template: `
			<BaseFormField v-bind="args">
				<input style="padding:8px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);width:100%;" placeholder="Введите значение" />
			</BaseFormField>
		`,
	}),
}
