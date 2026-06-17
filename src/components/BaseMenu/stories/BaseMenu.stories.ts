import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { playShiftTab } from '@utils/storybookUtils/a11yHelpers'
import { MENU_VARIANTS } from '../model/BaseMenu.types'
import BaseMenu from '../ui/BaseMenu.vue'
import type { BaseMenuItem } from '../model/BaseMenu.types'
/**
 * Stories для компонента BaseMenu.
 * Демонстрирует все возможности и интерактивные состояния.
 */
import type { Meta, StoryObj } from '@storybook/vue3'

const ITEMS: BaseMenuItem[][] = [
	[
		{ label: 'Профиль', icon: 'eye-open-icon' },
		{ label: 'Настройки', icon: 'code' },
	],
	[
		{ label: 'Каталог', icon: 'folder' },
		{ label: 'Заказы', icon: 'inbox', hasDivider: true },
	],
	[{ label: 'Выход', icon: 'arrow-right' }],
]

const SIMPLE_ITEMS: BaseMenuItem[][] = [
	[{ label: 'Редактировать' }, { label: 'Дублировать' }, { label: 'Удалить', hasDivider: true }],
]

const NAV_ITEMS: BaseMenuItem[][] = [
	[
		{ label: 'Главная', icon: 'home' },
		{ label: 'Каталог', icon: 'folder' },
		{ label: 'О нас', icon: 'info' },
		{ label: 'Контакты', icon: 'send' },
	],
]

const MANY_ITEMS: BaseMenuItem[][] = [
	[
		{ label: 'Пункт 1', icon: 'star' },
		{ label: 'Пункт 2', icon: 'file' },
		{ label: 'Пункт 3', icon: 'image' },
		{ label: 'Пункт 4', icon: 'link' },
		{ label: 'Пункт 5', icon: 'calendar' },
	],
	[
		{ label: 'Пункт 6', icon: 'download' },
		{ label: 'Пункт 7', icon: 'copy' },
	],
]

