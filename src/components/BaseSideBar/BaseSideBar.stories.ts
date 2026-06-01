/**
 * Stories для компонента BaseSideBar.
 * Демонстрирует все вариации, стороны, интерактивные состояния и слоты.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { userEvent, waitFor } from 'storybook/test'

import { playShiftTab } from '@utils/storybookUtils/a11yHelpers'

import { ref } from 'vue'

import { buildArgTypes } from '@utils/storybookUtils'

import { SIDEBAR_VARIANTS } from './BaseSideBar.types'
import BaseSideBar from './BaseSideBar.vue'

const meta: Meta<typeof BaseSideBar> = {
	title: 'UI/BaseSideBar',
	component: BaseSideBar,

	argTypes: buildArgTypes({
		props: {
			isCollapsed: {
				control: 'boolean',
				description: 'Свёрнутое состояние (undefined = внутреннее управление)',
			},
			title: {
				control: 'text',
				description: 'Заголовок сайдбара',
			},
			width: {
				control: { type: 'range', min: 200, max: 500, step: 20 },
				description: 'Ширина раскрытой панели (px)',
			},
			collapsedWidth: {
				control: { type: 'range', min: 40, max: 120, step: 8 },
				description: 'Ширина свёрнутой панели (px)',
			},
			isCollapsible: {
				control: 'boolean',
				description: 'Можно ли сворачивать',
			},
			variant: {
				control: 'inline-radio',
				options: SIDEBAR_VARIANTS,
				description: 'Вариант отображения сайдбара',
			},
			padding: {
				control: 'object',
				description:
					'Отступы. Число (px): Y = значение, X = значение × 2. Объект { x, y, top, right, bottom, left } задаёт оси напрямую без умножения (например { x: 25, y: 43 } → 43px сверху/снизу, 25px по бокам); стороны переопределяют оси',
			},
			gap: {
				control: { type: 'range', min: 0, max: 24, step: 2 },
				description: 'Отступ между секциями (px)',
			},
			color: {
				control: 'object',
				description: 'Объект CustomColor: bg, text и их состояния',
			},
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера (100 = 100%)',
			},
			isLoading: {
				control: 'boolean',
				description: 'Состояние загрузки',
			},
			'onUpdate:isCollapsed': { table: { disable: true } },
			onCollapse: { table: { disable: true } },
			onExpand: { table: { disable: true } },
		},
	}),

	args: {
		title: 'Навигация',
		width: 280,
		collapsedWidth: 64,
		isCollapsible: true,
		variant: 'default',
		padding: 12,
		gap: 0,
		sizeScale: 100,
		isLoading: false,
	},
}

export default meta
type Story = StoryObj<typeof BaseSideBar>
/** Базовый сайдбар с заголовком и навигацией */
export const Default: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseSideBar title="Навигация" />',
			},
		},
	},
	play: async ({ canvasElement, step }) => {
		await step('Фокусировка сайдбара по Tab', async () => {
			await userEvent.tab()
		})

		await step('Возврат фокуса по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { selector: '.base-sidebar' })
		})
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const isCollapsed = ref(false)
			return { args, isCollapsed }
		},
		template: `
			<div style="height:500px;">
				<BaseSideBar v-bind="args" v-model:is-collapsed="isCollapsed">
					<template #navigation>
						<div style="padding:8px 12px;cursor:pointer;border-radius:6px;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">🏠 Главная</div>
						<div style="padding:8px 12px;cursor:pointer;border-radius:6px;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">🎨 Каталог</div>
						<div style="padding:8px 12px;cursor:pointer;border-radius:6px;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">ℹ️ О нас</div>
					</template>
					<template #collapsedContent>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">🏠</div>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">🎨</div>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">ℹ️</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Все варианты отображения рядом */
export const Variants: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSideBar v-for="v in ['default','ghost','outline','shadow','soft']" :key="v" :variant="v" title="Навигация" />`,
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const variants = SIDEBAR_VARIANTS
			return { args, variants }
		},
		template: `
			<div style="display:flex;gap:24px;height:400px;">
				<div v-for="v in variants" :key="v" style="flex:1;">
					<p style="margin:0 0 8px;font-size:12px;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.05em;">{{ v }}</p>
					<BaseSideBar v-bind="args" :variant="v" :title="v">
						<template #navigation>
							<div style="padding:8px 12px;">Пункт 1</div>
							<div style="padding:8px 12px;">Пункт 2</div>
						</template>
					</BaseSideBar>
				</div>
			</div>
		`,
	}),
}
/** Свёрнутый сайдбар */
export const Collapsed: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseSideBar title="Навигация" :is-collapsed="true" :padding="0" />',
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: `
			<div style="height:500px;">
				<BaseSideBar v-bind="args" :is-collapsed="true" :padding="1">
					<template #collapsedContent>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">🏠</div>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">🔍</div>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">⚙️</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Сайдбар со всеми слотами */
export const WithSlots: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSideBar title="Навигация">
  <template #header>Кастомный заголовок</template>
  <template #navigation>...</template>
  <template #default>Основной контент</template>
  <template #footer>Подвал</template>
  <template #collapsedContent>...</template>
</BaseSideBar>`,
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const isCollapsed = ref(false)
			return { args, isCollapsed }
		},
		template: `
			<div style="height:500px;">
				<BaseSideBar v-bind="args" v-model:is-collapsed="isCollapsed" title="Навигация">
					<template #header>
						<div style="display:flex;align-items:center;gap:8px;width:100%;">
							<span style="font-size:20px;">🎨</span>
							<span style="font-weight:600;font-size:16px;">Metal Art</span>
						</div>
					</template>
					<template #navigation>
						<div style="padding:8px 12px;cursor:pointer;border-radius:6px;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">🏠 Главная</div>
						<div style="padding:8px 12px;cursor:pointer;border-radius:6px;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">🎨 Каталог</div>
						<div style="padding:8px 12px;cursor:pointer;border-radius:6px;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">ℹ️ О нас</div>
					</template>
					Контент основной области
					<template #footer>
						<div style="font-size:12px;color:var(--color-text-muted);">© 2024 Metal Art</div>
					</template>
					<template #collapsedContent>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">🏠</div>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">🎨</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding:16px;background:var(--color-bg);"><story /></div>',
		}),
	],
	parameters: {
		docs: {
			source: {
				code: '<BaseSideBar title="Навигация" />',
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const isCollapsed = ref(false)
			return { args, isCollapsed }
		},
		template: `
			<div style="height:400px;">
				<BaseSideBar v-bind="args" v-model:is-collapsed="isCollapsed">
					<template #navigation>
						<div style="padding:8px 12px;">Главная</div>
						<div style="padding:8px 12px;">Каталог</div>
					</template>
					<template #collapsedContent>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">🏠</div>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">🎨</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Интерактивная story — сворачивание/разворачивание с v-model */
