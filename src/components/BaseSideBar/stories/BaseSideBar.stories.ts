import type { Meta, StoryObj } from '@storybook/vue3'
import type { SideBarItem } from '../model/BaseSideBar.types'

import { waitFor } from 'storybook/test'
import { ref } from 'vue'

import { SIDEBAR_VARIANTS } from '../model/BaseSideBar.types'
import BaseSideBar from '../ui/BaseSideBar.vue'

import './BaseSideBar.stories.scss'

const BASIC_ITEMS: SideBarItem[] = [
	{
		key: 'dashboard',
		label: 'Главная',
		icon: 'home',
		to: '/dashboard',
	},
	{
		key: 'catalog',
		label: 'Каталог',
		icon: 'folder',
		to: '/catalog',
	},
	{
		key: 'orders',
		label: 'Заказы',
		icon: 'shopping-cart',
		to: '/orders',
		badge: 8,
	},
]

const NAVIGATION_ITEMS: SideBarItem[] = [
	{
		key: 'dashboard',
		label: 'Главная',
		icon: 'home',
		to: '/dashboard',
	},
	{
		key: 'catalog',
		label: 'Каталог',
		icon: 'folder',
		to: '/catalog',
		children: [
			{
				key: 'products',
				label: 'Товары',
				to: '/catalog/products',
				badge: 12,
			},
			{
				key: 'categories',
				label: 'Категории',
				to: '/catalog/categories',
			},
			{
				key: 'archive',
				label: 'Архив',
				to: '/catalog/archive',
				isDisabled: true,
			},
		],
	},
	{
		key: 'orders',
		label: 'Заказы',
		icon: 'shopping-cart',
		to: '/orders',
		badge: 8,
	},
	{
		key: 'analytics',
		label: 'Аналитика',
		icon: 'chart',
		to: '/analytics',
		hasDivider: true,
	},
	{
		key: 'settings',
		label: 'Настройки',
		icon: 'settings',
		to: '/settings',
	},
	{
		key: 'disabled',
		label: 'Недоступно',
		icon: 'lock',
		isDisabled: true,
	},
]

const LONG_ITEMS: SideBarItem[] = [
	{
		key: 'long-1',
		label: 'Очень длинное название пункта меню которое проверяет переполнение текста',
		icon: 'home',
		to: '/long-1',
	},
	{
		key: 'long-2',
		label: 'Ещё один длинный пункт навигации с подробным описанием раздела',
		icon: 'folder',
		to: '/long-2',
	},
	{
		key: 'long-3',
		label: 'Информация о компании с дополнительными сведениями и контактами',
		icon: 'info',
		to: '/long-3',
	},
]

const meta: Meta<typeof BaseSideBar> = {
	title: 'UI/BaseSideBar',
	component: BaseSideBar,
	decorators: [
		() => ({
			template: `
        <div class="sidebar-story-canvas">
          <story />
        </div>
      `,
		}),
	],
	argTypes: {
		isCollapsed: {
			control: 'boolean',
			description: 'Свёрнутое состояние. Используется вместе с v-model:isCollapsed.',
		},
		title: {
			control: 'text',
			description: 'Заголовок сайдбара.',
		},
		width: {
			control: { type: 'range', min: 220, max: 420, step: 20 },
			description: 'Ширина раскрытой панели в px.',
		},
		collapsedWidth: {
			control: { type: 'range', min: 56, max: 96, step: 4 },
			description: 'Ширина свёрнутой панели в px.',
		},
		isCollapsible: {
			control: 'boolean',
			description: 'Можно ли сворачивать сайдбар.',
		},
		variant: {
			control: 'inline-radio',
			options: SIDEBAR_VARIANTS,
			description: 'Визуальный вариант сайдбара.',
		},
		padding: {
			control: 'object',
			description: 'Внутренние отступы.',
		},
		gap: {
			control: { type: 'range', min: 0, max: 16, step: 1 },
			description: 'Отступ между пунктами навигации.',
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет компонента.',
		},
		sizeScale: {
			control: { type: 'range', min: 80, max: 140, step: 10 },
			description: 'Масштаб размера.',
		},
		isLoading: {
			control: 'boolean',
			description: 'Состояние загрузки.',
		},
		items: {
			control: 'object',
			description: 'Элементы навигации сайдбара.',
		},
		activeKey: {
			control: 'text',
			description: 'Активный пункт по key.',
		},
		activePath: {
			control: 'text',
			description: 'Активный путь.',
		},
		activeMatch: {
			control: 'inline-radio',
			options: ['exact', 'startsWith'],
			description: 'Режим сравнения activePath и item.to.',
		},
		linkComponent: {
			control: 'text',
			description: 'Компонент для ссылок.',
		},
		customClass: {
			control: 'object',
			description: 'Кастомные классы.',
		},
		'onUpdate:isCollapsed': {
			table: { disable: true },
		},
		onCollapse: {
			table: { disable: true },
		},
		onExpand: {
			table: { disable: true },
		},
		onItemClick: {
			table: { disable: true },
		},
	},
	args: {
		title: 'Навигация',
		width: 280,
		collapsedWidth: 68,
		isCollapsible: true,
		variant: 'default',
		gap: 4,
		sizeScale: 100,
		isLoading: false,
		activeMatch: 'exact',
		linkComponent: 'a',
		items: BASIC_ITEMS,
	},
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		items: BASIC_ITEMS,
		activePath: '/dashboard',
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: `
      <BaseSideBar v-bind="args">
        <template #footer>
          <div class="sidebar-story-footer">
            <span class="sidebar-story-footer__title">Rise UI Kit</span>
            <span>Sidebar component</span>
          </div>
        </template>
      </BaseSideBar>
    `,
	}),
}

