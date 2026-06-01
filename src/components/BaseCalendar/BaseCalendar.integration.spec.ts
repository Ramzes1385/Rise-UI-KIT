/**
 * Integration-тесты для BaseCalendar.
 * Проверяют selectionMode, навигацию, isDisabled.
 * Дочерние UI-компоненты заменены stub'ами со слотами.
 * Мокаем только DOM-зависимые composables.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'

import BaseCalendar from './BaseCalendar.vue'

vi.mock('@composables/useClickOutside', () => ({ useClickOutside: vi.fn() }))

const stubs = {
	BaseCard: { template: '<div class="base-card-stub"><slot /></div>' },
	BaseButton: { template: '<button class="base-button-stub"><slot /></button>' },
	BaseText: { template: '<span class="base-text-stub"><slot /></span>' },
	BaseIcon: { template: '<i class="base-icon-stub" />' },
	BaseInput: { template: '<input class="base-input-stub" />' },
}

describe('BaseCalendar integration', () => {
	describe('selectionMode: single', () => {
		it('должен эмитить update:modelValue при выборе даты', async () => {
			const date = new Date(2024, 0, 1)
			const { emitted } = render(BaseCalendar, {
				props: { modelValue: date },
				global: { stubs },
			})

			const day15 = screen.getByText('15')
			await fireEvent.click(day15)

			expect(emitted()).toHaveProperty('update:modelValue')
			const event = emitted()['update:modelValue'][0] as Date[]
			expect(event[0].getDate()).toBe(15)
		})

		it('должен выделять выбранную дату', async () => {
			const date = new Date(2024, 0, 1)
			const { container, emitted } = render(BaseCalendar, {
				props: { modelValue: date },
				global: { stubs },
			})

			const day15 = screen.getByText('15')
			await fireEvent.click(day15)

			expect(emitted()).toHaveProperty('update:modelValue')
			const selectedDay = container.querySelectorAll('.base-calendar__day--selected')
			expect(selectedDay.length).toBeGreaterThan(0)
		})
	})

	describe('selectionMode: range', () => {
		it('должен эмитить update:modelValue при выборе начала диапазона', async () => {
			const { emitted } = render(BaseCalendar, {
				props: {
					selectionMode: 'range',
					modelValue: null,
					modelValueEnd: null,
				},
				global: { stubs },
			})

			const day10 = screen.getByText('10')
			await fireEvent.click(day10)

			expect(emitted()).toHaveProperty('update:modelValue')
			const event = emitted()['update:modelValue'][0] as Date[]
			expect(event[0].getDate()).toBe(10)
		})

		it('должен эмитить update:modelValueEnd при выборе конца диапазона', async () => {
			const start = new Date(2024, 0, 5)
			const { emitted } = render(BaseCalendar, {
				props: {
					selectionMode: 'range',
					modelValue: start,
					modelValueEnd: null,
				},
				global: { stubs },
			})

			const day15 = screen.getByText('15')
			await fireEvent.click(day15)

			expect(emitted()).toHaveProperty('update:modelValueEnd')
			const event = emitted()['update:modelValueEnd'][0] as Date[]
			expect(event[0].getDate()).toBe(15)
		})
	})

	describe('selectionMode: multiple', () => {
		it('должен эмитить update:selectedDates при выборе даты', async () => {
			const { emitted } = render(BaseCalendar, {
				props: {
					selectionMode: 'multiple',
					selectedDates: [],
				},
				global: { stubs },
			})

			const day10 = screen.getByText('10')
			await fireEvent.click(day10)

			expect(emitted()).toHaveProperty('update:selectedDates')
			const event = emitted()['update:selectedDates'][0] as Date[][]
			expect(event[0].length).toBe(1)
			expect(event[0][0].getDate()).toBe(10)
		})
	})

	describe('навигация', () => {
		it('должен эмитить date-click при нажатии "Сегодня"', async () => {
			const { emitted } = render(BaseCalendar, {
				props: { modelValue: new Date(2024, 0, 1) },
				global: { stubs },
			})

			const todayBtn = screen.getByText('Сегодня')
			await fireEvent.click(todayBtn)

			expect(emitted()).toHaveProperty('date-click')
			expect(emitted()).toHaveProperty('update:modelValue')
		})
	})

	describe('isDisabled', () => {
		it('не должен эмитить события при isDisabled', async () => {
			const { emitted } = render(BaseCalendar, {
				props: { isDisabled: true },
				global: { stubs },
			})

			const allDays = screen.getAllByText(/\d+/)
			if (allDays.length > 0) {
				await fireEvent.click(allDays[0])
			}

			expect(emitted()['update:modelValue']).toBeUndefined()
		})
	})
})

