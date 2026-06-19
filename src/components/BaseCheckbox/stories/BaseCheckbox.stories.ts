/**
 * Stories для компонента BaseCheckbox.
 * Демонстрирует все состояния, интерактивные состояния и тёмную тему.
 */

import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'
import { UI_TEXT } from '@constants'
import { buildArgTypes, playFocusTest, playShiftTab } from '@utils/storybookUtils'
import { CHECKBOX_VARIANTS } from '../model/BaseCheckbox.types'
import BaseCheckbox from '../ui/BaseCheckbox.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<typeof BaseCheckbox> = {
	title: 'UI/BaseCheckbox',
	component: BaseCheckbox,

	argTypes: buildArgTypes({
		props: {
			label: { control: 'text' },
			variant: { control: 'radio', options: CHECKBOX_VARIANTS },
			color: { control: 'object', description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }' },
			isDisabled: { control: 'boolean' },
			error: { control: 'text' },
			sizeScale: { control: { type: 'range', min: 50, max: 200, step: 10 }, description: 'Масштаб размера (50–200%, по умолчанию 100)' },
			modelValue: { control: 'boolean' },
			customClass: { control: 'object' },
			'onUpdate:modelValue': { table: { disable: true } },
			onChange: { table: { disable: true } },
		},
	}),

	args: {
		label: 'Согласен с условиями',
		variant: 'default',
		isDisabled: false,
		error: '',
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseCheckbox>
/** Базовый чекбокс */
export const Default: Story = {
	render: args => ({
		components: { BaseCheckbox },
		setup() {
			const value = ref(false)
			return { args, value }
		},
		template: '<BaseCheckbox v-model="value" v-bind="args" />',
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
/** Выбранный */
export const Checked: Story = {
	render: args => ({
		components: { BaseCheckbox },
		setup() {
			const value = ref(true)
			return { args, value }
		},
		template: '<BaseCheckbox v-model="value" v-bind="args" />',
	}),
	args: {
		onChange: fn(),
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement)
		const label = canvas.getByText('Согласен с условиями')
		await userEvent.click(label)
		await waitFor(() => {
			expect(args.onChange).toHaveBeenCalledWith(false)
		})
	},
}
/** Отключенный */
export const Disabled: Story = {
	args: {
		isDisabled: true,
	},
	render: args => ({
		components: { BaseCheckbox },
		setup() {
			const value = ref(false)
			return { args, value }
		},
		template: '<BaseCheckbox v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector('input[type="checkbox"]') as HTMLInputElement
		expect(input).toBeDisabled()
	},
}
/** Отключенный выбранный */
export const DisabledChecked: Story = {
	render: () => ({
		components: { BaseCheckbox },
		setup() {
			const value = ref(true)
			return { value }
		},
		template: '<BaseCheckbox v-model="value" label="Отключённый выбранный" is-disabled />',
	}),
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector('input[type="checkbox"]') as HTMLInputElement
		expect(input).toBeDisabled()
		expect(input).toBeChecked()
	},
}
/** С ошибкой */
export const WithError: Story = {
	args: {
		error: UI_TEXT.REQUIRED_FIELD,
	},
	render: args => ({
		components: { BaseCheckbox },
		setup() {
			const value = ref(false)
			return { args, value }
		},
		template: '<BaseCheckbox v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText(UI_TEXT.REQUIRED_FIELD)).toBeInTheDocument()
	},
}
/** Без подписи */
export const WithoutLabel: Story = {
	parameters: {
		a11y: {
			config: {
				rules: [
					// Отключаем правило label для этой истории, так как компонент намеренно рендерится без подписи.
					// В реальном приложении для таких случаев необходимо передавать aria-label.
					{ id: 'label', enabled: false },
				],
			},
		},
	},
	render: () => ({
		components: { BaseCheckbox },
		setup() {
			const value = ref(false)
			return { value }
		},
		template: '<BaseCheckbox v-model="value" />',
	}),
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector('input[type="checkbox"]') as HTMLInputElement
		await userEvent.click(input)
		await waitFor(() => {
			expect(input).toBeChecked()
		})
	},
}
/** Несколько чекбоксов */
export const Group: Story = {
	render: () => ({
		components: { BaseCheckbox },
		setup() {
			const opt1 = ref(true)
			const opt2 = ref(false)
			const opt3 = ref(true)
			return { opt1, opt2, opt3 }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<BaseCheckbox v-model="opt1" label="Металл" />
				<BaseCheckbox v-model="opt2" label="Дерево" />
				<BaseCheckbox v-model="opt3" label="Камень" />
			</div>
		`,
	}),
}
/** Варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseCheckbox },
		setup() {
			const value = ref(false)
			return { args, value }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<BaseCheckbox v-for="v in ['default','ghost','outline','shadow','soft']"
					:key="v"
					v-model="value"
					v-bind="args"
					:variant="v"
					:label="'Variant: ' + v"
				/>
			</div>
		`,
	}),
}
/** все интерактивные состояния рядом */
export const InteractiveStates: Story = {
	render: () => ({
		components: { BaseCheckbox },
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<div style="display:flex;gap:16px;align-items:center;">
					<span style="width:60px;font-size:12px;color:var(--color-text-muted);">Normal</span>
					<BaseCheckbox label="Default" />
				</div>
				<div style="display:flex;gap:16px;align-items:center;">
					<span style="width:60px;font-size:12px;color:var(--color-text-muted);">Hover</span>
					<BaseCheckbox label="Hover" class="base-checkbox--hover" />
				</div>
				<div style="display:flex;gap:16px;align-items:center;">
					<span style="width:60px;font-size:12px;color:var(--color-text-muted);">Focus</span>
					<BaseCheckbox label="Focus" class="base-checkbox--focus" />
				</div>
				<div style="display:flex;gap:16px;align-items:center;">
					<span style="width:60px;font-size:12px;color:var(--color-text-muted);">Checked</span>
					<BaseCheckbox label="Checked" :model-value="true" />
				</div>
				<div style="display:flex;gap:16px;align-items:center;">
					<span style="width:60px;font-size:12px;color:var(--color-text-muted);">Error</span>
					<BaseCheckbox label="Error" error="Ошибка" />
				</div>
				<div style="display:flex;gap:16px;align-items:center;">
					<span style="width:60px;font-size:12px;color:var(--color-text-muted);">Disabled</span>
					<BaseCheckbox label="Disabled" is-disabled />
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
		components: { BaseCheckbox },
		setup() {
			const value = ref(false)
			return { value }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<BaseCheckbox v-model="value" label="Тёмная тема" />
				<BaseCheckbox label="Отключен" is-disabled />
				<BaseCheckbox label="С ошибкой" error="Ошибка" />
			</div>
		`,
	}),
}
/** Интерактивный */
export const Interactive: Story = {
	render: args => ({
		components: { BaseCheckbox },
		setup() {
			const value = ref(false)
			return { args, value }
		},
		template: `
			<div>
				<BaseCheckbox v-model="value" v-bind="args" />
				<p style="margin-top:8px;color:var(--color-text-muted);">Значение: {{ value }}</p>
			</div>
		`,
	}),
	args: {
		onChange: fn(),
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement)
		const label = canvas.getByText('Согласен с условиями')
		await userEvent.click(label)
		await waitFor(() => {
			expect(args.onChange).toHaveBeenCalledWith(true)
		})
	},
}
/** Слот error — покрывает альтернативные слоты */
export const CustomSlots: Story = {
	render: () => ({
		components: { BaseCheckbox },
		setup() {
			const value = ref(false)
			return { value }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<BaseCheckbox v-model="value" label="С кастомной ошибкой" error="Ошибка">
					<template #error><span style="color:red;">Кастомная ошибка</span></template>
				</BaseCheckbox>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Кастомная ошибка')).toBeInTheDocument()

		// Кликнем по чекбоксу, чтобы вызвать handleChange и покрыть его
		const checkbox = canvasElement.querySelector('input[type="checkbox"]') as HTMLInputElement
		if (checkbox) {
			await userEvent.click(checkbox)
			await waitFor(() => {
				expect(checkbox.checked).toBe(true)
			})
		}
	},
}
/** Масштаб размера */
export const SizeScale: Story = {
	args: {
		label: 'Масштаб 150%',
		sizeScale: 150,
	},
	render: args => ({
		components: { BaseCheckbox },
		setup() {
			const value = ref(false)
			return { args, value }
		},
		template: '<BaseCheckbox v-model="value" v-bind="args" />',
	}),
}
/** customClass — покрывает elementKeys */
export const WithCustomClass: Story = {
	args: {
		label: 'С кастомными классами',
		customClass: {
			root: 'chk-root',
			labelWrapper: 'chk-labelWrapper',
			wrapper: 'chk-wrapper',
			input: 'chk-input',
			box: 'chk-box',
			icon: 'chk-icon',
			label: 'chk-label',
			errorText: 'chk-errorText',
		},
	},
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.chk-root')).toBeTruthy()
	},
}
/** Чекбокс с длинным текстом подписи */
export const LongContent: Story = {
	args: {
		modelValue: true,
		label:
			'Я соглашаюсь с условиями использования сервиса, политикой конфиденциальности и даю согласие на обработку персональных данных в соответствии с законодательством РФ',
	},
	render: args => ({
		components: { BaseCheckbox },
		setup() {
			const value = ref(true)
			return { args, value }
		},
		template: '<BaseCheckbox v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		await playFocusTest(canvasElement, { selector: 'input[type="checkbox"]' })
		await playShiftTab(canvasElement, { selector: 'input[type="checkbox"]' })
	},
}