export const WithItemsApi: Story = {
	args: {
		title: 'Меню',
		items: NAVIGATION_ITEMS,
		activePath: '/catalog/products',
		activeMatch: 'startsWith',
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: `
      <BaseSideBar v-bind="args">
        <template #footer>
          <div class="sidebar-story-profile">
            <div class="sidebar-story-profile__avatar">UI</div>
            <div class="sidebar-story-profile__content">
              <span class="sidebar-story-profile__title">Admin</span>
              <span class="sidebar-story-profile__subtitle">Owner</span>
            </div>
          </div>
        </template>
      </BaseSideBar>
    `,
	}),
}

export const CollapsedItems: Story = {
	args: {
		title: 'Collapsed',
		isCollapsed: true,
		items: NAVIGATION_ITEMS,
		activePath: '/dashboard',
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: '<BaseSideBar v-bind="args" />',
	}),
}

export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: `
        <div class="dark sidebar-story-canvas sidebar-story-canvas--dark">
          <story />
        </div>
      `,
		}),
	],
	args: {
		title: 'Dark orange',
		items: NAVIGATION_ITEMS,
		activePath: '/catalog/products',
		activeMatch: 'startsWith',
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: `
      <BaseSideBar v-bind="args">
        <template #footer>
          <div class="sidebar-story-profile">
            <div class="sidebar-story-profile__avatar">UI</div>
            <div class="sidebar-story-profile__content">
              <span class="sidebar-story-profile__title">Admin</span>
              <span class="sidebar-story-profile__subtitle">Dark mode</span>
            </div>
          </div>
        </template>
      </BaseSideBar>
    `,
	}),
}

export const DarkCollapsed: Story = {
	decorators: [
		() => ({
			template: `
        <div class="dark sidebar-story-canvas sidebar-story-canvas--dark">
          <story />
        </div>
      `,
		}),
	],
	args: {
		title: 'Dark collapsed',
		isCollapsed: true,
		items: NAVIGATION_ITEMS,
		activePath: '/dashboard',
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: '<BaseSideBar v-bind="args" />',
	}),
}

export const ActiveByKey: Story = {
	args: {
		title: 'Active Key',
		items: NAVIGATION_ITEMS,
		activeKey: 'orders',
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: '<BaseSideBar v-bind="args" />',
	}),
}

export const ActiveByItemFlag: Story = {
	args: {
		title: 'isActive',
		items: [
			{
				key: 'dashboard',
				label: 'Главная',
				icon: 'home',
				to: '/dashboard',
			},
			{
				key: 'manual-active',
				label: 'Активный вручную',
				icon: 'star',
				isActive: true,
			},
			{
				key: 'settings',
				label: 'Настройки',
				icon: 'settings',
				to: '/settings',
			},
		],
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: '<BaseSideBar v-bind="args" />',
	}),
}

