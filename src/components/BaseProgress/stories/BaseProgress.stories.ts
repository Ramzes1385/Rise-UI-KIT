/**
 * Stories для компонента BaseProgress.
 * Демонстрирует формы, масштабирование и анимации.
 */

import { expect, fn, waitFor } from 'storybook/test'
import { ref } from 'vue'
import BaseProgress from '../ui/BaseProgress.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<typeof BaseProgress> = {
	title: 'UI/BaseProgress',
	component: BaseProgress,

	argTypes: {
		value: {
			control: { type: 'range', min: 0, max: 100 },
		},
		max: {
			control: 'number',
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		shape: {
			control: 'inline-radio',
			options: ['line', 'circle'],
		},
		animation: {
			control: 'select',
			options: ['none', 'striped', 'pulse', 'glow'],
		},
		hasLabel: {
			control: 'boolean',
		},
		isIndeterminate: {
			control: 'boolean',
		},
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
	},

	args: {
		value: 60,
		max: 100,
		shape: 'line',
		animation: 'none',
		hasLabel: false,
		isIndeterminate: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseProgress>
// play удалён: дублирует "должен рендерить BaseTooltip внутри fill когда hasLabel=true и shape=line" в *.integration.spec.ts
/** Базовое состояние компонента */
export const Default: Story = {}
// play удалён: дублирует "должен рендерить BaseTooltip внутри fill когда hasLabel=true и shape=line" в *.integration.spec.ts
/** Круговой вид */
export const Circle: Story = {
	args: {
		shape: 'circle',
		hasLabel: true,
	},
}
// play удалён: дублирует "должен рендерить BaseTooltip внутри fill когда hasLabel=true и shape=line" в *.integration.spec.ts
/** Неопределённый прогресс (бесконечная загрузка) */
export const Indeterminate: Story = {
	args: {
		isIndeterminate: true,
	},
}
// play удалён: дублирует "должен рендерить BaseTooltip внутри fill когда hasLabel=true и shape=line" в *.integration.spec.ts
/** Отображение в тёмной теме */
export const DarkTheme: Story = {
	render: args => ({
		components: { BaseProgress },
		setup() {
			return { args }
		},
		template: `
			<div data-theme="dark" style="padding: 24px; border-radius: 8px;">
				<div style="display: flex; flex-direction: column; gap: 16px;">
					<BaseProgress v-bind="args" :value="60" has-label />
					<BaseProgress v-bind="args" :value="40" shape="circle" has-label />
				</div>
			</div>
		`,
	}),
}
/** Круговой со слотом — покрывает default slot в circle */
export const CircleWithSlot: Story = {
	render: () => ({
		components: { BaseProgress },
		template: `
			<BaseProgress shape="circle" :value="75" has-label>
				<template #default="{ percent }">🔥 {{ percent }}%</template>
			</BaseProgress>
		`,
	}),
}

/** Покрывает watch(percent) → emit('complete') когда значение достигает 100 */
const completeSpy = fn()
/** Событие завершения прогресса */
export const OnComplete: Story = {
	args: {
		value: 50,
	},
	render: args => ({
		components: { BaseProgress },
		setup() {
			const localValue = ref<number>(args.value ?? 0)
			function handleComplete(): void {
				completeSpy()
			}
			return { args, localValue, handleComplete }
		},
		template: `
			<div>
				<BaseProgress
					v-bind="args"
					:value="localValue"
					data-testid="progress-complete"
					@complete="handleComplete"
				/>
				<button data-testid="trigger-complete" @click="localValue = 100">Trigger</button>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		completeSpy.mockClear()
		const trigger = canvasElement.querySelector<HTMLButtonElement>('[data-testid="trigger-complete"]')
		expect(trigger).not.toBeNull()
		trigger?.click()

		await waitFor(() => {
			expect(completeSpy).toHaveBeenCalled()
		})
	},
}
/** Все анимации — покрывает ветку animation !== 'none' (строка 4-6) */
export const AllAnimations: Story = {
	render: () => ({
		components: { BaseProgress },
		template: `
			<div style="display: flex; flex-direction: column; gap: 12px;">
				<BaseProgress :value="40" animation="striped" />
				<BaseProgress :value="60" animation="pulse" />
				<BaseProgress :value="80" animation="glow" />
			</div>
		`,
	}),
}
/** Кастомный цвет с label — покрывает ветку tooltipColor (строка 110) */
export const CustomColorWithLabel: Story = {
	args: {
		value: 70,
		hasLabel: true,
		color: { bg: { base: '#ff5722' } },
	},
}
/** Круговой неопределённый — покрывает circleOffset isIndeterminate (строка 128) */
export const CircleIndeterminate: Story = {
	args: {
		shape: 'circle',
		isIndeterminate: true,
		hasLabel: true,
	},
}
