/**
 * BaseSplitButton — stories.
 *
 * Разделы: Default (песочница) → внешний вид (варианты, размеры) → состояния (отключено, загрузка) → клавиатура.
 */

import { expect, fn, waitFor } from 'storybook/test'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, tabTo, useArgsWithoutSlots } from '@/stories/helpers'
import { SPLIT_BUTTON_VARIANTS } from '../model/BaseSplitButton.types'
import BaseSplitButton from '../ui/BaseSplitButton.vue'
import type { DropdownMenuItems } from '@components/BaseDropdownMenu'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const ITEMS: DropdownMenuItems = [
	[
		{ label: 'Сохранить как черновик', icon: 'file' },
		{ label: 'Сохранить и закрыть' },
	],
	[{ label: 'Удалить черновик', icon: 'trash', isDanger: true }],
]

const meta = {
	title: 'Element/BaseSplitButton',
	component: BaseSplitButton,
	parameters: {
		docs: {
			description: {
				component: [
					'Кнопка с меню: основное действие по клику и несколько похожих в меню справа («Сохранить» и «Сохранить как…»).',
					'',
					'- Две кнопки в группе: основная эмитит `click`, кнопка меню («Другие действия», `menuLabel`) открывает BaseDropdownMenu (APG Menu Button).',
					'- Пункты меню — формат BaseDropdownMenu: иконки, группы, опасные действия, ссылки; выбор — событие `select`.',
					'- `isLoading` занимает основную кнопку, меню остаётся доступным; `isDisabled` отключает обе.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: SPLIT_BUTTON_VARIANTS }),
		label: { control: 'text', table: propGroup(ARG_GROUP.content) },
		items: { control: 'object', table: propGroup(ARG_GROUP.content) },
		menuLabel: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	},
	args: {
		label: 'Сохранить',
		items: ITEMS,
		isDisabled: false,
		isLoading: false,
		variant: 'default',
		sizeScale: 100,
		onClick: fn(),
		onSelect: fn(),
	},
	render: args => ({
		components: { BaseSplitButton },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: '<BaseSplitButton v-bind="props" />',
	}),
} satisfies Meta<typeof BaseSplitButton>

export default meta
type Story = StoryObj<typeof meta>

/** Песочница: основное действие и меню других. */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Сохранить' }))
		await expect(args.onClick).toHaveBeenCalledTimes(1)
		await userEvent.click(canvas.getByRole('button', { name: 'Другие действия' }))
		const item = await waitFor(() => document.querySelector('[role="menuitem"]') as HTMLElement)
		await userEvent.click(item)
		await expect(args.onSelect).toHaveBeenCalledWith(expect.objectContaining({ label: 'Сохранить как черновик' }), expect.anything())
	},
}

/** Варианты — как у BaseButton. */
export const Variants: Story = {
	parameters: { controls: { include: ['sizeScale'] } },
	render: args => ({
		components: { BaseSplitButton },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant']), variants: SPLIT_BUTTON_VARIANTS }),
		template: '<div class="story-row"><BaseSplitButton v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" /></div>',
	}),
}

/** Размеры через `sizeScale`. */
export const Sizes: Story = {
	parameters: { controls: { include: ['variant'] } },
	render: args => ({
		components: { BaseSplitButton },
		setup: () => ({ props: useArgsWithoutSlots(args, ['sizeScale', 'label']), presets: SIZE_PRESETS.filter(preset => ['xs', 'md', 'xl'].includes(preset.name)), sizeLabel }),
		template: '<div class="story-row"><BaseSplitButton v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :label="sizeLabel(preset)" /></div>',
	}),
}

/** Отключено: обе кнопки недоступны. */
export const Disabled: Story = {
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Сохранить' })).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Другие действия' })).toBeDisabled()
	},
}

/** Загрузка: основная кнопка занята, меню доступно. */
export const Loading: Story = {
	args: { isLoading: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: /Сохранить/ })).toHaveAttribute('aria-busy', 'true')
		await expect(canvas.getByRole('button', { name: 'Другие действия' })).toBeEnabled()
	},
}

/** Клавиатура: Tab — основная кнопка, Tab — кнопка меню, Enter открывает меню с фокусом на первом пункте. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		await tabTo(canvas.getByRole('button', { name: 'Сохранить' }), userEvent)
		await userEvent.tab()
		const toggle = canvas.getByRole('button', { name: 'Другие действия' })
		await expect(toggle).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(document.querySelector('[role="menuitem"]')).toHaveFocus())
		await userEvent.keyboard('{Escape}')
		await expect(toggle).toHaveFocus()
	},
}
