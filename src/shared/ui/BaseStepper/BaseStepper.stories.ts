/**
 * Stories для компонента BaseStepper.
 * Демонстрирует все ориентации, формы, варианты, слоты и состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

import { buildArgTypes } from '@/shared/utils/storybookUtils'

import type { BaseStepperStep } from './BaseStepper.types'
import { STEPPER_ORIENTATIONS, STEPPER_SHAPES, STEPPER_VARIANTS } from './BaseStepper.types'
import BaseStepper from './BaseStepper.vue'

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
}

/** Интерактивный */
export const Interactive: Story = {
	parameters: {
		docs: {
			source: '<BaseStepper v-model="step" v-bind="args" />',
		},
	},
	render: args => ({
		components: { BaseStepper },
		setup() {
			const step = ref(1)
			return { args, step }
		},
		template: `
			<div>
				<BaseStepper v-model="step" v-bind="args" />
				<p style="margin-top:16px;color:var(--color-text-muted);">Шаг: {{ step }}</p>
			</div>
		`,
	}),
}
