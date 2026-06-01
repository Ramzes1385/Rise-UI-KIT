/**
 * Stories для компонента BaseFormField.
 * Демонстрирует все состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, userEvent, within } from 'storybook/test'

import { BaseInput } from '@components/BaseInput'
import { buildArgTypes } from '@utils/storybookUtils'

import { FORM_FIELD_VARIANTS } from './BaseFormField.types'
import BaseFormField from './BaseFormField.vue'

const meta: Meta<typeof BaseFormField> = {
	title: 'UI/BaseFormField',
	component: BaseFormField,

	argTypes: buildArgTypes({
		props: {
			label: { control: 'text' },
			description: { control: 'text' },
			error: { control: 'text' },
			variant: {
				control: 'radio',
				options: FORM_FIELD_VARIANTS,
			},
			color: {
				control: 'object',
				description: 'Объект CustomColor: bg (фон), text (текст) и их состояния hover/active/focus',
			},
			isRequired: { control: 'boolean' },
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера (50–200%, по умолчанию 100)',
			},
		},
	}),

	args: {
		label: 'Email',
		description: '',
		error: '',
		variant: 'default',
		isRequired: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseFormField>
/** Базовое поле */
export const Default: Story = {
	render: args => ({
		components: { BaseFormField, BaseInput },
		setup() {
			return { args }
		},
		template: `
			<BaseFormField v-bind="args">
				<BaseInput model-value="" placeholder="email@example.com" />
			</BaseFormField>
		`,
	}),
}
/** Варианты отображения */
export const Variants: Story = {
	render: () => ({
		components: { BaseFormField, BaseInput },
		setup() {
			return { FORM_FIELD_VARIANTS }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:400px;">
				<BaseFormField v-for="v in FORM_FIELD_VARIANTS" :key="v" :label="v" :variant="v">
					<BaseInput model-value="" :placeholder="v + ' вариант'" />
				</BaseFormField>
			</div>
		`,
	}),
}
/** Масштаб размера — sizeScale применяется ко всем вложенным элементам */
export const SizeScale: Story = {
	render: () => ({
		components: { BaseFormField, BaseInput },
		setup() {
			const scales = [75, 100, 125, 150]
			return { scales }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;max-width:400px;">
				<template v-for="s in scales" :key="s">
					<BaseFormField
						:label="'Масштаб ' + s + '% — описание'"
						:size-scale="s"
						description="Подсказка масштабируется"
						is-required
					>
						<BaseInput model-value="" placeholder="Введите значение" />
					</BaseFormField>
					<BaseFormField
						:label="'Масштаб ' + s + '% — ошибка'"
						:size-scale="s"
						error="Ошибка масштабируется"
						is-required
					>
						<BaseInput model-value="bad-email" error />
					</BaseFormField>
				</template>
			</div>
		`,
	}),
}
/** С описанием */
export const WithDescription: Story = {
	args: {
		description: 'Мы не будем передавать ваш email третьим лицам',
	},
	render: args => ({
		components: { BaseFormField, BaseInput },
		setup() {
			return { args }
		},
		template: `
			<BaseFormField v-bind="args">
				<BaseInput model-value="" placeholder="email@example.com" />
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
		components: { BaseFormField, BaseInput },
		setup() {
			return { args }
		},
		template: `
			<BaseFormField v-bind="args">
				<BaseInput model-value="bad-email" error />
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
		components: { BaseFormField, BaseInput },
		setup() {
			return { args }
		},
		template: `
			<BaseFormField v-bind="args">
				<BaseInput model-value="" placeholder="Обязательное поле" />
			</BaseFormField>
		`,
	}),
}
/** Тёмная тема */
export const DarkTheme: Story = {
	render: args => ({
		components: { BaseFormField, BaseInput },
		setup() {
			return { args }
		},
		template: `
			<div data-theme="dark" style="padding:16px;background:var(--color-bg);border-radius:var(--border-radius-base);">
				<BaseFormField v-bind="args">
					<BaseInput model-value="" placeholder="email@example.com" />
				</BaseFormField>
			</div>
		`,
	}),
}
/** Отключённое поле */
export const Disabled: Story = {
	args: {
		label: 'Email',
	},
	render: args => ({
		components: { BaseFormField, BaseInput },
		setup() {
			return { args }
		},
		template: `
			<BaseFormField v-bind="args">
				<BaseInput model-value="disabled@example.com" is-disabled />
			</BaseFormField>
		`,
	}),
}
/** Интерактивное */
export const Interactive: Story = {
	render: args => ({
		components: { BaseFormField, BaseInput },
		setup() {
			return { args }
		},
		template: `
			<BaseFormField v-bind="args">
				<BaseInput model-value="" placeholder="Введите значение" />
			</BaseFormField>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)

		await step('пользователь вводит значение в связанное поле', async () => {
			const input = canvas.getByPlaceholderText('Введите значение')
			await userEvent.type(input, 'Привет')
			expect(input).toHaveValue('Привет')
		})
	},
}
/** Длинный контент — проверка переполнения текста в лейбле, описании и ошибке */
export const LongContent: Story = {
	args: {
		label:
			'Пожалуйста, введите ваш основной адрес электронной почты, который будет использоваться для всех уведомлений, рассылок и важных сообщений от нашей компании, включая обновления заказов и промо-акции, а также для связи с технической поддержкой',
		description:
			'Этот адрес электронной почты будет отображаться в вашем профиле и использоваться для восстановления пароля, а также для получения важных уведомлений о состоянии ваших заказов и аккаунта',
		error:
			'Введённый адрес электронной почты не соответствует требуемому формату. Пожалуйста, убедитесь, что адрес содержит символ @ и корректное доменное имя, например user@example.com, и попробуйте снова',
		isRequired: true,
	},
	render: args => ({
		components: { BaseFormField, BaseInput },
		setup() {
			return { args }
		},
		template: `
			<BaseFormField v-bind="args">
				<BaseInput model-value="invalid-email" error />
			</BaseFormField>
		`,
	}),
	tags: ['!a11y'],
}
