import '@testing-library/jest-dom/vitest'
import BaseStepper from '../ui/BaseStepper.vue'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { BaseStepperStep } from '../types/BaseStepper.types'

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
		it('шаги — список <ol>, шаг — кнопка, текущий помечен aria-current="step", пройденный озвучивает «пройден» (ST-2)', () => {
			render(BaseStepper, { props: { modelValue: 2, items: ITEMS } })

			expect(screen.getByRole('list')).toContainElement(screen.getByText('Данные'))
			expect(screen.getAllByRole('listitem')).toHaveLength(3)
			const [done, current, disabled] = screen.getAllByRole('button')
			expect(done).toHaveAccessibleName('Данные, пройден')
			expect(done).not.toHaveAttribute('aria-current')
			expect(current).toHaveAccessibleName('Адрес')
			expect(current).toHaveAttribute('aria-current', 'step')
			expect(disabled).toHaveAccessibleName('Оплата')
			expect(disabled).toBeDisabled()
		})

		it('Tab проходит выбираемые шаги, Enter и Space делают шаг текущим', async () => {
			const user = userEvent.setup()
			const items = [{ label: 'Данные' }, { label: 'Адрес' }, { label: 'Оплата' }]
			const { emitted } = render(BaseStepper, { props: { modelValue: 2, items } })

			await user.tab()
			expect(screen.getByRole('button', { name: 'Данные, пройден' })).toHaveFocus()
			await user.keyboard('{Enter}')
			await user.tab()
			expect(screen.getByRole('button', { name: 'Адрес' })).toHaveFocus()
			await user.tab()
			expect(screen.getByRole('button', { name: 'Оплата' })).toHaveFocus()
			await user.keyboard(' ')

			expect(emitted('update:modelValue')).toEqual([[1], [3]])
			expect(emitted('change')).toEqual([[1], [3]])
		})

		it('отключённый шаг пропускается в порядке Tab', async () => {
			const user = userEvent.setup()
			render(BaseStepper, { props: { modelValue: 1, items: ITEMS } })

			await user.tab()
			await user.tab()
			expect(screen.getByRole('button', { name: 'Адрес' })).toHaveFocus()
			await user.tab()
			expect(document.body).toHaveFocus()
		})
	})

	describe('clickable (ST-3)', () => {
		it('клик и Enter по текущему шагу не эмитят событий, фокус остаётся на нём', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseStepper, { props: { modelValue: 2, items: ITEMS } })

			await user.click(screen.getByText('Адрес'))
			await user.keyboard('{Enter}')
			expect(screen.getByRole('button', { name: 'Адрес' })).toHaveFocus()

			expect(emitted()).not.toHaveProperty('change')
			expect(emitted()).not.toHaveProperty('update:modelValue')
		})

		it('completed — кнопки только у пройденных и текущего, клик по будущему не эмитит', async () => {
			const items = [{ label: 'Данные' }, { label: 'Адрес' }, { label: 'Оплата' }]
			const { emitted } = render(BaseStepper, { props: { modelValue: 2, items, clickable: 'completed' } })

			expect(screen.getAllByRole('button')).toHaveLength(2)
			expect(screen.getByRole('button', { name: 'Адрес' })).toHaveAttribute('aria-current', 'step')
			await fireEvent.click(screen.getByText('Оплата'))
			expect(emitted()).not.toHaveProperty('change')

			await fireEvent.click(screen.getByRole('button', { name: 'Данные, пройден' }))
			expect(emitted('change')).toEqual([[1]])
		})

		it('none — кнопок нет, клики не эмитят', async () => {
			const { emitted } = render(BaseStepper, { props: { modelValue: 2, items: ITEMS, clickable: 'none' } })

			expect(screen.queryAllByRole('button')).toHaveLength(0)
			await fireEvent.click(screen.getByText('Данные'))
			expect(emitted()).not.toHaveProperty('change')
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
