import { expect, fn, within } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import {
	ARG_GROUP,
	baseArgTypes,
	hiddenArgTypes,
	propGroup,
	SIZE_PRESETS,
	sizeLabel,
	StoryRouterLink,
	tabTo,
	useArgsWithoutSlots,
} from '@/stories/helpers'
import BaseBreadcrumbs from '../ui/BaseBreadcrumbs.vue'
import { BREADCRUMBS_VARIANTS } from '../types/BaseBreadcrumbs.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { BreadcrumbItem, BreadcrumbSeparator } from '../types/BaseBreadcrumbs.types'

const ITEMS: BreadcrumbItem[] = [
	{ label: 'Главная', to: '/' },
	{ label: 'Каталог', to: '/catalog' },
	{ label: 'Электроника', to: '/catalog/electronics' },
	{ label: 'Ноутбуки', to: '/catalog/electronics/laptops' },
	{ label: 'Ультрабук 13"' },
]

const ICON_ITEMS: BreadcrumbItem[] = [
	{ label: 'Главная', to: '/', icon: 'home' },
	{ label: 'Документы', to: '/docs', icon: 'folder' },
	{ label: 'Договор поставки.pdf', icon: 'file' },
]

const LONG_ITEMS: BreadcrumbItem[] = [
	{ label: 'Главная', to: '/' },
	{ label: 'Отдел закупок и логистики центрального офиса', to: '/purchasing' },
	{ label: 'Договоры с поставщиками комплектующих на 2025 год', to: '/purchasing/contracts' },
	{ label: 'Дополнительное соглашение № 14 об изменении сроков поставки' },
]

const SEPARATORS: BreadcrumbSeparator[] = ['chevron', 'arrow', 'slash', 'dot']

/**
 * Слоты `item` и `home` не передаются атрибутами. Слот `separator` не исключаем: одноимённый prop задаёт вид разделителя
 * (в argTypes у него категория props, поэтому Storybook передаёт его как prop, а не как содержимое слота).
 */
const SLOT_KEYS = ['item', 'home']

