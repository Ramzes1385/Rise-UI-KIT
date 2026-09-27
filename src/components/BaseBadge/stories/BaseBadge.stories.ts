/**
 * BaseBadge — stories.
 *
 * Разделы: Default (песочница) → внешний вид (варианты, размеры, кастомный цвет) →
 * содержимое (иконка, длинный текст) → сценарии (статусы через токены ролей, счётчик в кнопке).
 */

import { expect, fn } from 'storybook/test'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, slotArgType, useArgsWithoutSlots } from '@/stories/helpers'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BADGE_VARIANTS } from '../model/BaseBadge.types'
import BaseBadge from '../ui/BaseBadge.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/** Статусы заказа: мягкий фон и текст роли — токены меняются вместе с темой. */
const STATUSES = [
	{ label: 'Новый', role: 'info' },
	{ label: 'Оплачен', role: 'success' },
	{ label: 'Ждёт оплаты', role: 'warning' },
	{ label: 'Отменён', role: 'error' },
] as const

const meta = {
	title: 'Element/BaseBadge',
	component: BaseBadge,
	parameters: {
		docs: {
			description: {
				component: [
					'Компактная метка: статус, категория, счётчик, «Новое».',
					'',
					'- Варианты как у кнопки: `default` — заливка основным цветом, `soft` — мягкий фон,',
					'  `outline`, `ghost`, `shadow` — нейтральные.',
					'- Высота 20px при `sizeScale` = 100, текст 12/16. Длинный `label` обрезается многоточием.',
					'- Статусы (успех, ошибка) — проп `color` с токенами роли: `{ bg: { base: \'var(--rise-success-soft)\' }, text: { base: \'var(--rise-success-text)\' } }`.',
					'',
					'Бейдж не интерактивный: для действий используйте `BaseButton`, для индикатора поверх элемента — `BaseChip`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: BADGE_VARIANTS }),
		label: { control: 'text', table: propGroup(ARG_GROUP.content) },
		default: slotArgType('Содержимое (заменяет label)'),
	},
	args: {
		label: 'Новый',
		variant: 'default',
		sizeScale: 100,
		onClick: fn(),
	},
} satisfies Meta<typeof BaseBadge>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: меняйте props в панели Controls. Клик по бейджу вызывает событие `click`. */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		const badge = canvas.getByText('Новый')
		await expect(badge.closest('.base-badge')?.getBoundingClientRect().height).toBe(20)
		await userEvent.click(badge)
		await expect(args.onClick).toHaveBeenCalledOnce()
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Пять вариантов оформления. Размер из Controls применяется ко всем бейджам. */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: { source: { code: ['default', 'soft', 'outline', 'ghost', 'shadow'].map(variant => `<BaseBadge variant="${variant}" label="${variant}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseBadge },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: ['default', 'soft', 'outline', 'ghost', 'shadow'] }),
		template: `
			<div class="story-row">
				<BaseBadge v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="variant" />
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: при 100 высота 20px; текст, отступы и радиус масштабируются, рамка 1px — нет. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['variant'] },
		docs: { source: { code: SIZE_PRESETS.map(preset => `<BaseBadge :size-scale="${preset.sizeScale}" label="${preset.name}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseBadge },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-row">
				<BaseBadge v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :label="sizeLabel(preset)" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const [xs, md, xl] = ['xs · 75', 'md · 100', 'xl · 125'].map(label => canvas.getByText(label).closest('.base-badge')?.getBoundingClientRect().height ?? 0)
		await expect(md).toBe(20)
		await expect(xs).toBeLessThan(md)
		await expect(xl).toBeGreaterThan(md)
	},
}

/** Кастомный цвет через `color` — например, фирменный цвет тарифа. Для статусов берите токены ролей (см. «Статусы»). */
export const CustomColor: Story = {
	args: {
		label: 'Pro',
		color: { bg: { base: '#6d28d9' }, text: { base: '#ffffff' } },
	},
	play: async ({ canvas }) => {
		const badge = canvas.getByText('Pro').closest('.base-badge') as HTMLElement
		await expect(getComputedStyle(badge).backgroundColor).toBe('rgb(109, 40, 217)')
		await expect(getComputedStyle(badge).color).toBe('rgb(255, 255, 255)')
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/** Слот по умолчанию: иконка 16px (`:size-scale="80"`) и текст. Отступ между ними — 4px. */
export const WithIcon: Story = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			source: {
				code: [
					'<BaseBadge variant="soft">',
					'  <BaseIcon name="check" :size-scale="80" />',
					'  Проверено',
					'</BaseBadge>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseBadge, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'label']) }),
		template: `
			<div class="story-row">
				<BaseBadge v-bind="props" variant="soft">
					<BaseIcon name="check" :size-scale="80" />
					Проверено
				</BaseBadge>
				<BaseBadge v-bind="props" variant="outline">
					<BaseIcon name="calendar" :size-scale="80" />
					15 мая
				</BaseBadge>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const badge = canvas.getByText('Проверено')
		await expect(badge.getBoundingClientRect().height).toBe(20)
	},
}

/** Длинный `label` обрезается многоточием: бейдж не шире контейнера (здесь — 160px), полный текст доступен скринридеру. */
export const LongContent: Story = {
	args: { label: 'Ожидает согласования юристом' },
	render: args => ({
		components: { BaseBadge },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: '<div style="width: 160px;"><BaseBadge v-bind="props" /></div>',
	}),
	play: async ({ canvas }) => {
		const text = canvas.getByText('Ожидает согласования юристом')
		await expect(text.closest('.base-badge')?.getBoundingClientRect().width).toBeLessThanOrEqual(160)
		await expect(text.scrollWidth).toBeGreaterThan(text.clientWidth)
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Статусы: мягкий фон и текст роли через `color` с токенами `--rise-{роль}-soft` и `--rise-{роль}-text`.
 * Токены пересчитываются в тёмной теме, контраст текста — не ниже 4.5:1.
 */
export const Statuses: Story = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			source: {
				code: STATUSES.map(
					({ label, role }) =>
						`<BaseBadge label="${label}" :color="{ bg: { base: 'var(--rise-${role}-soft)' }, text: { base: 'var(--rise-${role}-text)' } }" />`,
				).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseBadge },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'label', 'variant']), statuses: STATUSES }),
		template: `
			<div class="story-row">
				<BaseBadge
					v-for="status in statuses"
					:key="status.role"
					v-bind="props"
					:label="status.label"
					:color="{ bg: { base: 'var(--rise-' + status.role + '-soft)' }, text: { base: 'var(--rise-' + status.role + '-text)' } }" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const paid = canvas.getByText('Оплачен').closest('.base-badge') as HTMLElement
		await expect(paid.style.getPropertyValue('--custom-bg')).toBe('var(--rise-success-soft)')
		await expect(paid.style.getPropertyValue('--custom-text')).toBe('var(--rise-success-text)')
	},
}

/** Счётчик в кнопке: бейдж в слоте `right` у `BaseButton`. Число входит в доступное имя кнопки. */
export const InButton: Story = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			source: {
				code: [
					'<BaseButton variant="outline">',
					'  Входящие',
					'  <template #right><BaseBadge variant="soft" label="12" /></template>',
					'</BaseButton>',
				].join('\n'),
			},
		},
	},
	args: { variant: 'soft' },
	render: args => ({
		components: { BaseBadge, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'label', 'onClick']) }),
		template: `
			<BaseButton variant="outline">
				Входящие
				<template #right><BaseBadge v-bind="props" label="12" /></template>
			</BaseButton>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button')).toHaveAccessibleName(/^Входящие\s*12$/)
	},
}
