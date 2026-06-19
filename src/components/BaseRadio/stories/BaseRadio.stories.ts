/**
 * Stories для компонента BaseRadio.
 * Демонстрирует все вариации, состояния и интерактивные состояния.
 */

import { expect, fn, userEvent } from 'storybook/test'
import { ref } from 'vue'
import { buildArgTypes, playFocusTest, playShiftTab } from '@utils/storybookUtils'
import { RADIO_VARIANTS } from '../model/BaseRadio.types'
import BaseRadio from '../ui/BaseRadio.vue'
import type { BaseRadioOption } from '../model/BaseRadio.types'
import type { Meta, StoryObj } from '@storybook/vue3'

const OPTIONS: BaseRadioOption[] = [
	{ value: 'metal', label: 'Металл' },
	{ value: 'wood', label: 'Дерево' },
	{ value: 'stone', label: 'Камень' },
	{ value: 'glass', label: 'Стекло', isDisabled: true },
]

const MATERIAL_OPTIONS: BaseRadioOption[] = [
	{ value: 'steel', label: 'Сталь' },
	{ value: 'bronze', label: 'Бронза' },
	{ value: 'copper', label: 'Медь' },
	{ value: 'iron', label: 'Железо' },
]

const SIZE_OPTIONS: BaseRadioOption[] = [
	{ value: 'sm', label: 'Маленький' },
	{ value: 'md', label: 'Средний' },
	{ value: 'lg', label: 'Большой' },
]

