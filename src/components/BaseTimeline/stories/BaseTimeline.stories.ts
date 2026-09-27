/**
 * BaseTimeline — stories.
 *
 * Разделы: Default (песочница) → внешний вид (варианты, размеры, горизонтальная лента) → сценарии (текущий этап
 * заказа, свой слот события).
 */

import { expect } from 'storybook/test'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, useArgsWithoutSlots } from '@/stories/helpers'
import { BaseBadge } from '@components/BaseBadge'
import { TIMELINE_VARIANTS } from '../model/BaseTimeline.types'
import BaseTimeline from '../ui/BaseTimeline.vue'
import type { TimelineItem } from '../model/BaseTimeline.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/** Этапы заказа: даты фиксированы, чтобы снимки не зависели от текущего дня */
const ORDER: TimelineItem[] = [
	{ id: 'created', title: 'Заказ оформлен', description: 'Оплата картой прошла', date: '2026-05-12T10:24:00', icon: 'check', color: 'success' },
	{ id: 'packed', title: 'Собран на складе', description: 'Склад в Подольске', date: '2026-05-13T08:05:00', icon: 'inbox' },
	{ id: 'shipped', title: 'Передан в доставку', description: 'Курьер привезёт завтра с 10 до 14', date: '2026-05-14T16:40:00', icon: 'send' },
	{ id: 'delivered', title: 'Доставлен', date: 'ожидается 15 мая', icon: 'home' },
]

const meta = {
	title: 'Data/BaseTimeline',
	component: BaseTimeline,
	parameters: {
		docs: {
			description: {
				component: [
					'Лента событий: история заказа, изменения документа, этапы процесса.',
					'',
					'- Разметка — упорядоченный список `<ol>`; дата — `<time datetime>` в формате языка (`dateFormat`), строка не-дата выводится как есть.',
					'- `currentId` — текущее событие: `aria-current="step"`, следующие приглушены как предстоящие.',
					'- Маркер — иконка события или точка, цвет — роль (`color`: success, warning, error, info, neutral).',
					'- `orientation="horizontal"` — лента слева направо с прокруткой; слот `item` — своё содержимое события.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: TIMELINE_VARIANTS }),
		items: { control: 'object', table: propGroup(ARG_GROUP.content) },
		currentId: { control: 'inline-radio', options: ORDER.map(item => item.id), table: propGroup(ARG_GROUP.state) },
		orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'], table: propGroup(ARG_GROUP.appearance) },
	},
	args: {
		items: ORDER,
		currentId: 'shipped',
		orientation: 'vertical',
		variant: 'default',
		sizeScale: 100,
	},
	render: args => ({
		components: { BaseTimeline },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: '<div class="story-narrow"><BaseTimeline v-bind="props" /></div>',
	}),
} satisfies Meta<typeof BaseTimeline>

export default meta
type Story = StoryObj<typeof meta>

/** Песочница: история заказа, текущий этап — «Передан в доставку». */
export const Default: Story = {
	play: async ({ canvas }) => {
		const items = canvas.getAllByRole('listitem')
		await expect(items).toHaveLength(4)
		await expect(items[2]).toHaveAttribute('aria-current', 'step')
		await expect(items[0].querySelector('time')).toHaveAttribute('datetime')
	},
}

/** Варианты маркеров: `default` — заливка, `soft` — мягкий фон, `outline` — кольцо. */
export const Variants: Story = {
	parameters: { controls: { include: ['sizeScale', 'currentId'] } },
	render: args => ({
		components: { BaseTimeline },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant']), variants: TIMELINE_VARIANTS }),
		template: `
			<div class="story-grid" style="--story-grid-min: 260px;">
				<div v-for="variant in variants" :key="variant" class="story-stack" style="gap: 8px;">
					<span class="story-label">{{ variant }}</span>
					<BaseTimeline v-bind="props" :variant="variant" />
				</div>
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: маркер, отступы и текст масштабируются вместе. */
export const Sizes: Story = {
	parameters: { controls: { include: ['variant'] } },
	render: args => ({
		components: { BaseTimeline },
		setup: () => ({ props: useArgsWithoutSlots(args, ['sizeScale']), presets: SIZE_PRESETS.filter(preset => ['xs', 'xl'].includes(preset.name)), sizeLabel }),
		template: `
			<div class="story-grid" style="--story-grid-min: 260px;">
				<div v-for="preset in presets" :key="preset.name" class="story-stack" style="gap: 8px;">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseTimeline v-bind="props" :size-scale="preset.sizeScale" />
				</div>
			</div>
		`,
	}),
}

/** Горизонтальная лента: этапы слева направо, при нехватке места — прокрутка. */
export const Horizontal: Story = {
	args: { orientation: 'horizontal', variant: 'soft' },
	render: args => ({
		components: { BaseTimeline },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: '<BaseTimeline v-bind="props" />',
	}),
	play: async ({ canvasElement }) => {
		const list = canvasElement.querySelector('.base-timeline') as HTMLElement
		await expect(getComputedStyle(list).flexDirection).toBe('row')
	},
}

/** Свой слот `item`: статус бейджем рядом с заголовком; маркер и линию рисует лента. */
export const CustomItem: Story = {
	parameters: { controls: { include: ['variant', 'sizeScale'] } },
	render: args => ({
		components: { BaseTimeline, BaseBadge },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: `
			<div class="story-narrow">
				<BaseTimeline v-bind="props">
					<template #item="{ item, isCurrent, isUpcoming }">
						<span style="display: flex; align-items: center; gap: 8px;">
							<strong style="font-weight: 500;">{{ item.title }}</strong>
							<BaseBadge v-if="isCurrent" variant="soft" label="Сейчас" />
							<BaseBadge v-else-if="isUpcoming" variant="outline" label="Скоро" />
						</span>
					</template>
				</BaseTimeline>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Сейчас')).toBeVisible()
	},
}
