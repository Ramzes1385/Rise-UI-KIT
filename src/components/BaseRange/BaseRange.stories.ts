/**
 * Stories для BaseRange — 100% coverage.
 * Покрывает все v-if ветки: range, vertical, tooltip, marks, label, custom thumb.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, fireEvent, userEvent, waitFor } from 'storybook/test'
import { ref } from 'vue'

import { buildArgTypes } from '@utils/storybookUtils'
import { playShiftTab } from '@utils/storybookUtils/a11yHelpers'
import { RANGE_VARIANTS } from './BaseRange.types'
import BaseRange from './BaseRange.vue'

const meta: Meta<typeof BaseRange> = {
	title: 'UI/BaseRange',
	component: BaseRange,
	argTypes: buildArgTypes({
		props: {
			modelValue: { control: { type: 'range', min: 0, max: 100 } },
			rangeValue: { control: 'object' },
			points: { control: 'object' },
			min: { control: 'number' },
			max: { control: 'number' },
			step: { control: 'number' },
			variant: { control: 'radio', options: RANGE_VARIANTS },
			isDisabled: { control: 'boolean' },
			hasTooltip: { control: 'boolean' },
			marks: { control: 'object' },
			isVertical: { control: 'boolean' },
			hasLabel: { control: 'boolean' },
			sizeScale: { control: { type: 'range', min: 50, max: 200, step: 10 } },
		},
	}),
	args: { modelValue: 40, min: 0, max: 100, step: 1, variant: 'default', sizeScale: 100 },
}

export default meta
type Story = StoryObj<typeof BaseRange>

const trackRect = {
	width: 200,
	height: 100,
	top: 0,
	left: 0,
	bottom: 100,
	right: 200,
	x: 0,
	y: 0,
	toJSON: () => ({}),
}

function getElement(root: ParentNode, selector: string): HTMLElement {
	const element = root.querySelector<HTMLElement>(selector)
	if (!element) throw new Error(`Не найден элемент ${selector}`)
	return element
}

function getElements(root: ParentNode, selector: string): NodeListOf<HTMLElement> {
	const elements = root.querySelectorAll<HTMLElement>(selector)
	if (!elements.length) throw new Error(`Не найдены элементы ${selector}`)
	return elements
}

function mockTrack(root: ParentNode): void {
	const track = getElement(root, '.base-range__track-wrapper')
	track.getBoundingClientRect = () => trackRect
}

function eventDetail(x: number, y = 50): MouseEventInit {
	return { clientX: x, clientY: y, bubbles: true }
}

/** Создаёт валидный Touch для Chromium (литералы Touch не принимает) */
function makeTouch(target: EventTarget, x: number, y: number): Touch {
	return new Touch({
		identifier: 0,
		target,
		clientX: x,
		clientY: y,
		pageX: x,
		pageY: y,
		screenX: x,
		screenY: y,
		radiusX: 1,
		radiusY: 1,
		rotationAngle: 0,
		force: 1,
	})
}