export const Interactive: Story = {
	parameters: {
		docs: {
			source: {
				code: `<script setup>
const isCollapsed = ref(false)
</script>
<BaseSideBar v-model:is-collapsed="isCollapsed" title="Навигация" />`,
			},
		},
	},
	play: async ({ canvasElement }) => {
		// Клик по кнопке сворачивания — покрытие handleToggle (controlled mode)
		const toggle = canvasElement.querySelector('.base-sidebar__toggle')
		if (toggle instanceof HTMLElement) {
			await userEvent.click(toggle)
			await userEvent.click(toggle)
		}
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const isCollapsed = ref(false)
			return { args, isCollapsed }
		},
		template: `
			<div style="height:500px;">
				<label style="display:flex;align-items:center;gap:8px;margin-bottom:12px;cursor:pointer;">
					<input type="checkbox" v-model="isCollapsed" />
					Свёрнуто: {{ isCollapsed }}
				</label>
				<BaseSideBar
					v-bind="args"
					v-model:is-collapsed="isCollapsed"
					title="Навигация"
				>
					<template #navigation>
						<div style="padding:8px 12px;">Главная</div>
						<div style="padding:8px 12px;">Каталог</div>
						<div style="padding:8px 12px;">О нас</div>
					</template>
					<template #collapsedContent>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">🏠</div>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">🔍</div>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">ℹ️</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Управление через v-model */
export const ControlledVModel: Story = {
	parameters: {
		docs: {
			source: {
				code: `<script setup>
const isCollapsed = ref(false)
</script>
<BaseSideBar v-model:is-collapsed="isCollapsed" title="Навигация" />`,
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const isCollapsed = ref(false)
			return { args, isCollapsed }
		},
		template: `
			<div style="height:500px;">
				<label style="display:flex;align-items:center;gap:8px;margin-bottom:12px;cursor:pointer;">
					<input type="checkbox" v-model="isCollapsed" />
					Свёрнуто: {{ isCollapsed }}
				</label>
				<BaseSideBar
					v-bind="args"
					v-model:is-collapsed="isCollapsed"
					title="Навигация"
				>
					<template #navigation>
						<div style="padding:8px 12px;">Главная</div>
						<div style="padding:8px 12px;">Каталог</div>
					</template>
					<template #collapsedContent>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">🏠</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Кастомный цвет */
export const CustomColor: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSideBar title="Навигация" :color="{ bg: '#1e293b', text: '#e2e8f0' }" />`,
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const isCollapsed = ref(false)
			return { args, isCollapsed }
		},
		template: `
			<div style="height:500px;">
				<BaseSideBar
					v-bind="args"
					v-model:is-collapsed="isCollapsed"
					title="Навигация"
					:color="{ bg: '#1e293b', text: '#e2e8f0' }"
				>
					<template #navigation>
						<div style="padding:8px 12px;">Главная</div>
						<div style="padding:8px 12px;">Каталог</div>
					</template>
					<template #collapsedContent>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">🏠</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Узкий сайдбар */
export const NarrowWidth: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseSideBar title="Панель" :width="220" />',
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const isCollapsed = ref(false)
			return { args, isCollapsed }
		},
		template: `
			<div style="height:500px;">
				<BaseSideBar v-bind="args" :width="220" v-model:is-collapsed="isCollapsed" title="Панель">
					<template #navigation>
						<div style="padding:6px 10px;font-size:13px;">Пункт 1</div>
						<div style="padding:6px 10px;font-size:13px;">Пункт 2</div>
					</template>
					<template #collapsedContent>
						<div style="width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:14px;">🏠</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Широкий сайдбар */
export const WideWidth: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseSideBar title="Панель" :width="400" />',
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const isCollapsed = ref(false)
			return { args, isCollapsed }
		},
		template: `
			<div style="height:500px;">
				<BaseSideBar v-bind="args" :width="400" v-model:is-collapsed="isCollapsed" title="Широкая панель">
					<template #navigation>
						<div style="padding:8px 12px;">Главная</div>
						<div style="padding:8px 12px;">Каталог</div>
						<div style="padding:8px 12px;">О нас</div>
					</template>
					<template #collapsedContent>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">🏠</div>
					</template>
					<div>Здесь много места для контента</div>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Сайдбар с подвалом */
