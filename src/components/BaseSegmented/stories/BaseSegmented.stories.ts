/**
 * BaseSegmented — stories.
 *
 * Разделы: Default (песочница с рабочим v-model) → внешний вид (варианты, размеры, во всю ширину, с иконками) →
 * состояния (отключено, ошибка) → клавиатура.
 */

import { expect, fn } from 'storybook/test'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'
import BaseSegmented from '../ui/BaseSegmented.vue'
import { SEGMENTED_VARIANTS } from '../types/BaseSegmented.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { SegmentedOption } from '../types/BaseSegmented.types'

/** Период отчёта */
const PERIODS: SegmentedOption[] = [
	{ value: 'day', label: 'День' },
	{ value: 'week', label: 'Неделя' },
	{ value: 'month', label: 'Месяц' },
	{ value: 'year', label: 'Год', isDisabled: true },
]

/** Вид списка — с иконками */
const VIEWS: SegmentedOption[] = [
	{ value: 'list', label: 'Список', icon: 'list-bullet' },
	{ value: 'cards', label: 'Карточки', icon: 'image' },
	{ value: 'calendar', label: 'Календарь', icon: 'calendar' },
]

const meta = {
	title: 'Form/BaseSegmented',
	component: BaseSegmented,
	parameters: {
		docs: {
			description: {
				component: [
					'Переключатель сегментами: выбор одного из двух–пяти коротких вариантов, который сразу меняет вид — период отчёта, вид списка, тариф.',
					'',
					'- Нативные radio с общим `name` (APG Radio Group): один таб-стоп на группу, стрелки переключают выбор.',
					'- Группа — `role="radiogroup"` с именем из `label`, `ariaLabel` или подписи BaseFormField вокруг.',
					'- `isBlock` — во всю ширину, сегменты поровну; у сегмента может быть иконка (`icon`).',
					'',
					'Для длинных подписей и выбора в форме — BaseRadio; для переключения разделов с панелями — BaseTabs.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: SEGMENTED_VARIANTS }),
		modelValue: { control: 'inline-radio', options: PERIODS.map(option => option.value), table: propGroup(ARG_GROUP.content) },
		options: { control: 'object', table: propGroup(ARG_GROUP.content) },
		label: { control: 'text', table: propGroup(ARG_GROUP.content) },
		isBlock: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		error: { control: 'text', table: propGroup(ARG_GROUP.state) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	},
	args: {
		modelValue: 'week',
		options: PERIODS,
		label: 'Период отчёта',
		isBlock: false,
		isDisabled: false,
		variant: 'default',
		sizeScale: 100,
		onChange: fn(),
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseSegmented },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
			template: '<BaseSegmented v-bind="props" @update:model-value="onUpdate" />',
		}
	},
} satisfies Meta<typeof BaseSegmented>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: клик выбирает сегмент, недоступный не выбирается. */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('radiogroup', { name: 'Период отчёта' })).toBeVisible()
		await userEvent.click(canvas.getByText('Месяц'))
		await expect(args.onChange).toHaveBeenLastCalledWith('month')
		await expect(canvas.getByRole('radio', { name: 'Месяц' })).toBeChecked()
		await expect(canvas.getByRole('radio', { name: 'Год' })).toBeDisabled()
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Варианты: `default` — выбранный сегмент белый с тенью, `soft` — мягкий основной цвет, `outline` — рамка. */
export const Variants: Story = {
	parameters: { controls: { include: ['sizeScale', 'isBlock'] } },
	render: args => ({
		components: { BaseSegmented },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant', 'label']), variants: SEGMENTED_VARIANTS }),
		template: `
			<div class="story-stack">
				<BaseSegmented v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="variant" />
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: высота 24, 32 и 40px. */
export const Sizes: Story = {
	parameters: { controls: { include: ['variant'] } },
	render: args => ({
		components: { BaseSegmented },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['sizeScale', 'label']),
			presets: SIZE_PRESETS.filter(preset => ['xs', 'md', 'xl'].includes(preset.name)),
			sizeLabel,
		}),
		template: `
			<div class="story-stack">
				<BaseSegmented v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :label="sizeLabel(preset)" />
			</div>
		`,
	}),
}

/** Во всю ширину с иконками: сегменты делят ширину поровну. */
export const BlockWithIcons: Story = {
	args: { options: VIEWS, modelValue: 'cards', isBlock: true, label: 'Вид' },
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseSegmented },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
			template: '<div style="max-width: 420px;"><BaseSegmented v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
	play: async ({ canvasElement }) => {
		const segments = canvasElement.querySelectorAll<HTMLElement>('.base-segmented__segment')
		await expect(Math.abs(segments[0].offsetWidth - segments[2].offsetWidth)).toBeLessThanOrEqual(1)
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Отключённая группа: все сегменты недоступны. */
export const Disabled: Story = {
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		for (const radio of canvas.getAllByRole('radio')) await expect(radio).toBeDisabled()
	},
}

/** Ошибка: рамка дорожки цвета ошибки, текст описывает группу. */
export const WithError: Story = {
	args: { modelValue: null, error: 'Выберите период' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('radiogroup', { name: 'Период отчёта' })).toHaveAccessibleDescription('Выберите период')
	},
}

// ─── Клавиатура ────────────────────────────────────────────────────────────────

/** Клавиатура: Tab — на выбранный сегмент, стрелки переключают выбор (недоступный пропускается). */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const week = canvas.getByRole('radio', { name: 'Неделя' })
		await tabTo(week, userEvent)
		await userEvent.keyboard('{ArrowRight}')
		await expect(canvas.getByRole('radio', { name: 'Месяц' })).toHaveFocus()
		await expect(args.onChange).toHaveBeenLastCalledWith('month')
		await userEvent.keyboard('{ArrowRight}')
		await expect(canvas.getByRole('radio', { name: 'День' })).toHaveFocus()
	},
}
