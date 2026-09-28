import { ref } from 'vue'
import { expect, fn, waitFor } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import {
	ARG_GROUP,
	baseArgTypes,
	propGroup,
	SIZE_PRESETS,
	sizeLabel,
	STORY_USERS,
	StoryRouterLink,
	tabTo,
	useArgsWithoutSlots,
	useModelArg,
} from '@/stories/helpers'
import BaseSideBar from '../ui/BaseSideBar.vue'
import { SIDEBAR_VARIANTS } from '../types/BaseSideBar.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { SideBarItem } from '../types/BaseSideBar.types'

const BASIC_ITEMS: SideBarItem[] = [
	{ key: 'dashboard', label: 'Главная', icon: 'home', to: '/dashboard' },
	{ key: 'inbox', label: 'Входящие', icon: 'inbox', to: '/inbox', badge: 4 },
	{ key: 'calendar', label: 'Календарь', icon: 'calendar', to: '/calendar' },
]

const NAVIGATION_ITEMS: SideBarItem[] = [
	{ key: 'dashboard', label: 'Главная', icon: 'home', to: '/dashboard' },
	{
		key: 'catalog',
		label: 'Каталог',
		icon: 'folder',
		to: '/catalog',
		children: [
			{ key: 'products', label: 'Товары', to: '/catalog/products', badge: 12 },
			{ key: 'categories', label: 'Категории', to: '/catalog/categories' },
			{ key: 'archive', label: 'Архив', to: '/catalog/archive', isDisabled: true },
		],
	},
	{ key: 'inbox', label: 'Входящие', icon: 'inbox', to: '/inbox', badge: 4 },
	{ key: 'calendar', label: 'Календарь', icon: 'calendar', to: '/calendar', hasDivider: true },
	{
		key: 'settings',
		label: 'Настройки',
		icon: 'list-bullet',
		children: [
			{ key: 'profile', label: 'Профиль', to: '/settings/profile' },
			{ key: 'security', label: 'Безопасность', to: '/settings/security' },
		],
	},
	{ key: 'locked', label: 'Недоступно', icon: 'x-circle', isDisabled: true },
]

const LONG_ITEMS: SideBarItem[] = [
	{ key: 'reports', label: 'Отчёты о продажах по регионам и каналам сбыта', icon: 'file', to: '/reports' },
	{ key: 'contracts', label: 'Договоры с поставщиками комплектующих', icon: 'folder', to: '/contracts' },
]

const ACTION_ITEMS: SideBarItem[] = [
	{ key: 'new-report', label: 'Создать отчёт', icon: 'plus' },
	{ key: 'export', label: 'Выгрузить данные', icon: 'download', badge: 'новое' },
	{ key: 'archive', label: 'Архивировать', icon: 'folder', isDisabled: true },
]

const USER = STORY_USERS[0]

/** Подвал с профилем: аватар и имя. В свёрнутой панели имя не выводится — остаётся аватар. */
const PROFILE_FOOTER = `
	<template #footer>
		<div class="story-row" style="flex-wrap: nowrap; gap: 8px;">
			<BaseAvatar :src="user.avatar" :name="user.name" :size-scale="80" />
			<span v-if="!props.isCollapsed">{{ user.name }}</span>
		</div>
	</template>
`

/** Сайдбар занимает высоту родителя: в примерах родитель — область фиксированной высоты. */
const FRAME_STYLE = 'display: flex; height: 520px;'

const SLOT_KEYS = ['default', 'header', 'footer', 'navigation', 'collapsedContent', 'item', 'icon', 'label', 'badge']

