/**
 * BaseRadio — stories.
 *
 * Разделы: Default (песочница с рабочим v-model) → внешний вид (варианты, размеры, цвет, вертикальная группа) →
 * состояния (disabled, ошибка, длинные подписи) → сценарии (слот option) → клавиатура.
 */

import { expect, fn, within } from 'storybook/test'
import { ref } from 'vue'
import {
	ARG_GROUP,
	baseArgTypes,
	hiddenArgTypes,
	propGroup,
	SIZE_PRESETS,
	sizeLabel,
	tabTo,
	useArgsWithoutSlots,
	useModelArg,
} from '@/stories/helpers'
import { RADIO_VARIANTS } from '../model/BaseRadio.types'
import BaseRadio from '../ui/BaseRadio.vue'
import type { BaseRadioOption } from '../model/BaseRadio.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const DELIVERY_OPTIONS: BaseRadioOption[] = [
	{ value: 'courier', label: 'Курьером' },
	{ value: 'pickup', label: 'Самовывоз' },
	{ value: 'post', label: 'Почтой России' },
]

/** Подробности опций для примера со слотом option */
const DELIVERY_DETAILS: Record<string, string> = {
	courier: 'Завтра с 10:00 до 22:00 · 290 ₽',
	pickup: 'Пункт выдачи на Тверской, 12 · бесплатно',
	post: '5–7 дней · 190 ₽',
}