export const WithFooter: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSideBar title="Навигация">
  <template #footer>Подвал</template>
</BaseSideBar>`,
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const isCollapsed = ref(false)
			return { args, isCollapsed }
		},
		template: `
			<div style="height:500px;">
				<BaseSideBar v-bind="args" v-model:is-collapsed="isCollapsed" title="Навигация">
					<template #navigation>
						<div style="padding:8px 12px;">Главная</div>
						<div style="padding:8px 12px;">Каталог</div>
					</template>
					<template #footer>
						<div style="display:flex;align-items:center;gap:8px;">
							<span>👤</span>
							<span style="font-size:13px;">Выйти из аккаунта</span>
						</div>
					</template>
					<template #collapsedContent>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">👤</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Вариант ghost — без фона и границ */
export const GhostVariant: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseSideBar variant="ghost" title="Навигация" />',
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const isCollapsed = ref(false)
			return { args, isCollapsed }
		},
		template: `
			<div style="height:500px;background:var(--color-bg);">
				<BaseSideBar v-bind="args" variant="ghost" v-model:is-collapsed="isCollapsed" title="Навигация">
					<template #navigation>
						<div style="padding:8px 12px;">Главная</div>
						<div style="padding:8px 12px;">Каталог</div>
					</template>
					<template #collapsedContent>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">🏠</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Вариант shadow — с тенью вместо границ */
export const ShadowVariant: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseSideBar variant="shadow" title="Навигация" />',
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const isCollapsed = ref(false)
			return { args, isCollapsed }
		},
		template: `
			<div style="height:500px;background:var(--color-bg);padding:24px;">
				<BaseSideBar v-bind="args" variant="shadow" v-model:is-collapsed="isCollapsed" title="Навигация">
					<template #navigation>
						<div style="padding:8px 12px;">Главная</div>
						<div style="padding:8px 12px;">Каталог</div>
					</template>
					<template #collapsedContent>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">🏠</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Вариант soft — полупрозрачный с размытием */
export const SoftVariant: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseSideBar variant="soft" title="Навигация" />',
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const isCollapsed = ref(false)
			return { args, isCollapsed }
		},
		template: `
			<div style="height:500px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);padding:24px;">
				<BaseSideBar v-bind="args" variant="soft" v-model:is-collapsed="isCollapsed" title="Навигация">
					<template #navigation>
						<div style="padding:8px 12px;">Главная</div>
						<div style="padding:8px 12px;">Каталог</div>
					</template>
					<template #collapsedContent>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">🏠</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Вариант outline — с акцентной рамкой */
export const OutlineVariant: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseSideBar variant="outline" title="Навигация" />',
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const isCollapsed = ref(false)
			return { args, isCollapsed }
		},
		template: `
			<div style="height:500px;background:var(--color-bg);">
				<BaseSideBar v-bind="args" variant="outline" v-model:is-collapsed="isCollapsed" title="Навигация">
					<template #navigation>
						<div style="padding:8px 12px;">Главная</div>
						<div style="padding:8px 12px;">Каталог</div>
					</template>
					<template #collapsedContent>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">🏠</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Сайдбар без заголовка (только кнопка сворачивания) */
