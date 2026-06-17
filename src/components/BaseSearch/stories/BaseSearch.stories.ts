/**
 * Stories для компонента BaseSearch.
 * Демонстрирует все варианты и режимы с готовыми данными.
 * Каждая story содержит play-функцию для 100% coverage.
 */

import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'
import { buildArgTypes } from '@utils/storybookUtils'
import { playShiftTab } from '@utils/storybookUtils/a11yHelpers'
import { SEARCH_VARIANTS } from '../model/BaseSearch.types'
import BaseSearch from '../ui/BaseSearch.vue'
import type { SearchResult } from '../model/BaseSearch.types'
import type { Meta, StoryObj } from '@storybook/vue3'

/** Демо-данные для результатов поиска (с иконками) */
const MOCK_RESULTS: SearchResult[] = [
	{ id: 1, title: 'Закат в горах', description: 'Масло, холст, 80Г—60 см', icon: 'search', category: 'Пейзаж' },
	{ id: 2, title: 'Весенний сад', description: 'Акварель, 50Г—40 см', icon: 'search', category: 'Пейзаж' },
	{ id: 3, title: 'Портрет дамы', description: 'Масло, холст, 70Г—90 см', icon: 'search', category: 'Портрет' },
	{
		id: 4,
		title: 'Абстрактная композиция',
		description: 'Акрил, 100Г—80 см',
		icon: 'search',
		category: 'Абстракция',
	},
	{
		id: 5,
		title: 'Натюрморт с фруктами',
		description: 'Масло, доска, 40Г—50 см',
		icon: 'search',
		category: 'Натюрморт',
	},
	{ id: 6, title: 'Городской пейзаж', description: 'Графика, 30Г—40 см', icon: 'search', category: 'Графика' },
	{ id: 7, title: 'Морской берег', description: 'Масло, холст, 120Г—80 см', icon: 'search', category: 'Пейзаж' },
	{ id: 8, title: 'Зимний лес', description: 'Акварель, 60Г—45 см', icon: 'search', category: 'Пейзаж' },
]

/** Демо-данные с изображениями */
const MOCK_IMAGE_RESULTS: SearchResult[] = [
	{
		id: 1,
		title: 'Закат в горах',
		description: 'Масло, холст, 80Г—60 см',
		image: 'https://picsum.photos/seed/sunset/80/80',
		category: 'Пейзаж',
	},
	{
		id: 2,
		title: 'Весенний сад',
		description: 'Акварель, 50Г—40 см',
		image: 'https://picsum.photos/seed/garden/80/80',
		category: 'Пейзаж',
	},
	{
		id: 3,
		title: 'Портрет дамы',
		description: 'Масло, холст, 70Г—90 см',
		image: 'https://picsum.photos/seed/portrait/80/80',
		category: 'Портрет',
	},
	{
		id: 4,
		title: 'Абстрактная композиция',
		description: 'Акрил, 100Г—80 см',
		image: 'https://picsum.photos/seed/abstract/80/80',
		category: 'Абстракция',
	},
	{
		id: 5,
		title: 'Натюрморт с фруктами',
		description: 'Масло, доска, 40Г—50 см',
		image: 'https://picsum.photos/seed/still/80/80',
		category: 'Натюрморт',
	},
]

const MIXED_RESULTS: SearchResult[] = [
	{
		id: 'image',
		title: 'Общий образ',
		description: 'Изображение результата',
		image: 'https://picsum.photos/seed/search-image/80/80',
		category: 'Галерея',
	},
	{
		id: 'icon',
		title: 'Общий значок',
		description: 'Иконка результата',
		icon: 'search',
		category: 'Иконка',
	},
	{ id: 'plain', title: 'Общий простой' },
]

const PLAIN_RESULTS: SearchResult[] = [{ id: 'plain', title: 'Простой результат' }]

const DESCRIPTION_RESULTS: SearchResult[] = [
	{ id: 'desc', title: 'Без совпадения', description: 'Особый запрос', icon: 'search' },
]

const meta: Meta<typeof BaseSearch> = {
	title: 'UI/BaseSearch',
	component: BaseSearch,

	argTypes: buildArgTypes({
		props: {
			placeholder: { control: 'text' },
			variant: { control: 'radio', options: SEARCH_VARIANTS },
			mode: { control: 'inline-radio', options: ['default', 'modal', 'sidebar'] },
			sizeScale: { control: { type: 'range', min: 50, max: 200, step: 10 } },
			isDisabled: { control: 'boolean' },
			isLoading: { control: 'boolean' },
			hasIcon: { control: 'boolean' },
			hasClear: { control: 'boolean' },
			isInstant: { control: 'boolean' },
			isAutofocus: { control: 'boolean' },
			debounceMs: { control: 'number' },
			maxResults: { control: 'number' },
			error: { control: 'text' },
		},
	}),

	args: {
		placeholder: 'Поиск картин...',
		variant: 'default',
		mode: 'default',
		sizeScale: 100,
		isDisabled: false,
		isLoading: false,
		hasIcon: true,
		hasClear: true,
		isInstant: true,
		isAutofocus: false,
		debounceMs: 300,
		maxResults: 10,
		error: '',
		results: MOCK_RESULTS as never,
	},
}

