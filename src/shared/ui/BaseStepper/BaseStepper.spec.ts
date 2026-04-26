/**
 * Unit-тесты для BaseStepper.
 * Проверяют рендер, пропсы, CSS-модификаторы и слоты.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import type { BaseStepperStep } from './BaseStepper.types'
import BaseStepper from './BaseStepper.vue'

const ITEMS: BaseStepperStep[] = [
	{ label: 'Данные' },
	{ label: 'Адрес', description: 'Адрес доставки' },
	{ label: 'Оплата', isDisabled: true },
]

describe('BaseStepper unit', () => {
	describe('рендер', () => {
		it('должен рендерить степпер', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
			})

			expect(container.querySelector('.base-stepper')).toBeInTheDocument()
			expect(container.querySelector('.base-stepper__items')).toBeInTheDocument()
		})

		it('должен рендерить все шаги', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
			})

			const stepElements = container.querySelectorAll('.base-stepper__step')
			expect(stepElements).toHaveLength(ITEMS.length)
		})

		it('должен рендерить текст каждого шага', () => {
			render(BaseStepper, { props: { modelValue: 1, items: ITEMS } })

			expect(screen.getByText('Данные')).toBeInTheDocument()
			expect(screen.getByText('Адрес')).toBeInTheDocument()
			expect(screen.getByText('Оплата')).toBeInTheDocument()
		})
	})

	describe('пропс modelValue', () => {
		it('должен добавлять класс --active на текущий шаг', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
			})

			const activeSteps = container.querySelectorAll('.base-stepper__step--active')
			expect(activeSteps).toHaveLength(1)
		})

		it('должен добавлять класс --completed на пройденные шаги', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 3, items: ITEMS },
			})

			const completedSteps = container.querySelectorAll('.base-stepper__step--completed')
			expect(completedSteps).toHaveLength(2)
		})

		it('должен рендерить галочку на пройденных шагах', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 3, items: ITEMS },
			})

			const checks = container.querySelectorAll('.base-stepper__check')
			expect(checks).toHaveLength(2)
		})
	})

	describe('пропс orientation', () => {
		it('должен применять модификатор --horizontal по умолчанию', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
			})

			expect(container.querySelector('.base-stepper')?.classList.contains('base-stepper--horizontal')).toBe(true)
		})

		it('должен применять модификатор --vertical когда orientation=vertical', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS, orientation: 'vertical' },
			})

			expect(container.querySelector('.base-stepper')?.classList.contains('base-stepper--vertical')).toBe(true)
		})
	})

	describe('пропс shape', () => {
		it('должен применять модификатор --circle по умолчанию', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
			})

			expect(container.querySelector('.base-stepper')?.classList.contains('base-stepper--circle')).toBe(true)
		})

		it('должен применять модификатор --square когда shape=square', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS, shape: 'square' },
			})

			expect(container.querySelector('.base-stepper')?.classList.contains('base-stepper--square')).toBe(true)
		})

		it('должен применять модификатор --diamond когда shape=diamond', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS, shape: 'diamond' },
			})

			expect(container.querySelector('.base-stepper')?.classList.contains('base-stepper--diamond')).toBe(true)
		})

		it('должен применять модификатор --empty когда shape=empty', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS, shape: 'empty' },
			})

			expect(container.querySelector('.base-stepper')?.classList.contains('base-stepper--empty')).toBe(true)
		})

		it('не должен рендерить индикатор когда shape=empty', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS, shape: 'empty' },
			})

			const indicators = container.querySelectorAll('.base-stepper__indicator')
			expect(indicators).toHaveLength(0)
		})
	})

	describe('пропс variant', () => {
		it('не должен добавлять модификатор варианта когда variant=default', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS, variant: 'default' },
			})

			expect(container.querySelector('.base-stepper')?.classList.contains('base-stepper--animated')).toBe(false)
		})

		it('должен применять модификатор --animated когда variant=animated', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS, variant: 'animated' },
			})

			expect(container.querySelector('.base-stepper')?.classList.contains('base-stepper--animated')).toBe(true)
		})

		it('должен устанавливать CSS-переменную прогресса', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 2, items: ITEMS },
			})

			const stepper = container.querySelector('.base-stepper') as HTMLElement
			expect(stepper.style.getPropertyValue('--stepper-progress-scale')).toBe('0.5')
		})
	})

	describe('описание шага', () => {
		it('должен рендерить описание когда передано', () => {
			render(BaseStepper, { props: { modelValue: 1, items: ITEMS } })

			expect(screen.getByText('Адрес доставки')).toBeInTheDocument()
		})
	})

	describe('отключённый шаг', () => {
		it('должен добавлять класс --disabled на отключённый шаг', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
			})

			const disabledSteps = container.querySelectorAll('.base-stepper__step--disabled')
			expect(disabledSteps).toHaveLength(1)
		})
	})

	describe('слоты', () => {
		it('должен рендерить слот header', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
				slots: { header: 'Заголовок степпера' },
			})

			expect(container.querySelector('.base-stepper__header')).toBeInTheDocument()
			expect(screen.getByText('Заголовок степпера')).toBeInTheDocument()
		})

		it('должен рендерить слот footer', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
				slots: { footer: 'Подвал степпера' },
			})

			expect(container.querySelector('.base-stepper__footer')).toBeInTheDocument()
			expect(screen.getByText('Подвал степпера')).toBeInTheDocument()
		})

		it('не должен рендерить header/footer без слота', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
			})

			expect(container.querySelector('.base-stepper__header')).not.toBeInTheDocument()
			expect(container.querySelector('.base-stepper__footer')).not.toBeInTheDocument()
		})

		it('должен рендерить scoped-слот item', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
				slots: {
					item: `<template #item="{ item, isActive, isCompleted }">
						<span class="custom-item">{{ item.label }}-{{ isActive }}-{{ isCompleted }}</span>
					</template>`,
				},
			})

			const customItems = container.querySelectorAll('.custom-item')
			expect(customItems).toHaveLength(ITEMS.length)
			expect(screen.getByText('Данные-true-false')).toBeInTheDocument()
		})
	})
})
