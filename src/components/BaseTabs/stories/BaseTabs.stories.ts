/**
 * BaseTabs — stories.
 *
 * Разделы: Default (песочница с рабочим v-model) → внешний вид (варианты, размеры, на всю ширину, цвет) →
 * состояния (отключённая вкладка, пусто, длинные названия) → содержимое (иконки, панель) →
 * сценарии (прокрутка) → клавиатура (стрелки, Home/End, roving tabindex).
 */

import { ref } from 'vue'
import { expect, fn, waitFor, within } from 'storybook/test'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'
import BaseTabs from '../ui/BaseTabs.vue'
import { TABS_VARIANTS } from '../types/BaseTabs.types'
import type { TabItem } from '../types/BaseTabs.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const TABS: TabItem[] = [
	{ id: 'overview', label: 'Обзор' },
	{ id: 'specs', label: 'Характеристики' },
	{ id: 'reviews', label: 'Отзывы' },
	{ id: 'delivery', label: 'Доставка' },
]

const TABS_WITH_DISABLED: TabItem[] = [
	{ id: 'overview', label: 'Обзор' },
	{ id: 'specs', label: 'Характеристики' },
	{ id: 'reviews', label: 'Отзывы' },
	{ id: 'delivery', label: 'Доставка', isDisabled: true },
]

/** Иконки вкладок — доверенная SVG-разметка (поле `icon` выводится через v-html). */
const SVG_ATTRS =
	'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"'
const ICON_TABS: TabItem[] = [
	{ id: 'profile', label: 'Профиль', icon: `<svg ${SVG_ATTRS}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>` },
	{
		id: 'security',
		label: 'Безопасность',
		icon: `<svg ${SVG_ATTRS}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`,
	},
	{
		id: 'notifications',
		label: 'Уведомления',
		icon: `<svg ${SVG_ATTRS}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21h4"/></svg>`,
	},
]

const MANY_TABS: TabItem[] = [
	{ id: 'overview', label: 'Обзор' },
	{ id: 'specs', label: 'Характеристики' },
	{ id: 'reviews', label: 'Отзывы' },
	{ id: 'delivery', label: 'Доставка' },
	{ id: 'payment', label: 'Оплата' },
	{ id: 'warranty', label: 'Гарантия' },
	{ id: 'similar', label: 'Похожие товары' },
	{ id: 'questions', label: 'Вопросы и ответы' },
]

const LONG_TABS: TabItem[] = [
	{ id: 'contract', label: 'Условия договора поставки оборудования' },
	{ id: 'schedule', label: 'График отгрузок по регионам' },
	{ id: 'documents', label: 'Сопроводительные документы' },
]

const PANELS: Record<string, string> = {
	overview: 'Лёгкий ноутбук с экраном 13 дюймов и автономностью до 18 часов.',
	specs: 'Процессор 8 ядер, 16 ГБ памяти, накопитель 512 ГБ, вес 1,2 кг.',
	reviews: 'Средняя оценка 4,8 по 126 отзывам покупателей.',
	delivery: 'Доставка курьером за 1–2 дня или самовывоз из пункта выдачи.',
}

/** Ключи args, которые витрины задают сами (у каждого экземпляра своя активная вкладка). */
const MODEL_KEYS = ['modelValue', 'onUpdate:modelValue']

