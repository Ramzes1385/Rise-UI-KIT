/**
 * Stories для компонента BaseDropdown.
 * Демонстрирует все позиции и настройки.
 */

import { expect, userEvent, waitFor } from 'storybook/test'
import { ref } from 'vue'
import { buildArgTypes } from '@utils/storybookUtils'
import { playShiftTab } from '@utils/storybookUtils/a11yHelpers'
import { DROPDOWN_VARIANTS } from '../model/BaseDropdown.types'
import BaseDropdown from '../ui/BaseDropdown.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<typeof BaseDropdown> = {
	title: 'UI/BaseDropdown',
	component: BaseDropdown,

	argTypes: buildArgTypes({
		props: {
			variant: { control: 'radio', options: DROPDOWN_VARIANTS },
			position: {
				control: 'select',
				options: [
					'bottom-start',
					'bottom-end',
					'bottom',
					'top-start',
					'top-end',
					'top',
					'left-start',
					'left-end',
					'left',
					'right-start',
					'right-end',
					'right',
				],
			},
			gap: { control: 'number' },
			maxHeight: { control: 'text' },
			color: {
				control: 'object',
				description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
			},
			padding: {
				control: 'object',
				description:
					'Отступы панели. Число (px): Y = значение, X = значение × 2. Объект { x, y, top, right, bottom, left } задаёт оси напрямую без умножения (например { x: 25, y: 43 } → 43px сверху/снизу, 25px по бокам); стороны переопределяют оси',
			},
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера (50–200%, по умолчанию 100)',
			},
		},
		hidden: ['onClose', 'onUpdate:isOpen'],
	}),

	args: {
		isOpen: false,
		position: 'bottom-start',
		variant: 'default',
		gap: 4,
		maxHeight: '320px',
		matchWidth: true,
		closeOnEscape: true,
		preventMousedown: true,
		padding: 2,
		sizeScale: 90,
	},
}

