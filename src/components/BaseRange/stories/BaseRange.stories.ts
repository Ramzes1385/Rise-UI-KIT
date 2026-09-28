import { ref } from 'vue'
import { expect, fn, screen, waitFor } from 'storybook/test'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'
import BaseRange from '../ui/BaseRange.vue'
import { RANGE_VARIANTS } from '../types/BaseRange.types'
import type { RangeMark } from '../types/BaseRange.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/** Шкала громкости: подписи на крайних и среднем делениях, промежуточные — короче. */
const VOLUME_MARKS: RangeMark[] = [
	{ value: 0, label: '0' },
	{ value: 25, tickSize: 'minor' },
	{ value: 50, label: '50' },
	{ value: 75, tickSize: 'minor' },
	{ value: 100, label: '100' },
	...[5, 10, 15, 20, 30, 35, 40, 45, 55, 60, 65, 70, 80, 85, 90, 95].map(value => ({ value, tickSize: 'sub' as const })),
]

/** Цвет после подстановки CSS-переменных в текущей теме: так значение `var(--rise-…)` сравнивается с цветом элемента. */
function resolveColor(value: string): string {
	const probe = document.createElement('span')
	probe.style.color = value
	document.body.append(probe)
	const resolved = getComputedStyle(probe).color
	probe.remove()
	return resolved
}