const meta = {
	title: 'Navigation/BaseSideBar',
	component: BaseSideBar,
	parameters: {
		docs: {
			description: {
				component: [
					'Боковая панель приложения: заголовок, навигация, произвольное содержимое и подвал; сворачивается до полосы иконок.',
					'',
					'- Навигацию задаёт `items`: пункты с `to` — ссылки (`linkComponent`: `a` или RouterLink), без `to` — кнопки;',
					'  `children` — вложенный уровень, `badge`, `hasDivider`, `isDisabled`. Пункт без `to` с детьми раскрывается по клику.',
					'- Текущий пункт определяют `activePath` + `activeMatch`, `activeKey` или `isActive`; он помечен `aria-current="page"`.',
					'- `v-model:isCollapsed` управляет свёрнутым состоянием; без него панель сворачивается сама. В свёрнутой панели у пунктов',
					'  остаются иконки, подсказки и доступные имена.',
					'- Сайдбар занимает всю высоту родителя. Варианты: `default` — панель с рамкой справа; `ghost` — без фона и рамки;',
					'  `outline`, `shadow` — отдельная панель со скруглением; `soft` — мягкий фон.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: SIDEBAR_VARIANTS }),
		title: { control: 'text', table: propGroup(ARG_GROUP.content) },
		items: { control: 'object', table: propGroup(ARG_GROUP.content) },
		width: { control: { type: 'range', min: 200, max: 400, step: 20 }, table: propGroup(ARG_GROUP.appearance) },
		collapsedWidth: { control: { type: 'range', min: 48, max: 96, step: 4 }, table: propGroup(ARG_GROUP.appearance) },
		padding: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
		gap: { control: { type: 'range', min: 0, max: 12, step: 1 }, table: propGroup(ARG_GROUP.appearance) },
		isCollapsed: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isCollapsible: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		activePath: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
		activeMatch: { control: 'inline-radio', options: ['exact', 'startsWith'], table: propGroup(ARG_GROUP.behavior) },
		activeKey: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
		linkComponent: { control: false, table: propGroup(ARG_GROUP.behavior) },
		default: { control: false },
		header: { control: false },
		footer: { control: false },
		navigation: { control: false },
		collapsedContent: { control: false },
		item: { control: false },
		icon: { control: false },
		label: { control: false },
		badge: { control: false },
	},
	args: {
		title: 'Панель управления',
		items: NAVIGATION_ITEMS,
		isCollapsed: false,
		isCollapsible: true,
		isLoading: false,
		activePath: '/catalog/products',
		activeMatch: 'startsWith',
		linkComponent: StoryRouterLink,
		variant: 'default',
		width: 280,
		collapsedWidth: 68,
		gap: 4,
		sizeScale: 100,
		'onUpdate:isCollapsed': fn(),
		onCollapse: fn(),
		onExpand: fn(),
		onItemClick: fn(),
	},
	// Свёрнутое состояние хранится в args: кнопка сворачивания меняет Controls, а изменение в Controls — панель.
	render: args => {
		const onUpdate = useModelArg('isCollapsed')
		return {
			components: { BaseSideBar, BaseAvatar },
			setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS), onUpdate, user: USER, frameStyle: FRAME_STYLE }),
			template: `
				<div :style="frameStyle">
					<BaseSideBar v-bind="props" @update:is-collapsed="onUpdate">${PROFILE_FOOTER}</BaseSideBar>
				</div>
			`,
		}
	},
} satisfies Meta<typeof BaseSideBar>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/**
 * Песочница: текущая страница «Товары» (`activePath`), её раздел «Каталог» раскрыт и выделен; «Настройки» — группа,
 * раскрывающаяся по клику. Кнопка в шапке сворачивает панель.
 */
export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: /Товары/ })).toHaveAttribute('aria-current', 'page')
		await expect(canvas.getByRole('button', { name: 'Настройки' })).toHaveAttribute('aria-expanded', 'false')
		await expect(canvas.getByRole('button', { name: 'Недоступно' })).toBeDisabled()
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Пять вариантов: `default` — панель с рамкой справа (край окна); `ghost` — без фона и рамки; `outline` и `shadow` —
 * отдельная панель со скруглением; `soft` — мягкий нейтральный фон.
 */