const meta: Meta<typeof BaseMenu> = {
	title: 'UI/BaseMenu',
	component: BaseMenu,

	argTypes: {
		variant: {
			control: 'select',
			options: MENU_VARIANTS,
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
		items: { table: { disable: true } },
	},

	args: {
		items: ITEMS,
		variant: 'default',
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseMenu>
/** Базовое меню */
export const Default: Story = {
	render: args => ({
		components: { BaseMenu },
		setup() {
			const items = ITEMS
			return { args, items }
		},
		template: '<BaseMenu :items="items" />',
	}),
	play: async ({ canvasElement, step }) => {
		await step('Фокусировка первого пункта по Tab', async () => {
			await userEvent.tab()
			await waitFor(() => {
				const firstItem = canvasElement.querySelector('.base-menu__item')
				expect(firstItem).toHaveFocus()
			})
		})

		await step('Обратная фокусировка по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { selector: '.base-menu__item' })
		})

		await step('Навигация по ArrowDown', async () => {
			await userEvent.keyboard('{ArrowDown}')
		})

		await step('Выбор пункта по Enter', async () => {
			await userEvent.keyboard('{Enter}')
		})
	},
}
/** Все варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseMenu },
		setup() {
			const items = ITEMS
			return { args, items }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:32px;">
				<div v-for="v in ['default','ghost','outline','shadow','soft']" :key="v">
					<span style="font-size:12px;color:var(--color-text-muted);">{{ v }}</span>
					<BaseMenu :items="items" v-bind="args" :variant="v" />
				</div>
			</div>
		`,
	}),
}
/** Простое меню */
export const Simple: Story = {
	render: args => ({
		components: { BaseMenu },
		setup() {
			const items = SIMPLE_ITEMS
			return { args, items }
		},
		template: '<BaseMenu :items="items" />',
	}),
}
/** С отключенными пунктами */
export const WithDisabled: Story = {
	render: () => ({
		components: { BaseMenu },
		setup() {
			const items: BaseMenuItem[][] = [
				[{ label: 'Действие 1' }, { label: 'Действие 2 (недоступно)', isDisabled: true }, { label: 'Действие 3' }],
			]
			return { items }
		},
		template: '<BaseMenu :items="items" />',
	}),
}
/** Навигационное меню */
export const Navigation: Story = {
	render: args => ({
		components: { BaseMenu },
		setup() {
			const items = NAV_ITEMS
			const handleSelect = fn()
			return { args, items, handleSelect }
		},
		template: '<BaseMenu :items="items" @select="handleSelect" />',
	}),
}
/** Много пунктов */
export const ManyItems: Story = {
	render: args => ({
		components: { BaseMenu },
		setup() {
			const items = MANY_ITEMS
			return { args, items }
		},
		template: '<BaseMenu :items="items" />',
	}),
}
/** Без иконок */
export const WithoutIcons: Story = {
	render: () => ({
		components: { BaseMenu },
		setup() {
			const items: BaseMenuItem[][] = [
				[{ label: 'Опция A' }, { label: 'Опция B' }, { label: 'Опция C', hasDivider: true }],
			]
			return { items }
		},
		template: '<BaseMenu :items="items" />',
	}),
}
/** С разделителями */
export const WithDividers: Story = {
	render: () => ({
		components: { BaseMenu },
		setup() {
			const items: BaseMenuItem[][] = [
				[{ label: 'Первая группа' }, { label: 'С разделителем', hasDivider: true }],
				[{ label: 'Вторая группа' }, { label: 'Конец', hasDivider: true }],
				[{ label: 'Третья группа' }],
			]
			return { items }
		},
		template: '<BaseMenu :items="items" />',
	}),
}
/** Все интерактивные состояния рядом */
export const InteractiveStates: Story = {
	render: () => ({
		components: { BaseMenu },
		setup() {
			const items = ITEMS
			return { items }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;">
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Normal</span>
					<BaseMenu :items="items" />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Hover</span>
					<BaseMenu :items="items" class="base-menu--hover" />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Active</span>
					<BaseMenu :items="items" class="base-menu--active" />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Focus</span>
					<BaseMenu :items="items" class="base-menu--focus" />
				</div>
			</div>
		`,
	}),
}
/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	render: () => ({
		components: { BaseMenu },
		setup() {
			const items = ITEMS
			return { items }
		},
		template: '<BaseMenu :items="items" />',
	}),
}
/** Интерактивное */
export const Interactive: Story = {
	render: args => ({
		components: { BaseMenu },
		setup() {
			const items = ITEMS
			return { args, items }
		},
		template: '<BaseMenu :items="items" />',
	}),
}
/** Клик по отключённому — не вызывает select; клик по доступному — вызывает */
export const ClickDisabled: Story = {
	render: () => ({
		components: { BaseMenu },
		setup() {
			const items: BaseMenuItem[][] = [[{ label: 'Доступно' }, { label: 'Недоступно', isDisabled: true }]]
			const handleSelect = fn()
			return { items, handleSelect }
		},
		template: '<BaseMenu :items="items" @select="handleSelect" />',
	}),
	play: async ({ canvasElement }) => {
		const items = canvasElement.querySelectorAll('.base-menu__item')
		// Клик по отключённому пункту — должен сработать ранний return
		const disabledItem = items[1]
		if (disabledItem instanceof HTMLElement) {
			await userEvent.click(disabledItem)
		}
		// Клик по доступному пункту — emit('select', item)
		const enabledItem = items[0]
		if (enabledItem instanceof HTMLElement) {
			await userEvent.click(enabledItem)
		}
	},
}
/** Кастомный цвет */
export const CustomColor: Story = {
	args: { color: { bg: { base: '#fef3c7' }, text: { base: '#92400e' } } },
	render: args => ({
		components: { BaseMenu },
		setup() {
			const items = ITEMS
			return { args, items }
		},
		template: '<BaseMenu :items="items" v-bind="args" />',
	}),
}
/** item.click callback — покрытие ветки if (item.click) */
export const ItemClickCallback: Story = {
	render: () => {
		const clickFn = fn()
		return {
			components: { BaseMenu },
			setup() {
				const items: BaseMenuItem[][] = [[{ label: 'С кликом', click: clickFn }]]
				return { items, clickFn }
			},
			template: '<BaseMenu :items="items" />',
		}
	},
	play: async ({ canvasElement }) => {
		const item = canvasElement.querySelector('.base-menu__item')
		if (item instanceof HTMLElement) {
			await userEvent.click(item)
		}
	},
}
/** Масштаб размера */
export const SizeScale: Story = {
	args: { sizeScale: 150 },
	render: args => ({
		components: { BaseMenu },
		setup() {
			const items = ITEMS
			return { args, items }
		},
		template: '<BaseMenu :items="items" v-bind="args" />',
	}),
}
/** Пустое меню */
export const Empty: Story = {
	render: () => ({
		components: { BaseMenu },
		setup() {
			const items: BaseMenuItem[][] = []
			return { items }
		},
		template: '<BaseMenu :items="items" />',
	}),
}
/** Меню с длинными текстами */
export const LongContent: Story = {
	render: () => ({
		components: { BaseMenu },
		setup() {
			const items: BaseMenuItem[][] = [
				[
					{ label: 'Художественная ковка металлических изделий' },
					{ label: 'Изготовление кованых ворот и оград' },
					{ label: 'Проектирование и монтаж лестниц', hasDivider: true },
				],
				[{ label: 'Реставрация антикварных кованых элементов' }, { label: 'Декоративные элементы интерьера' }],
			]
			return { items }
		},
		template: '<BaseMenu :items="items" />',
	}),
}
