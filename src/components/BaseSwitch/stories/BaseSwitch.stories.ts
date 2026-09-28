/**
 * BaseSwitch — stories.
 *
 * Разделы: Default (песочница с рабочим v-model) → внешний вид (варианты, размеры, цвет) →
 * состояния (disabled, ошибка, длинная подпись) → сценарии (подпись слева, слоты) → клавиатура.
 */

import { ref } from 'vue'
import { expect, fn } from 'storybook/test'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'
import BaseSwitch from '../ui/BaseSwitch.vue'
import { SWITCH_VARIANTS } from '../model/BaseSwitch.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta = {
	title: 'Form/BaseSwitch',
	component: BaseSwitch,
	parameters: {
		docs: {
			description: {
				component: [
					'Переключатель — включает и выключает настройку, которая применяется сразу: уведомления, тёмная тема, автопродление.',
					'',
					'- Нативный checkbox с `role="switch"`: скринридер озвучивает «переключатель, включён/выключен», Space переключает.',
					'- Подпись (`label` или слот `label`) — имя переключателя; клик по ней тоже переключает.',
					'- Ошибка (`error`) помечает переключатель `aria-invalid` и связана с ним через `aria-describedby`.',
					'- `reverse` ставит подпись слева, а трек — у правого края: так выглядят списки настроек.',
					'',
					'Если значение применяется только после отправки формы, используйте `BaseCheckbox`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: SWITCH_VARIANTS }),
		modelValue: { control: 'boolean', table: propGroup(ARG_GROUP.content) },
		label: { control: 'text', table: propGroup(ARG_GROUP.content) },
		reverse: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		error: { control: 'text', table: propGroup(ARG_GROUP.state) },
		isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		default: { control: false },
	},
	args: {
		modelValue: false,
		label: 'Уведомления по email',
		variant: 'default',
		sizeScale: 100,
		reverse: false,
		error: '',
		isRequired: false,
		isDisabled: false,
		'onUpdate:modelValue': fn(),
		onChange: fn(),
	},
	// Значение хранится в args: переключение обновляет Controls, а изменение в Controls — переключатель.
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseSwitch },
			setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
			template: '<BaseSwitch v-bind="props" @update:model-value="onUpdate" />',
		}
	},
} satisfies Meta<typeof BaseSwitch>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: кликните по переключателю или меняйте props в Controls — значение синхронизировано. */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		const toggle = canvas.getByRole('switch', { name: 'Уведомления по email' })
		await userEvent.click(toggle)
		await expect(toggle).toBeChecked()
		await expect(args.onChange).toHaveBeenCalledWith(true)
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Три варианта в двух состояниях: `default`, `outline` — прозрачный выключенный трек с рамкой, `shadow` — с тенью. */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled', 'error'] },
		docs: {
			source: {
				code: SWITCH_VARIANTS.map(variant => `<BaseSwitch v-model="enabled" variant="${variant}" label="${variant}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSwitch },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'label', 'variant', 'onUpdate:modelValue']),
			variants: SWITCH_VARIANTS,
			values: ref(Object.fromEntries(SWITCH_VARIANTS.map(variant => [variant, { off: false, on: true }]))),
		}),
		template: `
			<div class="story-col">
				<div v-for="variant in variants" :key="variant" class="story-row">
					<span class="story-label">{{ variant }}</span>
					<BaseSwitch v-bind="props" v-model="values[variant].off" :variant="variant" label="Выключен" />
					<BaseSwitch v-bind="props" v-model="values[variant].on" :variant="variant" label="Включён" />
				</div>
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: трек 27×15, 31.5×17.5, 36×20, 40.5×22.5 и 45×25px, подпись масштабируется вместе с ним. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			source: {
				code: SIZE_PRESETS.map(p => `<BaseSwitch v-model="enabled" :size-scale="${p.sizeScale}" label="${p.name}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSwitch },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'label', 'sizeScale', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref(Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, true]))),
		}),
		template: `
			<div class="story-col">
				<BaseSwitch
					v-for="preset in presets"
					:key="preset.name"
					v-bind="props"
					v-model="values[preset.name]"
					:size-scale="preset.sizeScale"
					:label="sizeLabel(preset)" />
			</div>
		`,
	}),
}

/** Кастомный цвет через `color`: `bg` — цвет трека включённого переключателя. */
export const CustomColor: Story = {
	args: {
		label: 'Автопродление подписки',
		modelValue: true,
		color: { bg: { base: '#15803d', hover: '#166534' } },
	},
	play: async ({ canvasElement }) => {
		const track = canvasElement.querySelector('.base-switch__slider') as HTMLElement
		await expect(getComputedStyle(track).backgroundColor).toBe('rgb(21, 128, 61)')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Отключённый переключатель — в обоих состояниях: приглушён, не получает фокус, клик не меняет значение. */
export const Disabled: Story = {
	parameters: { controls: { include: ['variant', 'sizeScale', 'reverse'] } },
	render: args => ({
		components: { BaseSwitch },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'label', 'isDisabled', 'onUpdate:modelValue']),
			off: ref(false),
			on: ref(true),
		}),
		template: `
			<div class="story-col">
				<BaseSwitch v-bind="props" v-model="off" label="Резервное копирование (недоступно на тарифе)" is-disabled />
				<BaseSwitch v-bind="props" v-model="on" label="Двухфакторный вход (включено администратором)" is-disabled />
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const toggle = canvas.getByRole('switch', { name: 'Резервное копирование (недоступно на тарифе)' })
		await expect(toggle).toBeDisabled()
		await userEvent.click(canvas.getByText('Резервное копирование (недоступно на тарифе)'))
		await expect(toggle).not.toBeChecked()
	},
}

/** Ошибка: красная обводка трека и текст под подписью; переключатель помечен `aria-invalid` и описан текстом ошибки. */
export const WithError: Story = {
	args: {
		label: 'Согласие на обработку данных',
		isRequired: true,
		error: 'Без согласия мы не сможем создать аккаунт',
	},
	play: async ({ canvas }) => {
		const toggle = canvas.getByRole('switch', { name: /Согласие на обработку данных/ })
		await expect(toggle).toHaveAttribute('aria-invalid', 'true')
		await expect(toggle).toHaveAttribute('aria-required', 'true')
		await expect(toggle).toHaveAccessibleDescription('Без согласия мы не сможем создать аккаунт')
	},
}

/** Длинная подпись переносится по словам, трек остаётся у первой строки (ширина контейнера 360px). */
export const LongContent: Story = {
	args: {
		modelValue: true,
		label: 'Автоматически продлевать подписку в конце периода и списывать оплату с сохранённой карты',
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseSwitch },
			setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
			template: '<div class="story-narrow"><BaseSwitch v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
	play: async ({ canvasElement }) => {
		const track = canvasElement.querySelector('.base-switch__slider') as HTMLElement
		const content = canvasElement.querySelector('.base-switch__content') as HTMLElement
		await expect(content.getBoundingClientRect().height).toBeGreaterThan(20)
		// Трек высотой в строку подписи (20px) стоит вровень с её первой строкой
		await expect(Math.round(track.getBoundingClientRect().top)).toBe(Math.round(content.getBoundingClientRect().top))
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/** Список настроек: `reverse` ставит подпись слева, трек прижимается к правому краю контейнера. */
export const Reverse: Story = {
	parameters: { controls: { include: ['variant', 'sizeScale', 'isDisabled'] } },
	render: args => ({
		components: { BaseSwitch },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'label', 'reverse', 'onUpdate:modelValue']),
			settings: ref({ email: true, push: false, digest: true }),
		}),
		template: `
			<div class="story-stack story-narrow">
				<BaseSwitch v-bind="props" v-model="settings.email" reverse label="Письма о заказах" />
				<BaseSwitch v-bind="props" v-model="settings.push" reverse label="Push-уведомления" />
				<BaseSwitch v-bind="props" v-model="settings.digest" reverse label="Еженедельная подборка" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const toggle = canvas.getByRole('switch', { name: 'Письма о заказах' })
		const label = canvas.getByText('Письма о заказах')
		await expect(toggle.getBoundingClientRect().left).toBeGreaterThan(label.getBoundingClientRect().right)
	},
}

/** Слот `label` заменяет подпись своей разметкой, слот `default` добавляет текст после подписи. */
export const Slots: Story = {
	parameters: { controls: { include: ['variant', 'sizeScale'] } },
	render: args => ({
		components: { BaseSwitch },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'modelValue', 'label', 'onUpdate:modelValue']), isDark: ref(false) }),
		template: `
			<BaseSwitch v-bind="props" v-model="isDark">
				<template #label><strong>Тёмная тема</strong></template>
				<span style="display: block; color: var(--rise-text-muted);">Применится ко всем устройствам аккаунта</span>
			</BaseSwitch>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const toggle = canvas.getByRole('switch', { name: /Тёмная тема/ })
		await userEvent.click(canvas.getByText('Тёмная тема'))
		await expect(toggle).toBeChecked()
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/** Клавиатура: Tab ставит фокус (видно кольцо вокруг трека), Space включает и выключает. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const toggle = canvas.getByRole('switch', { name: 'Уведомления по email' })
		await tabTo(toggle, userEvent)
		const track = canvasElement.querySelector('.base-switch__slider') as HTMLElement
		await expect(getComputedStyle(track).outlineStyle).toBe('solid')
		await userEvent.keyboard(' ')
		await expect(toggle).toBeChecked()
		await userEvent.keyboard(' ')
		await expect(toggle).not.toBeChecked()
		await expect(args.onChange).toHaveBeenLastCalledWith(false)
	},
}
