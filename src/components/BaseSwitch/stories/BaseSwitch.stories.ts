/**
 * Stories для компонента BaseSwitch.
 * Демонстрирует все вариации, состояния, слоты и CSS-состояния.
 */

import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { ref } from 'vue'
import { buildArgTypes, playFocusTest, playShiftTab } from '@utils/storybookUtils'
import { SWITCH_VARIANTS } from '../model/BaseSwitch.types'
import BaseSwitch from '../ui/BaseSwitch.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<typeof BaseSwitch> = {
	title: 'UI/BaseSwitch',
	component: BaseSwitch,
	argTypes: buildArgTypes({
		props: {
			label: { control: 'text' },
			error: { control: 'text' },
			isRequired: { control: 'boolean' },
			isDisabled: { control: 'boolean' },
			reverse: { control: 'boolean' },
			variant: {
				control: 'select',
				options: SWITCH_VARIANTS,
			},
			color: {
				control: 'object',
				description: 'Объект CustomColor: bg (фоновый цвет), text (цвет текста) и их состояния hover/active/focus',
			},
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера (50–200%, по умолчанию 100)',
			},
			modelValue: { control: 'boolean' },
			'onUpdate:modelValue': { table: { disable: true } },
			onChange: { table: { disable: true } },
			customClass: { control: 'object' },
		},
	}),
	args: {
		label: 'Уведомления',
		variant: 'default',
		isDisabled: false,
		isRequired: false,
		reverse: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseSwitch>
/** Базовый переключатель */
export const Default: Story = {
	render: args => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			return { args, value }
		},
		template: '<BaseSwitch v-model="value" v-bind="args" />',
	}),
	args: {
		onChange: fn(),
		'onUpdate:modelValue': fn(),
	},
	play: async ({ canvasElement, args, step }) => {
		const input = canvasElement.querySelector('input[type="checkbox"]') as HTMLInputElement

		await step('Фокусировка по клавише Tab', async () => {
			await userEvent.tab()
			expect(input).toHaveFocus()
		})

		await step('Переключение состояния по клавише Space', async () => {
			await userEvent.keyboard('[Space]')
			await waitFor(() => {
				expect(input).toBeChecked()
				expect(args.onChange).toHaveBeenCalledWith(true)
				expect(args['onUpdate:modelValue']).toHaveBeenCalledWith(true)
			})
		})

		await step('Повторное переключение по клавише Space', async () => {
			await userEvent.keyboard('[Space]')
			await waitFor(() => {
				expect(input).not.toBeChecked()
				expect(args.onChange).toHaveBeenCalledWith(false)
			})
		})

		await step('Обратная фокусировка по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { selector: 'input[type="checkbox"]' })
		})
	},
}
/** Включенный */
export const Checked: Story = {
	render: args => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(true)
			return { args, value }
		},
		template: '<BaseSwitch v-model="value" v-bind="args" />',
	}),
}
/** все варианты */
export const Variants: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSwitch v-for="v in ['default', 'outline', 'shadow']" :key="v" :variant="v" :label="'Variant: ' + v" />`,
			},
		},
	},
	render: args => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			const variants = SWITCH_VARIANTS
			return { args, value, variants }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<BaseSwitch v-for="v in variants" :key="v" v-model="value" v-bind="args" :variant="v" :label="'Variant: ' + v" />
			</div>
		`,
	}),
}
/** Масштабирование sizeScale */
export const SizeScale: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSwitch v-for="scale in [75, 100, 150]" :key="scale" :size-scale="scale" label="Уведомления" />`,
			},
		},
	},
	render: args => ({
		components: { BaseSwitch },
		setup() {
			const scales = [75, 100, 150]
			return { args, scales }
		},
		template: `
			<div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start;">
				<div v-for="scale in scales" :key="scale">
					<p style="margin-bottom:8px;font-size:13px;color:var(--color-text-muted);">{{ scale }}%</p>
					<BaseSwitch v-bind="args" :size-scale="scale" label="Уведомления" />
				</div>
			</div>
		`,
	}),
}
/** Обязательное поле */
export const Required: Story = {
	args: {
		isRequired: true,
	},
	render: args => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			return { args, value }
		},
		template: '<BaseSwitch v-model="value" v-bind="args" />',
	}),
}
/** С ошибкой */
export const WithError: Story = {
	args: {
		error: 'Необходимо включить уведомления',
	},
	render: args => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			return { args, value }
		},
		template: '<BaseSwitch v-model="value" v-bind="args" />',
	}),
}
/** Обратный порядок */
export const Reverse: Story = {
	args: {
		reverse: true,
	},
	render: args => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			return { args, value }
		},
		template: '<BaseSwitch v-model="value" v-bind="args" />',
	}),
}
/** Отключенный */
export const Disabled: Story = {
	args: {
		isDisabled: true,
	},
	render: args => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			return { args, value }
		},
		template: '<BaseSwitch v-model="value" v-bind="args" />',
	}),
}
/** Отключенный включенный */
export const DisabledChecked: Story = {
	args: {
		isDisabled: true,
	},
	render: args => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(true)
			return { args, value }
		},
		template: '<BaseSwitch v-model="value" v-bind="args" />',
	}),
}
/** Hover-состояние */
export const HoverState: Story = {
	render: () => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			return { value }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<BaseSwitch v-model="value" label="Hover (off)" class="base-switch--hover" />
				<BaseSwitch v-model="value" label="Hover (on)" class="base-switch--hover" :model-value="true" />
			</div>
		`,
	}),
}
/** Focus-состояние */
export const FocusState: Story = {
	render: () => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			return { value }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<BaseSwitch v-model="value" label="Focus (off)" class="base-switch--focus" />
				<BaseSwitch v-model="value" label="Focus (on)" class="base-switch--focus" :model-value="true" />
			</div>
		`,
	}),
}
/** все интерактивные состояния рядом */
export const InteractiveStates: Story = {
	render: () => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			return { value }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;">
				<div style="display:flex;gap:16px;align-items:center;">
					<span style="width:60px;font-size:12px;color:var(--color-text-muted);">Normal</span>
					<BaseSwitch v-model="value" label="Default" />
				</div>
				<div style="display:flex;gap:16px;align-items:center;">
					<span style="width:60px;font-size:12px;color:var(--color-text-muted);">Hover</span>
					<BaseSwitch v-model="value" label="Hover" class="base-switch--hover" />
				</div>
				<div style="display:flex;gap:16px;align-items:center;">
					<span style="width:60px;font-size:12px;color:var(--color-text-muted);">Focus</span>
					<BaseSwitch v-model="value" label="Focus" class="base-switch--focus" />
				</div>
				<div style="display:flex;gap:16px;align-items:center;">
					<span style="width:60px;font-size:12px;color:var(--color-text-muted);">Checked</span>
					<BaseSwitch label="Checked" :model-value="true" />
				</div>
				<div style="display:flex;gap:16px;align-items:center;">
					<span style="width:60px;font-size:12px;color:var(--color-text-muted);">Error</span>
					<BaseSwitch v-model="value" label="Error" error="Ошибка" />
				</div>
				<div style="display:flex;gap:16px;align-items:center;">
					<span style="width:60px;font-size:12px;color:var(--color-text-muted);">Disabled</span>
					<BaseSwitch label="Disabled" is-disabled />
				</div>
			</div>
		`,
	}),
}
/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 24px; background: var(--color-bg);"><story /></div>',
		}),
	],
	render: () => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			return { value }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<BaseSwitch v-model="value" label="Тёмная тема" />
				<BaseSwitch label="Отключен" is-disabled />
				<BaseSwitch label="С ошибкой" error="Ошибка" />
			</div>
		`,
	}),
}
/** Интерактивный */
export const Interactive: Story = {
	render: args => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			return { args, value }
		},
		template: `
			<div>
				<BaseSwitch v-model="value" v-bind="args" />
				<p style="margin-top:8px;color:var(--color-text-muted);">Значение: {{ value }}</p>
			</div>
		`,
	}),
	args: {
		onChange: fn(),
	},
}
/** Слоты error, label и default — покрывает альтернативные слоты */
export const CustomSlots: Story = {
	render: () => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			return { value }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<BaseSwitch v-model="value" label="С кастомной ошибкой">
					<template #error><span style="color:red;">Кастомная ошибка</span></template>
				</BaseSwitch>
				<BaseSwitch v-model="value">
					<template #label><strong>Кастомный лейбл</strong></template>
					Кастомный контент
				</BaseSwitch>
			</div>
		`,
	}),
}
/** Switch с длинным текстом подписи */
export const LongContent: Story = {
	args: {
		modelValue: true,
		label: 'Активировать автоматическое продление подписки на сервис с ежемесячным списанием средств',
	},
	render: args => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(true)
			return { args, value }
		},
		template: '<BaseSwitch v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement, step }) => {
		await step('Фокусировка по клавише Tab', async () => {
			await playFocusTest(canvasElement, { selector: 'input[type="checkbox"]' })
		})

		await step('Обратная фокусировка по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { selector: 'input[type="checkbox"]' })
		})
	},
}
/** Кастомные CSS-классы */
export const WithCustomClass: Story = {
	args: {
		customClass: { root: 'sw-root', row: 'sw-row', wrapper: 'sw-wrapper', input: 'sw-input', slider: 'sw-slider', handle: 'sw-handle', content: 'sw-content', label: 'sw-label', required: 'sw-required', errorText: 'sw-errorText' },
	},
	render: args => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			return { args, value }
		},
		template: '<BaseSwitch v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.sw-root')).toBeTruthy()
	},
}