export const Variants: Story = {
	argTypes: { variant: { control: false } },
	parameters: {
		docs: {
			source: {
				code: SIDEBAR_VARIANTS.map(variant => `<BaseSideBar :items="items" variant="${variant}" title="${variant}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...SLOT_KEYS, 'isCollapsed', 'onUpdate:isCollapsed', 'title', 'items', 'variant', 'width']),
			variants: SIDEBAR_VARIANTS,
			items: BASIC_ITEMS,
			collapsed: ref<Record<string, boolean>>(
				Object.fromEntries(SIDEBAR_VARIANTS.map(variant => [variant, Boolean(args.isCollapsed)])),
			),
		}),
		template: `
			<div class="story-row" style="align-items: stretch; height: 320px;">
				<BaseSideBar
					v-for="variant in variants"
					:key="variant"
					v-bind="props"
					v-model:is-collapsed="collapsed[variant]"
					:items="items"
					:variant="variant"
					:title="variant"
					:aria-label="'Боковая панель: ' + variant"
					:width="200"
					active-path="/dashboard" />
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: ширина панели, высота пунктов (24–40px), текст и иконки масштабируются пропорционально. */
export const Sizes: Story = {
	argTypes: { sizeScale: { control: false } },
	parameters: {
		docs: {
			source: { code: SIZE_PRESETS.map(p => `<BaseSideBar :items="items" :width="200" :size-scale="${p.sizeScale}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...SLOT_KEYS, 'isCollapsed', 'onUpdate:isCollapsed', 'title', 'items', 'sizeScale', 'width']),
			presets: SIZE_PRESETS,
			sizeLabel,
			items: BASIC_ITEMS,
		}),
		template: `
			<div class="story-row" style="align-items: stretch; height: 280px;">
				<BaseSideBar
					v-for="preset in presets"
					:key="preset.name"
					v-bind="props"
					:items="items"
					:title="sizeLabel(preset)"
					:aria-label="'Боковая панель: ' + preset.name"
					:width="200"
					:size-scale="preset.sizeScale"
					active-path="/dashboard" />
			</div>
		`,
	}),
}

/**
 * Свёрнутая панель: у пунктов остаются иконки, подсказка с названием и доступное имя; вложенные уровни и тело скрыты,
 * подвал сохраняется. Подсказка появляется при наведении на пункт.
 */
export const Collapsed: Story = {
	args: { isCollapsed: true, activePath: '/dashboard' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('complementary')).toHaveClass('base-side-bar--collapsed')
		await expect(canvas.getByRole('link', { name: 'Главная' })).toHaveAttribute('aria-current', 'page')
		await expect(canvas.getByRole('button', { name: 'Развернуть' })).toBeVisible()
	},
}

/**
 * Кастомный цвет через `color`: `bg.base` — фон панели, `text.base` — заголовок и пункты,
 * `bg.hover` и `text.hover` — пункт под курсором и текущий пункт.
 */
export const CustomColor: Story = {
	args: {
		color: {
			bg: { base: '#0f172a', hover: '#1e293b' },
			text: { base: '#cbd5e1', hover: '#ffffff' },
		},
	},
	play: async ({ canvas }) => {
		await expect(getComputedStyle(canvas.getByRole('complementary')).backgroundColor).toBe('rgb(15, 23, 42)')
		await expect(getComputedStyle(canvas.getByRole('link', { name: 'Главная' })).color).toBe('rgb(203, 213, 225)')
		await expect(getComputedStyle(canvas.getByRole('link', { name: /Товары/ })).backgroundColor).toBe('rgb(30, 41, 59)')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Загрузка: вместо навигации, тела и подвала — скелетон. */
export const Loading: Story = {
	args: { isLoading: true },
	play: async ({ canvas }) => {
		await expect(canvas.queryByRole('link')).toBeNull()
		await expect(canvas.getByRole('heading', { name: 'Панель управления' })).toBeVisible()
	},
}

/** Длинные названия обрезаются многоточием, панель не расширяется. */
export const LongContent: Story = {
	args: { items: LONG_ITEMS, activePath: '/reports' },
	play: async ({ canvas }) => {
		const label = canvas.getByText(/Отчёты о продажах/)
		await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth)
		await expect(canvas.getByRole('complementary').getBoundingClientRect().width).toBe(280)
	},
}

/** `isCollapsible: false` — панель без кнопки сворачивания. */
export const NotCollapsible: Story = {
	args: { isCollapsible: false },
	play: async ({ canvas }) => {
		await expect(canvas.queryByRole('button', { name: 'Свернуть' })).toBeNull()
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/**
 * Слоты панели: `header` заменяет заголовок, слот по умолчанию — тело под навигацией, `footer` — подвал,
 * `collapsedContent` — содержимое свёрнутой панели.
 */
export const WithSlots: Story = {
	args: { items: BASIC_ITEMS, activePath: '/inbox' },
	parameters: {
		docs: {
			source: {
				code: [
					'<BaseSideBar :items="items">',
					'  <template #header>…логотип и название…</template>',
					'  Свободное место: 2,4 ГБ из 10 ГБ',
					'  <template #footer>…профиль…</template>',
					'</BaseSideBar>',
				].join('\n'),
			},
		},
	},
	render: args => {
		const onUpdate = useModelArg('isCollapsed')
		return {
			components: { BaseSideBar, BaseAvatar, BaseIcon },
			setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS), onUpdate, user: USER, frameStyle: FRAME_STYLE }),
			template: `
				<div :style="frameStyle">
					<BaseSideBar v-bind="props" @update:is-collapsed="onUpdate">
						<template #header>
							<div class="story-row" style="flex-wrap: nowrap; gap: 8px;">
								<BaseIcon name="star" />
								<strong>Rise Studio</strong>
							</div>
						</template>
						Свободное место: 2,4 ГБ из 10 ГБ
						${PROFILE_FOOTER}
					</BaseSideBar>
				</div>
			`,
		}
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Rise Studio')).toBeVisible()
		await expect(canvas.getByText('Свободное место: 2,4 ГБ из 10 ГБ')).toBeVisible()
	},
}

/** Слот `navigation` заменяет навигацию из `items` в раскрытой панели — для полностью своей разметки. */
export const NavigationSlot: Story = {
	args: { items: BASIC_ITEMS },
	render: args => {
		const onUpdate = useModelArg('isCollapsed')
		return {
			components: { BaseSideBar, BaseButton },
			setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS), onUpdate, frameStyle: FRAME_STYLE }),
			template: `
				<div :style="frameStyle">
					<BaseSideBar v-bind="props" @update:is-collapsed="onUpdate">
						<template #navigation>
							<div class="story-col">
								<BaseButton variant="ghost">Кастомная главная</BaseButton>
								<BaseButton variant="ghost">Кастомный каталог</BaseButton>
							</div>
						</template>
					</BaseSideBar>
				</div>
			`,
		}
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Кастомная главная' })).toBeVisible()
		await expect(canvas.queryByRole('link', { name: 'Главная' })).toBeNull()
	},
}

/** Слот `item` заменяет содержимое пункта (параметры: `item`, `level`, `isActive`, `isCurrent`, `isCollapsed`, `hasChildren`). */
export const CustomItemSlot: Story = {
	args: { items: BASIC_ITEMS, activePath: '/inbox' },
	render: args => {
		const onUpdate = useModelArg('isCollapsed')
		return {
			components: { BaseSideBar, BaseIcon },
			setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS), onUpdate, frameStyle: FRAME_STYLE }),
			template: `
				<div :style="frameStyle">
					<BaseSideBar v-bind="props" @update:is-collapsed="onUpdate">
						<template #item="{ item, isCurrent }">
							<BaseIcon :name="item.icon" />
							<span style="flex: 1;">{{ item.label }}</span>
							<small v-if="isCurrent">открыто</small>
						</template>
					</BaseSideBar>
				</div>
			`,
		}
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: /Входящие/ })).toHaveTextContent('открыто')
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/** Текущий пункт по ключу (`activeKey`) — когда активный раздел не связан с адресом страницы. */
export const ActiveByKey: Story = {
	args: { items: BASIC_ITEMS, activePath: undefined, activeKey: 'calendar' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: 'Календарь' })).toHaveAttribute('aria-current', 'page')
	},
}

/** Пункты без `to` — кнопки-действия: клик вызывает `item.click` и событие `itemClick`, отключённый пункт не реагирует. */
export const ItemActions: Story = {
	args: { items: ACTION_ITEMS, activePath: undefined },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Создать отчёт' }))
		await expect(args.onItemClick).toHaveBeenCalledWith(ACTION_ITEMS[0], expect.anything())
		await expect(canvas.getByRole('button', { name: 'Архивировать' })).toBeDisabled()
	},
}

/** Раскладка приложения: сайдбар на всю высоту области, рядом — основное содержимое. */
export const AppLayout: Story = {
	render: args => {
		const onUpdate = useModelArg('isCollapsed')
		return {
			components: { BaseSideBar, BaseAvatar },
			setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS), onUpdate, user: USER }),
			template: `
				<div style="display: flex; height: 420px;">
					<BaseSideBar v-bind="props" @update:is-collapsed="onUpdate">${PROFILE_FOOTER}</BaseSideBar>
					<main style="flex: 1; padding: 24px;">Основное содержимое страницы</main>
				</div>
			`,
		}
	},
	play: async ({ canvas }) => {
		const sidebar = canvas.getByRole('complementary')
		const frame = sidebar.parentElement as HTMLElement
		await expect(Math.round(sidebar.getBoundingClientRect().height)).toBe(Math.round(frame.getBoundingClientRect().height))
	},
}

/**
 * Управляемый режим: `v-model:isCollapsed` связывает панель с состоянием приложения — например, с кнопкой в шапке
 * страницы. Кнопка сворачивания внутри панели меняет то же значение.
 */
export const Controlled: Story = {
	parameters: {
		docs: {
			source: {
				code: [
					'<BaseSideBar v-model:is-collapsed="isCollapsed" :items="items" />',
					'<BaseButton @click="isCollapsed = !isCollapsed">Переключить панель</BaseButton>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSideBar, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, [...SLOT_KEYS, 'isCollapsed', 'onUpdate:isCollapsed']), isCollapsed: ref(false) }),
		template: `
			<div style="display: flex; gap: 16px; height: 420px;">
				<BaseSideBar v-bind="props" v-model:is-collapsed="isCollapsed" />
				<div class="story-col">
					<BaseButton variant="outline" @click="isCollapsed = !isCollapsed">Переключить панель</BaseButton>
					<span class="story-label">isCollapsed: {{ isCollapsed }}</span>
				</div>
			</div>
		`,
	}),
	// Состояние не меняем: story открывает e2e-тест управляемого режима (BaseSideBar.e2e.spec.ts)
	play: async ({ canvas }) => {
		await expect(canvas.getByText('isCollapsed: false')).toBeVisible()
		await expect(canvas.getByRole('complementary')).not.toHaveClass('base-side-bar--collapsed')
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: Tab проходит кнопку сворачивания и пункты (видно кольцо фокуса), Enter раскрывает группу «Настройки»;
 * после сворачивания с клавиатуры фокус остаётся на кнопке.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const settings = canvas.getByRole('button', { name: 'Настройки' })
		await tabTo(settings, userEvent)
		await expect(getComputedStyle(settings).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await expect(settings).toHaveAttribute('aria-expanded', 'true')
		await expect(canvas.getByRole('link', { name: 'Профиль' })).toBeVisible()

		const toggle = canvas.getByRole('button', { name: 'Свернуть' })
		await tabTo(toggle, userEvent, 30)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(toggle).toHaveAccessibleName('Развернуть'))
		await expect(toggle).toHaveFocus()
	},
}
