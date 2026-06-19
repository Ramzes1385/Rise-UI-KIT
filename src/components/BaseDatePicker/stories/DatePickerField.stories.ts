/**
 * Stories для DatePickerField.
 * Используются для генерации покрытия в Storybook.
 * Внутренний sub-компонент — buildArgTypes не используется,
 * args задаются напрямую в meta.args (без контроля через args-таблицу).
 */

import { expect, fn, userEvent } from 'storybook/test'
import DatePickerField from '../ui/DatePickerField/DatePickerField.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<typeof DatePickerField> = {
	title: 'UI/BaseDatePicker/DatePickerField',
	component: DatePickerField,
	args: {
		displayValue: '',
		placeholder: 'Выберите дату',
		'onField-click': fn(),
		'onClear-click': fn(),
		'onIcon-click': fn(),
	},
}

export default meta
type Story = StoryObj<typeof DatePickerField>
/** Базовое поле без значения */
export const Default: Story = {
	render: args => ({
		components: { DatePickerField },
		setup() {
			return { args }
		},
		template: '<DatePickerField v-bind="args" />',
	}),
	play: async ({ canvasElement, args }) => {
		const input = canvasElement.querySelector('.base-input')
		if (input) {
			await userEvent.click(input)
		}
		expect(args['onField-click']).toHaveBeenCalled()
	},
}
/** Поле со значением */
export const WithValue: Story = {
	args: {
		displayValue: '12.05.2026',
		hasValue: true,
	},
	render: args => ({
		components: { DatePickerField },
		setup() {
			return { args }
		},
		template: '<DatePickerField v-bind="args" />',
	}),
}
/** Поле с кнопкой очистки */
export const Clearable: Story = {
	args: {
		displayValue: '12.05.2026',
		hasValue: true,
		isClearable: true,
	},
	render: args => ({
		components: { DatePickerField },
		setup() {
			return { args }
		},
		template: '<DatePickerField v-bind="args" />',
	}),
	play: async ({ canvasElement, args }) => {
		const clearBtn = canvasElement.querySelector('.date-picker-field__clear-btn')
		if (clearBtn) {
			await userEvent.click(clearBtn)
		}
		expect(args['onClear-click']).toHaveBeenCalled()
	},
}
/** Клик по иконке календаря */
export const IconClick: Story = {
	args: {
		displayValue: '',
	},
	render: args => ({
		components: { DatePickerField },
		setup() {
			return { args }
		},
		template: '<DatePickerField v-bind="args" />',
	}),
	play: async ({ canvasElement, args }) => {
		const iconBtn = canvasElement.querySelector('.date-picker-field__icon-btn')
		if (iconBtn) {
			await userEvent.click(iconBtn)
		}
		expect(args['onIcon-click']).toHaveBeenCalled()
	},
}
/** Отключённое поле */
export const Disabled: Story = {
	args: {
		isDisabled: true,
		displayValue: '12.05.2026',
		hasValue: true,
		isClearable: true,
	},
	render: args => ({
		components: { DatePickerField },
		setup() {
			return { args }
		},
		template: '<DatePickerField v-bind="args" />',
	}),
}
/** Поле с ошибкой */
export const WithError: Story = {
	args: {
		error: 'Дата обязательна',
		isRequired: true,
		label: 'Дата',
	},
	render: args => ({
		components: { DatePickerField },
		setup() {
			return { args }
		},
		template: '<DatePickerField v-bind="args" />',
	}),
}
/** Кастомная иконка через слот */
export const CustomIconSlot: Story = {
	render: args => ({
		components: { DatePickerField },
		setup() {
			return { args }
		},
		template: `
			<DatePickerField v-bind="args">
				<template #icon>
					<span class="custom-icon" style="padding: 4px;">📅</span>
				</template>
			</DatePickerField>
		`,
	}),
	play: async ({ canvasElement }) => {
		const customIcon = canvasElement.querySelector('.custom-icon')
		expect(customIcon).toBeInTheDocument()
	},
}
/** Clearable без значения — кнопка очистки скрыта */
export const ClearableNoValue: Story = {
	args: {
		isClearable: true,
		hasValue: false,
		displayValue: '',
	},
	render: args => ({
		components: { DatePickerField },
		setup() {
			return { args }
		},
		template: '<DatePickerField v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const clearBtn = canvasElement.querySelector('.date-picker-field__clear-btn')
		expect(clearBtn).toBeNull()
	},
}
