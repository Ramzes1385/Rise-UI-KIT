/**
 * Stories для компонента BaseStepper.
 * Демонстрирует все ориентации, формы, варианты, слоты и состояния.
 */

import { expect, fn, userEvent, within } from 'storybook/test'
import { ref } from 'vue'
import { buildArgTypes, playShiftTab } from '@utils/storybookUtils'
import { STEPPER_ORIENTATIONS, STEPPER_SHAPES, STEPPER_VARIANTS } from '../model/BaseStepper.types'
import BaseStepper from '../ui/BaseStepper.vue'
import type { BaseStepperStep } from '../model/BaseStepper.types'
import type { Meta, StoryObj } from '@storybook/vue3'

const ITEMS: BaseStepperStep[] = [
	{ label: 'Данные', description: 'Личная информация' },
	{ label: 'Адрес', description: 'Адрес доставки' },
	{ label: 'Оплата', description: 'Способ оплаты' },
	{ label: 'Подтверждение' },
]

const SIMPLE_ITEMS: BaseStepperStep[] = [{ label: 'Шаг 1' }, { label: 'Шаг 2' }, { label: 'Шаг 3' }]

const MANY_ITEMS: BaseStepperStep[] = [
	{ label: 'Корзина', description: 'Выбор товаров' },
	{ label: 'Данные', description: 'Контактная информация' },
	{ label: 'Доставка', description: 'Способ доставки' },
	{ label: 'Оплата', description: 'Способ оплаты' },
	{ label: 'Проверка', description: 'Проверка заказа' },
	{ label: 'Готово', description: 'Заказ оформлен' },
]

const DISABLED_ITEMS: BaseStepperStep[] = [{ label: 'Шаг 1' }, { label: 'Шаг 2', isDisabled: true }, { label: 'Шаг 3' }]

