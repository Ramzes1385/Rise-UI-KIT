/**
 * BaseColorPicker — stories.
 *
 * Разделы: Default (песочница с рабочим v-model) → внешний вид (размеры) → состояния (disabled) →
 * содержимое (свои пресеты, минимальная панель, свой триггер) → сценарии (ввод HEX, сброс цвета) → клавиатура.
 * Панель телепортируется в body, поэтому в Docs примеры с открытой панелью показываются в отдельном фрейме.
 */

import { expect, fn, screen, waitFor } from 'storybook/test'
import { ref } from 'vue'
import { ARG_GROUP, propGroup, SIZE_PRESETS, sizeLabel, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'
import { BaseIcon } from '@components/BaseIcon'
import { COLOR_PICKER_POSITIONS } from '../model/BaseColorPicker.types'
import BaseColorPicker from '../ui/BaseColorPicker.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/** Фирменная палитра студии для примера своих пресетов. */
const BRAND_PRESETS = [
	'#0f172a',
	'#1d4ed8',
	'#0891b2',
	'#15803d',
	'#ca8a04',
	'#c2410c',
	'#be123c',
	'#7e22ce',
	'#f8fafc',
	'#cbd5e1',
	'#64748b',
	'#334155',
]

/**
 * Образец — по центру примера: панель открывается под ним по центру и не выходит за левый край холста
 * (BaseDropdown не сдвигает панель от края экрана).
 */
const CENTERED = 'display: flex; justify-content: center;'

/** Панель телепортируется в body и перекрыла бы страницу Docs — пример с открытой панелью показывается во фрейме. */
function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}