const meta = {
	title: 'Form/BaseRange',
	component: BaseRange,
	parameters: {
		docs: {
			description: {
				component: [
					'Слайдер значения: один ползунок (`v-model`), диапазон (`v-model:range-value`) или несколько точек',
					'(`v-model:points`, приоритет: points → rangeValue → modelValue).',
					'',
					'- `update:*` приходит при каждом шаге перетаскивания, `change` — когда выбор завершён: отпускание',
					'  ползунка или шаг стрелкой с клавиатуры. Сохранять значение или запускать запрос удобно по `change`.',
					'- Ползунки — `role="slider"` со стрелками; соседние ползунки не пересекаются. Имя ползунка — `ariaLabel`',
					'  («Цена» → «Цена: минимум», «Цена: максимум»).',
					'- `hasTooltip` — значение над ползунком при наведении и фокусе, `hasLabel` — минимум, значение и максимум',
					'  над треком, `marks` — деления с подписями.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: RANGE_VARIANTS }),
		modelValue: { control: { type: 'number' }, table: propGroup(ARG_GROUP.content) },
		rangeValue: { control: 'object', table: propGroup(ARG_GROUP.content) },
		points: { control: 'object', table: propGroup(ARG_GROUP.content) },
		min: { control: 'number', table: propGroup(ARG_GROUP.content) },
		max: { control: 'number', table: propGroup(ARG_GROUP.content) },
		step: { control: 'number', table: propGroup(ARG_GROUP.content) },
		marks: { control: 'object', table: propGroup(ARG_GROUP.content) },
		hasLabel: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		hasTooltip: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		isVertical: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
		thumb: { control: false },
	},
	args: {
		modelValue: 40,
		min: 0,
		max: 100,
		step: 1,
		ariaLabel: 'Громкость',
		variant: 'default',
		sizeScale: 100,
		hasLabel: false,
		hasTooltip: false,
		isVertical: false,
		isDisabled: false,
		'onUpdate:modelValue': fn(),
		onChange: fn(),
	},
	// Значение хранится в args: перетаскивание обновляет Controls, а изменение в Controls — слайдер.
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseRange },
			setup: () => ({ props: useArgsWithoutSlots(args, ['thumb']), onUpdate }),
			template: '<div class="story-narrow"><BaseRange v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
} satisfies Meta<typeof BaseRange>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: перетащите ползунок, кликните по треку или меняйте props в Controls — значение синхронизировано. */
export const Default: Story = {
	args: { hasLabel: true },
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Пять вариантов. `default` — трек bg-accented; `soft` — трек мягкого основного цвета; `outline` — трек-контур;
 * `ghost` — без трека, только заполнение; `shadow` — бегунок с заметной тенью.
 */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled'] },
		docs: { source: { code: RANGE_VARIANTS.map(variant => `<BaseRange v-model="volume" variant="${variant}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseRange },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'variant', 'ariaLabel', 'thumb', 'onUpdate:modelValue']),
			variants: RANGE_VARIANTS,
			values: ref<Record<string, number>>(Object.fromEntries(RANGE_VARIANTS.map(variant => [variant, 60]))),
		}),
		template: `
			<div class="story-stack story-narrow">
				<div v-for="variant in variants" :key="variant" class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">{{ variant }}</span>
					<BaseRange v-bind="props" v-model="values[variant]" :variant="variant" :aria-label="variant" />
				</div>
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: трек 4.5–7.5px, бегунок 12–20px и область нажатия масштабируются вместе. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['variant'] },
		docs: { source: { code: SIZE_PRESETS.map(p => `<BaseRange v-model="volume" :size-scale="${p.sizeScale}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseRange },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'sizeScale', 'ariaLabel', 'thumb', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref<Record<string, number>>(Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, 60]))),
		}),
		template: `
			<div class="story-stack story-narrow">
				<div v-for="preset in presets" :key="preset.name" class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseRange v-bind="props" v-model="values[preset.name]" :size-scale="preset.sizeScale" :aria-label="sizeLabel(preset)" />
				</div>
			</div>
		`,
	}),
}

/**
 * Кастомный цвет через `color`: `bg` красит заполнение и кольцо бегунка, `text` — значение в подписи.
 * Для текста взят токен роли: он контрастен и в светлой, и в тёмной теме.
 */
export const CustomColor: Story = {
	args: { modelValue: 70, hasLabel: true, color: { bg: { base: '#16a34a' }, text: { base: 'var(--rise-success)' } } },
	play: async ({ canvas }) => {
		const thumb = canvas.getByRole('slider', { name: 'Громкость' })
		await expect(getComputedStyle(thumb).borderTopColor).toBe('rgb(22, 163, 74)')
		await expect(getComputedStyle(thumb).backgroundColor).toBe(resolveColor('var(--rise-bg)'))
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Отключённый слайдер: приглушён, ползунок вне порядка Tab и не реагирует на мышь и клавиатуру. */
export const Disabled: Story = {
	args: { isDisabled: true, hasLabel: true },
	play: async ({ canvas }) => {
		const thumb = canvas.getByRole('slider', { name: 'Громкость' })
		await expect(thumb).toHaveAttribute('aria-disabled', 'true')
		await expect(thumb).toHaveAttribute('tabindex', '-1')
	},
}

// ─── Режимы ────────────────────────────────────────────────────────────────────

/** Диапазон (`v-model:range-value`): два ползунка не пересекаются, заполнение — между ними. */
export const Range: Story = {
	args: { rangeValue: [1500, 4500], min: 0, max: 10000, step: 100, ariaLabel: 'Цена', hasLabel: true },
	render: args => {
		const onUpdate = useModelArg('rangeValue')
		return {
			components: { BaseRange },
			setup: () => ({ props: useArgsWithoutSlots(args, ['modelValue', 'thumb']), onUpdate }),
			template: '<div class="story-narrow"><BaseRange v-bind="props" @update:range-value="onUpdate" /></div>',
		}
	},
	play: async ({ canvas }) => {
		const min = canvas.getByRole('slider', { name: 'Цена: минимум' })
		const max = canvas.getByRole('slider', { name: 'Цена: максимум' })
		// Границы каждого ползунка — соседний ползунок
		await expect(min).toHaveAttribute('aria-valuemax', '4500')
		await expect(max).toHaveAttribute('aria-valuemin', '1500')
	},
}

/** Несколько точек (`v-model:points`): например, опорные точки кривой громкости; соседние ползунки ограничивают друг друга. */
export const MultiPoint: Story = {
	args: { points: [20, 45, 80], ariaLabel: undefined, hasLabel: true },
	render: args => {
		const onUpdate = useModelArg('points')
		return {
			components: { BaseRange },
			setup: () => ({ props: useArgsWithoutSlots(args, ['modelValue', 'thumb']), onUpdate }),
			template: '<div class="story-narrow"><BaseRange v-bind="props" @update:points="onUpdate" /></div>',
		}
	},
	play: async ({ canvas }) => {
		const middle = canvas.getByRole('slider', { name: 'Точка 2' })
		await expect(middle).toHaveAttribute('aria-valuemin', '20')
		await expect(middle).toHaveAttribute('aria-valuemax', '80')
	},
}

/** Вертикальный слайдер (`isVertical`): высота 200px, значение растёт снизу вверх, деления — справа. */
export const Vertical: Story = {
	args: {
		isVertical: true,
		modelValue: 65,
		marks: [
			{ value: 0, label: '0' },
			{ value: 50, label: '50' },
			{ value: 100, label: '100' },
		],
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseRange },
			setup: () => ({ props: useArgsWithoutSlots(args, ['thumb']), onUpdate }),
			// Отступ сверху и снизу — место под подписи крайних делений, они выходят за трек наполовину
			template: '<div style="padding: 8px 0;"><BaseRange v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('slider', { name: 'Громкость' })).toHaveAttribute('aria-orientation', 'vertical')
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/** Подсказка со значением (`hasTooltip`) — как BaseTooltip: появляется при наведении и при фокусе с клавиатуры. */
export const WithTooltip: Story = {
	args: { rangeValue: [25, 75], hasTooltip: true, ariaLabel: 'Громкость' },
	parameters: { docs: { story: { inline: false, height: '140px' } } },
	render: args => {
		const onUpdate = useModelArg('rangeValue')
		return {
			components: { BaseRange },
			setup: () => ({ props: useArgsWithoutSlots(args, ['modelValue', 'thumb']), onUpdate }),
			template:
				'<div class="story-narrow" style="padding-top: 40px;"><BaseRange v-bind="props" @update:range-value="onUpdate" /></div>',
		}
	},
	play: async ({ canvas, userEvent }) => {
		await tabTo(canvas.getByRole('slider', { name: 'Громкость: минимум' }), userEvent)
		const tooltip = await screen.findByRole('tooltip')
		await waitFor(() => expect(tooltip).toBeVisible())
		await expect(tooltip).toHaveTextContent('25')
	},
}

/**
 * Деления (`marks`): `tickSize` — длина линии (`major`, `minor`, `sub`), `label` — подпись под ней.
 * Деления только размечают шкалу: значение по-прежнему меняется с шагом `step`.
 */
export const WithMarks: Story = {
	args: { modelValue: 60, marks: VOLUME_MARKS, step: 5 },
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseRange },
			setup: () => ({ props: useArgsWithoutSlots(args, ['thumb']), onUpdate }),
			// Отступы по бокам — место под подписи крайних делений, они выходят за трек наполовину
			template:
				'<div class="story-narrow" style="padding: 0 12px;"><BaseRange v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText('50')).toBeVisible()
		await expect(canvas.getByRole('slider', { name: 'Громкость' })).toHaveAttribute('aria-valuenow', '60')
	},
}

/** Дробный шаг: значения кратны 0.1 без хвостов плавающей точки (0.3, а не 0.30000000000000004). */
export const DecimalStep: Story = {
	args: { modelValue: 0.5, min: 0, max: 1, step: 0.1, ariaLabel: 'Прозрачность', hasLabel: true },
	// Значение — в локальном ref: шаги стрелками идут подряд, каждый от уже обновлённого значения
	render: args => ({
		components: { BaseRange },
		setup: () => ({ props: useArgsWithoutSlots(args, ['modelValue', 'thumb', 'onUpdate:modelValue']), opacity: ref(0.5) }),
		template: '<div class="story-narrow"><BaseRange v-bind="props" v-model="opacity" /></div>',
	}),
	play: async ({ canvas, userEvent }) => {
		const thumb = canvas.getByRole('slider', { name: 'Прозрачность' })
		await tabTo(thumb, userEvent)
		await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
		await waitFor(() => expect(thumb).toHaveAttribute('aria-valuenow', '0.3'))
		await expect(canvas.getByText('0.3')).toBeVisible()
	},
}

/** Свой бегунок в слоте `thumb`: получает `value` и `index`; фокус с клавиатуры — то же кольцо. */
export const CustomThumb: Story = {
	args: { modelValue: 35, ariaLabel: 'Скорость воспроизведения' },
	parameters: {
		docs: {
			source: {
				code: '<BaseRange v-model="value">\n  <template #thumb="{ value }"><span class="my-thumb">{{ value }}</span></template>\n</BaseRange>',
			},
		},
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseRange },
			setup: () => ({ props: useArgsWithoutSlots(args, ['thumb']), onUpdate }),
			template: `
				<div class="story-narrow">
					<BaseRange v-bind="props" @update:model-value="onUpdate">
						<template #thumb="{ value }">
							<span
								style="display: flex; align-items: center; justify-content: center; min-width: 32px; height: 20px; padding: 0 6px;
									border-radius: 9999px; background: var(--rise-primary); color: var(--rise-on-primary);
									font-size: 12px; line-height: 16px; font-weight: 500; box-shadow: var(--rise-shadow-sm);">
								{{ value }}
							</span>
						</template>
					</BaseRange>
				</div>
			`,
		}
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('slider', { name: 'Скорость воспроизведения' })).toHaveTextContent('35')
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: Tab ставит фокус на ползунок, стрелки вправо/вверх увеличивают значение на `step`, влево/вниз —
 * уменьшают; каждый шаг с клавиатуры — завершённый выбор, поэтому приходит и `change`.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	// Значение — в локальном ref: обновление args перерисовало бы story и сбросило шпион onChange
	render: args => ({
		components: { BaseRange },
		setup: () => ({ props: useArgsWithoutSlots(args, ['modelValue', 'thumb', 'onUpdate:modelValue']), volume: ref(40) }),
		template: '<div class="story-narrow"><BaseRange v-bind="props" v-model="volume" /></div>',
	}),
	play: async ({ canvas, userEvent, args }) => {
		const thumb = canvas.getByRole('slider', { name: 'Громкость' })
		await tabTo(thumb, userEvent)

		await userEvent.keyboard('{ArrowRight}')
		await expect(thumb).toHaveAttribute('aria-valuenow', '41')
		await expect(args.onChange).toHaveBeenLastCalledWith(41)

		await userEvent.keyboard('{ArrowDown}{ArrowDown}')
		await expect(thumb).toHaveAttribute('aria-valuenow', '39')
		await expect(args.onChange).toHaveBeenLastCalledWith(39)
	},
}
