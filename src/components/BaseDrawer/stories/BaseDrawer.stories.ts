/**
 * BaseDrawer — stories.
 *
 * Разделы: Default (песочница: панель открывается кнопкой, isOpen синхронизирован с Controls) → края окна → клавиатура.
 * Stories с открытой панелью в play видны только в сайдбаре: в Docs панель закрыла бы страницу.
 */

import { ref } from 'vue'
import { expect, fn, screen, waitFor, within } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import { BaseCheckboxGroup } from '@components/BaseCheckboxGroup'
import { ARG_GROUP, baseArgTypes, hiddenArgTypes, propGroup, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'
import BaseDrawer from '../ui/BaseDrawer.vue'
import { DRAWER_DIRECTIONS } from '../types/BaseDrawer.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const STATUSES = [
	{ value: 'new', label: 'Новые' },
	{ value: 'paid', label: 'Оплаченные' },
	{ value: 'shipped', label: 'Отгруженные' },
]

const meta = {
	title: 'Overlay/BaseDrawer',
	component: BaseDrawer,
	parameters: {
		docs: {
			description: {
				component: [
					'Выдвижная панель у края окна: нижний лист на телефоне (фильтры, действия, корзина) или панель сверху и сбоку.',
					'',
					'- Открытие и закрытие — `v-model:is-open`; закрывают кнопка «Закрыть», Escape, клик по затемнению',
					'  и перетаскивание за ручку или шапку к краю дальше четверти панели (`isDraggable`).',
					'- Доступность как у BaseModal: `role="dialog"`, `aria-modal`, имя из `title` (или `ariaLabel`),',
					'  описание из `description`, фокус заперт в панели и возвращается к кнопке, прокрутка страницы заблокирована.',
					'- `direction`: `bottom`, `top`, `left`, `right`; `hasHandle` — полоска-ручка; слоты `header` и `footer`.',
					'',
					'Панель во всю высоту для форм и деталей записи — BaseSlideover; диалог по центру — BaseModal.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes(),
		...hiddenArgTypes('variant'),
		isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		title: { control: 'text', table: propGroup(ARG_GROUP.content) },
		description: { control: 'text', table: propGroup(ARG_GROUP.content) },
		ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
		direction: { control: 'inline-radio', options: DRAWER_DIRECTIONS, table: propGroup(ARG_GROUP.appearance) },
		hasHandle: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		hasOverlay: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		isDraggable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		closeOnOverlay: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		closeOnEscape: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		default: { control: false },
		header: { control: false },
		footer: { control: false },
	},
	args: {
		isOpen: false,
		title: 'Фильтры',
		description: 'Заказы за сентябрь',
		direction: 'bottom',
		hasHandle: true,
		hasOverlay: true,
		isDraggable: true,
		closeOnOverlay: true,
		closeOnEscape: true,
		sizeScale: 100,
		onClose: fn(),
	},
	// isOpen хранится в args: кнопка открывает панель, закрытие панели обновляет Controls
	render: args => {
		const onUpdate = useModelArg('isOpen')
		return {
			components: { BaseDrawer, BaseButton, BaseCheckboxGroup },
			setup: () => ({ props: useArgsWithoutSlots(args), onUpdate, statuses: STATUSES, selected: ref(['paid']) }),
			template: `
				<BaseButton variant="outline" @click="onUpdate(true)">Открыть фильтры</BaseButton>
				<BaseDrawer v-bind="props" @update:is-open="onUpdate">
					<BaseCheckboxGroup v-model="selected" :options="statuses" label="Статус" is-vertical />
					<template #footer>
						<BaseButton variant="outline" @click="onUpdate(false)">Сбросить</BaseButton>
						<BaseButton @click="onUpdate(false)">Показать</BaseButton>
					</template>
				</BaseDrawer>
			`,
		}
	},
} satisfies Meta<typeof BaseDrawer>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: нижний лист с фильтрами. Закрывается кнопкой, Escape, затемнением и перетаскиванием вниз. */
export const Default: Story = {
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть фильтры' }))
		const dialog = await screen.findByRole('dialog', { name: 'Фильтры' })
		await expect(dialog).toHaveAccessibleDescription('Заказы за сентябрь')
		await userEvent.click(within(dialog).getByRole('button', { name: 'Закрыть' }))
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
	},
}

// ─── Края окна ─────────────────────────────────────────────────────────────────

/** `direction`: снизу, сверху, слева, справа — у каждой панели скругление у внутреннего края. */
export const Directions: Story = {
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseDrawer, BaseButton },
		setup: () => {
			const openDirection = ref<string | null>(null)
			return {
				props: useArgsWithoutSlots(args, ['isOpen', 'direction', 'title', 'description']),
				directions: DRAWER_DIRECTIONS,
				openDirection,
			}
		},
		template: `
			<div class="story-row">
				<BaseButton v-for="direction in directions" :key="direction" variant="outline" @click="openDirection = direction">{{ direction }}</BaseButton>
			</div>
			<BaseDrawer
				v-for="direction in directions"
				:key="direction"
				v-bind="props"
				:direction="direction"
				:title="'Панель: ' + direction"
				:is-open="openDirection === direction"
				@update:is-open="openDirection = null">
				<p style="margin: 0">Содержимое панели.</p>
			</BaseDrawer>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'left' }))
		const dialog = await screen.findByRole('dialog', { name: 'Панель: left' })
		await expect(dialog).toHaveClass('base-drawer__panel--left')
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
	},
}

// ─── Клавиатура ────────────────────────────────────────────────────────────────

/** Клавиатура: Enter открывает панель, фокус внутри, Escape закрывает и возвращает фокус на кнопку. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Открыть фильтры' })
		await tabTo(trigger, userEvent)
		await userEvent.keyboard('{Enter}')
		const dialog = await screen.findByRole('dialog', { name: 'Фильтры' })
		await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await waitFor(() => expect(trigger).toHaveFocus())
	},
}
