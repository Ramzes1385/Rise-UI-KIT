/**
 * BaseButton — stories.
 *
 * Порядок разделов (одинаковый для всех компонентов):
 * 1. Default — песочница: все props меняются в панели Controls.
 * 2. Внешний вид — варианты, размеры, кастомный цвет.
 * 3. Состояния — disabled, loading.
 * 4. Содержимое — иконки, длинный текст.
 * 5. Сценарии — кнопка в форме, отступы.
 * 6. Доступность — проверка клавиатуры (только в сайдбаре, не в Docs).
 */

import { expect, fn } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, slotArgType, tabTo, useArgsWithoutSlots } from '@/stories/helpers'
import BaseButton from '../ui/BaseButton.vue'
import { BUTTON_TYPES, BUTTON_VARIANTS } from '../model/BaseButton.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta = {
	title: 'Element/BaseButton',
	component: BaseButton,
	parameters: {
		docs: {
			description: {
				component: [
					'Кнопка запускает действие: отправку формы, открытие окна, переход к следующему шагу.',
					'',
					'- `default` — главное действие; на экране или в области обычно одно.',
					'- `soft` — второстепенное действие, которое стоит выделить цветом.',
					'- `outline`, `ghost`, `shadow` — нейтральные действия: «Отмена», кнопки тулбаров и карточек.',
					'',
					'Размер задаёт `sizeScale` (100 — высота 32px). Во время `isLoading` кнопка остаётся в порядке Tab',
					'(`aria-busy`, `aria-disabled`), а клики и отправка формы подавляются.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: BUTTON_VARIANTS }),
		type: { control: 'inline-radio', options: BUTTON_TYPES, table: propGroup(ARG_GROUP.behavior) },
		padding: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
		isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		default: slotArgType('Текст кнопки'),
		left: { control: false },
		right: { control: false },
	},
	args: {
		default: 'Сохранить',
		variant: 'default',
		type: 'button',
		isLoading: false,
		isDisabled: false,
		sizeScale: 100,
		onClick: fn(),
	},
} satisfies Meta<typeof BaseButton>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: меняйте props в панели Controls. Клик вызывает событие `click`. */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Сохранить' }))
		await expect(args.onClick).toHaveBeenCalledOnce()
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Пять вариантов оформления. Остальные props из Controls (размер, состояния) применяются ко всем кнопкам. */
export const Variants: Story = {
	argTypes: { variant: { control: false } },
	parameters: {
		docs: {
			source: {
				code: [
					'<BaseButton>default</BaseButton>',
					'<BaseButton variant="soft">soft</BaseButton>',
					'<BaseButton variant="outline">outline</BaseButton>',
					'<BaseButton variant="ghost">ghost</BaseButton>',
					'<BaseButton variant="shadow">shadow</BaseButton>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: ['default', 'soft', 'outline', 'ghost', 'shadow'] }),
		template: `
			<div class="story-row">
				<BaseButton v-for="variant in variants" :key="variant" v-bind="props" :variant="variant">{{ variant }}</BaseButton>
			</div>
		`,
	}),
}

/** Размеры задаются `sizeScale`. Пресеты соответствуют шкале xs–xl: высота кнопки 24, 28, 32, 36 и 40px. */
export const Sizes: Story = {
	argTypes: { sizeScale: { control: false } },
	parameters: {
		docs: {
			source: {
				code: SIZE_PRESETS.map(preset => `<BaseButton :size-scale="${preset.sizeScale}">${preset.name}</BaseButton>`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-row" style="align-items: flex-end;">
				<BaseButton v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale">
					{{ sizeLabel(preset) }}
				</BaseButton>
			</div>
		`,
	}),
}

/**
 * Кастомный цвет через `color`: фон и текст с состояниями hover/active/focus.
 * Используйте для брендовых кнопок сторонних сервисов; для обычных действий хватает вариантов.
 */
export const CustomColor: Story = {
	args: {
		default: 'Оплатить',
		color: {
			bg: { base: '#6d28d9', hover: '#5b21b6', active: '#4c1d95' },
			text: { base: '#ffffff' },
		},
	},
	play: async ({ canvas }) => {
		const button = canvas.getByRole('button', { name: 'Оплатить' })
		await expect(button.style.getPropertyValue('--custom-bg')).toBe('#6d28d9')
		await expect(button.style.getPropertyValue('--custom-bg-hover')).toBe('#5b21b6')
		await expect(getComputedStyle(button).backgroundColor).toBe('rgb(109, 40, 217)')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Отключённая кнопка: приглушена, не получает фокус, клик не вызывает событие. */
export const Disabled: Story = {
	args: { isDisabled: true, default: 'Недоступно' },
	play: async ({ canvas, userEvent, args }) => {
		const button = canvas.getByRole('button', { name: 'Недоступно' })
		await expect(button).toBeDisabled()
		await userEvent.click(button)
		await expect(args.onClick).not.toHaveBeenCalled()
	},
}

/**
 * Загрузка: спиннер вместо текста, ширина кнопки не меняется. Кнопка остаётся фокусируемой
 * и сообщает о загрузке через `aria-busy`; клик не вызывает событие.
 */
export const Loading: Story = {
	args: { isLoading: true, default: 'Сохранение' },
	play: async ({ canvas, userEvent, args }) => {
		const button = canvas.getByRole('button', { name: 'Сохранение' })
		await expect(button).toHaveAttribute('aria-busy', 'true')
		await expect(button).toHaveAttribute('aria-disabled', 'true')
		await tabTo(button, userEvent)
		await userEvent.click(button)
		await expect(args.onClick).not.toHaveBeenCalled()
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/**
 * Иконки в слотах `left` и `right`. Кнопке только с иконкой нужен `aria-label` и квадратные отступы
 * `:padding="{ x: 5, y: 5 }"` — тогда она квадратная 32 × 32.
 */
export const WithIcons: Story = {
	parameters: {
		docs: {
			source: {
				code: [
					'<BaseButton>',
					'  <template #left><BaseIcon name="plus" /></template>',
					'  Добавить',
					'</BaseButton>',
					'<BaseButton variant="outline">',
					'  Далее',
					'  <template #right><BaseIcon name="arrow-right" /></template>',
					'</BaseButton>',
					'<BaseButton variant="ghost" aria-label="Удалить" :padding="{ x: 5, y: 5 }">',
					'  <BaseIcon name="trash" />',
					'</BaseButton>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseButton, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<div class="story-row">
				<BaseButton v-bind="props">
					<template #left><BaseIcon name="plus" /></template>
					Добавить
				</BaseButton>
				<BaseButton v-bind="props" variant="outline">
					Далее
					<template #right><BaseIcon name="arrow-right" /></template>
				</BaseButton>
				<BaseButton v-bind="props" variant="ghost" aria-label="Удалить" :padding="{ x: 5, y: 5 }">
					<BaseIcon name="trash" />
				</BaseButton>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const iconButton = canvas.getByRole('button', { name: 'Удалить' })
		const { width, height } = iconButton.getBoundingClientRect()
		await expect(Math.round(width)).toBe(Math.round(height))
	},
}

/** Длинный текст обрезается многоточием: кнопка не шире контейнера (здесь — 220px). */
export const LongText: Story = {
	args: { default: 'Сохранить изменения и отправить на согласование' },
	render: args => ({
		components: { BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args), label: args.default }),
		template: `
			<div style="width: 220px;">
				<BaseButton v-bind="props">{{ label }}</BaseButton>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const button = canvas.getByRole('button')
		await expect(button.getBoundingClientRect().width).toBeLessThanOrEqual(220)
		await expect(button).toHaveAccessibleName('Сохранить изменения и отправить на согласование')
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Кнопки в форме: `type="submit"` отправляет форму, `type="reset"` сбрасывает её.
 * Пока кнопка отправки в `isLoading`, повторная отправка невозможна.
 */
export const InForm: Story = {
	parameters: {
		docs: {
			source: {
				code: [
					'<form @submit.prevent="save">',
					'  <BaseButton type="submit" :is-loading="isSaving">Сохранить</BaseButton>',
					'  <BaseButton type="reset" variant="outline">Сбросить</BaseButton>',
					'</form>',
				].join('\n'),
			},
		},
	},
	render: () => ({
		components: { BaseButton },
		template: `
			<form class="story-row" aria-label="Профиль" @submit.prevent>
				<BaseButton type="submit">Сохранить</BaseButton>
				<BaseButton type="reset" variant="outline">Сбросить</BaseButton>
			</form>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const onSubmit = fn()
		canvas.getByRole('form', { name: 'Профиль' }).addEventListener('submit', onSubmit)
		await userEvent.click(canvas.getByRole('button', { name: 'Сохранить' }))
		await expect(onSubmit).toHaveBeenCalledOnce()
	},
}

/**
 * Отступы `padding`: число — Y = n, X = 2n; объект `{ x, y, top, right, bottom, left }` задаёт стороны напрямую.
 * Без `padding` отступы берутся из токенов темы (`--rise-control-padding-y/x`).
 */
export const Padding: Story = {
	parameters: {
		docs: {
			source: {
				code: [
					'<BaseButton>из темы</BaseButton>',
					'<BaseButton :padding="8">8 → 8px 16px</BaseButton>',
					'<BaseButton :padding="{ x: 24, y: 10 }">x: 24, y: 10</BaseButton>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<div class="story-row">
				<BaseButton v-bind="props">из темы</BaseButton>
				<BaseButton v-bind="props" :padding="8">8 → 8px 16px</BaseButton>
				<BaseButton v-bind="props" :padding="{ x: 24, y: 10 }">x: 24, y: 10</BaseButton>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const [themed, numeric] = canvas.getAllByRole('button')
		await expect(themed.style.getPropertyValue('--btn-pad-top')).toBe('')
		await expect(numeric.style.getPropertyValue('--btn-pad-left')).toBe('16px')
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/** Клавиатура: Tab переводит фокус (видно кольцо фокуса), Enter и Space нажимают кнопку. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const button = canvas.getByRole('button', { name: 'Сохранить' })
		await tabTo(button, userEvent)
		await expect(getComputedStyle(button).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await userEvent.keyboard(' ')
		await expect(args.onClick).toHaveBeenCalledTimes(2)
	},
}