export const NoTitle: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseSideBar :is-collapsible="true" />',
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const isCollapsed = ref(false)
			return { args, isCollapsed }
		},
		template: `
			<div style="height:500px;">
				<BaseSideBar v-bind="args" :is-collapsible="true" v-model:is-collapsed="isCollapsed">
					<template #navigation>
						<div style="padding:8px 12px;">Главная</div>
						<div style="padding:8px 12px;">Каталог</div>
					</template>
					<template #collapsedContent>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">🏠</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Сайдбар с контентом в body */
export const WithBodyContent: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSideBar title="Панель">
  <p>Основной контент сайдбара</p>
</BaseSideBar>`,
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const isCollapsed = ref(false)
			return { args, isCollapsed }
		},
		template: `
			<div style="height:500px;">
				<BaseSideBar v-bind="args" v-model:is-collapsed="isCollapsed" title="Панель">
					<div style="margin-bottom:12px;">
						<h4 style="margin:0 0 8px;">Раздел</h4>
						<p style="margin:0;color:var(--color-text-muted);font-size:14px;">Описание раздела с дополнительной информацией.</p>
					</div>
					<div style="margin-bottom:12px;">
						<h4 style="margin:0 0 8px;">Ещё раздел</h4>
						<p style="margin:0;color:var(--color-text-muted);font-size:14px;">Второй абзац контента.</p>
					</div>
					<template #collapsedContent>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">📄</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Все варианты в свёрнутом состоянии */
export const CollapsedVariants: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSideBar v-for="v in variants" :key="v" :variant="v" :is-collapsed="true" />`,
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const variants = SIDEBAR_VARIANTS
			return { args, variants }
		},
		template: `
			<div style="display:flex;gap:24px;height:400px;">
				<div v-for="v in variants" :key="v" style="flex:0 0 auto;">
					<p style="margin:0 0 8px;font-size:12px;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.05em;">{{ v }}</p>
					<BaseSideBar v-bind="args" :variant="v" :is-collapsed="true" :title="v">
						<template #collapsedContent>
							<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">📌</div>
							<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">🔍</div>
						</template>
					</BaseSideBar>
				</div>
			</div>
		`,
	}),
}
/** Свёрнутый сайдбар в тёмной теме */
export const DarkThemeCollapsed: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding:16px;background:var(--color-bg);"><story /></div>',
		}),
	],
	parameters: {
		docs: {
			source: {
				code: '<BaseSideBar :is-collapsed="true" title="Навигация" />',
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: `
			<div style="height:400px;">
				<BaseSideBar v-bind="args" :is-collapsed="true">
					<template #collapsedContent>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">🏠</div>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">🎨</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Разные значения padding */
export const PaddingVariants: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSideBar v-for="p in [6, 12, 20]" :key="p" :padding="p" title="Навигация" />`,
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;gap:24px;height:400px;align-items:flex-start;">
				<div v-for="p in [6, 12, 20]" :key="p">
					<p style="margin:0 0 8px;font-size:12px;color:var(--color-text-muted);">padding: {{ p }}px</p>
					<BaseSideBar v-bind="args" :padding="p" :title="\`padding \${p}\`">
						<template #navigation>
							<div style="padding:8px 12px;">Пункт 1</div>
							<div style="padding:8px 12px;">Пункт 2</div>
						</template>
					</BaseSideBar>
				</div>
			</div>
		`,
	}),
}
/** Объектный padding: оси x/y и точечные стороны */
export const ObjectPadding: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSideBar :padding="{ x: 20, y: 8 }" title="x/y" />\n<BaseSideBar :padding="{ x: 16, top: 4 }" title="top override" />`,
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;gap:24px;height:400px;align-items:flex-start;">
				<div>
					<p style="margin:0 0 8px;font-size:12px;color:var(--color-text-muted);">{ x: 20, y: 8 }</p>
					<BaseSideBar v-bind="args" :padding="{ x: 20, y: 8 }" title="x/y">
						<template #navigation>
							<div style="padding:8px 12px;">Пункт 1</div>
							<div style="padding:8px 12px;">Пункт 2</div>
						</template>
					</BaseSideBar>
				</div>
				<div>
					<p style="margin:0 0 8px;font-size:12px;color:var(--color-text-muted);">{ x: 16, top: 4 }</p>
					<BaseSideBar v-bind="args" :padding="{ x: 16, top: 4 }" title="top override">
						<template #navigation>
							<div style="padding:8px 12px;">Пункт 1</div>
							<div style="padding:8px 12px;">Пункт 2</div>
						</template>
					</BaseSideBar>
				</div>
			</div>
		`,
	}),
}
/** Зеркальное отображение left и right */
export const SideMirror: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSideBar title="Первый" />
<BaseSideBar title="Второй" />`,
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const leftCollapsed = ref(false)
			const rightCollapsed = ref(false)
			return { args, leftCollapsed, rightCollapsed }
		},
		template: `
			<div style="display:flex;justify-content:space-between;height:500px;">
				<BaseSideBar v-bind="args" v-model:is-collapsed="leftCollapsed" title="Первая панель">
					<template #navigation>
						<div style="padding:8px 12px;">Главная</div>
						<div style="padding:8px 12px;">Каталог</div>
					</template>
					<template #collapsedContent>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">🏠</div>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">🎨</div>
					</template>
				</BaseSideBar>
				<div style="flex:1;display:flex;align-items:center;justify-content:center;color:var(--color-text-muted);">
					Основной контент
				</div>
				<BaseSideBar v-bind="args" v-model:is-collapsed="rightCollapsed" title="Вторая панель">
					<template #navigation>
						<div style="padding:8px 12px;">Настройки</div>
						<div style="padding:8px 12px;">Профиль</div>
					</template>
					<template #collapsedContent>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">⚙️</div>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">👤</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Сайдбар с вложенными секциями и группами */
export const NestedSections: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSideBar title="Каталог">
	 <template #navigation>
	   <div>Группа: Изделия</div>
	   <div>Ворота</div>
	   <div>Заборы</div>
	   <div>Группа: Декор</div>
	   <div>Лампы</div>
	 </template>
</BaseSideBar>`,
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const isCollapsed = ref(false)
			const activeSection = ref('gates')
			return { args, isCollapsed, activeSection }
		},
		template: `
			<div style="height:600px;">
				<BaseSideBar v-bind="args" v-model:is-collapsed="isCollapsed" title="Каталог">
					<template #navigation>
						<div style="font-size:11px;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.06em;padding:12px 12px 4px;">Изделия</div>
						<div @click="activeSection='gates'" :style="{padding:'8px 12px',cursor:'pointer',borderRadius:'6px',background:activeSection==='gates'?'var(--color-surface-muted)':'transparent',transition:'background 0.15s'}">🚪 Ворота</div>
						<div @click="activeSection='fences'" :style="{padding:'8px 12px',cursor:'pointer',borderRadius:'6px',background:activeSection==='fences'?'var(--color-surface-muted)':'transparent',transition:'background 0.15s'}">🏗️ Заборы</div>
						<div @click="activeSection='railings'" :style="{padding:'8px 12px',cursor:'pointer',borderRadius:'6px',background:activeSection==='railings'?'var(--color-surface-muted)':'transparent',transition:'background 0.15s'}">🪜 Перила</div>
						<div style="font-size:11px;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.06em;padding:12px 12px 4px;margin-top:8px;">Декор</div>
						<div @click="activeSection='lamps'" :style="{padding:'8px 12px',cursor:'pointer',borderRadius:'6px',background:activeSection==='lamps'?'var(--color-surface-muted)':'transparent',transition:'background 0.15s'}">💡 Лампы</div>
						<div @click="activeSection='candleholders'" :style="{padding:'8px 12px',cursor:'pointer',borderRadius:'6px',background:activeSection==='candleholders'?'var(--color-surface-muted)':'transparent',transition:'background 0.15s'}">🕯️ Подсвечники</div>
						<div @click="activeSection='mirrors'" :style="{padding:'8px 12px',cursor:'pointer',borderRadius:'6px',background:activeSection==='mirrors'?'var(--color-surface-muted)':'transparent',transition:'background 0.15s'}">🪞 Зеркала</div>
					</template>
					<template #collapsedContent>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:6px;cursor:pointer;">🚪</div>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:6px;cursor:pointer;">🏗️</div>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:6px;cursor:pointer;">💡</div>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:6px;cursor:pointer;">🕯️</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Полностью кастомный layout: кастомный header, навигация с бейджами, footer с пользователем */
export const FullCustomLayout: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSideBar>
	 <template #header>Логотип + кнопка</template>
	 <template #navigation>Меню с бейджами</template>
	 <template #default>Контент</template>
	 <template #footer>Профиль пользователя</template>
	 <template #collapsedContent>Иконки</template>
</BaseSideBar>`,
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const isCollapsed = ref(false)
			return { args, isCollapsed }
		},
		template: `
			<div style="height:600px;">
				<BaseSideBar v-bind="args" v-model:is-collapsed="isCollapsed" variant="shadow" :padding="8">
					<template #header>
						<div style="display:flex;align-items:center;gap:10px;width:100%;">
							<div style="width:32px;height:32px;border-radius:8px;background:var(--color-accent);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;">M</div>
							<span style="font-weight:700;font-size:15px;">Metal Art</span>
						</div>
					</template>
					<template #navigation>
						<div style="padding:8px 12px;cursor:pointer;border-radius:6px;display:flex;align-items:center;justify-content:space-between;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">
							<span>🏠 Главная</span>
						</div>
						<div style="padding:8px 12px;cursor:pointer;border-radius:6px;display:flex;align-items:center;justify-content:space-between;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">
							<span>📦 Заказы</span>
							<span style="background:var(--color-accent);color:#fff;font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600;">3</span>
						</div>
						<div style="padding:8px 12px;cursor:pointer;border-radius:6px;display:flex;align-items:center;justify-content:space-between;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">
							<span>💬 Сообщения</span>
							<span style="background:var(--color-error,#ef4444);color:#fff;font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600;">12</span>
						</div>
						<div style="padding:8px 12px;cursor:pointer;border-radius:6px;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">
							🎨 Каталог
						</div>
						<div style="padding:8px 12px;cursor:pointer;border-radius:6px;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">
							📊 Аналитика
						</div>
						<div style="padding:8px 12px;cursor:pointer;border-radius:6px;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">
							⚙️ Настройки
						</div>
					</template>
					<div style="padding:8px 0;font-size:13px;color:var(--color-text-muted);">
						Последнее обновление: сегодня
					</div>
					<template #footer>
						<div style="display:flex;align-items:center;gap:10px;">
							<div style="width:36px;height:36px;border-radius:50%;background:var(--color-accent);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:14px;">АИ</div>
							<div>
								<div style="font-size:14px;font-weight:600;">Артём И.</div>
								<div style="font-size:12px;color:var(--color-text-muted);">Администратор</div>
							</div>
						</div>
					</template>
					<template #collapsedContent>
						<div style="width:36px;height:36px;border-radius:8px;background:var(--color-accent);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;">M</div>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:6px;cursor:pointer;">🏠</div>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:6px;cursor:pointer;position:relative;">📦<span style="position:absolute;top:0;right:0;width:14px;height:14px;background:var(--color-accent);color:#fff;font-size:9px;border-radius:50%;display:flex;align-items:center;justify-content:center;">3</span></div>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:6px;cursor:pointer;">💬</div>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:6px;cursor:pointer;">🎨</div>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:6px;cursor:pointer;">⚙️</div>
						<div style="margin-top:auto;width:36px;height:36px;border-radius:50%;background:var(--color-accent);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:12px;">АИ</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Сравнение всех вариантов с полным контентом и сворачиванием */
export const MultiVariantComparison: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSideBar v-for="v in variants" :key="v" :variant="v" title="Навигация" />`,
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const variants = SIDEBAR_VARIANTS
			const collapsed = ref<Record<string, boolean>>({})
			function toggle(v: string) {
				collapsed.value[v] = !collapsed.value[v]
			}
			return { args, variants, collapsed, toggle }
		},
		template: `
			<div style="display:flex;gap:24px;height:500px;">
				<div v-for="v in variants" :key="v" style="flex:1;">
					<p style="margin:0 0 8px;font-size:12px;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.05em;">{{ v }}</p>
					<BaseSideBar
						v-bind="args"
						:variant="v"
						:title="v"
						v-model:is-collapsed="collapsed[v]"
					>
						<template #navigation>
							<div style="padding:8px 12px;cursor:pointer;border-radius:6px;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">🏠 Главная</div>
							<div style="padding:8px 12px;cursor:pointer;border-radius:6px;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">🎨 Каталог</div>
							<div style="padding:8px 12px;cursor:pointer;border-radius:6px;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">ℹ️ О нас</div>
						</template>
						<template #footer>
							<div style="font-size:12px;color:var(--color-text-muted);">© 2024</div>
						</template>
						<template #collapsedContent>
							<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">🏠</div>
							<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">🎨</div>
							<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">ℹ️</div>
						</template>
					</BaseSideBar>
				</div>
			</div>
		`,
	}),
}
/** Кастомные цвета для разных тем и контекстов */
export const CustomColorVariants: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSideBar :color="{ bg: '#1e293b', text: '#e2e8f0' }" title="Тёмная тема" />
<BaseSideBar :color="{ bg: '#fef3c7', text: '#92400e' }" title="Тёплая" />
<BaseSideBar :color="{ bg: '#ecfdf5', text: '#065f46' }" title="Мятная" />`,
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const isCollapsed = ref(false)
			const colors = [
				{ bg: { base: '#1e293b' }, text: { base: '#e2e8f0' }, label: 'Тёмная' },
				{ bg: { base: '#fef3c7' }, text: { base: '#92400e' }, label: 'Тёплая' },
				{ bg: { base: '#ecfdf5' }, text: { base: '#065f46' }, label: 'Мятная' },
			]
			return { args, isCollapsed, colors }
		},
		template: `
			<div style="display:flex;gap:24px;height:400px;">
				<div v-for="c in colors" :key="c.label" style="flex:1;">
					<p style="margin:0 0 8px;font-size:12px;color:var(--color-text-muted);">{{ c.label }}</p>
					<BaseSideBar v-bind="args" :color="c" :title="c.label" v-model:is-collapsed="isCollapsed">
						<template #navigation>
							<div style="padding:8px 12px;">Главная</div>
							<div style="padding:8px 12px;">Каталог</div>
						</template>
						<template #collapsedContent>
							<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">🏠</div>
						</template>
					</BaseSideBar>
				</div>
			</div>
		`,
	}),
}
/** Сайдбар с раскрывающимися списками */
export const ExpandableLists: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSideBar title="Каталог">
  <template #navigation>
    <details><summary>Изделия</summary>...</details>
    <details><summary>Декор</summary>...</details>
  </template>
</BaseSideBar>`,
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const isCollapsed = ref(false)
			return { args, isCollapsed }
		},
		template: `
			<div style="height:600px;">
				<BaseSideBar v-bind="args" v-model:is-collapsed="isCollapsed" title="Каталог" :gap="8">
					<template #navigation>
						<details style="margin-bottom:4px;" open>
							<summary style="cursor:pointer;padding:8px 12px;font-weight:600;border-radius:6px;transition:background 0.15s;list-style:none;display:flex;align-items:center;justify-content:space-between;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">
								<span>🚪 Изделия</span>
								<span style="font-size:10px;">▼</span>
							</summary>
							<div style="padding:4px 12px 8px 28px;">
								<div style="padding:6px 0;cursor:pointer;border-radius:4px;font-size:14px;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">Ворота</div>
								<div style="padding:6px 0;cursor:pointer;border-radius:4px;font-size:14px;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">Заборы</div>
								<div style="padding:6px 0;cursor:pointer;border-radius:4px;font-size:14px;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">Перила</div>
								<div style="padding:6px 0;cursor:pointer;border-radius:4px;font-size:14px;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">Калитки</div>
							</div>
						</details>
						<details style="margin-bottom:4px;">
							<summary style="cursor:pointer;padding:8px 12px;font-weight:600;border-radius:6px;transition:background 0.15s;list-style:none;display:flex;align-items:center;justify-content:space-between;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">
								<span>💡 Декор</span>
								<span style="font-size:10px;">▼</span>
							</summary>
							<div style="padding:4px 12px 8px 28px;">
								<div style="padding:6px 0;cursor:pointer;border-radius:4px;font-size:14px;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">Лампы</div>
								<div style="padding:6px 0;cursor:pointer;border-radius:4px;font-size:14px;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">Подсвечники</div>
								<div style="padding:6px 0;cursor:pointer;border-radius:4px;font-size:14px;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">Зеркала</div>
							</div>
						</details>
						<details style="margin-bottom:4px;">
							<summary style="cursor:pointer;padding:8px 12px;font-weight:600;border-radius:6px;transition:background 0.15s;list-style:none;display:flex;align-items:center;justify-content:space-between;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">
								<span>🔧 Услуги</span>
								<span style="font-size:10px;">▼</span>
							</summary>
							<div style="padding:4px 12px 8px 28px;">
								<div style="padding:6px 0;cursor:pointer;border-radius:4px;font-size:14px;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">Ковка</div>
								<div style="padding:6px 0;cursor:pointer;border-radius:4px;font-size:14px;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">Сварка</div>
								<div style="padding:6px 0;cursor:pointer;border-radius:4px;font-size:14px;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">Монтаж</div>
							</div>
						</details>
					</template>
					<template #collapsedContent>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:6px;cursor:pointer;">🚪</div>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:6px;cursor:pointer;">💡</div>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:6px;cursor:pointer;">🔧</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Кастомная ширина свёрнутого состояния */
export const CustomCollapsedWidth: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseSideBar :collapsed-width="80" title="Навигация" />',
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const isCollapsed = ref(false)
			return { args, isCollapsed }
		},
		template: `
			<div style="height:500px;">
				<label style="display:flex;align-items:center;gap:8px;margin-bottom:12px;cursor:pointer;">
					<input type="checkbox" v-model="isCollapsed" />
					Свёрнуто: {{ isCollapsed }}
				</label>
				<BaseSideBar v-bind="args" :collapsed-width="80" v-model:is-collapsed="isCollapsed" title="Широкий collapse">
					<template #navigation>
						<div style="padding:8px 12px;">Главная</div>
						<div style="padding:8px 12px;">Каталог</div>
					</template>
					<template #collapsedContent>
						<div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;">🏠</div>
						<div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;">🎨</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Масштабирование размера сайдбара */