/** Диспатчит TouchEvent заданного типа с координатами */
function dispatchTouch(target: EventTarget, type: 'touchstart' | 'touchmove' | 'touchend', x: number, y: number): void {
	const touch = makeTouch(target, x, y)
	const event = new TouchEvent(type, {
		bubbles: true,
		cancelable: true,
		touches: type === 'touchend' ? [] : [touch],
		targetTouches: type === 'touchend' ? [] : [touch],
		changedTouches: [touch],
	})
	target.dispatchEvent(event)
}
/** Диапазон с двумя ползунками */
export const RangeDouble: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref<[number, number]>([20, 70])
			return { args, v }
		},
		template: '<BaseRange v-bind="args" v-model:range-value="v" has-tooltip has-label />',
	}),
	play: async ({ canvasElement }) => {
		const thumbs = canvasElement.querySelectorAll('.base-range__thumb')
		expect(thumbs.length).toBe(2)
	},
}
/** Несколько точек манипуляции (3 и более ползунков) */
export const MultiPoint: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref<number[]>([20, 50, 80])
			return { args, v }
		},
		template: '<BaseRange v-bind="args" v-model:points="v" has-tooltip has-label />',
	}),
	play: async ({ canvasElement }) => {
		const thumbs = canvasElement.querySelectorAll('.base-range__thumb')
		expect(thumbs.length).toBe(3)
		const fills = canvasElement.querySelectorAll('.base-range__fill')
		expect(fills.length).toBe(2)
	},
}
/** Перетаскивание среднего ползунка в режиме points — ограничено соседями */
export const MultiPointDragMiddle: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref<number[]>([20, 50, 80])
			return { args, v }
		},
		template: '<BaseRange v-bind="args" v-model:points="v" />',
	}),
	play: async ({ canvasElement }) => {
		mockTrack(canvasElement)
		const thumbs = getElements(canvasElement, '.base-range__thumb')
		// Тащим средний ползунок к 60% (120px)
		await fireEvent.mouseDown(thumbs[1], eventDetail(100))
		await fireEvent.mouseMove(document, eventDetail(120))
		await fireEvent.mouseUp(document)
		await waitFor(() => expect(thumbs[1].getAttribute('aria-valuenow')).toBe('60'))

		// Пытаемся утащить за правого соседа — ограничится 80
		await fireEvent.mouseDown(thumbs[1], eventDetail(120))
		await fireEvent.mouseMove(document, eventDetail(200))
		await fireEvent.mouseUp(document)
		await waitFor(() => expect(thumbs[1].getAttribute('aria-valuenow')).toBe('80'))
	},
}
/** Несколько точек с клавиатурным управлением */
export const MultiPointKeyboard: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref<number[]>([20, 50, 80])
			return { args, v }
		},
		template: '<BaseRange v-bind="args" v-model:points="v" />',
	}),
	play: async ({ canvasElement }) => {
		const thumbs = getElements(canvasElement, '.base-range__thumb')
		thumbs[1].focus()
		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(thumbs[1].getAttribute('aria-valuenow')).toBe('51'))
		await userEvent.keyboard('{ArrowLeft}')
		await waitFor(() => expect(thumbs[1].getAttribute('aria-valuenow')).toBe('50'))
	},
}
/** Вертикальная ориентация */
export const Vertical: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref(50)
			return { args, v }
		},
		template: '<div style="height:300px;"><BaseRange v-bind="args" v-model="v" is-vertical has-tooltip /></div>',
	}),
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.base-range--vertical')).toBeTruthy()
	},
}
/** Базовое состояние компонента */
export const Default: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref(40)
			return { args, v }
		},
		template: '<BaseRange v-bind="args" v-model="v" />',
	}),
	play: async ({ canvasElement, step }) => {
		await step('Фокусировка ползунка по Tab', async () => {
			await userEvent.tab()
		})

		await step('Обратная фокусировка по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { selector: '.base-range__thumb' })
		})
	},
}
/** Все визуальные варианты */
export const Variants: Story = {
	render: () => ({
		components: { BaseRange },
		setup() {
			const variants = RANGE_VARIANTS
			return { variants }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;padding:16px;">
				<div v-for="v in variants" :key="v" style="display:flex;flex-direction:column;gap:6px;">
					<span style="font-size:12px;color:var(--color-text-muted);">{{ v }}</span>
					<BaseRange :model-value="40" :variant="v" />
				</div>
			</div>
		`,
	}),
}
/** Доступные цветовые схемы */
export const Colors: Story = {
	render: () => ({
		components: { BaseRange },
		setup() {
			const colors = [
				{ name: 'success', value: { bg: { base: 'var(--color-success)' } } },
				{ name: 'warning', value: { bg: { base: 'var(--color-warning)' } } },
				{ name: 'error', value: { bg: { base: 'var(--color-error)' } } },
				{ name: 'primary', value: { bg: { base: 'var(--color-primary)' } } },
			]
			return { colors }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;padding:16px;">
				<div v-for="c in colors" :key="c.name" style="display:flex;flex-direction:column;gap:6px;">
					<span style="font-size:12px;color:var(--color-text-muted);">{{ c.name }}</span>
					<BaseRange :model-value="40" :color="c.value" />
				</div>
			</div>
		`,
	}),
}
/** Отключённое состояние */
export const Disabled: Story = {
	args: { isDisabled: true },
}
/** Интерактивный сценарий для проверки поведения */
export const Interactive: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref(40)
			return { args, v }
		},
		template: '<BaseRange v-bind="args" v-model="v" />',
	}),
	play: async ({ canvasElement }) => {
		mockTrack(canvasElement)
		await fireEvent.mouseDown(getElement(canvasElement, '.base-range__track-wrapper'), eventDetail(100))
		await fireEvent.mouseMove(document, eventDetail(160))
		await fireEvent.mouseUp(document)
		await waitFor(() =>
			expect(getElement(canvasElement, '.base-range__thumb').getAttribute('aria-valuenow')).toBe('80'),
		)
	},
}
/** Состояние при наведении (hover) */
export const HoverState: Story = {
	decorators: [() => ({ template: '<div class="base-range--hover"><story /></div>' })],
}
/** Активное состояние (нажатие) */
export const ActiveState: Story = {
	decorators: [() => ({ template: '<div class="base-range--active"><story /></div>' })],
}
/** Состояние фокуса (клавиатура) */
export const FocusState: Story = {
	decorators: [() => ({ template: '<div class="base-range--focus"><story /></div>' })],
}
/** Отображение в тёмной теме */
export const DarkTheme: Story = {
	decorators: [
		() => ({ template: '<div data-theme="dark" style="padding:16px;background:var(--color-bg);"><story /></div>' }),
	],
}
/** Кастомный ползунок (thumb) */
export const CustomThumb: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref(40)
			return { args, v }
		},
		template:
			'<BaseRange v-bind="args" v-model="v"><template #thumb="{ value }"><div style="width:28px;height:28px;border-radius:50%;background:var(--color-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;">{{ value }}</div></template></BaseRange>',
	}),
}
/** Управление одиночным значением с клавиатуры */
export const KeyboardSingle: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref(40)
			return { args, v }
		},
		template: '<BaseRange v-bind="args" v-model="v" />',
	}),
	play: async ({ canvasElement }) => {
		const thumb = getElement(canvasElement, '.base-range__thumb')
		thumb.focus()
		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(thumb.getAttribute('aria-valuenow')).toBe('41'))
		await userEvent.keyboard('{ArrowLeft}')
		await waitFor(() => expect(thumb.getAttribute('aria-valuenow')).toBe('40'))
		await userEvent.keyboard('{ArrowUp}')
		await waitFor(() => expect(thumb.getAttribute('aria-valuenow')).toBe('41'))
		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(thumb.getAttribute('aria-valuenow')).toBe('40'))
	},
}
/** Управление диапазоном с клавиатуры */
export const KeyboardRange: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref<[number, number]>([20, 70])
			return { args, v }
		},
		template: '<BaseRange v-bind="args" v-model:range-value="v" />',
	}),
	play: async ({ canvasElement }) => {
		const thumbs = getElements(canvasElement, '.base-range__thumb')
		thumbs[0].focus()
		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(thumbs[0].getAttribute('aria-valuenow')).toBe('21'))

		thumbs[1].focus()
		await userEvent.keyboard('{ArrowLeft}')
		await waitFor(() => expect(thumbs[1].getAttribute('aria-valuenow')).toBe('69'))
		await userEvent.keyboard('{ArrowUp}')
		await waitFor(() => expect(thumbs[1].getAttribute('aria-valuenow')).toBe('70'))
		await userEvent.keyboard('{ArrowDown}')
	},
}
/** Клавиша не из списка ArrowLeft/Right/Up/Down — игнорируется */
export const KeyboardOtherKey: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref(50)
			return { args, v }
		},
		template: '<BaseRange v-bind="args" v-model="v" />',
	}),
	play: async ({ canvasElement }) => {
		const thumb = getElement(canvasElement, '.base-range__thumb')
		thumb.focus()
		await userEvent.keyboard('{Enter}')
		expect(thumb.getAttribute('aria-valuenow')).toBe('50')
	},
}
/** Disabled — клавиатура игнорируется */
export const DisabledKeyboard: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref(40)
			return { args, v }
		},
		template: '<BaseRange v-bind="args" v-model="v" is-disabled />',
	}),
	play: async ({ canvasElement }) => {
		const thumb = getElement(canvasElement, '.base-range__thumb')
		thumb.focus()
		await userEvent.keyboard('{ArrowRight}')
		expect(thumb.getAttribute('aria-valuenow')).toBe('40')
	},
}
/** Disabled — клик по треку игнорируется */
export const DisabledTrackClick: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref(40)
			return { args, v }
		},
		template: '<BaseRange v-bind="args" v-model="v" is-disabled />',
	}),
	play: async ({ canvasElement }) => {
		mockTrack(canvasElement)
		await fireEvent.mouseDown(getElement(canvasElement, '.base-range__track-wrapper'), eventDetail(160))
		const thumb = getElement(canvasElement, '.base-range__thumb')
		expect(thumb.getAttribute('aria-valuenow')).toBe('40')
	},
}
/** Disabled — mousedown на thumb игнорируется */
export const DisabledThumbDown: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref(40)
			return { args, v }
		},
		template: '<BaseRange v-bind="args" v-model="v" is-disabled />',
	}),
	play: async ({ canvasElement }) => {
		mockTrack(canvasElement)
		const thumb = getElement(canvasElement, '.base-range__thumb')
		await fireEvent.mouseDown(thumb, eventDetail(100))
		await fireEvent.mouseMove(document, eventDetail(180))
		await fireEvent.mouseUp(document)
		expect(thumb.getAttribute('aria-valuenow')).toBe('40')
	},
}
/** Перетаскивание мышью одиночного ползунка */
export const DragThumbMouse: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref(20)
			return { args, v }
		},
		template: '<BaseRange v-bind="args" v-model="v" />',
	}),
	play: async ({ canvasElement }) => {
		mockTrack(canvasElement)
		const thumb = getElement(canvasElement, '.base-range__thumb')
		await fireEvent.mouseDown(thumb, eventDetail(40))
		await fireEvent.mouseMove(document, eventDetail(120))
		await fireEvent.mouseUp(document)
		await waitFor(() => expect(thumb.getAttribute('aria-valuenow')).toBe('60'))
	},
}
/** Перетаскивание тачем одиночного ползунка */
export const DragThumbTouch: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref(20)
			return { args, v }
		},
		template: '<BaseRange v-bind="args" v-model="v" />',
	}),
	play: async ({ canvasElement }) => {
		mockTrack(canvasElement)
		const thumb = getElement(canvasElement, '.base-range__thumb')
		dispatchTouch(thumb, 'touchstart', 40, 50)
		dispatchTouch(document, 'touchmove', 150, 50)
		dispatchTouch(document, 'touchend', 150, 50)
		await waitFor(() => expect(thumb.getAttribute('aria-valuenow')).toBe('75'))
	},
}
/** Клик по треку в range-режиме — активируется ближайший thumb */
export const TrackClickRangeNearestFirst: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref<[number, number]>([20, 70])
			return { args, v }
		},
		template: '<BaseRange v-bind="args" v-model:range-value="v" />',
	}),
	play: async ({ canvasElement }) => {
		mockTrack(canvasElement)
		// Клик на 25% (50px) ближе к первому ползунку (20%)
		await fireEvent.mouseDown(getElement(canvasElement, '.base-range__track-wrapper'), eventDetail(50))
		await fireEvent.mouseUp(document)
		const thumbs = getElements(canvasElement, '.base-range__thumb')
		await waitFor(() => expect(thumbs[0].getAttribute('aria-valuenow')).toBe('25'))
	},
}
/** Клик по треку в range-режиме — активируется второй thumb */
export const TrackClickRangeNearestSecond: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref<[number, number]>([20, 70])
			return { args, v }
		},
		template: '<BaseRange v-bind="args" v-model:range-value="v" />',
	}),
	play: async ({ canvasElement }) => {
		mockTrack(canvasElement)
		// Клик на 80% (160px) ближе ко второму (70%)
		await fireEvent.mouseDown(getElement(canvasElement, '.base-range__track-wrapper'), eventDetail(160))
		await fireEvent.mouseUp(document)
		const thumbs = getElements(canvasElement, '.base-range__thumb')
		await waitFor(() => expect(thumbs[1].getAttribute('aria-valuenow')).toBe('80'))
	},
}
/** Перетаскивание второго ползунка диапазона — пересечение ограничено первым */
export const DragRangeSecondCrossesFirst: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref<[number, number]>([40, 70])
			return { args, v }
		},
		template: '<BaseRange v-bind="args" v-model:range-value="v" />',
	}),
	play: async ({ canvasElement }) => {
		mockTrack(canvasElement)
		const thumbs = getElements(canvasElement, '.base-range__thumb')
		// Тащим второй ползунок ниже первого — ограничится значением первого
		await fireEvent.mouseDown(thumbs[1], eventDetail(140))
		await fireEvent.mouseMove(document, eventDetail(20))
		await fireEvent.mouseUp(document)
		await waitFor(() => expect(thumbs[1].getAttribute('aria-valuenow')).toBe('40'))
	},
}
/** Перетаскивание первого ползунка диапазона — пересечение ограничено вторым */
export const DragRangeFirstCrossesSecond: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref<[number, number]>([20, 50])
			return { args, v }
		},
		template: '<BaseRange v-bind="args" v-model:range-value="v" />',
	}),
	play: async ({ canvasElement }) => {
		mockTrack(canvasElement)
		const thumbs = getElements(canvasElement, '.base-range__thumb')
		await fireEvent.mouseDown(thumbs[0], eventDetail(40))
		await fireEvent.mouseMove(document, eventDetail(180))
		await fireEvent.mouseUp(document)
		await waitFor(() => expect(thumbs[0].getAttribute('aria-valuenow')).toBe('50'))
	},
}
/** Вертикальный режим — клик по треку */
export const VerticalTrackClick: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref(20)
			return { args, v }
		},
		template: '<div style="height:100px;"><BaseRange v-bind="args" v-model="v" is-vertical /></div>',
	}),
	play: async ({ canvasElement }) => {
		mockTrack(canvasElement)
		// При вертикальном clientY=25 → ratio = 1 - 25/100 = 0.75 → value 75
		await fireEvent.mouseDown(getElement(canvasElement, '.base-range__track-wrapper'), eventDetail(0, 25))
		await fireEvent.mouseUp(document)
		const thumb = getElement(canvasElement, '.base-range__thumb')
		await waitFor(() => expect(thumb.getAttribute('aria-valuenow')).toBe('75'))
	},
}
/** Вертикальный режим со значением диапазона — заливка fillStyle vertical */
export const VerticalRange: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref<[number, number]>([20, 60])
			return { args, v }
		},
		template: '<div style="height:200px;"><BaseRange v-bind="args" v-model:range-value="v" is-vertical /></div>',
	}),
	play: async ({ canvasElement }) => {
		const fill = getElement(canvasElement, '.base-range__fill')
		expect(fill.style.bottom).toBe('20%')
		expect(fill.style.height).toBe('40%')
	},
}
/** С метками — покрытие markStyle и v-for marks */
export const WithMarks: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref(50)
			const marks = [
				{ value: 0, label: '0' },
				{ value: 25, label: '25', tickSize: 'minor' as const },
				{ value: 50, label: '50' },
				{ value: 75 },
				{ value: 100, label: '100' },
			]
			return { args, v, marks }
		},
		template: '<BaseRange v-bind="args" v-model="v" :marks="marks" />',
	}),
	play: async ({ canvasElement }) => {
		const marks = canvasElement.querySelectorAll('.base-range__mark')
		expect(marks.length).toBe(5)
	},
}
/** С метками в вертикальном режиме — покрытие markStyle vertical */
export const VerticalMarks: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref(50)
			const marks = [
				{ value: 0, label: '0' },
				{ value: 50, label: '50' },
				{ value: 100, label: '100' },
			]
			return { args, v, marks }
		},
		template: '<div style="height:200px;"><BaseRange v-bind="args" v-model="v" :marks="marks" is-vertical /></div>',
	}),
	play: async ({ canvasElement }) => {
		const marks = canvasElement.querySelectorAll('.base-range__mark')
		expect(marks.length).toBe(3)
	},
}
/** Step != 1 — проверка дискретности через keyboard */
export const StepDiscrete: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref(20)
			return { args, v }
		},
		template: '<BaseRange v-bind="args" v-model="v" :step="5" />',
	}),
	play: async ({ canvasElement }) => {
		const thumb = getElement(canvasElement, '.base-range__thumb')
		thumb.focus()
		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(thumb.getAttribute('aria-valuenow')).toBe('25'))
	},
}
/** Tooltip — покрытие веток с тултипом для обоих ползунков */
export const WithTooltipRange: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref<[number, number]>([30, 70])
			return { args, v }
		},
		template: '<BaseRange v-bind="args" v-model:range-value="v" has-tooltip />',
	}),
}
/** С label и rangeValue — покрытие label-value (rangeValue branch) */
export const LabelWithRange: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref<[number, number]>([30, 70])
			return { args, v }
		},
		template: '<BaseRange v-bind="args" v-model:range-value="v" has-label />',
	}),
	play: async ({ canvasElement }) => {
		const label = getElement(canvasElement, '.base-range__label-value')
		expect(label.textContent).toContain('30')
		expect(label.textContent).toContain('70')
	},
}
/** Покрытие customClass — все ключи */
export const WithCustomClass: Story = {
	args: {
		modelValue: 40,
		hasLabel: true,
		marks: [{ value: 50, label: '50' }],
		customClass: {
			root: 'cc-root',
			label: 'cc-label',
			body: 'cc-body',
			track: 'cc-track',
			fill: 'cc-fill',
			thumb: 'cc-thumb',
			marks: 'cc-marks',
		},
	},
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.cc-root')).toBeTruthy()
		expect(canvasElement.querySelector('.cc-label')).toBeTruthy()
		expect(canvasElement.querySelector('.cc-track')).toBeTruthy()
		expect(canvasElement.querySelector('.cc-fill')).toBeTruthy()
		expect(canvasElement.querySelector('.cc-thumb')).toBeTruthy()
	},
}
/** has-tooltip + одиночный режим: mousedown/touchstart/keydown на thumb внутри BaseTooltip wrapper — покрывает анонимные handler-функции L44, L45, L46. */
export const TooltipSingleInteractions: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref(40)
			return { args, v }
		},
		template: '<BaseRange v-bind="args" v-model="v" has-tooltip />',
	}),
	play: async ({ canvasElement }) => {
		mockTrack(canvasElement)
		const thumb = getElement(canvasElement, '.base-range__thumb')

		await fireEvent.mouseDown(thumb, eventDetail(40))
		await fireEvent.mouseMove(document, eventDetail(120))
		await fireEvent.mouseUp(document)
		await waitFor(() => expect(thumb.getAttribute('aria-valuenow')).toBe('60'))

		dispatchTouch(thumb, 'touchstart', 30, 50)
		dispatchTouch(document, 'touchmove', 80, 50)
		dispatchTouch(document, 'touchend', 80, 50)
		await waitFor(() => expect(thumb.getAttribute('aria-valuenow')).toBe('40'))

		thumb.focus()
		await fireEvent.keyDown(thumb, { key: 'ArrowRight' })
		await waitFor(() => expect(thumb.getAttribute('aria-valuenow')).toBe('41'))
	},
}
/** has-tooltip + range: mousedown/touchstart/keydown на обоих ползунках внутри BaseTooltip wrapper — покрывает анонимные handler-функции L85, L86, L87. */
export const TooltipRangeInteractions: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref<[number, number]>([20, 70])
			return { args, v }
		},
		template: '<BaseRange v-bind="args" v-model:range-value="v" has-tooltip />',
	}),
	play: async ({ canvasElement }) => {
		mockTrack(canvasElement)
		const thumbs = getElements(canvasElement, '.base-range__thumb')

		await fireEvent.mouseDown(thumbs[1], eventDetail(140))
		await fireEvent.mouseMove(document, eventDetail(180))
		await fireEvent.mouseUp(document)
		await waitFor(() => expect(thumbs[1].getAttribute('aria-valuenow')).toBe('90'))

		dispatchTouch(thumbs[1], 'touchstart', 180, 50)
		dispatchTouch(document, 'touchmove', 160, 50)
		dispatchTouch(document, 'touchend', 160, 50)
		await waitFor(() => expect(thumbs[1].getAttribute('aria-valuenow')).toBe('80'))

		thumbs[1].focus()
		await fireEvent.keyDown(thumbs[1], { key: 'ArrowRight' })
		await waitFor(() => expect(thumbs[1].getAttribute('aria-valuenow')).toBe('81'))

		thumbs[0].focus()
		await fireEvent.keyDown(thumbs[0], { key: 'ArrowRight' })
		await waitFor(() => expect(thumbs[0].getAttribute('aria-valuenow')).toBe('21'))
	},
}
/** range без тултипа: keydown на втором thumb — покрывает анонимный handler L103 (v-else ветка второго ползунка в range-режиме). */
export const RangeSecondKeydownNoTooltip: Story = {
	render: args => ({
		components: { BaseRange },
		setup() {
			const v = ref<[number, number]>([20, 70])
			return { args, v }
		},
		template: '<BaseRange v-bind="args" v-model:range-value="v" />',
	}),
	play: async ({ canvasElement }) => {
		const thumbs = getElements(canvasElement, '.base-range__thumb')
		thumbs[1].focus()
		await fireEvent.keyDown(thumbs[1], { key: 'ArrowLeft' })
		await waitFor(() => expect(thumbs[1].getAttribute('aria-valuenow')).toBe('69'))
		await fireEvent.keyDown(thumbs[1], { key: 'ArrowRight' })
		await waitFor(() => expect(thumbs[1].getAttribute('aria-valuenow')).toBe('70'))
	},
}