export default meta
type Story = StoryObj<typeof BaseDropdown>
/** Базовый dropdown */
export const Default: Story = {
	render: args => ({
		components: { BaseDropdown },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div style="padding:80px;display:flex;justify-content:center;">
				<BaseDropdown v-bind="args" v-model:is-open="isOpen">
					<button data-testid="trigger" style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;" @click="isOpen = !isOpen">
						Открыть
					</button>
					<template #dropdown>
						<div data-testid="panel" style="padding:8px;">
							<div v-for="i in 5" :key="i" style="padding:8px;cursor:pointer;border-radius:var(--border-radius-base);" @click="isOpen = false">
								Пункт {{ i }}
							</div>
						</div>
					</template>
				</BaseDropdown>
			</div>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		const trigger = canvasElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement

		await step('Фокусировка на триггере по Tab', async () => {
			await userEvent.tab()
			expect(trigger).toHaveFocus()
		})

		await step('Обратная фокусировка по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { selector: '[data-testid="trigger"]' })
		})

		await step('Открытие меню по клавише Enter', async () => {
			await userEvent.keyboard('[Enter]')
			await waitFor(() => {
				const panel = document.body.querySelector('[data-testid="panel"]')
				expect(panel).toBeInTheDocument()
			})
		})

		await step('Закрытие меню по клавише Escape', async () => {
			await userEvent.keyboard('[Escape]')
			await waitFor(() => {
				const panel = document.body.querySelector('[data-testid="panel"]')
				expect(panel).toBeNull()
			})
		})
	},
	parameters: {
		docs: {
			source: {
				code: `
<BaseDropdown v-model:is-open="isOpen">
  <button @click="isOpen = !isOpen">Открыть</button>
  <template #dropdown>
    <div v-for="i in 5" :key="i" @click="isOpen = false">Пункт {{ i }}</div>
  </template>
</BaseDropdown>
				`,
			},
		},
	},
}
/** Все позиции */
export const Positions: Story = {
	render: args => ({
		components: { BaseDropdown },
		setup() {
			const positions = [
				'bottom-start',
				'bottom-end',
				'bottom',
				'top-start',
				'top-end',
				'top',
				'left-start',
				'left-end',
				'left',
				'right-start',
				'right-end',
				'right',
			] as const
			const openMap = ref<Record<string, boolean>>({})
			function toggle(p: string) {
				openMap.value[p] = !openMap.value[p]
			}
			return { args, positions, openMap, toggle }
		},
		template: `
			<div style="padding:160px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center;">
				<BaseDropdown v-for="p in positions" :key="p"
					v-bind="args"
					v-model:is-open="openMap[p]"
					:position="p"
					@close="openMap[p] = false">
					<button style="padding:6px 12px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;font-size:12px;" @click="toggle(p)">
						{{ p }}
					</button>
					<template #dropdown>
						<div style="padding:8px;">Контент {{ p }}</div>
					</template>
				</BaseDropdown>
			</div>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `
<BaseDropdown v-for="p in positions" :key="p"
  v-model:is-open="openMap[p]" :position="p" @close="openMap[p] = false">
  <button @click="toggle(p)">{{ p }}</button>
  <template #dropdown><div>Контент {{ p }}</div></template>
</BaseDropdown>
				`,
			},
		},
	},
}
/** Все варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseDropdown },
		setup() {
			const openMap = ref<Record<string, boolean>>({})
			function toggle(v: string) {
				openMap.value[v] = !openMap.value[v]
			}
			return { args, toggle, openMap, DROPDOWN_VARIANTS }
		},
		template: `
			<div style="padding:80px;display:flex;gap:12px;justify-content:center;">
				<BaseDropdown v-for="v in DROPDOWN_VARIANTS" :key="v"
					v-bind="args"
					v-model:is-open="openMap[v]"
					:variant="v"
					@close="openMap[v] = false">
					<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;" @click="toggle(v)">
						{{ v }}
					</button>
					<template #dropdown>
						<div style="padding:8px;">Контент {{ v }}</div>
					</template>
				</BaseDropdown>
			</div>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `
<BaseDropdown v-for="v in DROPDOWN_VARIANTS" :key="v"
  v-model:is-open="openMap[v]" :variant="v" @close="openMap[v] = false">
  <button @click="toggle(v)">{{ v }}</button>
  <template #dropdown><div>Контент {{ v }}</div></template>
</BaseDropdown>
				`,
			},
		},
	},
}
/** Интерактивный */
export const Interactive: Story = {
	render: args => ({
		components: { BaseDropdown },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div style="padding:80px;display:flex;justify-content:center;">
				<BaseDropdown v-bind="args" v-model:is-open="isOpen">
					<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;" @click="isOpen = !isOpen">
						Открыть
					</button>
					<template #dropdown>
						<div style="padding:8px;">Контент</div>
					</template>
				</BaseDropdown>
			</div>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `
<BaseDropdown v-model:is-open="isOpen">
  <button @click="isOpen = !isOpen">Открыть</button>
  <template #dropdown><div>Контент</div></template>
</BaseDropdown>
				`,
			},
		},
	},
}
/** closeOnEscape=false — Escape не закрывает */
export const NoCloseOnEscape: Story = {
	args: { isOpen: true, closeOnEscape: false },
	render: args => ({
		components: { BaseDropdown },
		setup() {
			const isOpen = ref(true)
			return { args, isOpen }
		},
		template: `
			<div style="padding:80px;">
				<BaseDropdown v-bind="args" v-model:is-open="isOpen">
					<button>Триггер</button>
					<template #dropdown><div>Панель</div></template>
				</BaseDropdown>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
		await new Promise(r => setTimeout(r, 50))
		expect(canvasElement).toBeInTheDocument()
	},
}
/** Кастомный maxHeight */
export const CustomMaxHeight: Story = {
	args: { isOpen: true, maxHeight: '500px' },
	render: args => ({
		components: { BaseDropdown },
		setup() {
			const isOpen = ref(true)
			return { args, isOpen }
		},
		template: `
			<div style="padding:80px;">
				<BaseDropdown v-bind="args" v-model:is-open="isOpen">
					<button>Триггер</button>
					<template #dropdown><div>Панель</div></template>
				</BaseDropdown>
			</div>
		`,
	}),
}
/** Покрывает watch isOpen → сохранение/сброс savedActiveElement и handlePanelFocusin */
export const WatchIsOpenAndFocusin: Story = {
	args: { isOpen: true },
	render: args => ({
		components: { BaseDropdown },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div style="padding:80px;">
				<BaseDropdown v-bind="args" v-model:is-open="isOpen">
					<button data-testid="trigger" @click="isOpen = !isOpen">Триггер</button>
					<template #dropdown>
						<div data-testid="panel" style="padding:12px;">
							<input data-testid="focus-input" placeholder="Фокус" />
						</div>
					</template>
				</BaseDropdown>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		// Открываем dropdown (watch isOpen: true → сохраняет activeElement)
		const trigger = canvasElement.querySelector('[data-testid="trigger"]') as HTMLElement
		trigger.click()
		await new Promise(r => setTimeout(r, 200))

		// Панель должна быть видна (Teleport to="body" — ищем в document.body)
		const panel = document.body.querySelector('[data-testid="panel"]')
		expect(panel).toBeInTheDocument()

		// Фокусируемся на input внутри панели — trigger'ит handlePanelFocusin
		const input = document.body.querySelector('[data-testid="focus-input"]') as HTMLInputElement
		if (input) input.focus()
		await new Promise(r => setTimeout(r, 100))

		// Закрываем (watch isOpen: false → savedActiveElement = null)
		trigger.click()
		await new Promise(r => setTimeout(r, 100))

		// Ждём исчезновения панели (Transition может задержать удаление в jsdom)
		await waitFor(
			() => {
				expect(document.body.querySelector('[data-testid="panel"]')).toBeNull()
			},
			{ timeout: 2000 },
		)
	},
}
/** Дропдаун без элементов */
export const Empty: Story = {
	render: args => ({
		components: { BaseDropdown },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div style="padding:80px;display:flex;justify-content:center;">
				<BaseDropdown v-bind="args" v-model:is-open="isOpen">
					<button data-testid="trigger" style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;" @click="isOpen = !isOpen">
						Открыть
					</button>
					<template #dropdown>
						<div data-testid="panel" style="padding:8px;">
							<p style="color:var(--color-text-muted);padding:8px;">Нет элементов</p>
						</div>
					</template>
				</BaseDropdown>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		expect(canvasElement).toBeInTheDocument()
	},
}
/** Дропдаун с длинными текстами элементов */
export const LongContent: Story = {
	render: args => ({
		components: { BaseDropdown },
		setup() {
			const isOpen = ref(false)
			const items = [
				'Очень длинное название пункта меню, которое не помещается в одну строку и требует переноса',
				'Ещё один пункт с длинным текстом для проверки адаптивности компонента',
				'Короткий',
				'Последний элемент с достаточно длинным описанием для тестирования',
			]
			return { args, isOpen, items }
		},
		template: `
			<div style="padding:80px;display:flex;justify-content:center;">
				<BaseDropdown v-bind="args" v-model:is-open="isOpen">
					<button data-testid="trigger" style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;" @click="isOpen = !isOpen">
						Открыть
					</button>
					<template #dropdown>
						<div data-testid="panel" style="padding:8px;max-width:300px;">
							<div v-for="(item, i) in items" :key="i" style="padding:8px;cursor:pointer;border-radius:var(--border-radius-base);" @click="isOpen = false">
								{{ item }}
							</div>
						</div>
					</template>
				</BaseDropdown>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		expect(canvasElement).toBeInTheDocument()
	},
}
/** preventMousedown=true — покрывает true-ветку handlePanelMousedown (event.preventDefault) */
export const PreventMousedown: Story = {
	args: { preventMousedown: true },
	render: args => ({
		components: { BaseDropdown },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div style="padding:80px;display:flex;justify-content:center;">
				<BaseDropdown v-bind="args" v-model:is-open="isOpen">
					<button data-testid="trigger" @click="isOpen = !isOpen">Триггер</button>
					<template #dropdown>
						<div data-testid="panel" style="padding:12px;">Контент</div>
					</template>
				</BaseDropdown>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector('[data-testid="trigger"]') as HTMLElement
		trigger.click()
		await new Promise(r => setTimeout(r, 200))

		const panelEl = document.body.querySelector('.base-dropdown__panel') as HTMLElement
		expect(panelEl).toBeInTheDocument()

		const mousedownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
		panelEl.dispatchEvent(mousedownEvent)
		expect(mousedownEvent.defaultPrevented).toBe(true)
	},
}
/** preventMousedown=false — покрывает ложную ветку условия в handlePanelFocusin (строка 121) */
export const NoPreventMousedown: Story = {
	args: { preventMousedown: false },
	render: args => ({
		components: { BaseDropdown },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div style="padding:80px;display:flex;justify-content:center;">
				<BaseDropdown v-bind="args" v-model:is-open="isOpen">
					<button data-testid="trigger" @click="isOpen = !isOpen">Триггер</button>
					<template #dropdown>
						<div data-testid="panel" style="padding:12px;">
							<input data-testid="focus-input" placeholder="Фокус" />
						</div>
					</template>
				</BaseDropdown>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector('[data-testid="trigger"]') as HTMLElement
		trigger.click()
		await new Promise(r => setTimeout(r, 200))

		const panel = document.body.querySelector('[data-testid="panel"]')
		expect(panel).toBeInTheDocument()

		const input = document.body.querySelector('[data-testid="focus-input"]') as HTMLInputElement
		if (input) input.focus()
		await new Promise(r => setTimeout(r, 100))

		const mousedownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
		const panelEl = document.body.querySelector('.base-dropdown__panel') as HTMLElement
		panelEl?.dispatchEvent(mousedownEvent)
		expect(mousedownEvent.defaultPrevented).toBe(false)
	},
}
/** Объектный padding панели: оси x/y и точечные стороны */
export const ObjectPadding: Story = {
	args: {
		isOpen: true,
		padding: { x: 16, y: 8, bottom: 20 },
	},
	render: args => ({
		components: { BaseDropdown },
		setup() {
			return { args }
		},
		template: `
			<div style="padding:80px;display:flex;justify-content:center;">
				<BaseDropdown v-bind="args">
					<button>Триггер</button>
					<template #dropdown>
						<div>padding: { x: 16, y: 8, bottom: 20 }</div>
					</template>
				</BaseDropdown>
			</div>
		`,
	}),
	play: async () => {
		await new Promise(r => setTimeout(r, 100))
		const panel = document.body.querySelector('.base-dropdown__panel') as HTMLElement
		expect(panel).toBeInTheDocument()
		expect(panel.style.getPropertyValue('--dd-pad-top')).toBe('8px')
		expect(panel.style.getPropertyValue('--dd-pad-bottom')).toBe('20px')
		expect(panel.style.getPropertyValue('--dd-pad-left')).toBe('16px')
	},
}
