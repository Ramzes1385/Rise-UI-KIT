import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import BaseEventCalendar from '../../ui/BaseEventCalendar.vue'
import type { CalendarEvent } from '@utils/calendar/eventUtils'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import type { BaseEventCalendarProps } from '../../types/BaseEventCalendar.types'

const EVENTS: CalendarEvent[] = [
	{ id: 'vacation', title: 'Отпуск', start: '2026-10-01', end: '2026-10-08' },
	{ id: 'meeting', title: 'Встреча', start: '2026-10-02T10:00', end: '2026-10-02T11:00' },
	{ id: 'lunch', title: 'Обед', start: '2026-10-02T10:30', end: '2026-10-02T12:00' },
	{ id: 'a', title: 'A', start: '2026-10-02T13:00' },
	{ id: 'b', title: 'B', start: '2026-10-02T14:00' },
]

const CELL = 100

function renderCalendar(props: Partial<BaseEventCalendarProps> = {}) {
	return render(BaseEventCalendar, {
		props: { date: '2026-10-02', today: '2026-10-02T12:30', events: EVENTS, isSelectable: true, ...props },
	})
}

function rect(left: number, top: number, height: number): DOMRect {
	const width = CELL
	return { left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) } as DOMRect
}

function layoutMonth(): void {
	document.querySelectorAll<HTMLElement>('.base-event-calendar__day').forEach((element, index) => {
		element.getBoundingClientRect = () => rect((index % 7) * CELL, Math.floor(index / 7) * CELL, CELL)
	})
}

function layoutColumns(height = 1440): void {
	document.querySelectorAll<HTMLElement>('.base-event-calendar__column').forEach((element, index) => {
		element.getBoundingClientRect = () => rect(index * CELL, 0, height)
	})
}

const cell = (key: string): HTMLElement => document.querySelector(`.base-event-calendar__day[data-day="${key}"]`) as HTMLElement
const column = (key: string): HTMLElement => document.querySelector(`.base-event-calendar__column[data-day="${key}"]`) as HTMLElement
const statusText = (): string => (screen.getByRole('status').textContent ?? '').replace(/\s/g, ' ')
const selectedKeys = (): string[] =>
	Array.from(document.querySelectorAll<HTMLElement>('.base-event-calendar__day--selected')).map(element => element.dataset.day ?? '')
const at = (day: number, hours: number, minutes = 0): Date => new Date(2026, 9, day, hours, minutes)

function press(target: Element, [x, y]: [number, number], init: Record<string, unknown> = {}): void {
	fireEvent.pointerDown(target, { button: 0, clientX: x, clientY: y, pointerType: 'mouse', ...init })
}
const moveTo = (x: number, y: number): Promise<void> => fireEvent.pointerMove(window, { clientX: x, clientY: y })
const release = (x: number, y: number): Promise<void> => fireEvent.pointerUp(window, { clientX: x, clientY: y })

