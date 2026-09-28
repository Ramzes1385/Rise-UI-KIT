import '@testing-library/jest-dom/vitest'
import BaseCalendar from '../ui/BaseCalendar.vue'
import userEvent from '@testing-library/user-event'
import { fireEvent, render } from '@testing-library/vue'

function getTimeInputs(container: Element): HTMLInputElement[] {
	return Array.from(container.querySelectorAll<HTMLInputElement>('.base-calendar__time input'))
}

function lastEmittedDate(emitted: Record<string, unknown[]>): Date {
	const updates = emitted['update:modelValue'] as [Date][]
	return updates.at(-1)![0]
}

async function typeTime(input: HTMLInputElement, value: string): Promise<void> {
	const user = userEvent.setup()
	await user.clear(input)
	await user.type(input, value)
	await fireEvent.change(input)
}

describe('BaseCalendar: выбор времени', () => {
	describe('12-часовой формат', () => {
		const props = {
			timeConfig: { showTime: true, is24Hour: false },
			modelValue: new Date(2026, 4, 15, 14, 30),
		}

		it('показывает 14:30 как 2:30 PM', () => {
			const { container } = render(BaseCalendar, { props })

			const [hours, minutes] = getTimeInputs(container)
			expect(hours.value).toBe('2')
			expect(minutes.value).toBe('30')
			expect(container.querySelector('.base-calendar__time-ampm')).toHaveTextContent('PM')
		})

		it('переключатель AM/PM с первого клика переводит 14:30 в 02:30 того же дня', async () => {
			const { container, emitted } = render(BaseCalendar, { props })

			await fireEvent.click(container.querySelector('.base-calendar__time-ampm')!)

			const value = lastEmittedDate(emitted())
			expect(value.getDate()).toBe(15)
			expect(value.getHours()).toBe(2)
			expect(value.getMinutes()).toBe(30)
			expect(container.querySelector('.base-calendar__time-ampm')).toHaveTextContent('AM')
		})

		it('очистка поля часов не подставляет значение до ввода цифры', async () => {
			const { container } = render(BaseCalendar, { props })
			const [hours] = getTimeInputs(container)

			await userEvent.setup().clear(hours)

			expect(hours.value).toBe('')
		})

		it('ввод часа сохраняет половину суток (PM) и дату', async () => {
			const { container, emitted } = render(BaseCalendar, { props })
			const [hours] = getTimeInputs(container)

			await typeTime(hours, '3')

			const value = lastEmittedDate(emitted())
			expect(value.getDate()).toBe(15)
			expect(value.getHours()).toBe(15)
			expect(value.getMinutes()).toBe(30)
			expect(hours.value).toBe('3')
		})

		it('v-model:is-am получает значение, соответствующее часам (PM для 14:30)', () => {
			const { emitted } = render(BaseCalendar, { props })

			expect(emitted()['update:isAm']?.at(-1)).toEqual([false])
		})

		it('внешнее изменение v-model:is-am переключает половину суток значения', async () => {
			const { emitted, rerender } = render(BaseCalendar, { props: { ...props, isAm: false } })

			await rerender({ ...props, isAm: true })

			const value = lastEmittedDate(emitted())
			expect(value.getDate()).toBe(15)
			expect(value.getHours()).toBe(2)
		})

		it('час больше 12 ограничивается 12 и не сдвигает дату', async () => {
			const { container, emitted } = render(BaseCalendar, { props })
			const [hours] = getTimeInputs(container)

			await typeTime(hours, '13')

			const value = lastEmittedDate(emitted())
			expect(value.getDate()).toBe(15)
			expect(value.getHours()).toBe(12)
			expect(hours.value).toBe('12')
		})
	})

	describe('24-часовой формат', () => {
		const props = {
			timeConfig: { showTime: true },
			modelValue: new Date(2026, 4, 15, 9, 30),
		}

		it('часы больше 23 ограничиваются 23 и не сдвигают дату', async () => {
			const { container, emitted } = render(BaseCalendar, { props })
			const [hours] = getTimeInputs(container)

			await typeTime(hours, '99')

			const value = lastEmittedDate(emitted())
			expect(value.getDate()).toBe(15)
			expect(value.getHours()).toBe(23)
			expect(hours.value).toBe('23')
		})

		it('минуты больше 59 ограничиваются 59 и не сдвигают час', async () => {
			const { container, emitted } = render(BaseCalendar, { props })
			const [, minutes] = getTimeInputs(container)

			await typeTime(minutes, '75')

			const value = lastEmittedDate(emitted())
			expect(value.getDate()).toBe(15)
			expect(value.getHours()).toBe(9)
			expect(value.getMinutes()).toBe(59)
			expect(minutes.value).toBe('59')
		})
	})
})
