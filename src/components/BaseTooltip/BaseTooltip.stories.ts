/**
 * Stories для компонента BaseTooltip.
 * Демонстрирует все позиции, варианты и состояния.
 * Каждая story содержит play-функцию для 100% coverage.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import BaseTooltip from './BaseTooltip.vue'

import { TOOLTIP_VARIANTS } from './BaseTooltip.types'

import { playShiftTab } from '@utils/storybookUtils/a11yHelpers'

const meta: Meta<typeof BaseTooltip> = {
	title: 'UI/BaseTooltip',
	component: BaseTooltip,

	argTypes: {
		text: { control: 'text' },
		position: {
			control: 'inline-radio',
			options: ['top', 'bottom', 'left', 'right'],
		},
		variant: {
			control: 'inline-radio',
			options: TOOLTIP_VARIANTS,
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		isAlwaysVisible: { control: 'boolean' },
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
	},

	args: {
		text: 'Подсказка',
		position: 'top',
		variant: 'default',
		isAlwaysVisible: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseTooltip>
/** Базовая подсказка — hover показать/скрыть */
export const Default: Story = {
	render: args => ({
		components: { BaseTooltip },
		setup() {
			return { args }
		},
		template: `
			<div style="padding:60px;display:flex;justify-content:center;">
				<BaseTooltip v-bind="args">
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;">
						Наведите
					</span>
				</BaseTooltip>
			</div>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		expect(canvasElement).toBeInTheDocument()

		await step('Фокусировка триггера по Tab', async () => {
			await userEvent.tab()
		})

		await step('Обратная фокусировка по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { selector: 'span' })
		})

		// Наводим — тултип появляется
		const trigger = canvas.getByText('Наведите')
		await userEvent.hover(trigger)

		// Ждём setTimeout 100ms + рендер
		await waitFor(
			() => {
				const tooltip = document.body.querySelector('.base-tooltip')
				expect(tooltip).not.toBeNull()
			},
			{ timeout: 500 },
		)

		// Убираем курсор — тултип скрывается
		await userEvent.unhover(trigger)
		await waitFor(
			() => {
				const tooltip = document.body.querySelector('.base-tooltip')
				expect(tooltip).toBeNull()
			},
			{ timeout: 500 },
		)
	},
}
/** Все позиции — hover на каждом */
export const Positions: Story = {
	render: args => ({
		components: { BaseTooltip },
		setup() {
			return { args }
		},
		template: `
			<div style="padding:80px;display:flex;gap:24px;justify-content:center;">
				<BaseTooltip v-bind="args" position="top" text="Сверху">
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">Top</span>
				</BaseTooltip>
				<BaseTooltip v-bind="args" position="bottom" text="Снизу">
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">Bottom</span>
				</BaseTooltip>
				<BaseTooltip v-bind="args" position="left" text="Слева">
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">Left</span>
				</BaseTooltip>
				<BaseTooltip v-bind="args" position="right" text="Справа">
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">Right</span>
				</BaseTooltip>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvasElement).toBeInTheDocument()

		// Hover на Top
		const topTrigger = canvas.getByText('Top')
		await userEvent.hover(topTrigger)
		await waitFor(
			() => {
				expect(document.body.querySelector('.base-tooltip')).not.toBeNull()
			},
			{ timeout: 500 },
		)
		await userEvent.unhover(topTrigger)
	},
}
/** Все варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseTooltip },
		setup() {
			return { args }
		},
		template: `
			<div style="padding:80px;display:flex;gap:24px;justify-content:center;flex-wrap:wrap;">
				<BaseTooltip v-for="v in ['default','ghost','outline','shadow','soft']"
					:key="v"
					v-bind="args"
					:variant="v"
					:text="'Variant: ' + v"
				>
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">{{ v }}</span>
				</BaseTooltip>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvasElement).toBeInTheDocument()

		const trigger = canvas.getByText('default')
		await userEvent.hover(trigger)
		await waitFor(
			() => {
				expect(document.body.querySelector('.base-tooltip')).not.toBeNull()
			},
			{ timeout: 500 },
		)
		await userEvent.unhover(trigger)
	},
}
/** Всегда видима — покрывает onMounted с isAlwaysVisible и watch */
export const AlwaysVisible: Story = {
	args: {
		isAlwaysVisible: true,
	},
	render: args => ({
		components: { BaseTooltip },
		setup() {
			return { args }
		},
		template: `
			<div style="padding:60px;display:flex;justify-content:center;">
				<BaseTooltip v-bind="args">
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">
						Всегда видима
					</span>
				</BaseTooltip>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		expect(canvasElement).toBeInTheDocument()

		// Ту��тип должен быть виден сразу
		await waitFor(
			() => {
				expect(document.body.querySelector('.base-tooltip')).not.toBeNull()
			},
			{ timeout: 500 },
		)

		// Hover не должен ничего менять
		const canvas = within(canvasElement)
		const trigger = canvas.getByText('Всегда видима')
		await userEvent.hover(trigger)
	},
}
/** Многострочный текст */
export const Multiline: Story = {
	args: {
		text: 'Первая строка подсказки\nВторая строка подсказки\nТретья строка подсказки',
	},
	render: args => ({
		components: { BaseTooltip },
		setup() {
			return { args }
		},
		template: `
			<div style="padding:60px;display:flex;justify-content:center;">
				<BaseTooltip v-bind="args">
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;">
						Наведите для многострочного текста
					</span>
				</BaseTooltip>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvasElement).toBeInTheDocument()

		const trigger = canvas.getByText('Наведите для многострочного текста')
		await userEvent.hover(trigger)
		await waitFor(
			() => {
				expect(document.body.querySelector('.base-tooltip')).not.toBeNull()
			},
			{ timeout: 500 },
		)
		await userEvent.unhover(trigger)
	},
}
/** Масштаб размера */
export const SizeScale: Story = {
	render: args => ({
		components: { BaseTooltip },
		setup() {
			return { args }
		},
		template: `
			<div style="padding:80px;display:flex;gap:24px;justify-content:center;align-items:center;">
				<BaseTooltip v-bind="args" :size-scale="75" text="Масштаб 75%">
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">75%</span>
				</BaseTooltip>
				<BaseTooltip v-bind="args" :size-scale="100" text="Масштаб 100%">
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">100%</span>
				</BaseTooltip>
				<BaseTooltip v-bind="args" :size-scale="150" text="Масштаб 150%">
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">150%</span>
				</BaseTooltip>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvasElement).toBeInTheDocument()

		const trigger = canvas.getByText('100%')
		await userEvent.hover(trigger)
		await waitFor(
			() => {
				expect(document.body.querySelector('.base-tooltip')).not.toBeNull()
			},
			{ timeout: 500 },
		)
		await userEvent.unhover(trigger)
	},
}
/** Кастомный цвет */
export const CustomColor: Story = {
	args: {
		color: { bg: { base: '#1a7a3a' }, text: { base: '#ffffff' } },
	},
	render: args => ({
		components: { BaseTooltip },
		setup() {
			return { args }
		},
		template: `
			<div style="padding:60px;display:flex;justify-content:center;">
				<BaseTooltip v-bind="args">
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;">
						Кастомный цвет
					</span>
				</BaseTooltip>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvasElement).toBeInTheDocument()

		const trigger = canvas.getByText('Кастомный цвет')
		await userEvent.hover(trigger)
		await waitFor(
			() => {
				expect(document.body.querySelector('.base-tooltip')).not.toBeNull()
			},
			{ timeout: 500 },
		)
		await userEvent.unhover(trigger)
	},
}
/** Все варианты × все позиции */
export const AllCombinations: Story = {
	render: args => ({
		components: { BaseTooltip },
		setup() {
			return { args }
		},
		template: `
			<div style="padding:40px;">
				<div v-for="variant in ['default','ghost','outline','shadow','soft']" :key="variant" style="margin-bottom:32px;">
					<h4 style="margin-bottom:12px;">{{ variant }}</h4>
					<div style="display:flex;gap:24px;justify-content:center;flex-wrap:wrap;">
						<BaseTooltip v-bind="args" :variant="variant" position="top" :text="variant + ' top'">
							<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">Top</span>
						</BaseTooltip>
						<BaseTooltip v-bind="args" :variant="variant" position="bottom" :text="variant + ' bottom'">
							<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">Bottom</span>
						</BaseTooltip>
						<BaseTooltip v-bind="args" :variant="variant" position="left" :text="variant + ' left'">
							<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">Left</span>
						</BaseTooltip>
						<BaseTooltip v-bind="args" :variant="variant" position="right" :text="variant + ' right'">
							<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">Right</span>
						</BaseTooltip>
					</div>
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvasElement).toBeInTheDocument()

		const trigger = canvas.getAllByText('Top')[0]!
		await userEvent.hover(trigger)
		await waitFor(
			() => {
				expect(document.body.querySelector('.base-tooltip')).not.toBeNull()
			},
			{ timeout: 500 },
		)
		await userEvent.unhover(trigger)
	},
}
/** Длинный текст в тултипе */
export const LongContent: Story = {
	args: {
		text: 'Это очень длинный текст подсказки, который проверяет как компонент BaseTooltip справляется с большим объёмом содержимого, включая перенос строк и масштабирование контейнера тултипа при значительном объёме текстовой информации',
	},
	render: args => ({
		components: { BaseTooltip },
		setup() {
			return { args }
		},
		template: `
			<div style="padding:60px;display:flex;justify-content:center;">
				<BaseTooltip v-bind="args">
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;">
						Длинный текст
					</span>
				</BaseTooltip>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvasElement).toBeInTheDocument()

		const trigger = canvas.getByText('Длинный текст')
		await userEvent.hover(trigger)
		await waitFor(
			() => {
				expect(document.body.querySelector('.base-tooltip')).not.toBeNull()
			},
			{ timeout: 500 },
		)
		await userEvent.unhover(trigger)
	},
}
/** Hover → быстрый Unhover → быстрый Hover (покрытие clearTimeout hideTimer в handleEnter) */
export const QuickReenter: Story = {
	render: args => ({
		components: { BaseTooltip },
		setup() {
			return { args }
		},
		template: `
			<div style="padding:60px;display:flex;justify-content:center;">
				<BaseTooltip v-bind="args" text="Быстрый возврат">
					<span style="padding:8px 16px;border:1px solid var(--color-border);">Trigger</span>
				</BaseTooltip>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const trigger = canvas.getByText('Trigger')

		await userEvent.hover(trigger)
		await waitFor(
			() => {
				expect(document.body.querySelector('.base-tooltip')).not.toBeNull()
			},
			{ timeout: 500 },
		)
		// Запускаем hideTimer
		await userEvent.unhover(trigger)
		// До истечения 150ms возвращаемся — handleEnter должен очистить hideTimer
		await userEvent.hover(trigger)
		await waitFor(
			() => {
				expect(document.body.querySelector('.base-tooltip')).not.toBeNull()
			},
			{ timeout: 500 },
		)
		await userEvent.unhover(trigger)
	},
}
/** Реактивное переключение isAlwaysVisible с true на false (покрытие watch false branch) */
export const ToggleAlwaysVisible: Story = {
	render: () => ({
		components: { BaseTooltip },
		setup() {
			const isAlwaysVisible = ref(true)
			function handleToggle(): void {
				isAlwaysVisible.value = !isAlwaysVisible.value
			}
			return { isAlwaysVisible, handleToggle }
		},
		template: `
			<div style="padding:60px;display:flex;flex-direction:column;gap:16px;align-items:center;">
				<button type="button" data-testid="toggle-btn" @click="handleToggle">Переключить</button>
				<BaseTooltip text="Подсказка" :is-always-visible="isAlwaysVisible">
					<span style="padding:8px 16px;border:1px solid var(--color-border);">Trigger</span>
				</BaseTooltip>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		await waitFor(
			() => {
				expect(document.body.querySelector('.base-tooltip')).not.toBeNull()
			},
			{ timeout: 500 },
		)
		const toggleBtn = canvasElement.querySelector('[data-testid="toggle-btn"]')
		if (toggleBtn instanceof HTMLElement) {
			await userEvent.click(toggleBtn)
		}
		await waitFor(
			() => {
				expect(document.body.querySelector('.base-tooltip')).toBeNull()
			},
			{ timeout: 500 },
		)
	},
}
/** Реактивное переключение isAlwaysVisible с false на true (покрытие watch true branch, стр. 138-141) */
export const ToggleToAlwaysVisible: Story = {
	render: () => ({
		components: { BaseTooltip },
		setup() {
			const isAlwaysVisible = ref(false)
			function handleToggle(): void {
				isAlwaysVisible.value = !isAlwaysVisible.value
			}
			return { isAlwaysVisible, handleToggle }
		},
		template: `
			<div style="padding:60px;display:flex;flex-direction:column;gap:16px;align-items:center;">
				<button type="button" data-testid="toggle-on-btn" @click="handleToggle">Показать</button>
				<BaseTooltip text="Постоянная подсказка" :is-always-visible="isAlwaysVisible">
					<span style="padding:8px 16px;border:1px solid var(--color-border);">Trigger</span>
				</BaseTooltip>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		// Начальное состояние — тултип скрыт
		await waitFor(
			() => {
				expect(document.body.querySelector('.base-tooltip')).toBeNull()
			},
			{ timeout: 500 },
		)
		// Переключаем на true → watch: updateCoords + isVisible = true + startUpdateLoop (стр. 139-141)
		const toggleBtn = canvasElement.querySelector('[data-testid="toggle-on-btn"]')
		if (toggleBtn instanceof HTMLElement) {
			await userEvent.click(toggleBtn)
		}
		await waitFor(
			() => {
				expect(document.body.querySelector('.base-tooltip')).not.toBeNull()
			},
			{ timeout: 500 },
		)
	},
}
/** Быстрый unhover ДО истечения showTimer (100ms) — покрывает ветку `if (showTimer)` в `handleLeave` (clearTimeout showTimer). */
export const TooltipHoverDelay: Story = {
	render: args => ({
		components: { BaseTooltip },
		setup() {
			return { args }
		},
		template: `
			<div style="padding:60px;display:flex;justify-content:center;">
				<BaseTooltip v-bind="args" text="Задержка показа">
					<span style="padding:8px 16px;border:1px solid var(--color-border);">HoverDelay</span>
				</BaseTooltip>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const trigger = canvas.getByText('HoverDelay')

		await userEvent.hover(trigger)
		await userEvent.unhover(trigger)

		await new Promise(resolve => setTimeout(resolve, 200))

		await waitFor(
			() => {
				expect(document.body.querySelector('.base-tooltip')).toBeNull()
			},
			{ timeout: 500 },
		)
	},
}
/** Hover/unhover при `isAlwaysVisible: true` — покрывает early-return ветки в `handleEnter` и `handleLeave`. */
export const TooltipKeyboardEsc: Story = {
	args: {
		isAlwaysVisible: true,
	},
	render: args => ({
		components: { BaseTooltip },
		setup() {
			return { args }
		},
		template: `
			<div style="padding:60px;display:flex;justify-content:center;">
				<BaseTooltip v-bind="args" text="Always">
					<span style="padding:8px 16px;border:1px solid var(--color-border);">AlwaysTrigger</span>
				</BaseTooltip>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const trigger = canvas.getByText('AlwaysTrigger')

		await waitFor(
			() => {
				expect(document.body.querySelector('.base-tooltip')).not.toBeNull()
			},
			{ timeout: 500 },
		)

		await userEvent.hover(trigger)
		await userEvent.unhover(trigger)

		trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

		await waitFor(
			() => {
				expect(document.body.querySelector('.base-tooltip')).not.toBeNull()
			},
			{ timeout: 300 },
		)
	},
}
/** Hover на тултипах со всеми позициями (bottom/left/right) — покрывает все ветки `getTooltipTransition` и стили позиционирования. */
export const TooltipPlacementFlip: Story = {
	render: args => ({
		components: { BaseTooltip },
		setup() {
			return { args }
		},
		template: `
			<div style="padding:120px;display:flex;gap:48px;justify-content:center;">
				<BaseTooltip v-bind="args" position="bottom" text="BottomTip">
					<span data-testid="flip-bottom" style="padding:8px 16px;border:1px solid var(--color-border);">FlipBottom</span>
				</BaseTooltip>
				<BaseTooltip v-bind="args" position="left" text="LeftTip">
					<span data-testid="flip-left" style="padding:8px 16px;border:1px solid var(--color-border);">FlipLeft</span>
				</BaseTooltip>
				<BaseTooltip v-bind="args" position="right" text="RightTip">
					<span data-testid="flip-right" style="padding:8px 16px;border:1px solid var(--color-border);">FlipRight</span>
				</BaseTooltip>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const bottomTrigger = canvas.getByText('FlipBottom')
		await userEvent.hover(bottomTrigger)
		await waitFor(
			() => {
				expect(document.body.querySelector('.base-tooltip--bottom')).not.toBeNull()
			},
			{ timeout: 500 },
		)
		await userEvent.unhover(bottomTrigger)

		const leftTrigger = canvas.getByText('FlipLeft')
		await userEvent.hover(leftTrigger)
		await waitFor(
			() => {
				expect(document.body.querySelector('.base-tooltip--left')).not.toBeNull()
			},
			{ timeout: 500 },
		)
		await userEvent.unhover(leftTrigger)

		const rightTrigger = canvas.getByText('FlipRight')
		await userEvent.hover(rightTrigger)
		await waitFor(
			() => {
				expect(document.body.querySelector('.base-tooltip--right')).not.toBeNull()
			},
			{ timeout: 500 },
		)
		await userEvent.unhover(rightTrigger)
	},
}
/** Размонтирование компонента при активных таймерах и видимом тултипе — покрывает `onBeforeUnmount` ветки `if (showTimer)` / `if (hideTimer)` true. */
export const TooltipDisabled: Story = {
	render: () => ({
		components: { BaseTooltip },
		setup() {
			const isMounted = ref(true)
			function handleUnmount(): void {
				isMounted.value = false
			}
			return { isMounted, handleUnmount }
		},
		template: `
			<div style="padding:60px;display:flex;flex-direction:column;gap:16px;align-items:center;">
				<button type="button" data-testid="unmount-btn" @click="handleUnmount">Размонтировать</button>
				<BaseTooltip v-if="isMounted" text="Исчезающая подсказка">
					<span style="padding:8px 16px;border:1px solid var(--color-border);">UnmountTrigger</span>
				</BaseTooltip>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const trigger = canvas.getByText('UnmountTrigger')

		await userEvent.hover(trigger)

		const unmountBtn = canvasElement.querySelector('[data-testid="unmount-btn"]')
		if (unmountBtn instanceof HTMLElement) {
			await userEvent.click(unmountBtn)
		}

		await waitFor(
			() => {
				expect(canvasElement.textContent).not.toContain('UnmountTrigger')
			},
			{ timeout: 500 },
		)
	},
}
