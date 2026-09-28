/**
 * BaseDropdownMenu — stories.
 *
 * Разделы: Default (песочница: меню действий серии) → внешний вид (варианты, размеры, кастомный цвет) →
 * состояния (отключённые пункты, длинные подписи) → сценарии (флажки и переключатели, подменю) → клавиатура.
 * Открытое меню телепортируется в body, поэтому в Docs такие примеры показываются в отдельном фрейме.
 */

import { ref } from 'vue'
import { expect, fn, screen, waitFor, within } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, tabTo, useArgsWithoutSlots } from '@/stories/helpers'
import BaseDropdownMenu from '../ui/BaseDropdownMenu.vue'
import { DROPDOWN_MENU_VARIANTS } from '../model/BaseDropdownMenu.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { DropdownMenuItem } from '../model/BaseDropdownMenu.types'

/** Действия с серией: три группы, подменю экспорта, опасное действие последним */
const EPISODE_ACTIONS: DropdownMenuItem[][] = [
	[
		{ label: 'Переименовать', icon: 'code', shortcut: 'F2' },
		{ label: 'Дублировать', icon: 'copy', shortcut: 'Ctrl+D' },
		{ label: 'Закрепить', icon: 'pin' },
	],
	[
		{
			label: 'Скачать',
			icon: 'download',
			children: [{ label: 'Видео MP4' }, { label: 'Субтитры SRT' }, { label: 'Звуковая дорожка WAV' }],
		},
		{ label: 'Открыть на сайте', icon: 'link', href: 'https://example.com/episodes/3', target: '_blank' },
	],
	[{ label: 'Удалить серию', icon: 'trash', isDanger: true }],
]

/** Открытые панели телепортируются в body и перекрыли бы страницу Docs — там пример показывается во фрейме. */
function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}