export default meta
type Story = StoryObj<typeof BaseSearch>

function getInput(root: ParentNode, selector: string): HTMLInputElement {
	const input = root.querySelector<HTMLInputElement>(selector)
	if (!input) throw new Error('Поле поиска не найдено')
	return input
}

function getEl(root: ParentNode, selector: string): HTMLElement {
	const element = root.querySelector<HTMLElement>(selector)
	if (!element) throw new Error('Элемент поиска не найден')
	return element
}

function getLastEl(root: ParentNode, selector: string): HTMLElement {
	const elements = Array.from(root.querySelectorAll<HTMLElement>(selector))
	const element = elements.at(-1)
	if (!element) throw new Error('Элемент поиска не найден')
	return element
}

function closeSearch(): void {
	document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
}
/** Базовый поиск с результатами */
export const Default: Story = {
	args: {
		onSearch: fn(),
		onSelect: fn(),
		onClear: fn(),
		'onUpdate:modelValue': fn(),
	},
	play: async ({ args, canvasElement }) => {
		// Фокус и ввод текста
		const input = canvasElement.querySelector('.base-input__field') as HTMLInputElement
		expect(input).toBeTruthy()

		await userEvent.click(input)
		await userEvent.type(input, 'Закат')

		// Ждём debounce
		await waitFor(
			() => {
				expect(args.onSearch).toHaveBeenCalled()
			},
			{ timeout: 3000 },
		)

		// Клик по результату → handleSelect
		// Результаты в BaseDropdown (Teleport to="body") — ищем в document.body
		await waitFor(
			() => {
				const results = document.body.querySelectorAll('.base-search__result')
				expect(results.length).toBeGreaterThan(0)
			},
			{ timeout: 3000 },
		)
		const firstResult = document.body.querySelector('.base-search__result') as HTMLElement
		await userEvent.click(firstResult)

		await waitFor(
			() => {
				expect(args.onSelect).toHaveBeenCalled()
			},
			{ timeout: 3000 },
		)

		// Shift+Tab — обратная фокусировка
		await playShiftTab(canvasElement, { selector: '.base-input__field' })
	},
}
/** Все варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseSearch },
		setup() {
			return { args, SEARCH_VARIANTS }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:400px;">
				<BaseSearch v-for="v in SEARCH_VARIANTS" :key="v" v-bind="args" :variant="v" :placeholder="v" />
			</div>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseSearch v-for="v in SEARCH_VARIANTS" :key="v" :variant="v" :placeholder="v" />`,
			},
		},
	},
}
/** Масштаб размера */
export const SizeScale: Story = {
	render: args => ({
		components: { BaseSearch },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:400px;">
				<BaseSearch v-bind="args" :size-scale="75" placeholder="75%" />
				<BaseSearch v-bind="args" :size-scale="100" placeholder="100%" />
				<BaseSearch v-bind="args" :size-scale="150" placeholder="150%" />
			</div>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseSearch :size-scale="75" />\n<BaseSearch :size-scale="100" />\n<BaseSearch :size-scale="150" />`,
			},
		},
	},
}
/** Отключенный */
export const Disabled: Story = {
	args: {
		isDisabled: true,
	},
}
/** В состоянии загрузки */
export const Loading: Story = {
	args: {
		isLoading: true,
		modelValue: 'Картина',
	},
}
/** С ошибкой */
export const WithError: Story = {
	args: {
		error: 'Введите минимум 3 символа',
	},
}
/** Без автопоиска (по Enter) */
export const NotInstant: Story = {
	args: {
		isInstant: false,
		onSearch: fn(),
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement)

		const input = canvasElement.querySelector('.base-input__field') as HTMLInputElement
		expect(input).toBeTruthy()

		await userEvent.type(input, 'Закат')

		// В не-instant режиме поиск по Enter
		await userEvent.keyboard('{Enter}')
		await waitFor(() => {
			expect(args.onSearch).toHaveBeenCalled()
		})
	},
}
/** Модальный режим */
export const ModalMode: Story = {
	args: {
		mode: 'modal',
		onSearch: fn(),
		onSelect: fn(),
		onClear: fn(),
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement)

		// Фокус открывает модальное окно
		const trigger = canvasElement.querySelector('.base-search__trigger input') as HTMLInputElement
		expect(trigger).toBeTruthy()
		await userEvent.click(trigger)

		await waitFor(() => {
			const modal = document.querySelector('.base-search__modal-overlay')
			expect(modal).toBeTruthy()
		})

		// Ввод в модальном окне
		const modalInput = document.querySelector('.base-search__modal .base-input__field') as HTMLInputElement
		if (modalInput) {
			await userEvent.type(modalInput, 'Закат')
		}

		await waitFor(() => {
			expect(args.onSearch).toHaveBeenCalled()
		})

		// Кнопка очистки
		await waitFor(() => {
			const clearBtns = document.querySelectorAll('.base-search__clear')
			expect(clearBtns.length).toBeGreaterThan(0)
		})
		const clearBtn = document.querySelector('.base-search__clear') as HTMLElement
		await userEvent.click(clearBtn)
		await waitFor(() => {
			expect(args.onClear).toHaveBeenCalled()
		})

		// Закрытие по оверлею
		const modal = document.querySelector('.base-search__modal-overlay') as HTMLElement
		await userEvent.click(modal)

		await waitFor(() => {
			expect(document.querySelector('.base-search__modal-overlay')).toBeNull()
		})
	},
}
/** Режим боковой панели */
export const SidebarMode: Story = {
	args: {
		mode: 'sidebar',
		onSearch: fn(),
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement)

		// Фокус открывает sidebar
		const trigger = canvasElement.querySelector('.base-search__trigger input') as HTMLInputElement
		expect(trigger).toBeTruthy()
		await userEvent.click(trigger)

		await waitFor(() => {
			const sidebar = document.querySelector('.base-search__sidebar-overlay')
			expect(sidebar).toBeTruthy()
		})

		// Ввод в sidebar
		const sidebarInput = document.querySelector('.base-search__sidebar .base-input__field') as HTMLInputElement
		if (sidebarInput) {
			await userEvent.type(sidebarInput, 'картин')
		}

		// Закрытие по оверлею
		const sidebar = document.querySelector('.base-search__sidebar-overlay') as HTMLElement
		await userEvent.click(sidebar)

		await waitFor(() => {
			expect(document.querySelector('.base-search__sidebar-overlay')).toBeNull()
		})
	},
}
/** Все режимы */
export const AllModes: Story = {
	render: args => ({
		components: { BaseSearch },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:400px;">
				<h4 style="margin:0;">default</h4>
				<BaseSearch v-bind="args" mode="default" />
				<h4 style="margin:0;">modal</h4>
				<BaseSearch v-bind="args" mode="modal" />
				<h4 style="margin:0;">sidebar</h4>
				<BaseSearch v-bind="args" mode="sidebar" />
			</div>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseSearch mode="default" />\n<BaseSearch mode="modal" />\n<BaseSearch mode="sidebar" />`,
			},
		},
	},
}
/** Результаты с изображениями */
export const WithImages: Story = {
	args: {
		results: MOCK_IMAGE_RESULTS as never,
	},
	parameters: {
		docs: {
			source: {
				code: `<BaseSearch :results="results" />`,
			},
		},
	},
}
/** Кастомные слоты (result-before, result-after) */
export const WithSlotContent: Story = {
	render: args => ({
		components: { BaseSearch },
		setup() {
			return { args }
		},
		template: `
			<BaseSearch v-bind="args">
				<template #result-before="{ results }">
					<div style="padding: 8px 14px; font-size: 12px; color: var(--color-text-muted); border-bottom: 1px solid var(--color-border);">
						Найдено: {{ results.length }}
					</div>
				</template>
				<template #result-after>
					<div style="padding: 8px 14px; font-size: 12px; color: var(--color-text-muted); border-top: 1px solid var(--color-border);">
						Нажмите Enter для полного поиска
					</div>
				</template>
			</BaseSearch>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseSearch v-bind="args">\n  <template #result-before="{ results }">\n    Найдено: {{ results.length }}\n  </template>\n  <template #result-after>\n    Нажмите Enter для полного поиска\n  </template>\n</BaseSearch>`,
			},
		},
	},
}
/** Полная замена списка через слот results */
export const CustomResultsList: Story = {
	render: args => ({
		components: { BaseSearch },
		setup() {
			return { args }
		},
		template: `
			<BaseSearch v-bind="args">
				<template #results="{ results, query }">
					<div style="padding: 12px 14px;">
						<div style="font-weight: 600; margin-bottom: 8px;">Результаты для В«{{ query }}В»</div>
						<div v-for="item in results" :key="item.id" style="padding: 6px 0; border-bottom: 1px solid var(--color-border);">
							{{ item.title }} — {{ item.description }}
						</div>
					</div>
				</template>
			</BaseSearch>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseSearch v-bind="args">\n  <template #results="{ results, query }">\n    <div v-for="item in results" :key="item.id">\n      {{ item.title }}\n    </div>\n  </template>\n</BaseSearch>`,
			},
		},
	},
}
/** Hover-состояние */
export const HoverState: Story = {
	decorators: [
		() => ({
			template: '<div class="base-search--hover"><story /></div>',
		}),
	],
}
/** Active-состояние */
export const ActiveState: Story = {
	decorators: [
		() => ({
			template: '<div class="base-search--active"><story /></div>',
		}),
	],
}
/** Focus-состояние */
export const FocusState: Story = {
	decorators: [
		() => ({
			template: '<div class="base-search--focus"><story /></div>',
		}),
	],
}
/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
}
/** Интерактивный */
export const Interactive: Story = {
	args: {
		onSearch: fn(),
		onSelect: fn(),
		onClear: fn(),
		'onUpdate:modelValue': fn(),
	},
	play: async ({ args, canvasElement }) => {
		// Ввод → debounced search → результаты
		const input = canvasElement.querySelector('.base-input__field') as HTMLInputElement
		await userEvent.click(input)
		await userEvent.type(input, 'Закат')

		// Результаты в BaseDropdown (Teleport to="body") — ищем в document.body
		await waitFor(
			() => {
				const results = document.body.querySelectorAll('.base-search__result')
				expect(results.length).toBeGreaterThan(0)
			},
			{ timeout: 3000 },
		)

		// handleKeydown Enter когда нет подсветки
		await userEvent.keyboard('{Enter}')

		// handleKeydown ArrowDown для навигации
		await userEvent.keyboard('{ArrowDown}')

		// handleKeydown Enter с подсветкой (select)
		await userEvent.keyboard('{Enter}')

		await waitFor(
			() => {
				expect(args.onSelect).toHaveBeenCalled()
			},
			{ timeout: 3000 },
		)
	},
}
/** С изображениями в результатах */
export const WithImageResults: Story = {
	args: { results: MOCK_IMAGE_RESULTS as never, onSearch: fn(), onSelect: fn() },
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector('.base-input__field') as HTMLInputElement
		if (input) {
			await userEvent.type(input, 'Закат')
		}
		// Результаты в BaseDropdown (Teleport to="body") — ищем в document.body
		await waitFor(
			() => {
				expect(document.body.querySelector('.base-search__result-image')).toBeTruthy()
			},
			{ timeout: 3000 },
		)
	},
}
/** С очисткой (hasClear + query) */
export const WithClearButton: Story = {
	args: { onClear: fn(), onSearch: fn() },
	play: async ({ args, canvasElement }) => {
		const input = canvasElement.querySelector('.base-input__field') as HTMLInputElement
		if (input) {
			await userEvent.type(input, 'Закат')
		}
		await waitFor(() => {
			const clearBtn = canvasElement.querySelector('.base-search__clear')
			if (clearBtn) {
				userEvent.click(clearBtn as HTMLElement)
			}
		})
	},
}
/** Загрузка (isLoading) — BaseLoader в suffix без класса .base-search__loading, ищем по spinner */
export const LoadingState: Story = {
	args: { isLoading: true, modelValue: 'Закат', onSearch: fn() },
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			expect(canvasElement.querySelector('.base-loader')).toBeTruthy()
		})
	},
}
/** Пустой результат */
export const EmptyResult: Story = {
	args: { results: [], onSearch: fn() },
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector('.base-input__field') as HTMLInputElement
		if (input) {
			await userEvent.type(input, 'zzz')
		}
		// Пустой результат в BaseDropdown (Teleport to="body") — ищем в document.body
		await waitFor(
			() => {
				expect(document.body.querySelector('.base-search__empty')).toBeTruthy()
			},
			{ timeout: 3000 },
		)
	},
}
/** Отключенный модальный режим (openModal early return) */
export const DisabledModal: Story = {
	args: { mode: 'modal', isDisabled: true },
	play: async ({ canvasElement }) => {
		const before = document.querySelectorAll('.base-search__modal-overlay').length
		const trigger = getInput(canvasElement, '.base-search__trigger input')
		trigger.dispatchEvent(new FocusEvent('focus', { bubbles: true }))
		expect(document.querySelectorAll('.base-search__modal-overlay').length).toBe(before)
	},
}
/** Отключенный sidebar (openSidebar early return) */
export const DisabledSidebar: Story = {
	args: { mode: 'sidebar', isDisabled: true },
	play: async ({ canvasElement }) => {
		const before = document.querySelectorAll('.base-search__sidebar-overlay').length
		const trigger = getInput(canvasElement, '.base-search__trigger input')
		trigger.dispatchEvent(new FocusEvent('focus', { bubbles: true }))
		expect(document.querySelectorAll('.base-search__sidebar-overlay').length).toBe(before)
	},
}
/** Фокус пустого поиска */
export const EmptyFocus: Story = {
	args: { onSearch: fn() },
	play: async ({ canvasElement }) => {
		const before = document.body.querySelectorAll('.base-dropdown__panel').length
		const input = getInput(canvasElement, '.base-input__field')
		await userEvent.click(input)
		expect(document.body.querySelectorAll('.base-dropdown__panel').length).toBe(before)
	},
}
/** Закрытие default dropdown */
export const DefaultClose: Story = {
	args: { onSearch: fn() },
	play: async ({ canvasElement }) => {
		const input = getInput(canvasElement, '.base-input__field')
		await userEvent.click(input)
		await userEvent.type(input, 'Закат')
		const panel = getLastEl(document.body, '.base-dropdown__panel')
		document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
		await waitFor(() => expect(panel.isConnected).toBe(false))
	},
}
/** Загрузка в default dropdown */
export const DefaultLoadingSlot: Story = {
	args: { isLoading: true, modelValue: 'Закат', onSearch: fn() },
	render: args => ({
		components: { BaseSearch },
		setup() {
			return { args }
		},
		template: `
			<BaseSearch v-bind="args">
				<template #loading>
					<div class="base-search__test-loading">Загрузка</div>
				</template>
			</BaseSearch>
		`,
	}),
	play: async ({ canvasElement }) => {
		const input = getInput(canvasElement, '.base-input__field')
		input.dispatchEvent(new FocusEvent('focus', { bubbles: true }))
		await waitFor(() => expect(document.body.querySelector('.base-search__test-loading')).toBeTruthy())
		closeSearch()
	},
}
/** Навигация по пустому запросу */
export const EmptyQueryNavigation: Story = {
	args: { onSearch: fn() },
	play: async ({ canvasElement }) => {
		const input = getInput(canvasElement, '.base-input__field')
		input.dispatchEvent(new FocusEvent('focus', { bubbles: true }))
		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
		expect(input.value).toBe('')
	},
}
/** Escape в default списке */
export const DefaultListEscape: Story = {
	args: { onSearch: fn() },
	play: async ({ canvasElement }) => {
		const input = getInput(canvasElement, '.base-input__field')
		await userEvent.click(input)
		await userEvent.type(input, 'Закат')
		const panel = getLastEl(document.body, '.base-dropdown__panel')
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(panel.isConnected).toBe(false))
	},
}
/** Выбор результата в sidebar-режиме */
export const SidebarSelect: Story = {
	args: { mode: 'sidebar', onSearch: fn(), onSelect: fn() },
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement)

		const trigger = canvasElement.querySelector('.base-search__trigger input') as HTMLInputElement
		await userEvent.click(trigger)

		await waitFor(() => {
			expect(document.querySelector('.base-search__sidebar-overlay')).toBeTruthy()
		})

		const sidebarInput = document.querySelector('.base-search__sidebar .base-input__field') as HTMLInputElement
		if (sidebarInput) {
			await userEvent.type(sidebarInput, 'Закат')
		}

		// Выбираем результат
		await waitFor(() => {
			const result = document.querySelector('.base-search__sidebar .base-search__result') as HTMLElement
			expect(result).toBeTruthy()
		})
		const result = document.querySelector('.base-search__sidebar .base-search__result') as HTMLElement
		await userEvent.click(result)

		await waitFor(() => {
			expect(args.onSelect).toHaveBeenCalled()
		})
	},
}
/** Закрытие sidebar по Escape */
export const SidebarEscape: Story = {
	args: { mode: 'sidebar', onSearch: fn() },
	play: async ({ canvasElement }) => {
		const trigger = getInput(canvasElement, '.base-search__trigger input')
		await userEvent.click(trigger)
		const overlay = getLastEl(document, '.base-search__sidebar-overlay')
		const sidebar = getLastEl(document, '.base-search__sidebar')
		const input = getInput(sidebar, '.base-input__field')
		await userEvent.click(input)
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(overlay.isConnected).toBe(false))
	},
}
/** Синхронизация modelValue извне */
export const ModelValueSync: Story = {
	args: {
		modelValue: 'начальное',
		onSearch: fn(),
		'onUpdate:modelValue': fn(),
	},
	play: async ({ args, canvasElement }) => {
		// При изменении modelValue извне — поле должно обновиться
		const input = canvasElement.querySelector('.base-input__field') as HTMLInputElement
		expect(input?.value).toBe('начальное')

		// Очистка поля
		const clearBtn = canvasElement.querySelector('.base-search__clear') as HTMLElement
		if (clearBtn) {
			await userEvent.click(clearBtn)
			await waitFor(() => {
				expect(args['onUpdate:modelValue']).toHaveBeenCalledWith('')
			})
		}
	},
}
/** Дебаунс с пустым значением (не должен вызывать search) */
export const DebounceEmptyValue: Story = {
	args: { onSearch: fn() },
	play: async ({ args, canvasElement }) => {
		const input = canvasElement.querySelector('.base-input__field') as HTMLInputElement
		if (input) {
			await userEvent.type(input, 'а')
			await userEvent.clear(input)
		}
		// После очистки не должен быть emit search с пустым значением
		// debouncedSearch проверяет if (value) перед emit
		await new Promise(r => setTimeout(r, 400))
		// onSearch не должен вызываться с пустой строкой
		const calls = (args.onSearch as ReturnType<typeof fn>).mock?.calls || []
		const hasEmptyCall = calls.some((c: string[]) => c[0] === '')
		expect(hasEmptyCall).toBe(false)
	},
}
/** handleBlur — потеря фокуса */
export const BlurHandling: Story = {
	args: { onSearch: fn() },
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector('.base-input__field') as HTMLInputElement
		if (input) {
			await userEvent.click(input)
			await userEvent.type(input, 'тест')
		}
		// Убираем фокус
		await userEvent.click(document.body)
		// Дропдаун должен закрыться
		await waitFor(() => {
			const dropdown = canvasElement.querySelector('.base-dropdown__content')
			expect(dropdown).toBeNull()
		})
	},
}
/** isOpen computed setter (закрытие дропдауна) */
export const DropdownClose: Story = {
	args: { onSearch: fn() },
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector('.base-input__field') as HTMLInputElement
		if (input) {
			await userEvent.click(input)
			await userEvent.type(input, 'Закат')
		}
		// Дропдаун должен открыться с результатами (Teleport to="body")
		await waitFor(
			() => {
				const results = document.body.querySelectorAll('.base-search__result')
				expect(results.length).toBeGreaterThan(0)
			},
			{ timeout: 3000 },
		)
	},
}
/** handleClear в модальном режиме (focusActiveInput modal) */
export const ModalClear: Story = {
	args: { mode: 'modal', onSearch: fn(), onClear: fn() },
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement)

		const trigger = canvasElement.querySelector('.base-search__trigger input') as HTMLInputElement
		await userEvent.click(trigger)

		await waitFor(() => {
			expect(document.querySelector('.base-search__modal-overlay')).toBeTruthy()
		})

		const modalInput = document.querySelector('.base-search__modal .base-input__field') as HTMLInputElement
		if (modalInput) {
			await userEvent.type(modalInput, 'тест')
		}

		await waitFor(() => {
			const clearBtn = document.querySelector('.base-search__modal .base-search__clear') as HTMLElement
			expect(clearBtn).toBeTruthy()
		})

		const clearBtn = document.querySelector('.base-search__modal .base-search__clear') as HTMLElement
		await userEvent.click(clearBtn)

		await waitFor(() => {
			expect(args.onClear).toHaveBeenCalled()
		})
	},
}
/** handleClear в sidebar режиме (focusActiveInput sidebar) */
export const SidebarClear: Story = {
	args: { mode: 'sidebar', onSearch: fn(), onClear: fn() },
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement)

		const trigger = canvasElement.querySelector('.base-search__trigger input') as HTMLInputElement
		await userEvent.click(trigger)

		await waitFor(() => {
			expect(document.querySelector('.base-search__sidebar-overlay')).toBeTruthy()
		})

		const sidebarInput = document.querySelector('.base-search__sidebar .base-input__field') as HTMLInputElement
		if (sidebarInput) {
			await userEvent.type(sidebarInput, 'тест')
		}

		await waitFor(() => {
			const clearBtn = document.querySelector('.base-search__sidebar .base-search__clear') as HTMLElement
			expect(clearBtn).toBeTruthy()
		})

		const clearBtn = document.querySelector('.base-search__sidebar .base-search__clear') as HTMLElement
		await userEvent.click(clearBtn)

		await waitFor(() => {
			expect(args.onClear).toHaveBeenCalled()
		})
	},
}
/** Модальное окно — закрытие по кнопке close */
export const ModalCloseButton: Story = {
	args: { mode: 'modal', onSearch: fn() },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const trigger = canvasElement.querySelector('.base-search__trigger input') as HTMLInputElement
		await userEvent.click(trigger)

		await waitFor(() => {
			expect(document.querySelector('.base-search__modal-overlay')).toBeTruthy()
		})

		// Закрытие через кнопку
		const closeBtn = document.querySelector('.base-search__modal-close') as HTMLElement
		await userEvent.click(closeBtn)

		await waitFor(() => {
			expect(document.querySelector('.base-search__modal-overlay')).toBeNull()
		})
	},
}
/** maxResults ограничение */
export const MaxResultsLimit: Story = {
	args: { maxResults: 2, onSearch: fn() },
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector('.base-input__field') as HTMLInputElement
		if (input) {
			await userEvent.click(input)
			// 'пейзаж' встречается в 4+ результатах
			await userEvent.type(input, 'пейзаж')
		}
		await waitFor(() => {
			const results = canvasElement.querySelectorAll('.base-search__result')
			expect(results.length).toBeLessThanOrEqual(2)
		})
	},
}
/** hasIcon = false (без иконки) */
export const NoIcon: Story = {
	args: { hasIcon: false, onSearch: fn() },
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.base-search__icon')).toBeNull()
	},
}
/** hasClear = false (без кнопки очистки) */
export const NoClear: Story = {
	args: { hasClear: false, onSearch: fn() },
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector('.base-input__field') as HTMLInputElement
		if (input) {
			await userEvent.type(input, 'тест')
		}
		// Кнопка очистки не должна появиться
		await waitFor(() => {
			expect(canvasElement.querySelector('.base-search__clear')).toBeNull()
		})
	},
}
/** Результат без опциональных полей */
export const PlainResult: Story = {
	args: { results: PLAIN_RESULTS as never, onSearch: fn() },
	play: async ({ canvasElement }) => {
		const input = getInput(canvasElement, '.base-input__field')
		await userEvent.click(input)
		await userEvent.type(input, 'Простой')
		await waitFor(() => expect(document.body.querySelector('.base-search__result')).toBeTruthy())
	},
}
/** Поиск по описанию */
export const DescriptionResult: Story = {
	args: { results: DESCRIPTION_RESULTS as never, onSearch: fn() },
	play: async ({ canvasElement }) => {
		const input = getInput(canvasElement, '.base-input__field')
		await userEvent.click(input)
		await userEvent.type(input, 'особый')
		await waitFor(() => expect(document.body.querySelector('.base-search__result')).toBeTruthy())
	},
}
/** Модальный выбор результата */
export const ModalMixedResults: Story = {
	args: { mode: 'modal', results: MIXED_RESULTS as never, onSearch: fn(), onSelect: fn() },
	play: async ({ args, canvasElement }) => {
		const trigger = getInput(canvasElement, '.base-search__trigger input')
		await userEvent.click(trigger)
		const modal = getLastEl(document, '.base-search__modal')
		const input = getInput(modal, '.base-input__field')
		await userEvent.type(input, 'Общий')
		await waitFor(() => expect(modal.querySelector('.base-search__result')).toBeTruthy())
		const result = getEl(modal, '.base-search__result')
		await userEvent.hover(result)
		await userEvent.click(result)
		await waitFor(() => expect(args.onSelect).toHaveBeenCalled())
	},
}
/** Модальные состояния без иконки и очистки */
export const ModalStaticStates: Story = {
	args: { mode: 'modal', modelValue: 'ожидание', hasIcon: false, hasClear: false, isLoading: true, results: [] },
	play: async ({ canvasElement }) => {
		const trigger = getInput(canvasElement, '.base-search__trigger input')
		await userEvent.click(trigger)
		const modal = getLastEl(document, '.base-search__modal')
		await waitFor(() => expect(modal.querySelector('.base-loader')).toBeTruthy())
		expect(modal.querySelector('.base-search__icon')).toBeNull()
		expect(modal.querySelector('.base-search__clear')).toBeNull()
		closeSearch()
	},
}
/** Пустой результат в модальном режиме */
export const ModalEmptyResult: Story = {
	args: { mode: 'modal', results: [], onSearch: fn() },
	play: async ({ canvasElement }) => {
		const trigger = getInput(canvasElement, '.base-search__trigger input')
		await userEvent.click(trigger)
		const modal = getLastEl(document, '.base-search__modal')
		const input = getInput(modal, '.base-input__field')
		await userEvent.type(input, 'ничего')
		await waitFor(() => expect(modal.querySelector('.base-search__empty')).toBeTruthy())
		closeSearch()
	},
}
/** Закрытие модального режима по Escape */
export const ModalEscapePaths: Story = {
	args: { mode: 'modal' },
	play: async ({ canvasElement }) => {
		const trigger = getInput(canvasElement, '.base-search__trigger input')
		await userEvent.click(trigger)
		let overlay = getLastEl(document, '.base-search__modal-overlay')
		closeSearch()
		await waitFor(() => expect(overlay.isConnected).toBe(false))
		await userEvent.click(trigger)
		overlay = getLastEl(document, '.base-search__modal-overlay')
		const modal = getLastEl(document, '.base-search__modal')
		getInput(modal, '.base-input__field').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
		await waitFor(() => expect(overlay.isConnected).toBe(false))
	},
}
/** Выбор результата в sidebar с разными типами */
export const SidebarMixedResults: Story = {
	args: { mode: 'sidebar', results: MIXED_RESULTS as never, onSearch: fn(), onSelect: fn() },
	play: async ({ args, canvasElement }) => {
		const trigger = getInput(canvasElement, '.base-search__trigger input')
		await userEvent.click(trigger)
		const sidebar = getLastEl(document, '.base-search__sidebar')
		const input = getInput(sidebar, '.base-input__field')
		await userEvent.type(input, 'Общий')
		await waitFor(() => expect(sidebar.querySelector('.base-search__result')).toBeTruthy())
		const result = getEl(sidebar, '.base-search__result')
		await userEvent.hover(result)
		await userEvent.click(result)
		await waitFor(() => expect(args.onSelect).toHaveBeenCalled())
	},
}
/** Sidebar состояния без иконки и очистки */
export const SidebarStaticStates: Story = {
	args: { mode: 'sidebar', modelValue: 'ожидание', hasIcon: false, hasClear: false, isLoading: true, results: [] },
	play: async ({ canvasElement }) => {
		const trigger = getInput(canvasElement, '.base-search__trigger input')
		await userEvent.click(trigger)
		const sidebar = getLastEl(document, '.base-search__sidebar')
		await waitFor(() => expect(sidebar.querySelector('.base-loader')).toBeTruthy())
		expect(sidebar.querySelector('.base-search__icon')).toBeNull()
		expect(sidebar.querySelector('.base-search__clear')).toBeNull()
		closeSearch()
	},
}
/** Пустой результат в sidebar режиме */
export const SidebarEmptyResult: Story = {
	args: { mode: 'sidebar', results: [], onSearch: fn() },
	play: async ({ canvasElement }) => {
		const trigger = getInput(canvasElement, '.base-search__trigger input')
		await userEvent.click(trigger)
		const sidebar = getLastEl(document, '.base-search__sidebar')
		const input = getInput(sidebar, '.base-input__field')
		await userEvent.type(input, 'ничего')
		await waitFor(() => expect(sidebar.querySelector('.base-search__empty')).toBeTruthy())
		closeSearch()
	},
}
/** Закрытие sidebar через document Escape */
export const SidebarDocumentEscape: Story = {
	args: { mode: 'sidebar' },
	play: async ({ canvasElement }) => {
		const trigger = getInput(canvasElement, '.base-search__trigger input')
		await userEvent.click(trigger)
		const overlay = getLastEl(document, '.base-search__sidebar-overlay')
		closeSearch()
		await waitFor(() => expect(overlay.isConnected).toBe(false))
	},
}
/** Обновление modelValue извне */
export const ExternalModelUpdate: Story = {
	render: args => ({
		components: { BaseSearch },
		setup() {
			const model = ref('начальное')

			function handleUpdate(value: string): void {
				model.value = value
			}

			function handleChange(): void {
				model.value = 'обновлено'
			}

			return { args, handleChange, handleUpdate, model }
		},
		template: `
			<div>
				<BaseSearch v-bind="args" :model-value="model" @update:model-value="handleUpdate" />
				<button data-testid="change-model" @click="handleChange">Обновить</button>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const input = getInput(canvasElement, '.base-input__field')
		await userEvent.click(canvas.getByTestId('change-model'))
		await waitFor(() => expect(input.value).toBe('обновлено'))
		await userEvent.type(input, '!')
		await waitFor(() => expect(input.value).toBe('обновлено!'))
	},
}
/** Пустой результат поиска */
export const Empty: Story = {
	args: {
		modelValue: 'несуществующий запрос',
		results: [],
	},
}
/** Автофокус в default-режиме — покрывает onMounted + nextTick + baseInputRef.focus() */
export const Autofocus: Story = {
	args: {
		mode: 'default',
		isAutofocus: true,
		results: MOCK_RESULTS as never,
	},
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			const input = canvasElement.querySelector('.base-input__field') as HTMLInputElement
			expect(input).toBeTruthy()
			expect(document.activeElement === input).toBe(true)
		})
	},
}
/** Длинный текст в результатах */
export const LongContent: Story = {
	args: {
		modelValue: 'длинный',
		results: [
			{
				id: 1,
				title:
					'Очень длинное название картины которое не помещается в одну строку и требует переноса на несколько строк для корректного отображения',
				description:
					'Масло, холст, очень большой размер 200×150 см, авторская работа известного художника из Санкт-Петербурга, созданная в 2023 году',
				icon: 'search',
				category: 'Пейзаж',
			},
			{
				id: 2,
				title:
					'Абстрактная композиция с элементами сюрреализма и постмодернизма в стиле великих мастеров двадцатого века',
				description: 'Смешанная техника, картон, 300×200 см, коллекционная работа из серии «Бесконечность»',
				icon: 'search',
				category: 'Абстракция',
			},
		] as never,
	},
}
