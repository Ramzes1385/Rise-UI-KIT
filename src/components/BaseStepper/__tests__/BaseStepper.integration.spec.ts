/**
 * Integration-тесты для BaseStepper.
 * Проверяют взаимодействие: клики по шагам, emits.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'

import type { BaseStepperStep } from '../model/BaseStepper.types'
import BaseStepper from '../ui/BaseStepper.vue'

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
})
