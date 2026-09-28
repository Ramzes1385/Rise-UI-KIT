/** Меню телепортируется в body, поэтому в Docs примеры показываются в отдельном фрейме. */

import { BaseText } from '@components/BaseText'
import BaseContextMenu from '../ui/BaseContextMenu.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu'
import { expect, fn, screen, waitFor, within } from 'storybook/test'
import { CONTEXT_MENU_VARIANTS } from '../types/BaseContextMenu.types'
import { ARG_GROUP, baseArgTypes, propGroup, tabTo, useArgsWithoutSlots } from '@/stories/helpers'

const EPISODE_ACTIONS: DropdownMenuItem[][] = [
	[
		{ label: 'Открыть', icon: 'play' },
		{ label: 'Копировать ссылку', icon: 'link', shortcut: 'Ctrl+L' },
		{ label: 'Переместить', icon: 'folder', children: [{ label: 'Сезон 1' }, { label: 'Сезон 2' }, { label: 'Архив' }] },
	],
	[{ label: 'Удалить', icon: 'trash', isDanger: true }],
]

function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}

/** Область с карточкой серии: у неё есть фокус, чтобы меню открывалось и с клавиатуры */
const AREA_TEMPLATE = `
	<BaseContextMenu v-bind="props">
		<div tabindex="0" role="group" class="story-stack" aria-label="Серия 3. Правый клик или Shift+F10 — действия" style="max-width: 320px; padding: 16px; border: 1px dashed var(--rise-border-accented); border-radius: var(--rise-radius-lg);">
			<BaseText :weight="600">Серия 3 · «Туман над заливом»</BaseText>
			<BaseText>Правый клик по карточке, клавиша «Меню» или Shift+F10 — действия с серией.</BaseText>
		</div>
	</BaseContextMenu>
`

const meta = {
	title: 'Overlay/BaseContextMenu',
	component: BaseContextMenu,
	parameters: {
		docs: {
			description: {
				component: [
					'Меню по правому клику на области: карточка, строка таблицы, холст редактора.',
					'',
					'- Открывается правым кликом у указателя, клавишей «Меню» или Shift+F10 — у элемента с фокусом.',
					'  У края окна меню сдвигается внутрь.',
					'- Пункты, клавиатура, подменю, флажки и ссылки — как у `BaseDropdownMenu`. После выбора пункта фокус',
					'  возвращается на элемент, с которого меню открыли.',
					'- `isDisabled` — своё меню отключено, открывается меню браузера.',
					'- Правый клик — не единственный путь: действие из контекстного меню должно быть доступно и иначе',
					'  (кнопка «…», меню у кнопки).',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: CONTEXT_MENU_VARIANTS }),
		items: { control: 'object', table: propGroup(ARG_GROUP.content) },
		ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		default: { control: false },
	},
	args: {
		items: EPISODE_ACTIONS,
		isDisabled: false,
		variant: 'default',
		sizeScale: 100,
		onSelect: fn(),
	},
	render: args => ({
		components: { BaseContextMenu, BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: AREA_TEMPLATE,
	}),
} satisfies Meta<typeof BaseContextMenu>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: правый клик по карточке открывает меню у указателя; выбор пункта закрывает меню. */
export const Default: Story = {
	parameters: { docs: docsFrame(300) },
	play: async ({ canvas, userEvent, args }) => {
		const card = canvas.getByText('Серия 3 · «Туман над заливом»')
		await userEvent.pointer({ keys: '[MouseRight]', target: card })
		const menu = await screen.findByRole('menu', { name: 'Контекстное меню' })
		await expect(menu).toHaveFocus()

		await userEvent.keyboard('{ArrowDown}')
		await expect(within(menu).getByRole('menuitem', { name: /Открыть/ })).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await expect(args.onSelect).toHaveBeenCalledWith(expect.objectContaining({ label: 'Открыть' }), expect.anything())
		await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Кастомный цвет через `color`: фон панели, фон пункта с фокусом и текст. */
export const CustomColor: Story = {
	args: { color: { bg: { base: 'var(--rise-primary-soft)', hover: 'var(--rise-bg)' }, text: { base: 'var(--rise-primary-text)' } } },
	parameters: { docs: docsFrame(300) },
	play: async ({ canvas, userEvent }) => {
		await userEvent.pointer({ keys: '[MouseRight]', target: canvas.getByText('Серия 3 · «Туман над заливом»') })
		const menu = await screen.findByRole('menu')
		await expect((menu.closest('.base-dropdown__panel') as HTMLElement).style.getPropertyValue('--custom-bg')).toBe(
			'var(--rise-primary-soft)',
		)
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Отключённое меню (`isDisabled`): правый клик открывает меню браузера, своё меню не появляется. */
export const Disabled: Story = {
	args: { isDisabled: true },
	play: async ({ canvas, userEvent }) => {
		const area = canvas.getByRole('group', { name: /Серия 3/ })
		await tabTo(area, userEvent)
		await userEvent.keyboard('{Shift>}{F10}{/Shift}')
		await expect(screen.queryByRole('menu')).not.toBeInTheDocument()
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: Shift+F10 (или клавиша «Меню») на карточке открывает меню у неё с фокусом на первом пункте.
 * Стрелка вправо открывает подменю, Escape закрывает подменю, затем меню, и фокус возвращается на карточку.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const area = canvas.getByRole('group', { name: /Серия 3/ })
		await tabTo(area, userEvent)
		await userEvent.keyboard('{Shift>}{F10}{/Shift}')
		const menu = await screen.findByRole('menu', { name: 'Контекстное меню' })
		await waitFor(() => expect(within(menu).getByRole('menuitem', { name: /Открыть/ })).toHaveFocus())

		await userEvent.keyboard('{End}{ArrowUp}{ArrowRight}')
		const submenu = await screen.findByRole('menu', { name: /Переместить/ })
		await waitFor(() => expect(within(submenu).getByRole('menuitem', { name: 'Сезон 1' })).toHaveFocus())

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('menu', { name: /Переместить/ })).not.toBeInTheDocument())
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
		await expect(area).toHaveFocus()
	},
}