export const ControlledVModel: Story = {
	args: {
		title: 'Controlled',
		items: NAVIGATION_ITEMS,
		activePath: '/catalog/products',
		activeMatch: 'startsWith',
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const isCollapsed = ref(false)

			return {
				args,
				isCollapsed,
			}
		},
		template: `
      <div class="sidebar-story-layout">
        <BaseSideBar
          v-bind="args"
          v-model:is-collapsed="isCollapsed"
        />

        <div class="sidebar-story-state">
          <div class="sidebar-story-state__title">Controlled state</div>
          <div>isCollapsed: {{ isCollapsed }}</div>

          <button
            type="button"
            class="sidebar-story-state__button"
            @click="isCollapsed = !isCollapsed"
          >
            Toggle outside
          </button>
        </div>
      </div>
    `,
	}),
}

export const UncontrolledToggle: Story = {
	args: {
		title: 'Uncontrolled',
		items: BASIC_ITEMS,
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: '<BaseSideBar v-bind="args" />',
	}),
}

export const ItemClickEvent: Story = {
	args: {
		title: 'Clicks',
		items: [
			{
				key: 'dashboard',
				label: 'Главная',
				icon: 'home',
				to: '/dashboard',
			},
			{
				key: 'action',
				label: 'Выполнить действие',
				icon: 'play',
				badge: 'new',
				click: item => {
					// eslint-disable-next-line no-console
					console.log('item.click:', item)
				},
			},
			{
				key: 'disabled',
				label: 'Disabled action',
				icon: 'lock',
				isDisabled: true,
			},
		],
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			function handleItemClick(item: SideBarItem): void {
				// eslint-disable-next-line no-console
				console.log('itemClick event:', item)
			}

			return {
				args,
				handleItemClick,
			}
		},
		template: `
      <BaseSideBar
        v-bind="args"
        @item-click="handleItemClick"
      />
    `,
	}),
}

export const WithItemSlots: Story = {
	args: {
		title: 'Custom slots',
		items: NAVIGATION_ITEMS,
		activePath: '/orders',
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: `
      <BaseSideBar v-bind="args">
        <template #icon="{ item, isCurrent }">
          <span class="sidebar-story-custom-icon">
            {{ isCurrent ? '●' : item.icon }}
          </span>
        </template>

        <template #label="{ item, isCurrent, hasChildren }">
          <span class="sidebar-story-custom-label">
            <span>{{ item.label }}</span>
            <span v-if="isCurrent" class="sidebar-story-badge">active</span>
            <span v-else-if="hasChildren" class="sidebar-story-badge">group</span>
          </span>
        </template>
      </BaseSideBar>
    `,
	}),
}

export const WithCustomItemSlot: Story = {
	args: {
		title: 'Item slot',
		items: BASIC_ITEMS,
		activeKey: 'catalog',
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: `
      <BaseSideBar v-bind="args">
        <template #item="{ item, isCurrent, onClick }">
          <button
            type="button"
            class="sidebar-story-custom-button"
            @click="onClick"
          >
            <span>{{ item.label }}</span>
            <span v-if="isCurrent" class="sidebar-story-badge">ON</span>
          </button>
        </template>
      </BaseSideBar>
    `,
	}),
}

export const NavigationSlotPriority: Story = {
	args: {
		title: 'Slot priority',
		items: BASIC_ITEMS,
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: `
      <BaseSideBar v-bind="args">
        <template #navigation>
          <nav class="sidebar-story-footer">
            <a href="/custom-dashboard">Кастомная главная</a>
            <a href="/custom-catalog">Кастомный каталог</a>
            <button type="button">Кастомное действие</button>
          </nav>
        </template>
      </BaseSideBar>
    `,
	}),
}

export const WithAllSlots: Story = {
	args: {
		title: 'All slots',
		items: BASIC_ITEMS,
		activePath: '/dashboard',
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const isCollapsed = ref(false)

			return {
				args,
				isCollapsed,
			}
		},
		template: `
      <BaseSideBar
        v-bind="args"
        v-model:is-collapsed="isCollapsed"
      >
        <template #header>
          <div class="sidebar-story-brand">
            <div class="sidebar-story-brand__logo">R</div>
            <div class="sidebar-story-brand__content">
              <span class="sidebar-story-brand__title">Rise UI</span>
              <span class="sidebar-story-brand__subtitle">Design System</span>
            </div>
          </div>
        </template>

        <div>
          Последнее обновление: сегодня
        </div>

        <template #footer>
          <div class="sidebar-story-profile">
            <div class="sidebar-story-profile__avatar">AD</div>
            <div class="sidebar-story-profile__content">
              <span class="sidebar-story-profile__title">Admin</span>
              <span class="sidebar-story-profile__subtitle">Owner</span>
            </div>
          </div>
        </template>

        <template #collapsedContent>
          <span>👤</span>
          <span>⚙️</span>
        </template>
      </BaseSideBar>
    `,
	}),
}

