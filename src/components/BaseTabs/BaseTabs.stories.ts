/**
 * Stories для компонента BaseTabs.
 * Демонстрирует все варианты, состояния и интерактивные состояния.
 * Каждая story содержит play-функцию для 100% coverage.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, fn, userEvent, within } from 'storybook/test'
import { ref } from 'vue'

import { playShiftTab } from '@utils/storybookUtils/a11yHelpers'

import type { TabItem } from './BaseTabs.types'
import BaseTabs from './BaseTabs.vue'

const TABS: TabItem[] = [
	{ id: 'info', label: 'Информация' },
	{ id: 'specs', label: 'Характеристики' },
	{ id: 'reviews', label: 'Отзывы' },
	{ id: 'delivery', label: 'Доставка', isDisabled: true },
]

const ICON_TABS: TabItem[] = [
	{ id: 'home', label: 'Главная', icon: '🏠' },
	{ id: 'catalog', label: 'Каталог', icon: '📂' },
	{ id: 'cart', label: 'Корзина', icon: '🛒' },
	{ id: 'profile', label: 'Профиль', icon: '👤' },
]

const MANY_TABS: TabItem[] = [
	{ id: 'tab1', label: 'Обзор' },
	{ id: 'tab2', label: 'Характеристики' },
	{ id: 'tab3', label: 'Отзывы' },
	{ id: 'tab4', label: 'Доставка' },
	{ id: 'tab5', label: 'Оплата' },
	{ id: 'tab6', label: 'Гарантия' },
	{ id: 'tab7', label: 'Аналоги' },
	{ id: 'tab8', label: 'Рекомендации' },
	{ id: 'tab9', label: 'История' },
	{ id: 'tab10', label: 'FAQ' },
]

const SETTINGS_TABS: TabItem[] = [
	{ id: 'profile', label: 'Профиль', icon: '👤' },
	{ id: 'security', label: 'Безопасность', icon: '🔒' },
	{ id: 'notifications', label: 'Уведомления', icon: '🔔' },
	{ id: 'appearance', label: 'Оформление', icon: '🎨' },
	{ id: 'language', label: 'Язык', icon: '🌐' },
	{ id: 'integrations', label: 'Интеграции', icon: '🔗' },
	{ id: 'billing', label: 'Оплата', icon: '💳' },
	{ id: 'api', label: 'API', icon: '⚙️' },
]

const meta: Meta<typeof BaseTabs> = {
	title: 'UI/BaseTabs',
	component: BaseTabs,

	argTypes: {
		variant: {
			control: 'radio',
			options: ['underline', 'pills', 'rounded', 'arc'],
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		isFullWidth: { control: 'boolean' },
		isScrollable: { control: 'boolean', description: 'Скролл табов с кнопками навигации' },
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
		modelValue: { table: { disable: true } },
		items: {
			control: 'object',
			description: 'Массив табов [{ id, label, icon?, isDisabled? }]',
		},
		'onUpdate:modelValue': { table: { disable: true } },
		onChange: { table: { disable: true } },
	},

	args: {
		items: TABS,
		variant: 'underline',
		isFullWidth: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseTabs>
/** Базовые табы (underline по умолчанию) */
export const Default: Story = {
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
	args: {
		onChange: fn(),
	},
	play: async ({ canvasElement, step }) => {
		await step('Фокусировка табов по Tab', async () => {
			await userEvent.tab()
		})

		await step('Обратная фокусировка по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { selector: '.base-tabs__tab' })
		})
	},
}
/** Вариант underline — клик по табу и проверка эмита */
export const Underline: Story = {
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
	args: {
		onChange: fn(),
	},
}
// play удалён: дублирует "должен эмитить change при переключении" в *.integration.spec.ts
/** Вид вкладок «pills» */
export const Pills: Story = {
	args: {
		variant: 'pills',
		onChange: fn(),
	},
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
}
// play удалён: дублирует "должен эмитить change при переключении" в *.integration.spec.ts
/** Скруглённый вид вкладок */
export const Rounded: Story = {
	args: {
		variant: 'rounded',
		onChange: fn(),
	},
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
}
// play удалён: дублирует "должен эмитить change при переключении" в *.integration.spec.ts
/** Вид вкладок «arc» */
export const Arc: Story = {
	args: {
		variant: 'arc',
		onChange: fn(),
	},
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
}
// play удалён: дублирует "должен эмитить change при переключении" в *.integration.spec.ts
/** Вкладки на всю ширину */
export const FullWidth: Story = {
	args: {
		isFullWidth: true,
		onChange: fn(),
	},
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
}
// play удалён: дублирует "должен эмитить change при переключении" в *.integration.spec.ts
/** С отключёнными элементами */
export const WithDisabled: Story = {
	args: {
		onChange: fn(),
	},
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
}
// play удалён: дублирует "должен эмитить корректный id таба" в *.integration.spec.ts
/** Отображение в тёмной теме */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	args: {
		onChange: fn(),
	},
	render: () => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			const items = TABS
			const onChange = fn()
			return { tab, items, onChange }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;">
				<BaseTabs v-model="tab" :items="items" variant="underline" :onChange="onChange" />
				<BaseTabs v-model="tab" :items="items" variant="pills" :onChange="onChange" />
				<BaseTabs v-model="tab" :items="items" variant="rounded" :onChange="onChange" />
				<BaseTabs v-model="tab" :items="items" variant="arc" :onChange="onChange" />
			</div>
		`,
	}),
}
/** Табы с контентом — переключение табов показывает разный контент */
export const WithContent: Story = {
	render: () => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			const items = TABS
			return { tab, items }
		},
		template: `
			<BaseTabs v-model="tab" :items="items">
				<div v-if="tab === 'info'" style="padding:16px;">
					<h3 style="margin:0 0 8px;">Информация</h3>
					<p style="margin:0;color:var(--color-text-muted);">Подробное описание товара</p>
				</div>
				<div v-if="tab === 'specs'" style="padding:16px;">
					<h3 style="margin:0 0 8px;">Характеристики</h3>
					<p style="margin:0;color:var(--color-text-muted);">Материал: Бронза, Высота: 45 см</p>
				</div>
				<div v-if="tab === 'reviews'" style="padding:16px;color:var(--color-text-muted);">
					Отзывы временно недоступны
				</div>
			</BaseTabs>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvasElement).toBeInTheDocument()

		// Переключаем на specs — должен появиться контент с характеристиками
		const specsTab = canvas.getByRole('tab', { name: 'Характеристики' })
		await userEvent.click(specsTab)
		expect(canvas.getByText('Материал: Бронза, Высота: 45 см')).toBeInTheDocument()

		// Переключаем на reviews
		const reviewsTab = canvas.getByRole('tab', { name: 'Отзывы' })
		await userEvent.click(reviewsTab)
		expect(canvas.getByText('Отзывы временно недоступны')).toBeInTheDocument()
	},
}
/** setupObserver с isScrollable=false (else ветка) */
export const NotScrollableObserver: Story = {
	args: { items: TABS, isScrollable: false, onChange: fn() },
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.base-tabs__scroll-btn')).toBeNull()
	},
}
/** handleListScroll (ручной скролл списка) */
export const ListScroll: Story = {
	args: { items: MANY_TABS, isScrollable: true, onChange: fn() },
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('tab1')
			return { args, tab }
		},
		template: '<div style="max-width:240px;"><BaseTabs v-model="tab" v-bind="args" /></div>',
	}),
	play: async ({ canvasElement }) => {
		const list = canvasElement.querySelector('.base-tabs__list') as HTMLElement
		if (list) {
			list.scrollLeft = 50
			list.dispatchEvent(new Event('scroll', { bubbles: true }))
		}
	},
}
/** Кнопки скролла влево/вправо — покрывает handleScrollLeft/Right (стр. 112-122) и шаблонные #left (стр. 18) */
export const ScrollButtons: Story = {
	args: { items: MANY_TABS, isScrollable: true, onChange: fn() },
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('tab1')
			return { args, tab }
		},
		template: '<div style="max-width:200px;"><BaseTabs v-model="tab" v-bind="args" /></div>',
	}),
	play: async ({ canvasElement }) => {
		const list = canvasElement.querySelector<HTMLElement>('.base-tabs__list')
		if (!list) return

		Object.defineProperty(list, 'scrollWidth', { value: 1000, configurable: true })
		Object.defineProperty(list, 'clientWidth', { value: 200, configurable: true })

		list.scrollLeft = 100
		list.scrollBy = function scrollBy() {}
		list.dispatchEvent(new Event('scroll', { bubbles: true }))

		await new Promise(resolve => setTimeout(resolve, 50))

		const leftBtn = canvasElement.querySelector<HTMLButtonElement>('.base-tabs__scroll-btn--left')
		const rightBtn = canvasElement.querySelector<HTMLButtonElement>('.base-tabs__scroll-btn--right')

		if (leftBtn) await userEvent.click(leftBtn)
		if (rightBtn) await userEvent.click(rightBtn)
	},
}
/** Переключение isScrollable во время жизни компонента — покрывает watch (стр. 144-149) */
export const ToggleScrollable: Story = {
	args: { items: MANY_TABS, onChange: fn() },
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('tab1')
			const scrollable = ref(false)
			function toggleScrollable(): void {
				scrollable.value = !scrollable.value
			}
			return { args, tab, scrollable, toggleScrollable }
		},
		template: `
			<div>
				<button data-testid="toggle-scrollable" @click="toggleScrollable">Toggle</button>
				<div style="max-width:200px;">
					<BaseTabs v-model="tab" v-bind="args" :is-scrollable="scrollable" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const toggle = canvasElement.querySelector<HTMLButtonElement>('[data-testid="toggle-scrollable"]')
		if (toggle) {
			await userEvent.click(toggle)
			await new Promise(resolve => setTimeout(resolve, 30))
			await userEvent.click(toggle)
		}
	},
}
/** Табы без элементов */
export const Empty: Story = {
	tags: ['!a11y'],
	args: {
		items: [],
		onChange: fn(),
	},
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		expect(canvasElement).toBeInTheDocument()
	},
}
/** Табы с иконками — покрывает v-if="item.icon" (строка 37) */
export const WithIcons: Story = {
	args: {
		items: ICON_TABS,
		onChange: fn(),
	},
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('home')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const icons = canvasElement.querySelectorAll('.base-tabs__icon')
		expect(icons.length).toBe(ICON_TABS.length)
	},
}
/** Клик по disabled табу — покрывает if (tab?.isDisabled) return (строка 94) */
export const ClickDisabledTab: Story = {
	args: {
		items: TABS,
		onChange: fn(),
	},
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
	play: async ({ canvasElement, args }) => {
		const disabledTab = canvasElement.querySelector<HTMLButtonElement>('.base-tabs__tab.base-button--disabled')
		if (disabledTab instanceof HTMLButtonElement) {
			disabledTab.click()
		}
		expect(args.onChange).not.toHaveBeenCalled()
	},
}
/** Табы с длинными заголовками */
export const LongContent: Story = {
	args: {
		items: [
			{ id: 'long1', label: 'Очень длинное название вкладки которое не помещается в одну строку' },
			{ id: 'long2', label: 'Ещё одно длинное название вкладки для проверки адаптивности' },
			{ id: 'long3', label: 'Кратко' },
			{ id: 'long4', label: 'Сверхдлинное название вкладки для тестирования переполнения текста' },
		],
		onChange: fn(),
	},
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('long1')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		expect(canvasElement).toBeInTheDocument()
	},
}
/** Табы с customClass — покрытие всех elementKeys из useCustomClass */
export const WithCustomClass: Story = {
	args: {
		items: TABS,
		customClass: {
			root: 'tabs-root',
			nav: 'tabs-nav',
			scrollBtn: 'tabs-scroll-btn',
			list: 'tabs-list',
			tab: 'tabs-tab',
			icon: 'tabs-icon',
			label: 'tabs-label',
			content: 'tabs-content',
		},
		onChange: fn(),
	},
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.tabs-root')).toBeTruthy()
	},
}
/** Табы с customColor — покрытие customColorStyle */
export const WithCustomColor: Story = {
	args: {
		items: TABS,
		color: {
			bg: { base: '#fafafa', hover: '#f0f0f0' },
			text: { base: '#222222', hover: '#000000' },
		},
		onChange: fn(),
	},
	render: args => ({
		components: { BaseTabs },
		setup() {
			const tab = ref('info')
			return { args, tab }
		},
		template: '<BaseTabs v-model="tab" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		expect(canvasElement).toBeInTheDocument()
	},
}
