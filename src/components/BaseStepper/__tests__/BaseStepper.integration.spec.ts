/**
 * Integration-тесты для BaseStepper.
 * Проверяют взаимодействие: клики по шагам, emits.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import BaseStepper from '../ui/BaseStepper.vue'
import type { BaseStepperStep } from '../model/BaseStepper.types'

const ITEMS: BaseStepperStep[] = [{ label: 'Данные' }, { label: 'Адрес' }, { label: 'Оплата', isDisabled: true }]

describe('BaseStepper integration', () => {
	describe('клик по шагу', () => {
		it('должен эмитить update:modelValue при клике на шаг', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
			})

			await user.click(screen.getByText('Адрес'))

			expect(emitted()).toHaveProperty('update:modelValue')
		})

		it('должен эмитить корректный номер шага', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
			})

			await user.click(screen.getByText('Адрес'))

			const events = emitted()['update:modelValue'] as number[][]
			expect(events.at(-1)?.[0]).toBe(2)
		})
	})

	describe('событие change', () => {
		it('должен эмитить change при клике на шаг', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
			})

			await user.click(screen.getByText('Адрес'))

			expect(emitted()).toHaveProperty('change')
		})
	})

	describe('отключённый шаг', () => {
		it('не должен эмитить update:modelValue при клике на отключённый шаг', async () => {
			const { emitted } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
			})

			await fireEvent.click(screen.getByText('Оплата'))

			expect(emitted()).not.toHaveProperty('update:modelValue')
		})
	})
	describe('клавиатура и семантика', () => {
		it('шаг — кнопка в порядке Tab, текущий помечен aria-current="step"', () => {
			render(BaseStepper, { props: { modelValue: 2, items: ITEMS } })

			const [first, second, third] = screen.getAllByRole('button')
			expect(first).toHaveAttribute('tabindex', '0')
			expect(first).not.toHaveAttribute('aria-current')
			expect(second).toHaveAttribute('aria-current', 'step')
			expect(third).toHaveAttribute('aria-disabled', 'true')
			expect(third).toHaveAttribute('tabindex', '-1')
		})

		it('Enter и Space на шаге делают его текущим, как клик', async () => {
			const { emitted } = render(BaseStepper, { props: { modelValue: 1, items: ITEMS } })

			const [first, second] = screen.getAllByRole('button')
			await fireEvent.keyDown(second, { key: 'Enter' })
			await fireEvent.keyDown(first, { key: ' ' })

			expect(emitted()['update:modelValue']).toEqual([[2], [1]])
			expect(emitted().change).toEqual([[2], [1]])
		})

		it('отключённый шаг не реагирует на Enter', async () => {
			const { emitted } = render(BaseStepper, { props: { modelValue: 1, items: ITEMS } })

			await fireEvent.keyDown(screen.getAllByRole('button')[2], { key: 'Enter' })

			expect(emitted()).not.toHaveProperty('update:modelValue')
		})
	})

	describe('иконка шага', () => {
		it('icon заменяет номер в индикаторе, у пройденного шага остаётся галочка', () => {
			const { container } = render(BaseStepper, {
				props: {
					modelValue: 2,
					items: [
						{ label: 'Документы', icon: 'file' },
						{ label: 'Проверка', icon: 'search' },
					],
				},
			})

			const [completed, current] = container.querySelectorAll('.base-stepper__indicator')
			expect(completed.querySelector('use')?.getAttribute('href')).toBe('icons.svg#check')
			expect(current.querySelector('use')?.getAttribute('href')).toBe('icons.svg#search')
			expect(current).not.toHaveTextContent('2')
		})
	})
})