const meta = {
	title: 'Form/BaseRadio',
	component: BaseRadio,
	parameters: {
		docs: {
			description: {
				component: [
					'Группа радиокнопок — выбор одного варианта из нескольких видимых: способ доставки, тариф, формат файла.',
					'',
					'- Группа объявлена `role="radiogroup"`, её имя — заголовок `label`; ошибка (`error`) описывает группу и помечает её `aria-invalid`.',
					'- Нативные radio с общим `name`: один таб-стоп на группу, стрелки переключают выбор. `name` должен быть уникальным на странице.',
					'- Слот `option` заменяет только подпись опции — круг, выбор и клавиатура остаются.',
					'- `bordered` — опции-кнопки высотой 32px для короткого выбора («S / M / L»).',
					'',
					'Для одного флага «да/нет» используйте `BaseCheckbox` или `BaseSwitch`; для длинного списка — `BaseSelect`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: RADIO_VARIANTS }),
		modelValue: { control: 'inline-radio', options: DELIVERY_OPTIONS.map(option => option.value), table: propGroup(ARG_GROUP.content) },
		options: { control: 'object', table: propGroup(ARG_GROUP.content) },
		label: { control: 'text', table: propGroup(ARG_GROUP.content) },
		isVertical: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		name: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
		error: { control: 'text', table: propGroup(ARG_GROUP.state) },
		isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		option: { control: false },
		// Слот default объявлен в типах, но компонент его не выводит.
		...hiddenArgTypes('default'),
	},
	args: {
		modelValue: 'courier',
		options: DELIVERY_OPTIONS,
		name: 'delivery',
		label: 'Способ доставки',
		variant: 'default',
		sizeScale: 100,
		isVertical: false,
		isRequired: false,
		error: '',
		'onUpdate:modelValue': fn(),
		onChange: fn(),
	},
	// Значение хранится в args: выбор обновляет Controls, а изменение в Controls — группу.
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseRadio },
			setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
			template: '<BaseRadio v-bind="props" @update:model-value="onUpdate" />',
		}
	},
} satisfies Meta<typeof BaseRadio>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: выберите опцию или меняйте props в Controls — значение синхронизировано. */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('radiogroup')).toHaveAccessibleName('Способ доставки')
		await userEvent.click(canvas.getByText('Самовывоз'))
		await expect(canvas.getByRole('radio', { name: 'Самовывоз' })).toBeChecked()
		await expect(args.onChange).toHaveBeenCalledWith('pickup')
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Пять вариантов. `default` — основной; `outline` — прозрачный круг, для цветного фона; `ghost` — без рамки;
 * `shadow` — с тенью; `bordered` — опции-кнопки без круга.
 */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'isVertical', 'error'] },
		docs: {
			source: {
				code: RADIO_VARIANTS.map(
					variant => `<BaseRadio v-model="value" :options="options" name="${variant}" variant="${variant}" label="${variant}" />`,
				).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseRadio },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'name', 'label', 'variant', 'onUpdate:modelValue']),
			variants: RADIO_VARIANTS,
			values: ref<Record<string, string | number>>(Object.fromEntries(RADIO_VARIANTS.map(variant => [variant, 'pickup']))),
		}),
		template: `
			<div class="story-stack">
				<BaseRadio
					v-for="variant in variants"
					:key="variant"
					v-bind="props"
					v-model="values[variant]"
					:name="'delivery-' + variant"
					:variant="variant"
					:label="variant" />
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: круг 12, 14, 16, 18 и 20px, подписи масштабируются вместе с ним. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['variant', 'isVertical'] },
		docs: {
			source: {
				code: SIZE_PRESETS.map(
					p => `<BaseRadio v-model="value" :options="options" name="size-${p.name}" :size-scale="${p.sizeScale}" />`,
				).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseRadio },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'name', 'label', 'sizeScale', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref<Record<string, string | number>>(Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, 'courier']))),
		}),
		template: `
			<div class="story-stack">
				<BaseRadio
					v-for="preset in presets"
					:key="preset.name"
					v-bind="props"
					v-model="values[preset.name]"
					:name="'size-' + preset.name"
					:size-scale="preset.sizeScale"
					:label="sizeLabel(preset)" />
			</div>
		`,
	}),
}

/** Кастомный цвет через `color`: `bg` — заливка выбранного круга, `text` — цвет точки. */
export const CustomColor: Story = {
	args: {
		label: 'Тариф',
		name: 'plan',
		modelValue: 'pro',
		options: [
			{ value: 'basic', label: 'Базовый' },
			{ value: 'pro', label: 'Профессиональный' },
			{ value: 'team', label: 'Командный' },
		],
		color: { bg: { base: '#0f766e', hover: '#115e59' }, text: { base: '#ffffff' } },
	},
	argTypes: { modelValue: { control: 'inline-radio', options: ['basic', 'pro', 'team'] } },
	play: async ({ canvas }) => {
		const circle = canvas.getByRole('radio', { name: 'Профессиональный' }).nextElementSibling as HTMLElement
		await expect(getComputedStyle(circle).backgroundColor).toBe('rgb(15, 118, 110)')
	},
}

/** Вертикальная группа `isVertical` — для длинных подписей и больше чем 3–4 опций. */
export const Vertical: Story = {
	args: { isVertical: true, name: 'delivery-vertical' },
	play: async ({ canvas }) => {
		const [first, second] = canvas.getAllByRole('radio')
		await expect(second.getBoundingClientRect().top).toBeGreaterThan(first.getBoundingClientRect().top)
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/**
 * Отключённые опции: `isDisabled` у отдельной опции или у всех опций сразу (у группы своего `isDisabled` нет).
 * Отключённая опция приглушена, не выбирается и пропускается стрелками.
 */
export const Disabled: Story = {
	parameters: { controls: { include: ['variant', 'sizeScale', 'isVertical'] } },
	render: args => ({
		components: { BaseRadio },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'name', 'label', 'options', 'onUpdate:modelValue']),
			someDisabled: DELIVERY_OPTIONS.map(option => ({ ...option, isDisabled: option.value === 'post' })),
			allDisabled: DELIVERY_OPTIONS.map(option => ({ ...option, isDisabled: true })),
			partial: ref<string | number>('courier'),
			all: ref<string | number>('pickup'),
		}),
		template: `
			<div class="story-stack">
				<BaseRadio v-bind="props" v-model="partial" :options="someDisabled" name="delivery-partial" label="Почта временно недоступна" />
				<BaseRadio v-bind="props" v-model="all" :options="allDisabled" name="delivery-all" label="Доставка выбрана менеджером" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const [partialGroup, allGroup] = canvas.getAllByRole('radiogroup')
		await expect(within(partialGroup).getByRole('radio', { name: 'Почтой России' })).toBeDisabled()
		await expect(within(partialGroup).getByRole('radio', { name: 'Курьером' })).toBeEnabled()
		for (const radio of within(allGroup).getAllByRole('radio')) {
			await expect(radio).toBeDisabled()
		}
	},
}