const meta = {
	title: 'Navigation/BaseTabs',
	component: BaseTabs,
	parameters: {
		docs: {
			description: {
				component: [
					'Вкладки переключают разделы одной области без перехода на другую страницу.',
					'',
					'- `v-model` хранит `id` активной вкладки; содержимое панели передаётся в слот по умолчанию.',
					'- Варианты: `underline` (по умолчанию) — линия под активной вкладкой; `pills` и `rounded` — вкладки в контейнере;',
					'  `arc` — вкладки со скруглением сверху.',
					'- Клавиатура по APG Tabs: в порядке Tab только выбранная вкладка, стрелки ←/→ с зацикливанием, Home/End;',
					'  отключённые вкладки пропускаются. Выбор следует за фокусом.',
					'- `isScrollable` добавляет кнопки прокрутки при переполнении; список можно тянуть мышью.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: TABS_VARIANTS }),
		modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
		items: { control: 'object', table: propGroup(ARG_GROUP.content) },
		isFullWidth: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		isScrollable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		default: { control: false },
	},
	args: {
		modelValue: 'overview',
		items: TABS,
		variant: 'underline',
		isFullWidth: false,
		isScrollable: false,
		sizeScale: 100,
		'onUpdate:modelValue': fn(),
		onChange: fn(),
	},
	// Активная вкладка хранится в args: клик меняет Controls, а изменение в Controls — вкладки.
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseTabs },
			setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
			template: '<BaseTabs v-bind="props" @update:model-value="onUpdate" />',
		}
	},
} satisfies Meta<typeof BaseTabs>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: клик по вкладке эмитит `update:modelValue` и `change` с её `id`. */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('tab', { name: 'Характеристики' }))
		await expect(args.onChange).toHaveBeenCalledWith('specs')
		// Значение живёт в args: aria-selected переходит на вкладку, когда id вернулся в v-model
		await waitFor(() => expect(canvas.getByRole('tab', { name: 'Характеристики' })).toHaveAttribute('aria-selected', 'true'))
		await expect(canvas.getByRole('tab', { name: 'Обзор' })).toHaveAttribute('aria-selected', 'false')
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Четыре варианта. `underline` — навигация по разделам страницы; `pills` и `rounded` — переключатели режимов
 * (компактные сегменты); `arc` — вкладки над панелью с содержимым.
 */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'isFullWidth'] },
		docs: {
			source: { code: TABS_VARIANTS.map(variant => `<BaseTabs v-model="tab" :items="items" variant="${variant}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseTabs },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...MODEL_KEYS, 'variant', 'default']),
			variants: TABS_VARIANTS,
			tabs: ref<Record<string, string>>(Object.fromEntries(TABS_VARIANTS.map(variant => [variant, 'specs']))),
		}),
		template: `
			<div class="story-stack">
				<div v-for="variant in variants" :key="variant" class="story-col">
					<span class="story-label">{{ variant }}</span>
					<BaseTabs v-bind="props" v-model="tabs[variant]" :variant="variant" />
				</div>
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: высота вкладки 24, 28, 32, 36 и 40px — как у кнопки того же размера. */
export const Sizes: Story = {
	args: { variant: 'pills' },
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			source: {
				code: SIZE_PRESETS.map(p => `<BaseTabs v-model="tab" :items="items" variant="pills" :size-scale="${p.sizeScale}" />`).join(
					'\n',
				),
			},
		},
	},
	render: args => ({
		components: { BaseTabs },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...MODEL_KEYS, 'sizeScale', 'default']),
			presets: SIZE_PRESETS,
			sizeLabel,
			tabs: ref<Record<string, string>>(Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, 'overview']))),
		}),
		template: `
			<div class="story-stack">
				<div v-for="preset in presets" :key="preset.name" class="story-col">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseTabs v-bind="props" v-model="tabs[preset.name]" :size-scale="preset.sizeScale" />
				</div>
			</div>
		`,
	}),
}

/** `isFullWidth` растягивает вкладки на всю ширину контейнера поровну. */
export const FullWidth: Story = {
	args: { variant: 'pills', isFullWidth: true, items: TABS.slice(0, 3) },
	play: async ({ canvas }) => {
		const [first, second] = canvas.getAllByRole('tab')
		await expect(Math.round(first.getBoundingClientRect().width)).toBe(Math.round(second.getBoundingClientRect().width))
	},
}

/**
 * Кастомный цвет через `color`: `text.base` — неактивные вкладки, `text.active` — активная,
 * `bg.active` — линия (underline, arc) или «пилюля» (pills, rounded) активной вкладки, `bg.base` — фон контейнера.
 */