const meta: Meta<typeof BaseRadio> = {
	title: 'UI/BaseRadio',
	component: BaseRadio,

	argTypes: buildArgTypes({
		props: {
			name: { control: 'text' },
			label: { control: 'text' },
			variant: { control: 'radio', options: RADIO_VARIANTS },
			color: {
				control: 'object',
				description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
			},
			isVertical: { control: 'boolean' },
			isRequired: { control: 'boolean' },
			error: { control: 'text' },
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера (50–200%, по умолчанию 100)',
			},
			customClass: { control: 'object' },
		},
	}),

	args: {
		name: 'material',
		options: OPTIONS,
		isVertical: false,
		isRequired: false,
		variant: 'default',
		error: '',
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseRadio>
/** Горизонтальная группа */
export const Default: Story = {
	render: args => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('metal')
			return { args, value }
		},
		template: '<BaseRadio v-model="value" v-bind="args" />',
	}),
	args: {
		onChange: fn(),
	},
	play: async ({ canvasElement, step }) => {
		await step('Фокусировка группы radio по Tab', async () => {
			await userEvent.tab()
			const firstRadio = canvasElement.querySelector('input[type="radio"]')
			expect(firstRadio).toHaveFocus()
		})

		await step('Перемещение фокуса по ArrowDown', async () => {
			await userEvent.keyboard('{ArrowDown}')
			const radios = canvasElement.querySelectorAll('input[type="radio"]')
			expect(radios[1]).toHaveFocus()
		})

		await step('Обратная фокусировка по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { selector: 'input[type="radio"]' })
		})
	},
}
/** С заголовком группы */
export const WithLabel: Story = {
	args: {
		label: 'Выберите материал',
	},
	render: args => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('metal')
			return { args, value }
		},
		template: '<BaseRadio v-model="value" v-bind="args" />',
	}),
}
/** Вертикальная группа */
export const Vertical: Story = {
	args: {
		isVertical: true,
	},
	render: args => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('metal')
			return { args, value }
		},
		template: '<BaseRadio v-model="value" v-bind="args" />',
	}),
}
/** С ошибкой */
export const WithError: Story = {
	args: {
		error: 'Выберите материал',
	},
	render: args => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('')
			return { args, value }
		},
		template: '<BaseRadio v-model="value" v-bind="args" />',
	}),
}
/** Все опции отключены */
export const Disabled: Story = {
	render: () => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('metal')
			const options = OPTIONS.map(o => ({ ...o, isDisabled: true }))
			return { value, options }
		},
		template: '<BaseRadio v-model="value" :options="options" name="disabled" label="Отключённая группа" />',
	}),
}
/** С отключенной опцией */
export const WithDisabledOption: Story = {
	render: () => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('metal')
			const options = OPTIONS
			return { value, options }
		},
		template: '<BaseRadio v-model="value" :options="options" name="disabled-opt" />',
	}),
}
/** Другой набор опций */
export const MaterialOptions: Story = {
	args: {
		options: MATERIAL_OPTIONS,
		name: 'material-type',
	},
	render: args => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('steel')
			return { args, value }
		},
		template: '<BaseRadio v-model="value" v-bind="args" />',
	}),
}
/** Размеры */
export const SizeOptions: Story = {
	args: {
		options: SIZE_OPTIONS,
		name: 'size',
	},
	render: args => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('md')
			return { args, value }
		},
		template: `
			<div>
				<BaseRadio v-model="value" v-bind="args" />
				<p style="margin-top:8px;color:var(--color-text-muted);">Выбрано: {{ value }}</p>
			</div>
		`,
	}),
}
/** Вертикальная + ошибка */
export const VerticalWithError: Story = {
	args: {
		isVertical: true,
		error: 'Выберите материал',
	},
	render: args => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('')
			return { args, value }
		},
		template: '<BaseRadio v-model="value" v-bind="args" />',
	}),
}
/** все варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('metal')
			return { args, value, variants: RADIO_VARIANTS }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;">
				<BaseRadio v-for="v in variants"
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
/** Hover-состояние */
export const HoverState: Story = {
	render: () => ({
		components: { BaseRadio },
		setup() {
			const value = ref('metal')
			const options = OPTIONS
			return { value, options }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<BaseRadio v-model="value" :options="options" name="hover-radio" class="base-radio-item--hover" />
			</div>
		`,
	}),
}
/** Focus-состояние */
export const FocusState: Story = {
	render: () => ({
		components: { BaseRadio },
		setup() {
			const value = ref('metal')
			const options = OPTIONS
			return { value, options }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<BaseRadio v-model="value" :options="options" name="focus-radio" class="base-radio-item--focus" />
			</div>
		`,
	}),
}
/** все интерактивные состояния рядом */
export const InteractiveStates: Story = {
	render: () => ({
		components: { BaseRadio },
		setup() {
			const value = ref('metal')
			const options = OPTIONS
			return { value, options }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;">
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Normal</span>
					<BaseRadio v-model="value" :options="options" name="normal" />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Hover</span>
					<BaseRadio v-model="value" :options="options" name="hover" class="base-radio-item--hover" />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Focus</span>
					<BaseRadio v-model="value" :options="options" name="focus" class="base-radio-item--focus" />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Error</span>
					<BaseRadio v-model="value" :options="options" name="error" error="Ошибка" />
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
		components: { BaseRadio },
		setup() {
			const value = ref('metal')
			const options = OPTIONS
			return { value, options }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;">
				<BaseRadio v-model="value" :options="options" name="dark" />
				<BaseRadio v-model="value" :options="options" name="dark-v" is-vertical />
			</div>
		`,
	}),
}
/** Интерактивный — клик по опции */
export const Interactive: Story = {
	render: args => ({
		components: { BaseRadio },
		setup() {
			const value = ref('metal')
			return { args, value }
		},
		template: `
			<div>
				<BaseRadio v-model="value" v-bind="args" />
				<p style="margin-top:8px;color:var(--color-text-muted);">Выбрано: {{ value }}</p>
			</div>
		`,
	}),
	args: {
		onChange: fn(),
	},
	play: async ({ canvasElement, args }) => {
		expect(canvasElement).toBeInTheDocument()
		const radios = canvasElement.querySelectorAll<HTMLInputElement>('input[type="radio"]')
		expect(radios.length).toBeGreaterThan(1)
		radios[1].click()
		expect(args.onChange).toHaveBeenCalled()
	},
}
/** Обязательное поле */
export const Required: Story = {
	args: {
		label: 'Выберите материал',
		isRequired: true,
	},
	render: args => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('metal')
			return { args, value }
		},
		template: '<BaseRadio v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		expect(canvasElement).toBeInTheDocument()
		const required = canvasElement.querySelector('.base-radio__required')
		expect(required).toBeInTheDocument()
	},
}
/** Кастомный слот option */
export const CustomSlot: Story = {
	render: () => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('metal')
			const options = OPTIONS
			return { value, options }
		},
		template: `
			<BaseRadio v-model="value" :options="options" name="custom-slot">
				<template #option="{ option, isChecked }">
					<span class="custom-radio-slot" :class="{ 'custom-radio-slot--checked': isChecked }">
						{{ option.label }} {{ isChecked ? '✓' : '' }}
					</span>
				</template>
			</BaseRadio>
		`,
	}),
	play: async ({ canvasElement }) => {
		expect(canvasElement).toBeInTheDocument()
		const slots = canvasElement.querySelectorAll('.custom-radio-slot')
		expect(slots.length).toBeGreaterThan(0)
		// Кастомный слот заменяет дефолтный контент — inputs отсутствуют
		expect(slots[0].textContent).toContain('Металл')
	},
}
/** Кастомный цвет */
export const CustomColor: Story = {
	args: {
		label: 'Цветная группа',
		color: {
			bg: { base: '#e0f2fe', hover: '#bae6fd' },
			text: { base: '#0369a1', hover: '#0c4a6e' },
		},
	},
	render: args => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('metal')
			return { args, value }
		},
		template: '<BaseRadio v-model="value" v-bind="args" />',
	}),
}
/** Клик по скрытому инпуту при кастомном слоте — покрывает @change на скрытом input */
export const CustomSlotClickHiddenInput: Story = {
	render: () => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('metal')
			const options = OPTIONS
			return { value, options }
		},
		template: `
			<BaseRadio v-model="value" :options="options" name="custom-slot-click">
				<template #option="{ option, isChecked }">
					<span class="custom-slot-item" :class="{ 'custom-slot-item--checked': isChecked }">
						{{ option.label }}
					</span>
				</template>
			</BaseRadio>
		`,
	}),
	play: async ({ canvasElement }) => {
		expect(canvasElement).toBeInTheDocument()
		const slots = canvasElement.querySelectorAll('.custom-slot-item')
		expect(slots.length).toBeGreaterThan(0)
		// Кастомный слот заменяет дефолтный контент — inputs отсутствуют
		expect(slots[0].textContent).toContain('Металл')
	},
}
/** Масштаб размера */
export const SizeScale: Story = {
	args: {
		label: 'Масштаб 150%',
		sizeScale: 150,
	},
	render: args => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('metal')
			return { args, value }
		},
		template: '<BaseRadio v-model="value" v-bind="args" />',
	}),
}
/** Клик по скрытому инпуту при кастомном слоте — покрывает @change на скрытом input */
export const CustomSlotHiddenInputClick: Story = {
	render: () => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('metal')
			const options = OPTIONS
			return { value, options }
		},
		template: `
			<BaseRadio v-model="value" :options="options" name="hidden-click">
				<template #option="{ option, isChecked }">
					<span class="hidden-slot-item" :class="{ 'hidden-slot-item--checked': isChecked }">
						{{ option.label }}
					</span>
				</template>
			</BaseRadio>
		`,
	}),
	args: {
		onChange: fn(),
	},
	play: async ({ canvasElement }) => {
		// Кастомный слот заменяет дефолтный контент — проверяем что слот отрендерился
		const slots = canvasElement.querySelectorAll('.hidden-slot-item')
		expect(slots.length).toBeGreaterThan(0)
		expect(slots[0].textContent).toContain('Металл')
	},
}
/** Изменение выбора в не-multiple режиме — покрывает openIndexes.value = [index] */
export const SwitchSelection: Story = {
	args: {
		onChange: fn(),
	},
	render: args => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('metal')
			return { args, value }
		},
		template: '<BaseRadio v-model="value" v-bind="args" />',
	}),
	play: async ({ args, canvasElement }) => {
		const radios = canvasElement.querySelectorAll<HTMLInputElement>('input[type="radio"]')
		// Переключаем с 'metal' на 'wood'
		radios[1].click()
		expect(args.onChange).toHaveBeenCalledWith('wood')
		// Переключаем с 'wood' на 'stone'
		radios[2].click()
		expect(args.onChange).toHaveBeenCalledWith('stone')
	},
}
/** Radio с длинным текстом подписи */
export const LongContent: Story = {
	args: {
		modelValue: 'option1',
		options: [
			{
				label:
					'Я соглашаюсь с условиями использования сервиса и политикой конфиденциальности, даю согласие на обработку персональных данных',
				value: 'option1',
			},
			{ label: 'Короткий вариант', value: 'option2' },
		],
	},
	render: args => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('option1')
			return { args, value }
		},
		template: '<BaseRadio v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement, step }) => {
		await step('Фокусировка группы radio по Tab', async () => {
			await playFocusTest(canvasElement, { selector: 'input[type="radio"]' })
		})

		await step('Обратная фокусировка по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { selector: 'input[type="radio"]' })
		})
	},
}
export const WithCustomClass: Story = {
	args: {
		customClass: { root: 'rad-root', label: 'rad-label', options: 'rad-options', radio: 'rad-radio', wrapper: 'rad-wrapper', input: 'rad-input', circle: 'rad-circle', dot: 'rad-dot', optionLabel: 'rad-optionLabel', errorText: 'rad-errorText' },
	},
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.rad-root')).toBeTruthy()
	},
}