/** Ошибка: круги с красной рамкой и текст под группой; группа помечена `aria-invalid` и описана текстом ошибки. */
export const WithError: Story = {
	args: { modelValue: '', name: 'delivery-error', isRequired: true, error: 'Выберите способ доставки' },
	play: async ({ canvas }) => {
		const group = canvas.getByRole('radiogroup', { name: /Способ доставки/ })
		await expect(group).toHaveAttribute('aria-invalid', 'true')
		await expect(group).toHaveAttribute('aria-required', 'true')
		await expect(group).toHaveAccessibleDescription('Выберите способ доставки')
	},
}

/** Длинные подписи переносятся по словам, круг остаётся у первой строки (ширина контейнера 360px). */
export const LongContent: Story = {
	args: {
		label: 'Что сделать, если товара не окажется в наличии',
		name: 'out-of-stock',
		modelValue: 'replace',
		isVertical: true,
		options: [
			{ value: 'replace', label: 'Заменить на аналогичный товар того же бренда с похожими характеристиками и ценой' },
			{ value: 'call', label: 'Позвонить мне и согласовать замену до сборки заказа' },
			{ value: 'remove', label: 'Убрать товар из заказа и вернуть деньги на карту' },
		],
	},
	argTypes: { modelValue: { control: 'inline-radio', options: ['replace', 'call', 'remove'] } },
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseRadio },
			setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
			template: '<div class="story-narrow"><BaseRadio v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
	play: async ({ canvas }) => {
		const radio = canvas.getByRole('radio', { name: /Заменить на аналогичный/ })
		const label = canvas.getByText(/Заменить на аналогичный/)
		await expect(label.getBoundingClientRect().height).toBeGreaterThan(20)
		// Круг по центру первой строки (20px): его верх на 2px ниже верха подписи
		const circle = radio.nextElementSibling as HTMLElement
		await expect(Math.round(circle.getBoundingClientRect().top - label.getBoundingClientRect().top)).toBe(2)
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Слот `option({ option, isChecked })` заменяет подпись опции — например, добавляет срок и цену.
 * Круг, выбор кликом по подписи и стрелки работают как обычно.
 */
export const OptionSlot: Story = {
	args: { isVertical: true, name: 'delivery-details' },
	parameters: { controls: { include: ['variant', 'sizeScale'] } },
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseRadio },
			setup: () => ({ props: useArgsWithoutSlots(args), onUpdate, details: DELIVERY_DETAILS }),
			template: `
				<BaseRadio v-bind="props" @update:model-value="onUpdate">
					<template #option="{ option }">
						<span style="display: flex; flex-direction: column;">
							<span>{{ option.label }}</span>
							<span style="color: var(--rise-text-muted); font-weight: var(--rise-font-weight-normal);">{{ details[option.value] }}</span>
						</span>
					</template>
				</BaseRadio>
			`,
		}
	},
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getAllByRole('radio')).toHaveLength(DELIVERY_OPTIONS.length)
		await userEvent.click(canvas.getByText('Пункт выдачи на Тверской, 12 · бесплатно'))
		await expect(canvas.getByRole('radio', { name: /Самовывоз/ })).toBeChecked()
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/** Клавиатура: Tab ставит фокус на выбранную опцию (видно кольцо вокруг круга), стрелки переключают выбор. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	args: { name: 'delivery-keyboard' },
	play: async ({ canvas, userEvent, args }) => {
		const courier = canvas.getByRole('radio', { name: 'Курьером' })
		await tabTo(courier, userEvent)
		await expect(getComputedStyle(courier.nextElementSibling as HTMLElement).outlineStyle).toBe('solid')
		await userEvent.keyboard('{ArrowRight}')
		const pickup = canvas.getByRole('radio', { name: 'Самовывоз' })
		await expect(pickup).toBeChecked()
		await expect(pickup).toHaveFocus()
		await expect(args.onChange).toHaveBeenLastCalledWith('pickup')
	},
}