export const CustomColor: Story = {
	args: {
		modelValue: 'specs',
		variant: 'pills',
		color: {
			bg: { base: '#eff6ff', active: '#2563eb' },
			text: { base: '#1e40af', active: '#ffffff' },
		},
	},
	play: async ({ canvas }) => {
		const active = canvas.getByRole('tab', { name: 'Характеристики' })
		await expect(getComputedStyle(active).backgroundColor).toBe('rgb(37, 99, 235)')
		await expect(getComputedStyle(active).color).toBe('rgb(255, 255, 255)')
		await expect(getComputedStyle(canvas.getByRole('tab', { name: 'Обзор' })).color).toBe('rgb(30, 64, 175)')
		await expect(getComputedStyle(canvas.getByRole('tablist')).backgroundColor).toBe('rgb(239, 246, 255)')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Отключённая вкладка приглушена, не выбирается кликом и пропускается стрелками. */
export const Disabled: Story = {
	args: { items: TABS_WITH_DISABLED },
	play: async ({ canvas, userEvent, args }) => {
		const disabled = canvas.getByRole('tab', { name: 'Доставка' })
		await expect(disabled).toBeDisabled()
		await userEvent.click(disabled)
		await expect(args.onChange).not.toHaveBeenCalled()
		await expect(disabled).toHaveAttribute('aria-selected', 'false')
	},
}

/** Без вкладок: пустой список `tablist`, панели нет. */
export const Empty: Story = {
	args: { items: [], modelValue: '' },
	play: async ({ canvas }) => {
		await expect(within(canvas.getByRole('tablist')).queryAllByRole('tab')).toHaveLength(0)
		await expect(canvas.queryByRole('tabpanel')).toBeNull()
	},
}

/** Длинные названия не переносятся: список прокручивается по горизонтали и не растягивает контейнер (здесь — 360px). */
export const LongContent: Story = {
	args: { items: LONG_TABS, modelValue: 'contract' },
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseTabs },
			setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
			template: '<div class="story-narrow"><BaseTabs v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
	play: async ({ canvas }) => {
		const list = canvas.getByRole('tablist')
		await expect(list.scrollWidth).toBeGreaterThan(list.clientWidth)
		await expect(list.getBoundingClientRect().width).toBeLessThanOrEqual(360)
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/** Иконка вкладки — поле `icon` с доверенной SVG-разметкой (выводится через v-html, не передавайте данные пользователей). */
export const WithIcons: Story = {
	args: { items: ICON_TABS, modelValue: 'profile', variant: 'pills' },
}

/**
 * Содержимое панели — слот по умолчанию. Панель получает `role="tabpanel"`, подписана активной вкладкой и
 * доступна по Tab, чтобы с клавиатуры можно было перейти к её содержимому.
 */
export const WithContent: Story = {
	args: { variant: 'arc' },
	parameters: {
		docs: {
			source: {
				code: ['<BaseTabs v-model="tab" :items="items" variant="arc">', '  <div>{{ panels[tab] }}</div>', '</BaseTabs>'].join('\n'),
			},
		},
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseTabs },
			setup: () => ({ props: useArgsWithoutSlots(args), onUpdate, panels: PANELS }),
			template: `
				<BaseTabs v-bind="props" @update:model-value="onUpdate">
					<div>{{ panels[props.modelValue] }}</div>
				</BaseTabs>
			`,
		}
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('tab', { name: 'Отзывы' }))
		await waitFor(() => expect(canvas.getByRole('tabpanel', { name: 'Отзывы' })).toHaveTextContent('Средняя оценка 4,8'))
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * `isScrollable`: при переполнении по краям появляются кнопки прокрутки, список можно тянуть мышью
 * (перетаскивание не переключает вкладку).
 */
export const Scrollable: Story = {
	args: { items: MANY_TABS, isScrollable: true },
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseTabs },
			setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
			template: '<div style="max-width: 320px;"><BaseTabs v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
	// Состояние прокрутки не меняем: story используют e2e-тесты перетаскивания (BaseTabs.e2e.spec.ts)
	play: async ({ canvas }) => {
		await expect(await canvas.findByRole('button', { name: 'Прокрутить вкладки вправо' })).toBeVisible()
		await expect(canvas.queryByRole('button', { name: 'Прокрутить вкладки влево' })).toBeNull()
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура (APG Tabs): Tab попадает только на выбранную вкладку, → переносит фокус и выбор на следующую,
 * End — на последнюю доступную (отключённая «Доставка» пропускается), Home — на первую.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	args: { items: TABS_WITH_DISABLED },
	play: async ({ canvas, userEvent, args }) => {
		const overview = canvas.getByRole('tab', { name: 'Обзор' })
		await tabTo(overview, userEvent)
		await expect(getComputedStyle(overview).outlineStyle).toBe('solid')
		await expect(canvas.getByRole('tab', { name: 'Характеристики' })).toHaveAttribute('tabindex', '-1')

		await userEvent.keyboard('{ArrowRight}')
		await expect(canvas.getByRole('tab', { name: 'Характеристики' })).toHaveFocus()
		await expect(args.onChange).toHaveBeenLastCalledWith('specs')

		await userEvent.keyboard('{End}')
		await expect(canvas.getByRole('tab', { name: 'Отзывы' })).toHaveFocus()

		await userEvent.keyboard('{Home}')
		await expect(overview).toHaveFocus()
		await waitFor(() => expect(overview).toHaveAttribute('aria-selected', 'true'))
	},
}
