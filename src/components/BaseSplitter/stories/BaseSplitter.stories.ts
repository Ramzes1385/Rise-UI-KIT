/**
 * BaseSplitter — stories.
 *
 * Разделы: Default (песочница с v-model) → внешний вид (одна над другой, варианты) → состояния (отключено) →
 * клавиатура.
 */

import { expect, fn } from 'storybook/test'
import { ARG_GROUP, baseArgTypes, hiddenArgTypes, propGroup, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'
import BaseSplitter from '../ui/BaseSplitter.vue'
import { SPLITTER_VARIANTS } from '../types/BaseSplitter.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const LETTERS = ['Счёт за сентябрь', 'Договор поставки', 'Сверка остатков', 'Отгрузка № 1048', 'Акт выполненных работ']

const PANES = `
	<template #start>
		<ul aria-label="Письма" style="margin: 0; padding: 12px 16px; list-style: none; display: grid; gap: 8px">
			<li v-for="letter in letters" :key="letter">{{ letter }}</li>
		</ul>
	</template>
	<template #end>
		<article style="padding: 12px 16px">
			<h3 style="margin-top: 0">Счёт за сентябрь</h3>
			<p style="margin: 0">Добрый день! Во вложении счёт за сентябрь, оплата до 10 октября.</p>
		</article>
	</template>
`

const BOX = 'height: 240px; border: 1px solid var(--rise-border); border-radius: 8px; overflow: hidden'

const meta = {
	title: 'Layout/BaseSplitter',
	component: BaseSplitter,
	parameters: {
		docs: {
			description: {
				component: [
					'Две панели с разделителем, который двигает пользователь: список и письмо, код и превью, дерево и таблица.',
					'',
					'- `v-model` — размер первой панели в процентах; `min`, `max` — границы; событие `change` — итог, чтобы сохранить его.',
					'- `orientation`: `horizontal` — панели рядом, `vertical` — одна над другой.',
					'- Доступность по APG Window Splitter: разделитель — `role="separator"` с `aria-valuenow` и `aria-controls`,',
					'  стрелки двигают его на `step`, Home/End — к границам, Enter сворачивает первую панель и возвращает её.',
					'  Имя — `label`: лучше назвать первую панель («Список писем»).',
					'- Панели с прокруткой получают tabindex, чтобы их можно было прокрутить с клавиатуры.',
					'- `variant`: `default` — линия с ручкой, `ghost` — линия видна при наведении и в фокусе.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: SPLITTER_VARIANTS }),
		...hiddenArgTypes('color'),
		modelValue: { control: { type: 'range', min: 0, max: 100 }, table: propGroup(ARG_GROUP.state) },
		orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'], table: propGroup(ARG_GROUP.appearance) },
		min: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
		max: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
		step: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
		label: { control: 'text', table: propGroup(ARG_GROUP.content) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	},
	args: {
		modelValue: 35,
		orientation: 'horizontal',
		min: 20,
		max: 80,
		step: 5,
		label: 'Список писем',
		isDisabled: false,
		variant: 'default',
		sizeScale: 100,
		onChange: fn(),
	},
	// v-model хранится в args: перетаскивание обновляет Controls, ползунок в Controls — разделитель
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseSplitter },
			setup: () => ({ props: useArgsWithoutSlots(args), onUpdate, letters: LETTERS, box: BOX }),
			template: `<div :style="box"><BaseSplitter v-bind="props" @update:model-value="onUpdate">${PANES}</BaseSplitter></div>`,
		}
	},
} satisfies Meta<typeof BaseSplitter>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: тяните разделитель мышью или стрелками, размер виден в Controls. */
export const Default: Story = {
	play: async ({ canvas, args }) => {
		const separator = canvas.getByRole('separator', { name: 'Список писем' })
		await expect(separator).toHaveAttribute('aria-valuenow', '35')
		await expect(separator).toHaveAttribute('aria-controls', canvas.getByRole('list', { name: 'Письма' }).parentElement?.id)
		await expect(args.onChange).not.toHaveBeenCalled()
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Одна над другой (`orientation="vertical"`): разделитель горизонтальный, двигается стрелками ↑/↓. */
export const Vertical: Story = {
	args: { orientation: 'vertical', modelValue: 50 },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal')
	},
}

/** Варианты: `default` — линия с ручкой, `ghost` — линия появляется при наведении и в фокусе. */
export const Variants: Story = {
	parameters: { controls: { include: ['sizeScale', 'orientation'] } },
	render: args => ({
		components: { BaseSplitter },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant', 'label']), variants: SPLITTER_VARIANTS, letters: LETTERS, box: BOX }),
		template: `
			<div class="story-stack">
				<div v-for="variant in variants" :key="variant" :style="box">
					<BaseSplitter v-bind="props" :variant="variant" :label="'Список писем, ' + variant">${PANES}</BaseSplitter>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('separator')).toHaveLength(2)
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Отключённый разделитель не двигается и не получает фокус. */
export const Disabled: Story = {
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		const separator = canvas.getByRole('separator')
		await expect(separator).toHaveAttribute('aria-disabled', 'true')
		await expect(separator).not.toHaveAttribute('tabindex')
	},
}

// ─── Клавиатура ────────────────────────────────────────────────────────────────

/** Клавиатура: →/← — шаг 5%, Home/End — к границам, Enter сворачивает первую панель и возвращает её. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const separator = canvas.getByRole('separator', { name: 'Список писем' })
		await tabTo(separator, userEvent)
		await userEvent.keyboard('{ArrowRight}')
		await expect(separator).toHaveAttribute('aria-valuenow', '40')
		await userEvent.keyboard('{End}')
		await expect(separator).toHaveAttribute('aria-valuenow', '80')
		await userEvent.keyboard('{Enter}')
		await expect(separator).toHaveAttribute('aria-valuenow', '20')
		await userEvent.keyboard('{Enter}')
		await expect(separator).toHaveAttribute('aria-valuenow', '80')
		await expect(args.onChange).toHaveBeenLastCalledWith(80)
	},
}