const meta = {
	title: 'Navigation/BaseBreadcrumbs',
	component: BaseBreadcrumbs,
	parameters: {
		docs: {
			description: {
				component: [
					'Хлебные крошки показывают путь до текущей страницы и позволяют вернуться на любой уровень выше.',
					'',
					'- Корень — ориентир `<nav aria-label="Хлебные крошки">`, текущая страница помечена `aria-current="page"`.',
					'- Крошки — ссылки: `to` рендерит компонент ссылок приложения (`linkComponent`, плагин или RouterLink',
					'  подключённого vue-router), без роутера — `<a href>`; `href` открывается в новой вкладке (`target` меняет это).',
					'  Крошка без адреса — кнопка с событием `item-click`. `navigate(url)` сообщает о переходе.',
					'- `maxItems` сворачивает начало пути в «…», `showHome` добавляет перед крошками ссылку-иконку «домой».',
					'- Варианты: `default` — ссылки; `ghost` — ссылки-кнопки; `outline`, `shadow`, `soft` — крошки в контейнере высотой с контрол.',
					'',
					'Вместе с крошками разметка Schema.org (JSON-LD) попадает на страницу для поисковых систем.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: BREADCRUMBS_VARIANTS }),
		items: { control: 'object', table: propGroup(ARG_GROUP.content) },
		homeIcon: { control: 'text', table: propGroup(ARG_GROUP.content) },
		separator: { control: 'inline-radio', options: SEPARATORS, table: propGroup(ARG_GROUP.appearance) },
		showHome: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		maxItems: { control: { type: 'number', min: 0, max: 10 }, table: propGroup(ARG_GROUP.behavior) },
		...hiddenArgTypes('linkComponent'),
		item: { control: false },
		home: { control: false },
	},
	args: {
		items: ITEMS,
		variant: 'default',
		separator: 'chevron',
		maxItems: 0,
		showHome: false,
		homeIcon: 'home',
		sizeScale: 100,
		linkComponent: StoryRouterLink,
		onNavigate: fn(),
		'onItem-click': fn(),
	},
} satisfies Meta<typeof BaseBreadcrumbs>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: крошки — ссылки; клик эмитит `item-click` и `navigate` с адресом из `to`. Текущая страница — последняя крошка. */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		const nav = canvas.getByRole('navigation', { name: 'Хлебные крошки' })
		await expect(within(nav).getByText('Ультрабук 13"').closest('[aria-current="page"]')).not.toBeNull()

		const catalog = canvas.getByRole('link', { name: 'Каталог' })
		await expect(catalog).toHaveAttribute('href', '/catalog')
		await userEvent.click(catalog)
		await expect(args['onItem-click']).toHaveBeenCalledWith(ITEMS[1])
		await expect(args.onNavigate).toHaveBeenCalledWith('/catalog')
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Пять вариантов. `default` и `ghost` — для шапки страницы, контейнерные `outline`, `shadow`, `soft` — для тулбаров и карточек.
 * Если на странице несколько крошек, дайте каждой своё имя через `aria-label` — так ориентиры различимы для скринридера.
 */
export const Variants: Story = {
	argTypes: { variant: { control: false } },
	parameters: {
		docs: {
			source: { code: BREADCRUMBS_VARIANTS.map(variant => `<BaseBreadcrumbs :items="items" variant="${variant}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseBreadcrumbs },
		setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS), variants: BREADCRUMBS_VARIANTS }),
		template: `
			<div class="story-stack">
				<div v-for="variant in variants" :key="variant" class="story-col">
					<span class="story-label">{{ variant }}</span>
					<BaseBreadcrumbs v-bind="props" :variant="variant" :aria-label="'Хлебные крошки: ' + variant" />
				</div>
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: текст 12–17px, контейнерные варианты — высотой с контрол того же размера (24–40px). */
export const Sizes: Story = {
	args: { variant: 'outline' },
	argTypes: { sizeScale: { control: false } },
	parameters: {
		docs: {
			source: {
				code: SIZE_PRESETS.map(p => `<BaseBreadcrumbs :items="items" variant="outline" :size-scale="${p.sizeScale}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseBreadcrumbs },
		setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-stack">
				<div v-for="preset in presets" :key="preset.name" class="story-col">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseBreadcrumbs v-bind="props" :size-scale="preset.sizeScale" :aria-label="'Хлебные крошки: ' + preset.name" />
				</div>
			</div>
		`,
	}),
}

/** Разделители: `chevron` (по умолчанию), `arrow`, `slash`, `dot`. Своё содержимое — через слот `separator`. */
export const Separators: Story = {
	argTypes: { separator: { control: false } },
	parameters: {
		docs: { source: { code: SEPARATORS.map(separator => `<BaseBreadcrumbs :items="items" separator="${separator}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseBreadcrumbs },
		setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS), separators: SEPARATORS }),
		template: `
			<div class="story-stack">
				<div v-for="separator in separators" :key="separator" class="story-col">
					<span class="story-label">{{ separator }}</span>
					<BaseBreadcrumbs v-bind="props" :separator="separator" :aria-label="'Хлебные крошки: ' + separator" />
				</div>
			</div>
		`,
	}),
}

/**
 * Кастомный цвет через `color`: `text.base` — ссылки, `text.hover` — ссылка под курсором, `text.active` — текущая страница,
 * `bg.base` — фон контейнера (варианты `outline`, `shadow`, `soft`).
 */
export const CustomColor: Story = {
	args: {
		variant: 'soft',
		color: {
			bg: { base: '#eff6ff' },
			text: { base: '#1d4ed8', hover: '#1e3a8a', active: '#172554' },
		},
	},
	play: async ({ canvas }) => {
		await expect(getComputedStyle(canvas.getByRole('link', { name: 'Каталог' })).color).toBe('rgb(29, 78, 216)')
		await expect(getComputedStyle(canvas.getByRole('navigation')).backgroundColor).toBe('rgb(239, 246, 255)')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Без пунктов: ориентир навигации остаётся, список пустой. */
export const Empty: Story = {
	args: { items: [] },
	play: async ({ canvas }) => {
		const list = within(canvas.getByRole('navigation', { name: 'Хлебные крошки' })).getByRole('list')
		await expect(within(list).queryAllByRole('listitem')).toHaveLength(0)
	},
}

/** Длинные названия переносятся по словам, крошки не выходят за ширину контейнера (здесь — 360px). */
export const LongContent: Story = {
	args: { items: LONG_ITEMS },
	render: args => ({
		components: { BaseBreadcrumbs },
		setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS) }),
		template: '<div class="story-narrow"><BaseBreadcrumbs v-bind="props" /></div>',
	}),
	play: async ({ canvas }) => {
		const nav = canvas.getByRole('navigation')
		await expect(nav.scrollWidth).toBeLessThanOrEqual(nav.clientWidth)
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/** Иконки у крошек задаёт поле `icon` (имя из спрайта). */
export const WithIcons: Story = {
	args: { items: ICON_ITEMS },
}

/**
 * `showHome` показывает первую крошку ссылкой-иконкой «домой» (`homeIcon`). Доступное имя ссылки — метка первой крошки,
 * она ведёт на её адрес.
 */
export const WithHome: Story = {
	args: { showHome: true },
	play: async ({ canvas, userEvent, args }) => {
		const home = canvas.getByRole('link', { name: 'Главная' })
		await expect(home).not.toHaveTextContent('Главная')
		await userEvent.click(home)
		await expect(args.onNavigate).toHaveBeenCalledWith('/')
	},
}

/** Слоты `item`, `separator` и `home` заменяют разметку крошки, разделителя и кнопки «домой». */
export const CustomSlots: Story = {
	args: { showHome: true },
	parameters: {
		docs: {
			source: {
				code: [
					'<BaseBreadcrumbs :items="items" show-home>',
					'  <template #home><BaseIcon name="star" /></template>',
					'  <template #separator>—</template>',
					'  <template #item="{ item, index }">{{ index + 1 }}. {{ item.label }}</template>',
					'</BaseBreadcrumbs>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseBreadcrumbs, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS) }),
		template: `
			<BaseBreadcrumbs v-bind="props">
				<template #home><BaseIcon name="star" :size-scale="80" /></template>
				<template #separator>—</template>
				<template #item="{ item, index }">{{ index + 1 }}. {{ item.label }}</template>
			</BaseBreadcrumbs>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('5. Ультрабук 13"')).toBeVisible()
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/** `maxItems` оставляет последние N крошек, остальные сворачиваются в «…»; клик по «…» раскрывает весь путь. */
export const Collapsed: Story = {
	args: { maxItems: 2 },
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.queryByRole('link', { name: 'Каталог' })).toBeNull()
		await userEvent.click(canvas.getByRole('button', { name: '…' }))
		await expect(canvas.getByRole('link', { name: 'Каталог' })).toBeVisible()
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/** Клавиатура: Tab переводит фокус на крошку (видно кольцо фокуса), Enter выполняет переход. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const link = canvas.getByRole('link', { name: 'Главная' })
		await tabTo(link, userEvent)
		await expect(getComputedStyle(link).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await expect(args.onNavigate).toHaveBeenCalledWith('/')
	},
}