const meta = {
	title: 'Overlay/BaseDropdownMenu',
	component: BaseDropdownMenu,
	parameters: {
		docs: {
			description: {
				component: [
					'Меню у кнопки по паттерну APG Menu Button: действия, флажки, переключатели, подменю, ссылки.',
					'',
					'- Кнопка — слот по умолчанию. Кит ставит ей `aria-haspopup="menu"`, `aria-expanded` и `aria-controls`',
					'  сам; `triggerProps` из слота нужен, если кнопка вложена глубже.',
					'- Клавиатура: Enter, Space и стрелка вниз на кнопке открывают меню на первом пункте, стрелка вверх —',
					'  на последнем. В меню стрелки ходят по пунктам по кругу, Home/End — первый и последний, буквы — поиск',
					'  по началу подписи, стрелка вправо открывает подменю, влево — закрывает. Escape закрывает верхнее меню',
					'  и возвращает фокус; Tab из меню не уходит.',
					'- Обычный пункт закрывает меню. Флажок и переключатель по клику и Space остаются открытыми, по Enter — закрывают.',
					'  Состояние отметок хранит приложение: `isChecked` у пункта и `onUpdateChecked`.',
					'- Пункт с `to` или `href` — ссылка (BaseLink). `isDanger` — цвет ошибки для необратимых действий.',
					'- Панель — BaseDropdown: варианты, переворот у края окна, стек слоёв и тема блока — как у неё.',
					'',
					'Меню по правому клику — `BaseContextMenu`, вопрос перед действием — `BasePopconfirm`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: DROPDOWN_MENU_VARIANTS }),
		items: { control: 'object', table: propGroup(ARG_GROUP.content) },
		position: {
			control: 'select',
			options: ['bottom-start', 'bottom', 'bottom-end', 'top-start', 'top', 'top-end', 'right-start', 'left-start'],
			table: propGroup(ARG_GROUP.appearance),
		},
		isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
		default: { control: false },
	},
	args: {
		items: EPISODE_ACTIONS,
		position: 'bottom-start',
		variant: 'default',
		sizeScale: 100,
		onSelect: fn(),
		onClose: fn(),
	},
	render: args => ({
		components: { BaseDropdownMenu, BaseButton, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: `
			<BaseDropdownMenu v-bind="props">
				<BaseButton variant="outline">
					Действия
					<template #right><BaseIcon name="chevron-down" :size-scale="80" /></template>
				</BaseButton>
			</BaseDropdownMenu>
		`,
	}),
} satisfies Meta<typeof BaseDropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/**
 * Песочница: меню действий с серией. Enter на кнопке открывает меню на первом пункте, стрелки ходят по пунктам,
 * Escape закрывает меню и возвращает фокус на кнопку, выбор пункта — тоже.
 */
export const Default: Story = {
	parameters: { docs: docsFrame(320) },
	play: async ({ canvas, userEvent, args }) => {
		const trigger = canvas.getByRole('button', { name: 'Действия' })
		await expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
		await tabTo(trigger, userEvent)

		await userEvent.keyboard('{Enter}')
		const menu = await screen.findByRole('menu', { name: 'Действия' })
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')
		await waitFor(() => expect(within(menu).getByRole('menuitem', { name: /Переименовать/ })).toHaveFocus())

		await userEvent.keyboard('{ArrowDown}')
		await expect(within(menu).getByRole('menuitem', { name: /Дублировать/ })).toHaveFocus()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()

		await userEvent.keyboard('{ArrowUp}')
		await waitFor(() => expect(screen.getByRole('menuitem', { name: /Удалить серию/ })).toHaveFocus())
		await userEvent.keyboard('{Enter}')
		await expect(args.onSelect).toHaveBeenCalledWith(expect.objectContaining({ label: 'Удалить серию' }), expect.anything())
		await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Варианты панели — те же, что у BaseDropdown: default, ghost, outline, shadow, soft. */
export const Variants: Story = {
	parameters: { controls: { include: ['sizeScale'] }, docs: docsFrame(260) },
	render: args => ({
		components: { BaseDropdownMenu, BaseButton },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['isOpen', 'variant', 'items']),
			variants: DROPDOWN_MENU_VARIANTS,
			items: [[{ label: 'Переименовать' }, { label: 'Дублировать' }], [{ label: 'Удалить', isDanger: true }]],
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 160px;">
				<div v-for="variant in variants" :key="variant" style="height: 190px;">
					<BaseDropdownMenu v-bind="props" :items="items" :is-open="true" :variant="variant" :aria-label="variant">
						<BaseButton variant="outline">{{ variant }}</BaseButton>
					</BaseDropdownMenu>
				</div>
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125 — пункты, иконки и отступы панели. */
export const Sizes: Story = {
	parameters: { controls: { include: ['variant'] }, docs: docsFrame(240) },
	render: args => ({
		components: { BaseDropdownMenu, BaseButton },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['isOpen', 'sizeScale', 'items']),
			presets: SIZE_PRESETS,
			sizeLabel,
			items: [
				[
					{ label: 'Копировать', icon: 'copy' },
					{ label: 'Удалить', icon: 'trash' },
				],
			],
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 160px;">
				<div v-for="preset in presets" :key="preset.name" style="height: 170px;">
					<BaseDropdownMenu v-bind="props" :items="items" :is-open="true" :size-scale="preset.sizeScale" :aria-label="sizeLabel(preset)">
						<BaseButton variant="outline" :size-scale="preset.sizeScale">{{ sizeLabel(preset) }}</BaseButton>
					</BaseDropdownMenu>
				</div>
			</div>
		`,
	}),
}

/** Кастомный цвет через `color`: фон панели, фон пункта с фокусом и текст. */
export const CustomColor: Story = {
	args: { color: { bg: { base: 'var(--rise-primary-soft)', hover: 'var(--rise-bg)' }, text: { base: 'var(--rise-primary-text)' } } },
	parameters: { docs: docsFrame(320) },
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Действия' }))
		const menu = await screen.findByRole('menu')
		const panel = menu.closest('.base-dropdown__panel') as HTMLElement
		await expect(panel.style.getPropertyValue('--custom-bg')).toBe('var(--rise-primary-soft)')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/**
 * Отключённые пункты: видны приглушёнными, стрелки их пропускают, клик ничего не делает.
 * Отключённая кнопка (`isDisabled` у BaseButton) меню не открывает.
 */
export const Disabled: Story = {
	args: {
		items: [
			[
				{ label: 'Опубликовать', isDisabled: true },
				{ label: 'Сохранить черновик' },
				{ label: 'Отправить на проверку', isDisabled: true },
				{ label: 'Удалить' },
			],
		],
	},
	parameters: { docs: docsFrame(260) },
	render: args => ({
		components: { BaseDropdownMenu, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: `
			<div class="story-row">
				<BaseDropdownMenu v-bind="props">
					<BaseButton variant="outline">Черновик</BaseButton>
				</BaseDropdownMenu>
				<BaseDropdownMenu v-bind="props" aria-label="Недоступно">
					<BaseButton variant="outline" is-disabled>Архив</BaseButton>
				</BaseDropdownMenu>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Черновик' })
		await tabTo(trigger, userEvent)
		await userEvent.keyboard('{ArrowDown}')
		const menu = await screen.findByRole('menu')
		await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'Сохранить черновик' })).toHaveFocus())
		await expect(within(menu).getByRole('menuitem', { name: 'Опубликовать' })).toHaveAttribute('aria-disabled', 'true')

		await userEvent.keyboard('{ArrowDown}')
		await expect(within(menu).getByRole('menuitem', { name: 'Удалить' })).toHaveFocus()
		await userEvent.keyboard('{Escape}')
		await expect(canvas.getByRole('button', { name: 'Архив' })).toBeDisabled()
	},
}

/** Длинные подписи переносятся по словам; панель не шире 320px. Длинный список прокручивается внутри панели. */
export const LongContent: Story = {
	args: {
		items: [
			[
				{ label: 'Перенести серию в сезон «Северный ветер. Продолжение истории» и обновить нумерацию' },
				{ label: 'Сделать копию для сообщества переводчиков с сохранением таймингов субтитров' },
			],
			Array.from({ length: 12 }, (_, index) => ({ label: `Серия ${index + 1}` })),
		],
	},
	parameters: { docs: docsFrame(400) },
	render: args => ({
		components: { BaseDropdownMenu, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: `
			<BaseDropdownMenu v-bind="props">
				<BaseButton variant="outline">Переместить</BaseButton>
			</BaseDropdownMenu>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Переместить' }))
		const menu = await screen.findByRole('menu')
		const panel = menu.closest('.base-dropdown__panel') as HTMLElement
		await waitFor(() => expect(panel.scrollHeight).toBeGreaterThan(panel.clientHeight))
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Флажки и переключатели: колонки таблицы и сортировка. Клик и Space меняют отметку, меню остаётся открытым;
 * Enter меняет отметку и закрывает меню. Подписи групп называют группы для скринридера.
 */
export const CheckboxesAndRadios: Story = {
	parameters: { controls: { include: ['variant', 'sizeScale'] }, docs: docsFrame(340) },
	render: args => ({
		components: { BaseDropdownMenu, BaseButton },
		setup: () => {
			const columns = ref({ title: true, duration: true, author: false })
			const sort = ref<'date' | 'title'>('date')
			const items = (): DropdownMenuItem[][] => [
				[
					{ type: 'label', label: 'Колонки' },
					...(['title', 'duration', 'author'] as const).map(key => ({
						type: 'checkbox' as const,
						label: { title: 'Название', duration: 'Длительность', author: 'Автор перевода' }[key],
						isChecked: columns.value[key],
						onUpdateChecked: (value: boolean) => (columns.value[key] = value),
					})),
				],
				[
					{ type: 'label', label: 'Сортировка' },
					{ type: 'radio', label: 'По дате', isChecked: sort.value === 'date', onUpdateChecked: () => (sort.value = 'date') },
					{
						type: 'radio',
						label: 'По названию',
						isChecked: sort.value === 'title',
						onUpdateChecked: () => (sort.value = 'title'),
					},
				],
			]
			return { props: useArgsWithoutSlots(args, ['items']), items }
		},
		template: `
			<BaseDropdownMenu v-bind="props" :items="items()">
				<BaseButton variant="outline">Вид таблицы</BaseButton>
			</BaseDropdownMenu>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Вид таблицы' }))
		const menu = await screen.findByRole('menu')
		const author = within(menu).getByRole('menuitemcheckbox', { name: 'Автор перевода' })
		await expect(author).toHaveAttribute('aria-checked', 'false')

		await userEvent.click(author)
		await expect(within(menu).getByRole('menuitemcheckbox', { name: 'Автор перевода' })).toHaveAttribute('aria-checked', 'true')
		await expect(within(menu).getByRole('group', { name: 'Сортировка' })).toBeInTheDocument()

		await userEvent.click(within(menu).getByRole('menuitemradio', { name: 'По названию' }))
		await expect(within(menu).getByRole('menuitemradio', { name: 'По названию' })).toHaveAttribute('aria-checked', 'true')
		await expect(within(menu).getByRole('menuitemradio', { name: 'По дате' })).toHaveAttribute('aria-checked', 'false')

		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
	},
}

/**
 * Подменю: стрелка вправо, Enter или Space на пункте со стрелкой открывают подменю на первом пункте, стрелка влево
 * и Escape закрывают его и возвращают фокус на пункт. Мышью подменю открывается наведением или кликом.
 */
export const Submenu: Story = {
	parameters: { docs: docsFrame(320) },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Действия' }))
		const menu = await screen.findByRole('menu', { name: 'Действия' })
		const download = within(menu).getByRole('menuitem', { name: /Скачать/ })
		await expect(download).toHaveAttribute('aria-haspopup', 'menu')

		download.focus()
		await userEvent.keyboard('{ArrowRight}')
		const submenu = await screen.findByRole('menu', { name: /Скачать/ })
		await waitFor(() => expect(within(submenu).getByRole('menuitem', { name: 'Видео MP4' })).toHaveFocus())
		await expect(download).toHaveAttribute('aria-expanded', 'true')

		await userEvent.keyboard('{ArrowLeft}')
		await waitFor(() => expect(screen.queryByRole('menu', { name: /Скачать/ })).not.toBeInTheDocument())
		await expect(download).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		const reopened = await screen.findByRole('menu', { name: /Скачать/ })
		await userEvent.click(within(reopened).getByRole('menuitem', { name: 'Субтитры SRT' }))
		await expect(args.onSelect).toHaveBeenCalledWith(expect.objectContaining({ label: 'Субтитры SRT' }), expect.anything())
		await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: буква переводит фокус на пункт с этой буквы (повтор — на следующий), Home и End — на первый
 * и последний пункт, Tab не уводит фокус из меню, Escape закрывает меню.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Действия' })
		await tabTo(trigger, userEvent)
		await userEvent.keyboard('{ArrowDown}')
		const menu = await screen.findByRole('menu', { name: 'Действия' })
		await waitFor(() => expect(within(menu).getByRole('menuitem', { name: /Переименовать/ })).toHaveFocus())

		await userEvent.keyboard('з')
		await expect(within(menu).getByRole('menuitem', { name: /Закрепить/ })).toHaveFocus()
		await userEvent.keyboard('{End}')
		await expect(within(menu).getByRole('menuitem', { name: /Удалить серию/ })).toHaveFocus()
		await userEvent.keyboard('{Home}')
		await expect(within(menu).getByRole('menuitem', { name: /Переименовать/ })).toHaveFocus()
		await userEvent.keyboard('{ArrowUp}')
		await expect(within(menu).getByRole('menuitem', { name: /Удалить серию/ })).toHaveFocus()

		await userEvent.tab()
		await expect(within(menu).getByRole('menuitem', { name: /Удалить серию/ })).toHaveFocus()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}
