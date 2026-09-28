/**
 * BaseInputNumber — stories.
 *
 * Разделы: Default (песочница с рабочим v-model) → внешний вид (варианты, размеры) → состояния (отключено, ошибка,
 * только чтение) → сценарии (дробный шаг, значение для скринридера) → клавиатура.
 */

import { expect, fn } from 'storybook/test'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'
import BaseInputNumber from '../ui/BaseInputNumber.vue'
import { INPUT_NUMBER_VARIANTS } from '../types/BaseInputNumber.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta = {
	title: 'Form/BaseInputNumber',
	component: BaseInputNumber,
	parameters: {
		docs: {
			description: {
				component: [
					'Поле числа: количество, возраст, сумма с шагом. Кнопки −/+ по краям, ввод с клавиатуры, границы `min`/`max`.',
					'',
					'- По образцу APG Spinbutton: поле — `role="spinbutton"` с `aria-valuenow`/`min`/`max`; ↑/↓ — шаг, PageUp/PageDown — десять шагов, Home/End — границы.',
					'- Кнопки −/+ вне порядка Tab (с клавиатуры шагают стрелки) и отключаются на границе.',
					'- Ввод принимает `1,5` и `1.5`; число вне границ поднимается или опускается до границы при выходе из поля, нечисло возвращает прежнее значение.',
					'- `precision` — знаков после запятой (по умолчанию — как у шага); `formatValueText` — текст значения для скринридера.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: INPUT_NUMBER_VARIANTS }),
		modelValue: { control: 'number', table: propGroup(ARG_GROUP.content) },
		label: { control: 'text', table: propGroup(ARG_GROUP.content) },
		placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
		min: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
		max: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
		step: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
		precision: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
		hasControls: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		error: { control: 'text', table: propGroup(ARG_GROUP.state) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isReadonly: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	},
	args: {
		modelValue: 2,
		label: 'Гостей',
		min: 1,
		max: 10,
		step: 1,
		hasControls: true,
		isDisabled: false,
		isReadonly: false,
		isRequired: false,
		variant: 'default',
		sizeScale: 100,
		onChange: fn(),
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseInputNumber },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
			template:
				'<div class="story-narrow" style="max-width: 200px;"><BaseInputNumber v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
} satisfies Meta<typeof BaseInputNumber>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: кнопки −/+ меняют значение на шаг, на границе кнопка отключается. */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('spinbutton', { name: 'Гостей' })
		await expect(field).toHaveAttribute('aria-valuenow', '2')
		await userEvent.click(canvas.getByRole('button', { name: 'Увеличить' }))
		await expect(args.onChange).toHaveBeenLastCalledWith(3)
		await userEvent.click(canvas.getByRole('button', { name: 'Уменьшить' }))
		await userEvent.click(canvas.getByRole('button', { name: 'Уменьшить' }))
		await expect(args.onChange).toHaveBeenLastCalledWith(1)
		await expect(canvas.getByRole('button', { name: 'Уменьшить' })).toBeDisabled()
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Варианты — как у BaseInput. */
export const Variants: Story = {
	parameters: { controls: { include: ['sizeScale', 'hasControls'] } },
	render: args => ({
		components: { BaseInputNumber },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant', 'label', 'modelValue']), variants: INPUT_NUMBER_VARIANTS }),
		template: `
			<div class="story-grid" style="--story-grid-min: 160px;">
				<BaseInputNumber v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="variant" :model-value="4" />
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: высота поля и кнопок 24, 32 и 40px. */
export const Sizes: Story = {
	parameters: { controls: { include: ['variant'] } },
	render: args => ({
		components: { BaseInputNumber },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['sizeScale', 'label']),
			presets: SIZE_PRESETS.filter(preset => ['xs', 'md', 'xl'].includes(preset.name)),
			sizeLabel,
		}),
		template: `
			<div class="story-row">
				<BaseInputNumber v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :label="sizeLabel(preset)" />
			</div>
		`,
	}),
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Отключённое поле: кнопки и ввод недоступны. */
export const Disabled: Story = {
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('spinbutton', { name: 'Гостей' })).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Увеличить' })).toBeDisabled()
	},
}

/** Ошибка: текст под полем описывает его, поле помечено `aria-invalid`. */
export const WithError: Story = {
	args: { modelValue: null, isRequired: true, error: 'Укажите число гостей' },
	play: async ({ canvas }) => {
		const field = canvas.getByRole('spinbutton', { name: 'Гостей' })
		await expect(field).toHaveAttribute('aria-invalid', 'true')
		await expect(field).toHaveAccessibleDescription('Укажите число гостей')
	},
}

/** Только чтение: значение видно, кнопок нет, стрелки не меняют число. */
export const Readonly: Story = {
	args: { isReadonly: true, modelValue: 4 },
	play: async ({ canvas }) => {
		await expect(canvas.queryByRole('button', { name: 'Увеличить' })).toBeNull()
		await expect(canvas.getByRole('spinbutton', { name: 'Гостей' })).toHaveAttribute('readonly')
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Дробный шаг и текст для скринридера: `step` 0,5, два знака после запятой (`precision`), `formatValueText` —
 * «2,5 кг». Ввод «1.25» и «1,25» одинаковы; при выходе из поля число округляется до двух знаков и ограничивается.
 */
export const DecimalStep: Story = {
	args: {
		label: 'Вес посылки, кг',
		modelValue: 2.5,
		min: 0.5,
		max: 30,
		step: 0.5,
		precision: 2,
		formatValueText: (value: number) => `${String(value).replace('.', ',')} кг`,
	},
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('spinbutton', { name: 'Вес посылки, кг' })
		await expect(field).toHaveValue('2,50')
		await expect(field).toHaveAttribute('aria-valuetext', '2,5 кг')
		await userEvent.clear(field)
		await userEvent.type(field, '1.25')
		await userEvent.tab()
		await expect(args.onChange).toHaveBeenLastCalledWith(1.25)
		await expect(field).toHaveValue('1,25')
	},
}

// ─── Клавиатура ────────────────────────────────────────────────────────────────

/** Клавиатура: ↑/↓ — шаг, PageUp/PageDown — десять шагов (с границей), Home/End — min и max. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	args: { max: 50 },
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('spinbutton', { name: 'Гостей' })
		await tabTo(field, userEvent)
		await userEvent.keyboard('{ArrowUp}')
		await expect(args.onChange).toHaveBeenLastCalledWith(3)
		await userEvent.keyboard('{PageUp}')
		await expect(args.onChange).toHaveBeenLastCalledWith(13)
		await userEvent.keyboard('{End}')
		await expect(args.onChange).toHaveBeenLastCalledWith(50)
		await userEvent.keyboard('{Home}')
		await expect(args.onChange).toHaveBeenLastCalledWith(1)
		await expect(field).toHaveValue('1')
	},
}
