/**
 * BaseTimePicker — stories.
 *
 * Разделы: Default (песочница с рабочим v-model) → внешний вид (варианты) → состояния (отключено, ошибка) →
 * сценарии (рабочие часы и шаг, ввод без двоеточия) → клавиатура.
 */

import { expect, fn, waitFor } from 'storybook/test'
import { ARG_GROUP, baseArgTypes, propGroup, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'
import { TIME_PICKER_VARIANTS } from '../model/BaseTimePicker.types'
import BaseTimePicker from '../ui/BaseTimePicker.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta = {
	title: 'Form/BaseTimePicker',
	component: BaseTimePicker,
	parameters: {
		docs: {
			description: {
				component: [
					'Поле времени: список времени с шагом `step` (по умолчанию 30 минут) и свободный ввод.',
					'',
					'- Построено на BaseAutocomplete (APG Combobox): ↓/↑ по списку, Enter выбирает, ввод фильтрует список по началу времени.',
					'- Набранное «930», «9:30», «9.30» при выходе из поля или Enter становится 09:30; время вне `minTime`–`maxTime` и не время не принимаются.',
					'- Значение — строка `HH:MM` или `null`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: TIME_PICKER_VARIANTS }),
		modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
		label: { control: 'text', table: propGroup(ARG_GROUP.content) },
		step: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
		minTime: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
		maxTime: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
		error: { control: 'text', table: propGroup(ARG_GROUP.state) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	},
	args: {
		modelValue: null,
		label: 'Время звонка',
		step: 30,
		minTime: '09:00',
		maxTime: '18:00',
		isDisabled: false,
		isRequired: false,
		variant: 'default',
		sizeScale: 100,
		onChange: fn(),
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseTimePicker },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
			template: '<div class="story-narrow" style="max-width: 220px;"><BaseTimePicker v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
} satisfies Meta<typeof BaseTimePicker>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: список с 09:00 до 18:00 через 30 минут, клик выбирает. */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('combobox', { name: 'Время звонка' })
		await userEvent.click(field)
		await waitFor(() => expect(document.querySelectorAll('[role="option"]')).toHaveLength(19))
		await userEvent.click(document.querySelectorAll<HTMLElement>('[role="option"]')[2])
		await expect(args.onChange).toHaveBeenLastCalledWith('10:00')
		await expect(field).toHaveValue('10:00')
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Варианты поля — как у BaseInput. */
export const Variants: Story = {
	parameters: { controls: { include: ['sizeScale'] } },
	render: args => ({
		components: { BaseTimePicker },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant', 'label', 'modelValue']), variants: TIME_PICKER_VARIANTS }),
		template: `
			<div class="story-grid" style="--story-grid-min: 160px;">
				<BaseTimePicker v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="variant" model-value="14:30" />
			</div>
		`,
	}),
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Отключённое поле. */
export const Disabled: Story = {
	args: { isDisabled: true, modelValue: '12:00' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('combobox', { name: 'Время звонка' })).toBeDisabled()
	},
}

/** Ошибка: текст под полем описывает его. */
export const WithError: Story = {
	args: { isRequired: true, error: 'Выберите время звонка' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('combobox', { name: 'Время звонка' })).toHaveAccessibleDescription('Выберите время звонка')
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Ввод без двоеточия: «1415» при выходе из поля становится 14:15 — даже если такого времени нет в списке с шагом
 * 30 минут. Время вне рабочих часов («2130») не принимается: в поле возвращается прежнее значение.
 */
export const TypedTime: Story = {
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('combobox', { name: 'Время звонка' })
		await userEvent.type(field, '1415')
		await userEvent.tab()
		await expect(args.onChange).toHaveBeenLastCalledWith('14:15')
		await userEvent.clear(field)
		await userEvent.type(field, '2130')
		await userEvent.tab()
		await expect(field).toHaveValue('14:15')
	},
}

// ─── Клавиатура ────────────────────────────────────────────────────────────────

/** Клавиатура: цифры фильтруют список по началу времени, ↓ ведёт по нему, Enter выбирает. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('combobox', { name: 'Время звонка' })
		await tabTo(field, userEvent)
		await userEvent.keyboard('16')
		await waitFor(() => expect(document.querySelectorAll('[role="option"]')).toHaveLength(2))
		await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
		await expect(args.onChange).toHaveBeenLastCalledWith('16:30')
	},
}