export const SizeScaleVariants: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSideBar :size-scale="80" title="Маленький" />
<BaseSideBar :size-scale="100" title="Обычный" />
<BaseSideBar :size-scale="120" title="Большой" />`,
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const scales = [80, 100, 120]
			return { args, scales }
		},
		template: `
			<div style="display:flex;gap:24px;height:400px;align-items:flex-start;">
				<div v-for="s in scales" :key="s">
					<p style="margin:0 0 8px;font-size:12px;color:var(--color-text-muted);">sizeScale: {{ s }}%</p>
					<BaseSideBar v-bind="args" :size-scale="s" :title="\`Масштаб \${s}\`">
						<template #navigation>
							<div style="padding:8px 12px;">Главная</div>
							<div style="padding:8px 12px;">Каталог</div>
						</template>
					</BaseSideBar>
				</div>
			</div>
		`,
	}),
}
/** Разные значения gap между секциями */
export const GapVariants: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSideBar v-for="g in [0, 8, 16]" :key="g" :gap="g" title="Навигация" />`,
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;gap:24px;height:400px;align-items:flex-start;">
				<div v-for="g in [0, 8, 16]" :key="g">
					<p style="margin:0 0 8px;font-size:12px;color:var(--color-text-muted);">gap: {{ g }}px</p>
					<BaseSideBar v-bind="args" :gap="g" :title="\`gap \${g}\`">
						<template #navigation>
							<div style="padding:8px 12px;">Пункт 1</div>
							<div style="padding:8px 12px;">Пункт 2</div>
						</template>
						<template #footer>
							<div style="font-size:12px;color:var(--color-text-muted);">Подвал</div>
						</template>
					</BaseSideBar>
				</div>
			</div>
		`,
	}),
}
/** Все слоты — покрывает hasBody, hasFooter, hasNavigation, hasCollapsedContent */
export const AllSlots: Story = {
	render: () => ({
		components: { BaseSideBar },
		setup() {
			const collapsed = ref(false)
			return { collapsed }
		},
		template: `
			<div style="height:400px;">
				<BaseSideBar
					title="Все слоты"
					:is-collapsed="collapsed"
					@update:is-collapsed="val => collapsed = val"
				>
					<template #navigation>
						<div style="padding:8px 12px;">Навигация</div>
					</template>
					Основной контент
					<template #footer>
						<div style="font-size:12px;">Подвал</div>
					</template>
					<template #collapsedContent>
						<div style="padding:4px;">📁</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Uncontrolled toggle — покрытие ветки internalCollapsed.value = newValue */