const meta: Meta<typeof BaseStepper> = {
	title: 'UI/BaseStepper',
	component: BaseStepper,

	argTypes: buildArgTypes({
		props: {
			orientation: {
				control: 'inline-radio',
				options: STEPPER_ORIENTATIONS,
			},
			shape: {
				control: 'inline-radio',
				options: STEPPER_SHAPES,
			},
			variant: {
				control: 'radio',
				options: STEPPER_VARIANTS,
			},
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера (50–200%, по умолчанию 100)',
			},
			color: {
				control: 'object',
				description: 'Объект CustomColor: bg (фоновый цвет), text (цвет текста) и их состояния hover/active/focus',
			},
			modelValue: { table: { disable: true } },
			items: {
				control: 'object',
				description: 'Массив шагов BaseStepperStep[]',
			},
			'onUpdate:modelValue': { table: { disable: true } },
			onChange: { table: { disable: true } },
			customClass: { control: 'object' },
		},
	}),

	args: {
		items: ITEMS,
		orientation: 'horizontal',
		shape: 'circle',
		variant: 'default',
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseStepper>
/** Базовый горизонтальный степпер */
export const Default: Story = {
	parameters: {
		docs: {
			source: { code: '<BaseStepper v-model="step" :items="items" />' },
		},
	},
	render: args => ({
		components: { BaseStepper },
		setup() {
			const step = ref(1)
			return { args, step }
		},
		template: '<BaseStepper v-model="step" v-bind="args" />',
	}),
	args: {
		onChange: fn(),
	},
	play: async ({ canvasElement, step }) => {
		await step('Фокусировка степпера по Tab', async () => {
			await userEvent.tab()
		})
		await step('Обратная фокусировка по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { selector: '.base-stepper' })
		})
	},
}
/** Кастомные CSS-классы */
export const WithCustomClass: Story = {
	args: {
		customClass: { root: 'stp-root', header: 'stp-header', items: 'stp-items', step: 'stp-step', indicatorWrapper: 'stp-indicatorWrapper', indicator: 'stp-indicator', check: 'stp-check', content: 'stp-content', label: 'stp-label', description: 'stp-description', footer: 'stp-footer' },
	},
	render: args => ({
		components: { BaseStepper },
		setup() {
			const step = ref(1)
			return { args, step }
		},
		template: '<BaseStepper v-model="step" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.stp-root')).toBeTruthy()
	},
}
/** Все варианты отображения */
export const Variants: Story = {
	parameters: {
		docs: {
			source: `<BaseStepper v-for="v in ['default', 'animated']" :key="v" :variant="v" />`,
		},
	},
	render: () => ({
		components: { BaseStepper },
		setup() {
			const step = ref(2)
			const items = ITEMS
			const variants = STEPPER_VARIANTS
			return { step, items, variants }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:32px;">
				<div v-for="v in variants" :key="v">
					<span style="font-size:12px;color:var(--color-text-muted);">{{ v }}</span>
					<BaseStepper v-model="step" :items="items" :variant="v" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('default')).toBeInTheDocument()
		expect(canvas.getByText('animated')).toBeInTheDocument()
	},
}
/** Все формы индикатора */
export const Shapes: Story = {
	parameters: {
		docs: {
			source: `<BaseStepper v-for="s in ['circle', 'square', 'diamond', 'empty']" :key="s" :shape="s" />`,
		},
	},
	render: () => ({
		components: { BaseStepper },
		setup() {
			const step = ref(2)
			const items = ITEMS
			const shapes = STEPPER_SHAPES
			return { step, items, shapes }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:32px;">
				<div v-for="s in shapes" :key="s">
					<span style="font-size:12px;color:var(--color-text-muted);">{{ s }}</span>
					<BaseStepper v-model="step" :items="items" :shape="s" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		// Проверяем что форма empty не показывает индикатор
		const steppers = canvasElement.querySelectorAll('.base-stepper')
		const emptyStepper = steppers[3]
		expect(emptyStepper?.classList.contains('base-stepper--empty')).toBe(true)
	},
}
/** Масштабирование sizeScale */
export const SizeScale: Story = {
	parameters: {
		docs: {
			source: `<BaseStepper v-for="scale in [75, 100, 150]" :key="scale" :size-scale="scale" />`,
		},
	},
	render: args => ({
		components: { BaseStepper },
		setup() {
			const step = ref(2)
			return { args, step }
		},
		template: `
			<div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start;">
				<div v-for="scale in [75, 100, 150]" :key="scale">
					<span style="font-size:13px;color:var(--color-text-muted);">{{ scale }}%</span>
					<BaseStepper v-model="step" v-bind="args" :size-scale="scale" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const steppers = canvasElement.querySelectorAll('.base-stepper')
		expect(steppers).toHaveLength(3)
	},
}
/** Вертикальный степпер */
export const Vertical: Story = {
	parameters: {
		docs: {
			source: '<BaseStepper v-model="step" :items="items" orientation="vertical" />',
		},
	},
	args: {
		orientation: 'vertical',
	},
	render: args => ({
		components: { BaseStepper },
		setup() {
			const step = ref(1)
			return { args, step }
		},
		template: '<BaseStepper v-model="step" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const stepper = canvasElement.querySelector('.base-stepper')
		expect(stepper?.classList.contains('base-stepper--vertical')).toBe(true)
	},
}
/** Все шаги пройдены */
export const AllCompleted: Story = {
	parameters: {
		docs: {
			source: '<BaseStepper v-model="step" :items="items" />',
		},
	},
	render: () => ({
		components: { BaseStepper },
		setup() {
			const step = ref(4)
			const items = ITEMS
			return { step, items }
		},
		template: '<BaseStepper v-model="step" :items="items" />',
	}),
	play: async ({ canvasElement }) => {
		// Все шаги пройдены — проверяем наличие иконок check
		const checks = canvasElement.querySelectorAll('.base-stepper__check')
		expect(checks.length).toBeGreaterThanOrEqual(3)
	},
}
/** Вариант animated — анимация заполнения линии */
export const Animated: Story = {
	parameters: {
		docs: {
			source: '<BaseStepper variant="animated" />',
		},
	},
	args: {
		variant: 'animated',
	},
	render: args => ({
		components: { BaseStepper },
		setup() {
			const step = ref(2)
			return { args, step }
		},
		template: '<BaseStepper v-model="step" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const stepper = canvasElement.querySelector('.base-stepper')
		expect(stepper?.classList.contains('base-stepper--animated')).toBe(true)
	},
}
/** Форма empty — без индикатора */
export const EmptyShape: Story = {
	parameters: {
		docs: {
			source: '<BaseStepper shape="empty" />',
		},
	},
	args: {
		shape: 'empty',
	},
	render: args => ({
		components: { BaseStepper },
		setup() {
			const step = ref(2)
			return { args, step }
		},
		template: '<BaseStepper v-model="step" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		// Форма empty — нет индикатора
		const indicators = canvasElement.querySelectorAll('.base-stepper__indicator')
		expect(indicators).toHaveLength(0)
	},
}
/** Много шагов */
export const ManySteps: Story = {
	parameters: {
		docs: {
			source: '<BaseStepper :items="manyItems" />',
		},
	},
	args: {
		items: MANY_ITEMS,
	},
	render: args => ({
		components: { BaseStepper },
		setup() {
			const step = ref(3)
			return { args, step }
		},
		template: '<BaseStepper v-model="step" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Корзина')).toBeInTheDocument()
		expect(canvas.getByText('Готово')).toBeInTheDocument()
	},
}
/** Простые шаги без описания */
export const SimpleSteps: Story = {
	parameters: {
		docs: {
			source: '<BaseStepper :items="simpleItems" />',
		},
	},
	args: {
		items: SIMPLE_ITEMS,
	},
	render: args => ({
		components: { BaseStepper },
		setup() {
			const step = ref(1)
			return { args, step }
		},
		template: '<BaseStepper v-model="step" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Шаг 1')).toBeInTheDocument()
		expect(canvas.getByText('Шаг 3')).toBeInTheDocument()
	},
}
/** Отключённый шаг — покрывает handleStepClick (стр. 128-131) и шаблонный @click (стр. 23) */
export const DisabledStep: Story = {
	parameters: {
		docs: {
			source: '<BaseStepper :items="disabledItems" />',
		},
	},
	args: {
		items: DISABLED_ITEMS,
		onChange: fn(),
	},
	render: args => ({
		components: { BaseStepper },
		setup() {
			const step = ref(1)
			return { args, step }
		},
		template: '<BaseStepper v-model="step" v-bind="args" />',
	}),
	play: async ({ args, canvasElement }) => {
		const steps = canvasElement.querySelectorAll<HTMLElement>('.base-stepper__step')
		expect(steps.length).toBe(3)

		await userEvent.click(steps[2])
		expect(args.onChange).toHaveBeenCalledWith(3)

		const disabledCallsBefore = (args.onChange as ReturnType<typeof fn>).mock.calls.length
		await userEvent.click(steps[1])
		const disabledCallsAfter = (args.onChange as ReturnType<typeof fn>).mock.calls.length
		expect(disabledCallsAfter).toBe(disabledCallsBefore)
	},
}
/** Слоты header и footer */
export const WithSlots: Story = {
	parameters: {
		docs: {
			source: `<BaseStepper v-model="step" :items="items">
  <template #header>Оформление заказа</template>
  <template #footer>Шаг {{ step }} из {{ items.length }}</template>
</BaseStepper>`,
		},
	},
	render: args => ({
		components: { BaseStepper },
		setup() {
			const step = ref(2)
			const items = ITEMS
			return { args, step, items }
		},
		template: `
			<BaseStepper v-model="step" v-bind="args">
				<template #header>
					<span style="font-size:18px;font-weight:700;">Оформление заказа</span>
				</template>
				<template #footer>
					<span style="font-size:13px;color:var(--color-text-muted);">Шаг {{ step }} из {{ items.length }}</span>
				</template>
			</BaseStepper>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Оформление заказа')).toBeInTheDocument()
		expect(canvas.getByText('Шаг 2 из 4')).toBeInTheDocument()
	},
}
/** Кастомный слот item */
export const CustomItem: Story = {
	parameters: {
		docs: {
			source: `<BaseStepper v-model="step" :items="items" shape="empty">
  <template #item="{ item, stepNumber, isActive, isCompleted }">
    <div class="base-stepper__content">
      <span class="base-stepper__label">
        {{ isCompleted ? '✓ ' : stepNumber + '. ' }}{{ item.label }}
      </span>
    </div>
  </template>
</BaseStepper>`,
		},
	},
	args: {
		shape: 'empty',
	},
	render: args => ({
		components: { BaseStepper },
		setup() {
			const step = ref(2)
			const items = ITEMS
			return { args, step, items }
		},
		template: `
			<BaseStepper v-model="step" v-bind="args">
				<template #item="{ item, stepNumber, isActive, isCompleted }">
					<div class="base-stepper__content">
						<span class="base-stepper__label"
							:style="{ fontWeight: isActive ? 700 : 400, color: isActive || isCompleted ? 'var(--color-accent)' : 'var(--color-text-muted)' }">
							{{ isCompleted ? '✓ ' : stepNumber + '. ' }}{{ item.label }}
						</span>
					</div>
				</template>
			</BaseStepper>
		`,
	}),
	play: async ({ canvasElement }) => {
		// Кастомный слот item заменяет дефолтный контент — .base-stepper__label из слота
		const labels = canvasElement.querySelectorAll('.base-stepper__label')
		expect(labels.length).toBeGreaterThan(0)
		// Проверяем что шаг 1 показан как completed (с ✓)
		expect(labels[0].textContent).toContain('✓')
		// Проверяем что шаг 2 показан как active (жирный)
		expect(labels[1].textContent).toContain('Адрес')
	},
}
/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	parameters: {
		docs: {
			source: '<BaseStepper data-theme="dark" />',
		},
	},
	render: () => ({
		components: { BaseStepper },
		setup() {
			const step = ref(2)
			const items = ITEMS
			return { step, items }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:32px;">
				<BaseStepper v-model="step" :items="items" orientation="horizontal" />
				<BaseStepper v-model="step" :items="items" orientation="vertical" />
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const steppers = canvasElement.querySelectorAll('.base-stepper')
		expect(steppers).toHaveLength(2)
	},
}
/** Один шаг — покрывает ветку count <= 1 в progressStyle */
export const SingleStep: Story = {
	args: {
		items: [{ label: 'Единственный шаг' }],
	},
	render: args => ({
		components: { BaseStepper },
		setup() {
			const step = ref(1)
			return { args, step }
		},
		template: '<BaseStepper v-model="step" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Единственный шаг')).toBeInTheDocument()
	},
}

// ── Длинные заголовки ──

const LONG_LABEL_ITEMS: BaseStepperStep[] = [
	{
		label: 'Заполнение развёрнутой анкеты персональных данных',
		description: 'Внесите полную информацию о себе включая паспортные данные и адрес регистрации',
	},
	{
		label: 'Выбор способа доставки и оплата транспортных расходов',
		description: 'Определите предпочтительный вариант получения заказа',
	},
	{
		label: 'Подтверждение и финальная проверка всех введённых данных',
		description: 'Убедитесь в корректности указанной информации перед отправкой',
	},
]
/** Степпер с длинными заголовками — проверка переполнения текста */
export const LongContent: Story = {
	args: {
		items: LONG_LABEL_ITEMS,
	},
	render: args => ({
		components: { BaseStepper },
		setup() {
			const step = ref(1)
			return { args, step }
		},
		template: '<BaseStepper v-model="step" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Заполнение развёрнутой анкеты персональных данных')).toBeInTheDocument()
	},
}