const meta = {
	title: 'Form/BaseColorPicker',
	component: BaseColorPicker,
	parameters: {
		docs: {
			description: {
				component: [
					'Выбор цвета: образец-триггер открывает панель с областью насыщенности и яркости, слайдером тона,',
					'полем HEX и пресетами.',
					'',
					'- `v-model` — цвет в HEX. Пресет и введённый HEX попадают в модель как есть, без пересчёта через HSV.',
					'- Выбор пресета и сброс (`isResettable`) закрывают панель; область, тон и HEX — нет, можно подбирать дальше.',
					'- Клавиатура: Enter на образце открывает панель, Tab переходит по её элементам, стрелки меняют',
					'  насыщенность и яркость (Shift — шаг 10%) и тон, Escape закрывает панель и возвращает фокус на образец.',
					'',
					'Проп `color` компонент не использует: цвет образца — это выбранное значение.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		modelValue: { control: 'color', table: propGroup(ARG_GROUP.content) },
		presets: { control: 'object', table: propGroup(ARG_GROUP.content) },
		resetLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
		position: { control: 'inline-radio', options: COLOR_PICKER_POSITIONS, table: propGroup(ARG_GROUP.appearance) },
		sizeScale: { control: { type: 'range', min: 50, max: 200, step: 12.5 }, table: propGroup(ARG_GROUP.appearance) },
		isHexHidden: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		isPresetsHidden: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		hasTransparentSwatch: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		customClass: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
		isResettable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		variant: { table: { disable: true } },
		color: { table: { disable: true } },
	},
	args: {
		modelValue: '#f97316',
		position: 'bottom',
		sizeScale: 100,
		isHexHidden: false,
		isPresetsHidden: false,
		isResettable: false,
		hasTransparentSwatch: false,
		isDisabled: false,
		'onUpdate:modelValue': fn(),
		onChange: fn(),
		onReset: fn(),
	},
	// Цвет хранится в args: выбор в панели обновляет Controls, а изменение в Controls — образец.
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseColorPicker },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate, centered: CENTERED }),
			template: '<div :style="centered"><BaseColorPicker v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
} satisfies Meta<typeof BaseColorPicker>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: нажмите на образец, выберите цвет в панели или меняйте props в Controls. */
export const Default: Story = {
	play: async ({ canvas }) => {
		const swatch = canvas.getByRole('button', { name: 'Выбранный цвет #f97316' })
		await expect(swatch).toHaveAttribute('aria-expanded', 'false')
		await expect(swatch.style.backgroundColor).toBe('rgb(249, 115, 22)')
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Размеры через `sizeScale`: образец 24, 28, 32, 36 и 40px — как поле того же размера; панель масштабируется вместе с ним. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['modelValue'] },
		docs: { source: { code: SIZE_PRESETS.map(p => `<BaseColorPicker v-model="color" :size-scale="${p.sizeScale}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseColorPicker },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'sizeScale', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			colors: ref<Record<string, string>>({}),
		}),
		template: `
			<div class="story-row">
				<div v-for="preset in presets" :key="preset.name" class="story-col" style="align-items: center; gap: 6px;">
					<BaseColorPicker v-bind="props" :model-value="colors[preset.name] ?? '#1d4ed8'" :size-scale="preset.sizeScale" @update:model-value="colors[preset.name] = $event" />
					<span class="story-label" style="min-width: 0;">{{ sizeLabel(preset) }}</span>
				</div>
			</div>
		`,
	}),
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Отключённый выбор цвета: образец приглушён и не открывает панель. */
export const Disabled: Story = {
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: /Выбранный цвет/ })).toBeDisabled()
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/**
 * Свои пресеты (`presets`) — например, фирменная палитра. Выбор пресета записывает его HEX в модель как есть
 * и закрывает панель; выбранный пресет отмечен кольцом основного цвета.
 */
export const Presets: Story = {
	args: { presets: BRAND_PRESETS, modelValue: '#0f172a' },
	parameters: { docs: docsFrame(380) },
	play: async ({ canvas, userEvent }) => {
		const swatch = canvas.getByRole('button', { name: /Выбранный цвет/ })
		await userEvent.click(swatch)
		await userEvent.click(await screen.findByRole('button', { name: 'Пресет #1d4ed8' }))
		// Точный HEX пресета: раньше значение искажалось округлённым HSV
		await waitFor(() => expect(swatch.style.backgroundColor).toBe('rgb(29, 78, 216)'))
		await waitFor(() => expect(screen.queryByRole('slider', { name: 'Насыщенность и яркость' })).not.toBeInTheDocument())

		await userEvent.click(swatch)
		await expect(await screen.findByRole('button', { name: 'Пресет #1d4ed8' })).toHaveAttribute('aria-pressed', 'true')
	},
}

/** Минимальная панель: без поля HEX (`isHexHidden`) и пресетов (`isPresetsHidden`) — только область и тон. */
export const Minimal: Story = {
	args: { isHexHidden: true, isPresetsHidden: true, modelValue: '#0891b2' },
	parameters: { docs: docsFrame(260) },
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: /Выбранный цвет/ }))
		await expect(await screen.findByRole('slider', { name: 'Насыщенность и яркость' })).toBeInTheDocument()
		await expect(screen.queryByRole('textbox', { name: 'HEX-значение' })).not.toBeInTheDocument()
		await expect(screen.queryByRole('button', { name: /Пресет/ })).not.toBeInTheDocument()
	},
}

/**
 * Свой триггер: `hasTransparentSwatch` не заливает образец цветом, а слот `trigger` показывает иконку —
 * так выглядит кнопка цвета текста в тулбаре редактора.
 */
export const TriggerSlot: Story = {
	args: { hasTransparentSwatch: true, modelValue: '#be123c' },
	parameters: {
		docs: {
			source: {
				code: [
					'<BaseColorPicker v-model="textColor" has-transparent-swatch>',
					'  <template #trigger><BaseIcon name="color-picker" :color="textColor" /></template>',
					'</BaseColorPicker>',
				].join('\n'),
			},
		},
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseColorPicker, BaseIcon },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate, centered: CENTERED }),
			template: `
				<div :style="centered">
					<BaseColorPicker v-bind="props" @update:model-value="onUpdate">
						<template #trigger>
							<BaseIcon name="color-picker" :color="props.modelValue" :size-scale="80" />
						</template>
					</BaseColorPicker>
				</div>
			`,
		}
	},
	play: async ({ canvas }) => {
		// Образец не залит цветом — цвет показывает иконка из слота; имя кнопки по-прежнему называет цвет
		await expect(canvas.getByRole('button', { name: 'Выбранный цвет #be123c' }).style.backgroundColor).toBe('')
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/** Ввод HEX: значение применяется после Enter или ухода из поля и попадает в модель без искажений. */
export const HexInput: Story = {
	parameters: { docs: docsFrame(380) },
	play: async ({ canvas, userEvent }) => {
		const swatch = canvas.getByRole('button', { name: /Выбранный цвет/ })
		await userEvent.click(swatch)
		const hex = await screen.findByRole('textbox', { name: 'HEX-значение' })
		await userEvent.clear(hex)
		await userEvent.type(hex, '#123456')
		await userEvent.tab()
		// #123456 не переживает пересчёт через округлённый HSV (стал бы #123457) — в модели точное значение
		await waitFor(() => expect(swatch.style.backgroundColor).toBe('rgb(18, 52, 86)'))
		await expect(hex).toHaveValue('#123456')
	},
}

/** Сброс цвета (`isResettable`): кнопка «Без цвета» эмитит `reset` и закрывает панель; здесь сброс убирает заливку образца. */
export const Resettable: Story = {
	args: { isResettable: true, modelValue: '#15803d' },
	parameters: { docs: docsFrame(380) },
	render: args => ({
		components: { BaseColorPicker, BaseIcon },
		setup: () => {
			const color = ref(String(args.modelValue))
			const isNone = ref(false)
			return { props: useArgsWithoutSlots(args, ['modelValue', 'onUpdate:modelValue']), color, isNone, centered: CENTERED }
		},
		template: `
			<div :style="centered">
				<BaseColorPicker
					v-bind="props"
					v-model="color"
					:has-transparent-swatch="isNone"
					@update:model-value="isNone = false"
					@reset="isNone = true">
					<template #trigger>
						<BaseIcon v-if="isNone" name="minus" :size-scale="80" />
					</template>
				</BaseColorPicker>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const swatch = canvas.getByRole('button', { name: /Выбранный цвет/ })
		await userEvent.click(swatch)
		await userEvent.click(await screen.findByRole('button', { name: 'Без цвета' }))
		await expect(args.onReset).toHaveBeenCalledOnce()
		await waitFor(() => expect(swatch.style.backgroundColor).toBe(''))
		await waitFor(() => expect(screen.queryByRole('button', { name: 'Без цвета' })).not.toBeInTheDocument())
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: Enter на образце открывает панель, Tab ведёт в область выбора, стрелки меняют насыщенность
 * (Shift — шаг 10%), Escape закрывает панель и возвращает фокус на образец.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	args: { modelValue: '#808080' },
	play: async ({ canvas, userEvent }) => {
		const swatch = canvas.getByRole('button', { name: /Выбранный цвет/ })
		await tabTo(swatch, userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(swatch).toHaveAttribute('aria-expanded', 'true')

		const area = await screen.findByRole('slider', { name: 'Насыщенность и яркость' })
		await tabTo(area, userEvent)
		await expect(area).toHaveAttribute('aria-valuenow', '0')
		await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}')
		await expect(area).toHaveAttribute('aria-valuenow', '10')
		await userEvent.keyboard('{ArrowRight}')
		await expect(area).toHaveAttribute('aria-valuenow', '11')

		await userEvent.keyboard('{Escape}')
		await expect(swatch).toHaveAttribute('aria-expanded', 'false')
		await expect(swatch).toHaveFocus()
	},
}