export const Loading: Story = {
	args: {
		title: 'Загрузка',
		isLoading: true,
		items: NAVIGATION_ITEMS,
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: '<BaseSideBar v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			const loading = canvasElement.querySelector('.base-sidebar__loading')

			if (!loading) {
				throw new Error('Loading state not rendered')
			}
		})
	},
}

export const NotCollapsible: Story = {
	args: {
		title: 'Not collapsible',
		isCollapsible: false,
		items: BASIC_ITEMS,
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: '<BaseSideBar v-bind="args" />',
	}),
}

export const Variants: Story = {
	args: {
		items: BASIC_ITEMS,
		activePath: '/dashboard',
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const variants = SIDEBAR_VARIANTS

			return {
				args,
				variants,
			}
		},
		template: `
      <div class="sidebar-story-grid">
        <BaseSideBar
          v-for="variant in variants"
          :key="variant"
          v-bind="args"
          :variant="variant"
          :title="variant"
        />
      </div>
    `,
	}),
}

export const CollapsedVariants: Story = {
	args: {
		isCollapsed: true,
		items: BASIC_ITEMS,
		activePath: '/dashboard',
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const variants = SIDEBAR_VARIANTS

			return {
				args,
				variants,
			}
		},
		template: `
      <div class="sidebar-story-grid">
        <BaseSideBar
          v-for="variant in variants"
          :key="variant"
          v-bind="args"
          :variant="variant"
          :title="variant"
        />
      </div>
    `,
	}),
}

export const WidthVariants: Story = {
	args: {
		items: BASIC_ITEMS,
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: `
      <div class="sidebar-story-grid">
        <BaseSideBar
          v-bind="args"
          title="Narrow"
          :width="240"
          :collapsed-width="64"
        />

        <BaseSideBar
          v-bind="args"
          title="Default"
          :width="280"
          :collapsed-width="68"
        />

        <BaseSideBar
          v-bind="args"
          title="Wide"
          :width="340"
          :collapsed-width="76"
        />
      </div>
    `,
	}),
}

export const GapVariants: Story = {
	args: {
		items: BASIC_ITEMS,
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const gaps = [0, 2, 4, 8]

			return {
				args,
				gaps,
			}
		},
		template: `
      <div class="sidebar-story-grid">
        <BaseSideBar
          v-for="gap in gaps"
          :key="gap"
          v-bind="args"
          :title="\`gap: \${gap}px\`"
          :gap="gap"
        />
      </div>
    `,
	}),
}

export const SizeScaleVariants: Story = {
	args: {
		items: BASIC_ITEMS,
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const scales = [90, 100, 110]

			return {
				args,
				scales,
			}
		},
		template: `
      <div class="sidebar-story-grid">
        <BaseSideBar
          v-for="scale in scales"
          :key="scale"
          v-bind="args"
          :title="\`scale: \${scale}%\`"
          :size-scale="scale"
        />
      </div>
    `,
	}),
}

export const LongContent: Story = {
	args: {
		title: 'Long labels',
		items: LONG_ITEMS,
		activePath: '/long-1',
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: '<BaseSideBar v-bind="args" />',
	}),
}

export const SideMirror: Story = {
	args: {
		items: BASIC_ITEMS,
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const leftCollapsed = ref(false)
			const rightCollapsed = ref(false)

			return {
				args,
				leftCollapsed,
				rightCollapsed,
			}
		},
		template: `
      <div class="sidebar-story-layout">
        <BaseSideBar
          v-bind="args"
          v-model:is-collapsed="leftCollapsed"
          title="Left"
        />

        <main class="sidebar-story-main">
          Основной контент
        </main>

        <BaseSideBar
          v-bind="args"
          v-model:is-collapsed="rightCollapsed"
          title="Right"
          :items="[
            {
              key: 'settings',
              label: 'Настройки',
              icon: 'settings',
              to: '/settings',
            },
            {
              key: 'profile',
              label: 'Профиль',
              icon: 'user',
              to: '/profile',
            },
          ]"
        />
      </div>
    `,
	}),
}
