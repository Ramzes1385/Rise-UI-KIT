/**
 * BaseProgress — stories.
 *
 * Разделы: Default (песочница) → внешний вид (размеры, круг, кастомный цвет, оформление заливки) →
 * состояния (неопределённый режим) → содержимое (подпись) → сценарии (событие complete).
 */

import { expect, fn } from 'storybook/test'
import { ref } from 'vue'
import { ARG_GROUP, baseArgTypes, hiddenArgTypes, propGroup, SIZE_PRESETS, sizeLabel, useArgsWithoutSlots } from '@/stories/helpers'
import { BaseButton } from '@components/BaseButton'
import { PROGRESS_ANIMATIONS, PROGRESS_SHAPES } from '../model/BaseProgress.types'
import BaseProgress from '../ui/BaseProgress.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta = {
	title: 'Element/BaseProgress',
	component: BaseProgress,
	parameters: {
		docs: {
			description: {
				component: [
					'Индикатор выполнения известной длительности: загрузка файла, шаги мастера, заполненность профиля.',
					'Если длительность неизвестна — `isIndeterminate` или `BaseLoader`.',
					'',
					'- `line` — полоса 8px при `sizeScale` = 100; `circle` — кольцо 64px.',
					'- `hasLabel` показывает процент: над полосой у конца заливки или в центре кольца; текст меняется слотом.',
					'- Доступность: `role="progressbar"` со значением `aria-valuenow`; имя — `ariaLabel` (по умолчанию «Прогресс»)',
					'  или внешний `aria-labelledby`. В неопределённом режиме значение не сообщается.',
					'- Движение (бегущая полоса, striped, pulse, glow) отключается при системной настройке «уменьшить движение».',
				].join('\n'),
			},
		},
	},
	decorators: [() => ({ template: '<div class="story-medium"><story /></div>' })],
	argTypes: {
		...baseArgTypes(),
		...hiddenArgTypes('variant'),
		value: { control: { type: 'range', min: 0, max: 100 }, table: propGroup(ARG_GROUP.content) },
		max: { control: 'number', table: propGroup(ARG_GROUP.content) },
		shape: { control: 'inline-radio', options: PROGRESS_SHAPES, table: propGroup(ARG_GROUP.appearance) },
		animation: { control: 'inline-radio', options: PROGRESS_ANIMATIONS, table: propGroup(ARG_GROUP.appearance) },
		hasLabel: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		isIndeterminate: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
		default: { control: false },
	},
	args: {
		value: 60,
		max: 100,
		shape: 'line',
		animation: 'none',
		hasLabel: false,
		isIndeterminate: false,
		sizeScale: 100,
		onComplete: fn(),
	},
} satisfies Meta<typeof BaseProgress>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: меняйте props в панели Controls. Значение сообщается скринридеру через `aria-valuenow`. */
export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('progressbar', { name: 'Прогресс' })).toHaveAttribute('aria-valuenow', '60')
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Размеры задаются `sizeScale`: высота полосы 6, 7, 8, 9 и 10px, кольцо — 48–80px. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['value', 'shape', 'hasLabel'] },
		docs: { source: { code: SIZE_PRESETS.map(preset => `<BaseProgress :value="60" :size-scale="${preset.sizeScale}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseProgress },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-stack">
				<div v-for="preset in presets" :key="preset.name" class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseProgress v-bind="props" :size-scale="preset.sizeScale" :aria-label="sizeLabel(preset)" />
				</div>
			</div>
		`,
	}),
}

