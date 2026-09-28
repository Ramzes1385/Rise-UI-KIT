/**
 * BaseCheckboxGroup — stories.
 *
 * Разделы: Default (песочница с рабочим v-model) → внешний вид (варианты, размеры, столбиком) → состояния (отключено,
 * ошибка) → сценарии («Выбрать все», группа в BaseFormField) → клавиатура.
 */

import { ref } from 'vue'
import { expect, fn } from 'storybook/test'
import { BaseFormField } from '@components/BaseFormField'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'
import BaseCheckboxGroup from '../ui/BaseCheckboxGroup.vue'
import { CHECKBOX_GROUP_VARIANTS } from '../types/BaseCheckboxGroup.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { CheckboxGroupOption } from '../types/BaseCheckboxGroup.types'

/** Каналы уведомлений: SMS недоступны в тарифе */
const CHANNELS: CheckboxGroupOption[] = [
	{ value: 'email', label: 'Электронная почта' },
	{ value: 'push', label: 'Push-уведомления' },
	{ value: 'telegram', label: 'Telegram' },
	{ value: 'sms', label: 'SMS — в тарифе «Бизнес»', isDisabled: true },
]

const meta = {
	title: 'Form/BaseCheckboxGroup',
	component: BaseCheckboxGroup,
	parameters: {
		docs: {
			description: {
				component: [
					'Группа флажков — выбор нескольких вариантов из видимого списка: каналы уведомлений, фильтры, права доступа.',
					'',
					'- `v-model` — массив отмеченных значений в порядке вариантов; `options` — `value`, `label`, `isDisabled`.',
					'- Группа — `role="group"` с именем из `label` (или подписи BaseFormField вокруг); ошибка описывает группу.',
					'- `hasSelectAll` — флажок «Выбрать все»: при части отмеченных он с чертой (indeterminate), клик отмечает все доступные.',
					'- Флажки — BaseCheckbox: Tab переходит по ним, пробел отмечает. `variant` получает каждый флажок.',
					'',
					'Для одного флага — `BaseCheckbox` или `BaseSwitch`; для выбора одного варианта — `BaseRadio`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: CHECKBOX_GROUP_VARIANTS }),
		modelValue: { control: 'object', table: propGroup(ARG_GROUP.content) },
		options: { control: 'object', table: propGroup(ARG_GROUP.content) },
		label: { control: 'text', table: propGroup(ARG_GROUP.content) },
		selectAllLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
		isVertical: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		hasSelectAll: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		error: { control: 'text', table: propGroup(ARG_GROUP.state) },
		isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	},
	args: {
		modelValue: ['email'],
		options: CHANNELS,
		label: 'Каналы уведомлений',
		isVertical: false,
		hasSelectAll: false,
		isRequired: false,
		isDisabled: false,
		variant: 'default',
		sizeScale: 100,
		onChange: fn(),
	},
	// v-model хранится в args: клик по флажку обновляет Controls, изменение в Controls — группу
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseCheckboxGroup },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
			template: '<BaseCheckboxGroup v-bind="props" @update:model-value="onUpdate" />',
		}
	},
} satisfies Meta<typeof BaseCheckboxGroup>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: отмеченные значения попадают в `modelValue` (видно в Controls). */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('group', { name: 'Каналы уведомлений' })).toBeVisible()
		await userEvent.click(canvas.getByRole('checkbox', { name: 'Telegram' }))
		await expect(canvas.getByRole('checkbox', { name: 'Telegram' })).toBeChecked()
		await expect(args.onChange).toHaveBeenLastCalledWith(['email', 'telegram'])
		await expect(canvas.getByRole('checkbox', { name: /SMS/ })).toBeDisabled()
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Варианты флажков: `default`, `ghost`, `outline`, `shadow`, `soft` — как у BaseCheckbox. */
export const Variants: Story = {
	parameters: { controls: { include: ['sizeScale', 'isVertical'] } },
	render: args => ({
		components: { BaseCheckboxGroup },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant', 'label']), variants: CHECKBOX_GROUP_VARIANTS }),
		template: `
			<div class="story-stack">
				<BaseCheckboxGroup v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="variant" />
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: подпись, флажки и зазоры масштабируются вместе. */
export const Sizes: Story = {
	parameters: { controls: { include: ['variant'] } },
	render: args => ({
		components: { BaseCheckboxGroup },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['sizeScale', 'label']),
			presets: SIZE_PRESETS.filter(preset => ['xs', 'md', 'xl'].includes(preset.name)),
			sizeLabel,
		}),
		template: `
			<div class="story-stack">
				<BaseCheckboxGroup v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :label="sizeLabel(preset)" />
			</div>
		`,
	}),
}

/** Столбиком (`isVertical`): для длинных подписей и списков из пяти и больше вариантов. */
export const Vertical: Story = {
	args: { isVertical: true, hasSelectAll: true },
	play: async ({ canvasElement }) => {
		const options = canvasElement.querySelector('.base-checkbox-group__options') as HTMLElement
		await expect(getComputedStyle(options).flexDirection).toBe('column')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Отключённая группа: все флажки недоступны, отмеченные остаются видны. */
export const Disabled: Story = {
	args: { isDisabled: true, modelValue: ['email', 'push'] },
	play: async ({ canvas }) => {
		for (const checkbox of canvas.getAllByRole('checkbox')) await expect(checkbox).toBeDisabled()
		await expect(canvas.getByRole('checkbox', { name: 'Push-уведомления' })).toBeChecked()
	},
}

/** Ошибка: текст под флажками описывает группу (`aria-describedby`). */
export const WithError: Story = {
	args: { modelValue: [], isRequired: true, error: 'Выберите хотя бы один канал' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('group', { name: 'Каналы уведомлений' })).toHaveAccessibleDescription('Выберите хотя бы один канал')
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * «Выбрать все» (`hasSelectAll`): при части отмеченных вариантов флажок с чертой (indeterminate), клик отмечает все
 * доступные варианты, повторный — снимает. Недоступные варианты он не трогает.
 */
export const SelectAll: Story = {
	args: { hasSelectAll: true, isVertical: true },
	play: async ({ canvas, userEvent, args }) => {
		const selectAll = canvas.getByRole('checkbox', { name: 'Выбрать все' })
		await expect(selectAll).toBePartiallyChecked()
		await userEvent.click(selectAll)
		await expect(args.onChange).toHaveBeenLastCalledWith(['email', 'push', 'telegram'])
		await expect(selectAll).toBeChecked()
		await userEvent.click(selectAll)
		await expect(args.onChange).toHaveBeenLastCalledWith([])
		await expect(selectAll).not.toBeChecked()
	},
}

/** Группа в BaseFormField: подпись обёртки — имя группы, описание и ошибка обёртки описывают группу. */
export const InFormField: Story = {
	parameters: { controls: { include: ['variant', 'sizeScale', 'isVertical'] } },
	render: args => ({
		components: { BaseCheckboxGroup, BaseFormField },
		setup: () => ({ props: useArgsWithoutSlots(args, ['label', 'modelValue']), selected: ref<(string | number)[]>(['push']) }),
		template: `
			<BaseFormField label="Куда присылать отчёты" description="Отчёт приходит каждый понедельник">
				<BaseCheckboxGroup v-bind="props" v-model="selected" />
			</BaseFormField>
		`,
	}),
	play: async ({ canvas }) => {
		const group = canvas.getByRole('group', { name: 'Куда присылать отчёты' })
		await expect(group).toHaveAccessibleDescription('Отчёт приходит каждый понедельник')
		await expect(canvas.getByRole('checkbox', { name: 'Push-уведомления' })).toBeChecked()
	},
}

// ─── Клавиатура ────────────────────────────────────────────────────────────────

/** Клавиатура: Tab переходит по флажкам (недоступный пропускается), пробел отмечает. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	args: { modelValue: [] },
	play: async ({ canvas, userEvent, args }) => {
		const email = canvas.getByRole('checkbox', { name: 'Электронная почта' })
		await tabTo(email, userEvent)
		await userEvent.keyboard(' ')
		await expect(args.onChange).toHaveBeenLastCalledWith(['email'])
		await userEvent.tab()
		await expect(canvas.getByRole('checkbox', { name: 'Push-уведомления' })).toHaveFocus()
	},
}