describe('BaseEventCalendar — выделение и создание', () => {
	describe('без isSelectable', () => {
		it('нет подсказки, aria-multiselectable, tabindex колонок; нажатие и клавиши ничего не выделяют', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ isSelectable: undefined })
			layoutMonth()
			const grid = screen.getByRole('grid')
			expect(grid).not.toHaveAttribute('aria-multiselectable')
			expect(grid).not.toHaveAttribute('aria-describedby')
			press(cell('2026-10-02'), [450, 50])
			moveTo(50, 150)
			release(50, 150)
			cell('2026-10-02').focus()
			await user.keyboard('{Shift>}{ArrowRight}{/Shift}{Enter}')
			expect(selectedKeys()).toEqual([])
			expect(emitted().select).toBeUndefined()
			expect(emitted().create).toBeUndefined()
			expect(cell('2026-10-03')).toHaveFocus()
		})

		it('неделя: у колонок нет tabindex и подсказки, фокус и клавиши колонки ничего не делают', async () => {
			const { emitted } = renderCalendar({ isSelectable: false, view: 'week' })
			layoutColumns()
			const target = column('2026-10-02')
			expect(target).not.toHaveAttribute('tabindex')
			expect(target).not.toHaveAttribute('aria-describedby')
			await fireEvent.focus(target)
			await fireEvent.keyDown(target, { key: 'Enter' })
			press(target, [450, 600])
			release(450, 600)
			expect(document.querySelector('.base-event-calendar__cursor')).toBeNull()
			expect(emitted().create).toBeUndefined()
			expect(statusText()).toBe('')
		})
	})

	describe('мышь, месяц', () => {
		it('протянуть на другой день — select до полуночи после последнего дня, выделение остаётся', async () => {
			const { emitted } = renderCalendar()
			layoutMonth()
			press(cell('2026-10-02'), [450, 50])
			await moveTo(50, 150)
			expect(selectedKeys()).toEqual(['2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05'])
			await release(50, 150)
			expect(emitted().select).toEqual([[{ start: at(2, 0), end: at(6, 0), allDay: true }]])
			expect(emitted().create).toBeUndefined()
			expect(selectedKeys()).toHaveLength(4)
			expect(cell('2026-10-05')).toHaveAttribute('aria-selected', 'true')
		})

		it('назад — тот же диапазон; точка вне ячеек не меняет выделение', async () => {
			const { emitted } = renderCalendar()
			layoutMonth()
			press(cell('2026-10-05'), [50, 150])
			await moveTo(450, 50)
			await moveTo(-500, -500)
			await release(-500, -500)
			expect(emitted().select).toEqual([[{ start: at(2, 0), end: at(6, 0), allDay: true }]])
		})

		it('нажатие без движения — create одного дня, выделение снимается', async () => {
			const { emitted } = renderCalendar()
			layoutMonth()
			press(cell('2026-10-03'), [550, 50])
			await release(550, 50)
			expect(emitted().create).toEqual([[{ start: at(3, 0), end: at(4, 0), allDay: true }]])
			expect(emitted().select).toBeUndefined()
			expect(selectedKeys()).toEqual([])
		})

		it.each([
			['Escape', () => fireEvent.keyDown(window, { key: 'Escape' })],
			['pointercancel', () => fireEvent.pointerCancel(window)],
		])('%s во время протягивания — выделение снято, событий нет', async (_name, cancel) => {
			const { emitted } = renderCalendar()
			layoutMonth()
			press(cell('2026-10-02'), [450, 50])
			await moveTo(550, 50)
			await cancel()
			await waitFor(() => expect(selectedKeys()).toEqual([]))
			expect(statusText()).toBe('Выделение снято')
			await release(550, 50)
			await moveTo(650, 50)
			expect(emitted().select).toBeUndefined()
			expect(emitted().create).toBeUndefined()
		})

		it('выделение снято клавиатурой во время протягивания — pointerup и Escape ничего не шлют', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar()
			layoutMonth()
			cell('2026-10-02').focus()
			press(cell('2026-10-02'), [450, 50])
			await moveTo(550, 50)
			await user.keyboard('{Escape}')
			expect(statusText()).toBe('Выделение снято')
			press(cell('2026-10-02'), [450, 50])
			await moveTo(550, 50)
			await user.keyboard('{ArrowLeft}')
			await release(550, 50)
			expect(emitted().select).toBeUndefined()
			expect(emitted().create).toBeUndefined()
		})

		it('другие клавиши во время протягивания не отменяют его', async () => {
			const { emitted } = renderCalendar()
			layoutMonth()
			press(cell('2026-10-02'), [450, 50])
			await moveTo(550, 50)
			await fireEvent.keyDown(window, { key: 'a' })
			await release(550, 50)
			expect(emitted().select).toHaveLength(1)
		})

		it('не левая кнопка, событие и «+N ещё» — не начинают выделение', async () => {
			const { emitted } = renderCalendar()
			layoutMonth()
			press(cell('2026-10-02'), [450, 50], { button: 2 })
			press(screen.getByRole('button', { name: 'Встреча, 2 октября, 10:00–11:00' }), [450, 50])
			press(screen.getByRole('button', { name: 'Все события дня: 2 октября' }), [450, 50])
			press(screen.getByRole('grid'), [450, 50])
			await release(450, 50)
			expect(emitted().create).toBeUndefined()
			expect(emitted().select).toBeUndefined()
		})
	})

	describe('мышь, неделя и день', () => {
		it('протянуть по шкале — select шагами slotDuration, полоса в колонке; курсор — на последнем шаге', async () => {
			const { emitted } = renderCalendar({ view: 'week' })
			layoutColumns()
			press(column('2026-10-02'), [450, 610])
			await moveTo(450, 689)
			const band = column('2026-10-02').querySelector<HTMLElement>('.base-event-calendar__selection')
			expect(band?.style.top).toBe('41.6667%')
			expect(band?.style.height).toBe('6.25%')
			await release(450, 689)
			expect(emitted().select).toEqual([[{ start: at(2, 10), end: at(2, 11, 30), allDay: false }]])
			column('2026-10-02').focus()
			await waitFor(() => expect(statusText()).toBe('2 октября, 11:00'))
		})

		it('через дни недели — непрерывное время, полосы в каждой задетой колонке', async () => {
			const { emitted } = renderCalendar({ view: 'week' })
			layoutColumns()
			press(column('2026-10-02'), [450, 1320])
			await moveTo(550, 60)
			expect(column('2026-10-02').querySelector('.base-event-calendar__selection')).not.toBeNull()
			expect(column('2026-10-03').querySelector('.base-event-calendar__selection')).not.toBeNull()
			expect(column('2026-10-04').querySelector('.base-event-calendar__selection')).toBeNull()
			await release(550, 60)
			expect(emitted().select).toEqual([[{ start: at(2, 22), end: at(3, 1, 30), allDay: false }]])
		})

		it('нажатие без движения — create одного шага; минуты обрезаются 0…сутки−шаг', async () => {
			const { emitted } = renderCalendar({ view: 'day', slotDuration: 15 })
			layoutColumns()
			press(column('2026-10-02'), [50, 2000])
			await release(50, 2000)
			press(column('2026-10-02'), [50, -40])
			await moveTo(50, -10)
			await release(50, -10)
			expect(emitted().create).toEqual([
				[{ start: at(2, 23, 45), end: at(3, 0), allDay: false }],
				[{ start: at(2, 0), end: at(2, 0, 15), allDay: false }],
			])
		})

		it('колонка без высоты — начало суток', async () => {
			const { emitted } = renderCalendar({ view: 'day' })
			layoutColumns(0)
			press(column('2026-10-02'), [50, 500])
			await release(50, 500)
			expect(emitted().create).toEqual([[{ start: at(2, 0), end: at(2, 0, 30), allDay: false }]])
		})

		it('нажатие на событие шкалы, мимо колонки или без даты — не выделяет', async () => {
			const { emitted } = renderCalendar({ view: 'week' })
			layoutColumns()
			press(screen.getByRole('button', { name: 'Встреча, 2 октября, 10:00–11:00' }), [450, 610])
			press(document.querySelector('.base-event-calendar__time-canvas') as HTMLElement, [450, 610])
			const target = column('2026-10-02')
			target.removeAttribute('data-day')
			press(target, [450, 610])
			await release(450, 610)
			expect(emitted().create).toBeUndefined()
		})
	})

	describe('клавиатура, месяц', () => {
		it('Shift + стрелки выделяют от выбранного дня, подсказка и aria-selected; Enter — select', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar()
			const grid = screen.getByRole('grid')
			expect(grid).toHaveAttribute('aria-multiselectable', 'true')
			expect(grid).toHaveAccessibleDescription(
				'Enter — создать событие, Shift со стрелками — выделить время, Escape — снять выделение',
			)
			cell('2026-10-02').focus()
			await user.keyboard('{Shift>}{ArrowRight}{ArrowRight}{/Shift}')
			expect(selectedKeys()).toEqual(['2026-10-02', '2026-10-03', '2026-10-04'])
			expect(cell('2026-10-03')).toHaveAttribute('aria-selected', 'true')
			expect(statusText()).toBe('Выделено: 2 октября — 4 октября')
			await user.keyboard('{Enter}')
			expect(emitted().select).toEqual([[{ start: at(2, 0), end: at(5, 0), allDay: true }]])
			expect(selectedKeys()).toHaveLength(3)
		})

		it('назад и один день; без Shift выделение снимается; Enter без выделения — create', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar()
			cell('2026-10-02').focus()
			await user.keyboard('{Shift>}{ArrowLeft}{/Shift}')
			expect(statusText()).toBe('Выделено: 1 октября — 2 октября')
			await user.keyboard('{Shift>}{ArrowRight}{/Shift}')
			expect(statusText()).toBe('Выделено: 2 октября')
			await user.keyboard('{Shift>}{End}{/Shift}')
			expect(selectedKeys()).toEqual(['2026-10-02', '2026-10-03', '2026-10-04'])
			await user.keyboard('{ArrowDown}')
			expect(selectedKeys()).toEqual([])
			await user.keyboard('{Enter}')
			expect(emitted().create).toEqual([[{ start: at(11, 0), end: at(12, 0), allDay: true }]])
		})

		it('Escape снимает выделение, без выделения — ничего; клавиши не с ячейки идут в сетку', async () => {
			const user = userEvent.setup()
			renderCalendar()
			cell('2026-10-02').focus()
			await user.keyboard('{Escape}')
			expect(statusText()).toBe('')
			await user.keyboard('{Shift>}{ArrowRight}{/Shift}{Escape}')
			expect(selectedKeys()).toEqual([])
			expect(statusText()).toBe('Выделение снято')
			const event = screen.getByRole('button', { name: 'Встреча, 2 октября, 10:00–11:00' })
			await fireEvent.keyDown(event, { key: 'Enter' })
			await fireEvent.keyDown(event, { key: 'ArrowRight', shiftKey: true })
			expect(selectedKeys()).toEqual([])
		})

		it('клавиши, которые не двигают день, не выделяют', async () => {
			const user = userEvent.setup()
			renderCalendar()
			cell('2026-10-02').focus()
			await user.keyboard('{Shift>}{ArrowRight}{/Shift}')
			await user.keyboard('{Shift>}a{/Shift}')
			expect(selectedKeys()).toEqual(['2026-10-02', '2026-10-03'])
		})
	})

	describe('клавиатура, неделя и день', () => {
		it('колонка выбранного дня — одна точка Tab с подсказкой; фокус — курсор на 08:00', async () => {
			renderCalendar({ view: 'week' })
			expect(column('2026-10-02')).toHaveAttribute('tabindex', '0')
			expect(column('2026-10-01')).toHaveAttribute('tabindex', '-1')
			expect(column('2026-10-02')).toHaveAccessibleDescription(
				'Enter — создать событие, Shift со стрелками — выделить время, Escape — снять выделение',
			)
			column('2026-10-02').focus()
			await waitFor(() => expect(statusText()).toBe('2 октября, 08:00'))
			const cursor = column('2026-10-02').querySelector<HTMLElement>('.base-event-calendar__cursor')
			expect(cursor?.style.top).toBe('33.3333%')
			column('2026-10-02').blur()
			await waitFor(() => expect(document.querySelector('.base-event-calendar__cursor')).toBeNull())
		})

		it('курсор — на начале workHours, округлённом вниз до шага; фокус на другом дне — update:date', async () => {
			const { emitted } = renderCalendar({ view: 'week', workHours: { start: '09:15', end: '18:00' } })
			column('2026-09-30').focus()
			await waitFor(() => expect(statusText()).toBe('30 сентября, 09:00'))
			expect(emitted()['update:date']).toEqual([[new Date(2026, 8, 30)]])
		})

		it('↑/↓ — шаг, Shift — выделение, Enter — select, Escape — снять', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ view: 'week' })
			column('2026-10-02').focus()
			await user.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}')
			expect(statusText()).toBe('2 октября, 08:30')
			await user.keyboard('{Shift>}{ArrowDown}{ArrowDown}{/Shift}')
			expect(statusText()).toBe('Выделено: 2 октября, 08:30–10:00')
			await user.keyboard('{Enter}')
			expect(emitted().select).toEqual([[{ start: at(2, 8, 30), end: at(2, 10), allDay: false }]])
			await user.keyboard('{Escape}')
			expect(statusText()).toBe('Выделение снято')
			expect(document.querySelector('.base-event-calendar__selection')).toBeNull()
			await user.keyboard('{Escape}{Enter}')
			expect(emitted().create).toEqual([[{ start: at(2, 9, 30), end: at(2, 10), allDay: false }]])
		})

		it('←/→ — соседний день, фокус на его колонке; Shift — выделение через дни', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ view: 'week' })
			column('2026-10-02').focus()
			await user.keyboard('{ArrowRight}')
			expect(emitted()['update:date']).toEqual([[at(3, 0)]])
			await waitFor(() => expect(column('2026-10-03')).toHaveFocus())
			expect(statusText()).toBe('3 октября, 08:00')
			await user.keyboard('{Shift>}{ArrowLeft}{/Shift}')
			await waitFor(() => expect(column('2026-10-02')).toHaveFocus())
			expect(statusText()).toBe('Выделено: 2 октября, 08:00 — 3 октября, 08:30')
			expect(column('2026-10-02').querySelector('.base-event-calendar__selection')).not.toBeNull()
			expect(column('2026-10-03').querySelector('.base-event-calendar__selection')).not.toBeNull()
			await user.keyboard('{Shift>}{ArrowDown}{/Shift}')
			expect(statusText()).toBe('Выделено: 2 октября, 08:30 — 3 октября, 08:30')
			await user.keyboard('{Enter}')
			expect(emitted().select).toEqual([[{ start: at(2, 8, 30), end: at(3, 8, 30), allDay: false }]])
		})

		it('за сутки и за период не выходит; в «День» ←/→ некуда', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({
				view: 'week',
				date: '2026-09-28',
				slotDuration: 60,
				workHours: { start: '00:00', end: '23:00' },
			})
			column('2026-09-28').focus()
			await user.keyboard('{ArrowUp}{ArrowLeft}')
			expect(statusText()).toBe('28 сентября, 00:00')
			expect(emitted()['update:date']).toBeUndefined()
			await user.keyboard('a')
			expect(statusText()).toBe('28 сентября, 00:00')
		})

		it('последний шаг суток и «День»', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ view: 'day', slotDuration: 60, workHours: { start: '23:00', end: '23:59' } })
			column('2026-10-02').focus()
			await user.keyboard('{ArrowDown}{ArrowLeft}{ArrowRight}')
			expect(statusText()).toBe('2 октября, 23:00')
			expect(emitted()['update:date']).toBeUndefined()
		})

		it('клавиша колонки до фокуса — курсор на начальном шаге', async () => {
			const { emitted } = renderCalendar({ view: 'day' })
			await fireEvent.keyDown(column('2026-10-02'), { key: 'Enter' })
			expect(emitted().create).toEqual([[{ start: at(2, 8), end: at(2, 8, 30), allDay: false }]])
		})

		it('неверные workHours — 08:00; клавиши с события в колонке колонка не обрабатывает', async () => {
			const { emitted } = renderCalendar({ view: 'week', workHours: { start: 'утро', end: 'вечер' } })
			column('2026-10-02').focus()
			await waitFor(() => expect(statusText()).toBe('2 октября, 08:00'))
			await fireEvent.keyDown(screen.getByRole('button', { name: 'Встреча, 2 октября, 10:00–11:00' }), { key: 'Enter' })
			expect(emitted().create).toBeUndefined()
		})
	})
})