/** Кольцо (`shape="circle"`) — для компактных карточек и дашбордов. Подпись в центре меняется слотом. */
export const Circle: Story = {
	args: { shape: 'circle', hasLabel: true },
	parameters: {
		controls: { include: ['sizeScale', 'hasLabel', 'animation', 'color'] },
		docs: {
			source: {
				code: [
					'<BaseProgress shape="circle" :value="25" has-label />',
					'<BaseProgress shape="circle" :value="100" has-label />',
					'<BaseProgress shape="circle" :value="3" :max="5" has-label>',
					'  <template #default="{ value }">{{ value }}/5</template>',
					'</BaseProgress>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseProgress },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'value', 'max']) }),
		template: `
			<div class="story-row" style="gap: 24px;">
				<BaseProgress v-bind="props" :value="25" aria-label="Заполнение профиля" />
				<BaseProgress v-bind="props" :value="100" aria-label="Проверка документов" />
				<BaseProgress v-bind="props" :value="3" :max="5" aria-label="Шаги онбординга">
					<template #default="{ value }">{{ value }}/5</template>
				</BaseProgress>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const steps = canvas.getByRole('progressbar', { name: 'Шаги онбординга' })
		await expect(steps).toHaveAttribute('aria-valuenow', '60')
		await expect(steps).toHaveTextContent('3/5')
	},
}

/** Кастомный цвет заливки через `color.bg` — одинаково для полосы и кольца. Трек остаётся нейтральным. */
export const CustomColor: Story = {
	args: { color: { bg: { base: '#16a34a' } }, hasLabel: true },
	parameters: { controls: { include: ['color', 'value', 'hasLabel', 'sizeScale'] } },
	render: args => ({
		components: { BaseProgress },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'shape']) }),
		template: `
			<div class="story-stack">
				<BaseProgress v-bind="props" aria-label="Выполнение плана" />
				<BaseProgress v-bind="props" shape="circle" aria-label="Выполнение плана, круг" />
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const fill = canvasElement.querySelector('.base-progress__fill') as HTMLElement
		await expect(getComputedStyle(fill).backgroundColor).toBe('rgb(22, 163, 74)')
		const arc = canvasElement.querySelector('.base-progress__fill-circle') as SVGElement
		await expect(getComputedStyle(arc).stroke).toBe('rgb(22, 163, 74)')
	},
}

/** Оформление заливки `animation`: `striped` — полосы, `pulse` — мерцание, `glow` — свечение. */
export const Animations: Story = {
	parameters: {
		controls: { include: ['value', 'sizeScale', 'color'] },
		docs: { source: { code: PROGRESS_ANIMATIONS.map(animation => `<BaseProgress :value="60" animation="${animation}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseProgress },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'animation', 'shape']), animations: PROGRESS_ANIMATIONS }),
		template: `
			<div class="story-stack">
				<div v-for="animation in animations" :key="animation" class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">{{ animation }}</span>
					<BaseProgress v-bind="props" :animation="animation" :aria-label="animation" />
				</div>
			</div>
		`,
	}),
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/**
 * Неопределённый режим: значение неизвестно — по полосе бежит отрезок, по кольцу — дуга. `aria-valuenow` и подпись
 * с процентом не выводятся. При настройке «уменьшить движение» — статичная бледная заливка.
 */
export const Indeterminate: Story = {
	args: { isIndeterminate: true, hasLabel: true },
	parameters: { controls: { include: ['sizeScale', 'color', 'hasLabel'] } },
	render: args => ({
		components: { BaseProgress },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'shape']) }),
		template: `
			<div class="story-stack">
				<BaseProgress v-bind="props" aria-label="Подготовка архива" />
				<BaseProgress v-bind="props" shape="circle" aria-label="Синхронизация" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		for (const progressbar of canvas.getAllByRole('progressbar')) {
			await expect(progressbar).not.toHaveAttribute('aria-valuenow')
			await expect(progressbar).not.toHaveTextContent('%')
		}
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/**
 * Подпись `hasLabel` над полосой прижата к концу заливки; в начале шкалы не уходит за левый край.
 * Слот меняет текст подписи — например, на «Шаг 3 из 5».
 */
export const WithLabel: Story = {
	args: { hasLabel: true },
	parameters: {
		controls: { include: ['sizeScale', 'color'] },
		docs: {
			source: {
				code: [
					'<BaseProgress :value="5" has-label />',
					'<BaseProgress :value="3" :max="5" has-label>',
					'  <template #default="{ value }">Шаг {{ value }} из 5</template>',
					'</BaseProgress>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseProgress },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'value', 'max', 'shape']) }),
		template: `
			<div class="story-stack">
				<BaseProgress v-bind="props" :value="5" aria-label="Загрузка отчёта" />
				<BaseProgress v-bind="props" :value="100" aria-label="Загрузка фото" />
				<BaseProgress v-bind="props" :value="3" :max="5" aria-label="Регистрация">
					<template #default="{ value }">Шаг {{ value }} из 5</template>
				</BaseProgress>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('progressbar', { name: 'Загрузка отчёта' })).toHaveTextContent('5%')
		await expect(canvas.getByRole('progressbar', { name: 'Регистрация' })).toHaveTextContent('Шаг 3 из 5')
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/** Событие `complete` приходит, когда прогресс доходит до 100%: например, чтобы показать «Готово». */
export const Complete: Story = {
	args: { hasLabel: true, value: 60 },
	parameters: {
		controls: { include: ['sizeScale', 'shape'] },
		docs: { source: { code: '<BaseProgress :value="uploaded" has-label aria-label="Загрузка файла" @complete="onUploaded" />' } },
	},
	render: args => ({
		components: { BaseProgress, BaseButton },
		setup: () => {
			const value = ref(args.value)
			const add = (): void => {
				value.value = Math.min(value.value + 20, 100)
			}
			return { props: useArgsWithoutSlots(args, ['default', 'value']), value, add }
		},
		template: `
			<div class="story-stack">
				<BaseProgress v-bind="props" :value="value" aria-label="Загрузка файла" />
				<div>
					<BaseButton variant="outline" @click="add">Загрузить ещё 20%</BaseButton>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const button = canvas.getByRole('button', { name: 'Загрузить ещё 20%' })
		await userEvent.click(button)
		await expect(args.onComplete).not.toHaveBeenCalled()
		await userEvent.click(button)
		await expect(canvas.getByRole('progressbar', { name: 'Загрузка файла' })).toHaveAttribute('aria-valuenow', '100')
		await expect(args.onComplete).toHaveBeenCalledOnce()
	},
}