export const UncontrolledToggle: Story = {
	args: { title: 'Uncontrolled' },
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: `
			<div style="height:400px;">
				<BaseSideBar v-bind="args">
					<template #navigation>
						<div style="padding:8px 12px;">Пункт 1</div>
					</template>
					<template #collapsedContent>
						<div style="padding:4px;">📁</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		// Клик в uncontrolled-режиме: props.isCollapsed === undefined → internalCollapsed.value = newValue
		const toggle = canvasElement.querySelector('.base-sidebar__toggle')
		if (toggle instanceof HTMLElement) {
			await userEvent.click(toggle)
			await userEvent.click(toggle)
		}
	},
}
/** Uncontrolled expand emit — покрывает стр. 163 (internalCollapsed) и 169 (emit expand) */
export const UncontrolledExpandEmit: Story = {
	args: { title: 'Uncontrolled Expand' },
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: `
			<div style="height:400px;">
				<BaseSideBar v-bind="args">
					<template #navigation>
						<div style="padding:8px 12px;">Пункт</div>
					</template>
					<template #collapsedContent>
						<div style="padding:4px;">📁</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		// Покрывает internalCollapsed (стр. 163) и оба ветвления emit collapse/expand (стр. 167-169).
		// Дважды кликаем по той же кнопке (после collapse её перерисовывает BaseTooltip).
		const toggle = canvasElement.querySelector('.base-sidebar__toggle')
		if (toggle instanceof HTMLElement) {
			// Первый клик — collapse (newValue=true → internalCollapsed=true → emit collapse)
			await userEvent.click(toggle)
			const toggleAgain = canvasElement.querySelector('.base-sidebar__toggle')
			if (toggleAgain instanceof HTMLElement) {
				// Второй клик — expand (newValue=false → internalCollapsed=false → emit expand)
				await userEvent.click(toggleAgain)
			}
		}
	},
}
// play удалён: дублирует "не должен рендерить кнопку сворачивания" в *.integration.spec.ts
/** Несворачиваемый режим */
export const NotCollapsible: Story = {
	args: {
		isCollapsible: false,
		title: 'Несворачиваемый',
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: `
			<div style="height:400px;">
				<BaseSideBar v-bind="args">
					<template #navigation>
						<div style="padding:8px 12px;">Пункт 1</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Сайдбар в состоянии загрузки. Покрывает v-if="isLoading" (L48) — скелетон вместо навигации и body. */
export const LoadingStateCoverage: Story = {
	args: {
		isLoading: true,
		title: 'Загрузка',
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: `
			<div style="height:400px;">
				<BaseSideBar v-bind="args">
					<template #navigation>
						<div style="padding:8px 12px;">Скрытый пункт</div>
					</template>
					<template #footer>
						<div style="font-size:12px;">Скрытый подвал</div>
					</template>
					<template #collapsedContent>
						<div style="padding:4px;">📁</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			const skeleton = canvasElement.querySelector('.base-sidebar__loading')
			if (!skeleton) {
				throw new Error('skeleton not rendered')
			}
		})
	},
}
/** Сайдбар только со слотом header (без title) — покрывает hasHeader через slots.header и ветку v-if="title" внутри fallback (L11 branch=1 — title undefined). */
export const HeaderSlotOnlyCoverage: Story = {
	args: {
		title: undefined,
		isCollapsible: true,
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: `
			<div style="height:400px;">
				<BaseSideBar v-bind="args">
					<template #header>
						<div style="font-weight:600;">Кастомный заголовок</div>
					</template>
					<template #navigation>
						<div style="padding:8px 12px;">Пункт</div>
					</template>
					<template #collapsedContent>
						<div style="padding:4px;">📁</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Controlled expand emit — покрывает ветку else (L166 branch=1) в handleToggle: v-model управляется снаружи, клик при isCollapsed=true вызывает emit('expand'). */
export const ControlledExpandEmitCoverage: Story = {
	args: { title: 'Controlled Expand' },
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const isCollapsed = ref(true)
			return { args, isCollapsed }
		},
		template: `
			<div style="height:400px;">
				<BaseSideBar v-bind="args" v-model:is-collapsed="isCollapsed">
					<template #navigation>
						<div style="padding:8px 12px;">Пункт</div>
					</template>
					<template #collapsedContent>
						<div style="padding:4px;">📁</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			const toggle = canvasElement.querySelector('.base-sidebar__toggle')
			if (!toggle) {
				throw new Error('toggle not found')
			}
		})
		const toggle = canvasElement.querySelector('.base-sidebar__toggle')
		if (toggle instanceof HTMLElement) {
			await userEvent.click(toggle)
		}
	},
}
/** Сайдбар без header-slot и без title, только isCollapsible. Покрывает третью ветку OR в hasHeader (L145 branch=2): первые два false, третий evaluated. */
export const NoHeaderTitleCollapsibleCoverage: Story = {
	args: {
		title: undefined,
		isCollapsible: true,
	},
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: `
			<div style="height:400px;">
				<BaseSideBar v-bind="args">
					<template #navigation>
						<div style="padding:8px 12px;">Без заголовка</div>
					</template>
					<template #collapsedContent>
						<div style="padding:4px;">📁</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
/** Uncontrolled toggle — покрывает ветку true (L162 branch=0): isCollapsed не передан, handleToggle обновляет internalCollapsed. */
export const UncontrolledToggleCoverage: Story = {
	args: { title: 'Uncontrolled', isCollapsible: true },
	render: args => ({
		components: { BaseSideBar },
		setup() {
			return { args }
		},
		template: `
			<div style="height:400px;">
				<BaseSideBar v-bind="args">
					<template #navigation>
						<div style="padding:8px 12px;">Пункт</div>
					</template>
					<template #collapsedContent>
						<div style="padding:4px;">📁</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			const toggle = canvasElement.querySelector('.base-sidebar__toggle')
			if (!toggle) {
				throw new Error('toggle not found')
			}
		})
		const toggle = canvasElement.querySelector('.base-sidebar__toggle')
		if (toggle instanceof HTMLElement) {
			await userEvent.click(toggle)
		}
	},
}
/** Длинный текст в пунктах меню */
export const LongContent: Story = {
	render: args => ({
		components: { BaseSideBar },
		setup() {
			const isCollapsed = ref(false)
			return { args, isCollapsed }
		},
		template: `
			<div style="height:500px;">
				<BaseSideBar v-bind="args" v-model:is-collapsed="isCollapsed">
					<template #navigation>
						<div style="padding:8px 12px;cursor:pointer;border-radius:6px;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">🏠 Очень длинное название пункта меню которое проверяет переполнение текста</div>
						<div style="padding:8px 12px;cursor:pointer;border-radius:6px;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">🎨 Ещё один длинный пункт навигации с подробным описанием раздела</div>
						<div style="padding:8px 12px;cursor:pointer;border-radius:6px;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">ℹ️ Информация о компании с дополнительными сведениями и контактами</div>
					</template>
					<template #collapsedContent>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">🏠</div>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">🎨</div>
						<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='var(--color-surface-muted)'" onmouseout="this.style.background='transparent'">ℹ️</div>
					</template>
				</BaseSideBar>
			</div>
		`,
	}),
}
