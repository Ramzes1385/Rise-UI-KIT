import { expect, fn } from 'storybook/test'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, tabTo, useArgsWithoutSlots } from '@/stories/helpers'
import BaseMenu from '../ui/BaseMenu.vue'
import { MENU_VARIANTS } from '../types/BaseMenu.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { BaseMenuItem } from '../types/BaseMenu.types'

const ITEMS: BaseMenuItem[][] = [
	[
		{ label: 'Открыть', icon: 'eye-open-icon' },
		{ label: 'Скачать', icon: 'download' },
		{ label: 'Копировать ссылку', icon: 'link' },
	],
	[
		{ label: 'Переименовать', icon: 'file' },
		{ label: 'Переместить', icon: 'folder' },
	],
	[{ label: 'Удалить', icon: 'trash' }],
]

const SHORT_ITEMS: BaseMenuItem[][] = [
	[
		{ label: 'Открыть', icon: 'eye-open-icon' },
		{ label: 'Скачать', icon: 'download' },
		{ label: 'Удалить', icon: 'trash' },
	],
]

const DISABLED_ITEMS: BaseMenuItem[][] = [
	[
		{ label: 'Открыть', icon: 'eye-open-icon' },
		{ label: 'Опубликовать', icon: 'send', isDisabled: true },
		{ label: 'Скачать', icon: 'download' },
	],
]

const DIVIDER_ITEMS: BaseMenuItem[][] = [
	[{ label: 'Вырезать' }, { label: 'Копировать' }, { label: 'Вставить', hasDivider: true }, { label: 'Выделить всё' }],
	[{ label: 'Свойства' }],
]

const LONG_ITEMS: BaseMenuItem[][] = [
	[
		{ label: 'Экспортировать отчёт о продажах за квартал в формате таблицы', icon: 'download' },
		{ label: 'Отправить ссылку на отчёт руководителю отдела', icon: 'send' },
	],
]

const meta = {
	title: 'Navigation/BaseMenu',
	component: BaseMenu,
	parameters: {
		docs: {
			description: {
				component: [
					'Панель пунктов-действий: контекстное меню файла, меню «ещё» в карточке, список команд.',
					'Кладите её в выпадающую панель (`BaseDropdown`, `BasePopover`) или показывайте на странице.',
					'',
					'- `items` — массив групп: `BaseMenuItem[][]`. Между группами — разделитель; `hasDivider` добавляет линию после пункта.',
					'- Клик, Enter или Space по пункту вызывают его `click()` и событие `select(item)`; отключённый пункт не реагирует.',
					'- Пункты — кнопки (`role="button"`), каждый доступен по Tab. Стрелочной навигации APG Menu нет.',
					'- Ширину задаёт контейнер; минимальная — 180px.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: MENU_VARIANTS }),
		items: { control: 'object', table: propGroup(ARG_GROUP.content) },
		default: { control: false },
	},
	args: {
		items: ITEMS,
		variant: 'default',
		sizeScale: 100,
		onSelect: fn(),
	},
	render: args => ({
		components: { BaseMenu },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: '<div style="width: 240px;"><BaseMenu v-bind="props" /></div>',
	}),
} satisfies Meta<typeof BaseMenu>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: клик по пункту эмитит `select` с этим пунктом. */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Скачать' }))
		await expect(args.onSelect).toHaveBeenCalledWith(ITEMS[0][1])
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Пять вариантов: `default` — плавающая панель; `ghost` — без фона, рамки и тени, для меню внутри другой поверхности;
 * `outline` — выразительная рамка; `shadow` — крупная тень; `soft` — мягкий нейтральный фон.
 */
export const Variants: Story = {
	argTypes: { variant: { control: false } },
	parameters: {
		docs: { source: { code: MENU_VARIANTS.map(variant => `<BaseMenu :items="items" variant="${variant}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseMenu },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: MENU_VARIANTS, items: SHORT_ITEMS }),
		template: `
			<div class="story-grid" style="--story-grid-min: 200px;">
				<div v-for="variant in variants" :key="variant" class="story-col">
					<span class="story-label">{{ variant }}</span>
					<BaseMenu v-bind="props" :items="items" :variant="variant" />
				</div>
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: высота пункта 24–40px, текст и иконки масштабируются пропорционально. */
export const Sizes: Story = {
	argTypes: { sizeScale: { control: false } },
	parameters: {
		docs: { source: { code: SIZE_PRESETS.map(p => `<BaseMenu :items="items" :size-scale="${p.sizeScale}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseMenu },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel, items: SHORT_ITEMS }),
		template: `
			<div class="story-row" style="align-items: flex-start;">
				<div v-for="preset in presets" :key="preset.name" class="story-col">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseMenu v-bind="props" :items="items" :size-scale="preset.sizeScale" />
				</div>
			</div>
		`,
	}),
}

/**
 * Кастомный цвет через `color`: `bg.base` — фон панели, `bg.hover` — фон пункта под курсором,
 * `text.base` и `text.hover` — текст пунктов.
 */
export const CustomColor: Story = {
	args: {
		items: SHORT_ITEMS,
		color: {
			bg: { base: '#1e293b', hover: '#334155' },
			text: { base: '#e2e8f0', hover: '#ffffff' },
		},
	},
	play: async ({ canvas }) => {
		const item = canvas.getByRole('button', { name: 'Открыть' })
		await expect(getComputedStyle(item).color).toBe('rgb(226, 232, 240)')
		await expect(getComputedStyle(item.closest('.base-menu') as HTMLElement).backgroundColor).toBe('rgb(30, 41, 59)')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Отключённый пункт приглушён и помечен `aria-disabled`: клик, Enter и Space не вызывают `select`. */
export const Disabled: Story = {
	args: { items: DISABLED_ITEMS },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Опубликовать' })).toHaveAttribute('aria-disabled', 'true')
		await expect(canvas.getByRole('button', { name: 'Скачать' })).not.toHaveAttribute('aria-disabled')
	},
}

/** Без пунктов остаётся пустая панель. */
export const Empty: Story = {
	args: { items: [] },
	play: async ({ canvas }) => {
		await expect(canvas.queryAllByRole('button')).toHaveLength(0)
	},
}

/** Длинные названия переносятся по словам: меню не шире контейнера (здесь — 240px). */
export const LongContent: Story = {
	args: { items: LONG_ITEMS },
	play: async ({ canvas }) => {
		const item = canvas.getByRole('button', { name: /Экспортировать отчёт/ })
		await expect(item.getBoundingClientRect().width).toBeLessThanOrEqual(240)
		await expect(item.scrollWidth).toBeLessThanOrEqual(item.clientWidth)
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/** Разделители: между группами (вложенные массивы `items`) и после пункта с `hasDivider`. */
export const WithDividers: Story = {
	args: { items: DIVIDER_ITEMS },
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('separator')).toHaveLength(2)
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/** Обработчик `click` у пункта вызывается перед событием `select` — удобно для действий, не зависящих от меню. */
export const ItemClickHandler: Story = {
	args: {
		items: [
			[
				{ label: 'Копировать ссылку', icon: 'link', click: fn() },
				{ label: 'Скачать', icon: 'download' },
			],
		],
	},
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Копировать ссылку' }))
		await expect(args.items[0][0].click).toHaveBeenCalledOnce()
		await expect(args.onSelect).toHaveBeenCalledOnce()
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/** Клавиатура: Tab переводит фокус между пунктами (подсветка и кольцо фокуса), Enter и Space выбирают пункт. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const open = canvas.getByRole('button', { name: 'Открыть' })
		await tabTo(open, userEvent)
		await expect(getComputedStyle(open).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await expect(args.onSelect).toHaveBeenLastCalledWith(ITEMS[0][0])

		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Скачать' })).toHaveFocus()
		await userEvent.keyboard(' ')
		await expect(args.onSelect).toHaveBeenLastCalledWith(ITEMS[0][1])
	},
}
