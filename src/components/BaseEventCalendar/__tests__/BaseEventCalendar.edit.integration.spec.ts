import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import BaseEventCalendar from '../ui/BaseEventCalendar.vue'
import type { CalendarEvent } from '@utils/calendar/eventUtils'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import type { BaseEventCalendarProps, EventCalendarChange } from '../types/BaseEventCalendar.types'

const VACATION: CalendarEvent = { id: 'vacation', title: 'Отпуск', start: '2026-10-01', end: '2026-10-08' }
const MEETING: CalendarEvent = { id: 'meeting', title: 'Встреча', start: '2026-10-02T10:00', end: '2026-10-02T11:00' }
const EVENTS = [VACATION, MEETING]

const CELL = 100
const MEETING_NAME = 'Встреча, 2 октября, 10:00–11:00'
const VACATION_NAME = 'Отпуск, 1 октября — 7 октября'

function renderCalendar(props: Partial<BaseEventCalendarProps> = {}) {
	return render(BaseEventCalendar, {
		props: { date: '2026-10-02', today: '2026-10-02T12:30', events: EVENTS, isEditable: true, ...props },
	})
}

function rect(left: number, top: number, height: number): DOMRect {
	const width = CELL
	return { left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) } as DOMRect
}

function layout(): void {
	document.querySelectorAll<HTMLElement>('.base-event-calendar__day').forEach((element, index) => {
		element.getBoundingClientRect = () => rect((index % 7) * CELL, Math.floor(index / 7) * CELL, CELL)
	})
	document.querySelectorAll<HTMLElement>('.base-event-calendar__column').forEach((element, index) => {
		element.getBoundingClientRect = () => rect(index * CELL, 0, 1440)
	})
}

const at = (day: number, hours = 0, minutes = 0): Date => new Date(2026, 9, day, hours, minutes)
const statusText = (): string => (screen.getByRole('status').textContent ?? '').replace(/\s/g, ' ')
const eventByKey = (key: string): HTMLElement => document.querySelector(`[data-event-key="${key}"]`) as HTMLElement
const meeting = (): HTMLElement => screen.getByRole('button', { name: MEETING_NAME })
const changes = (emitted: Record<string, unknown[][]>): EventCalendarChange[] =>
	(emitted['event-change'] ?? []).map(([change]) => change as EventCalendarChange)

function press(target: Element, [x, y]: [number, number], init: Record<string, unknown> = {}): void {
	fireEvent.pointerDown(target, { button: 0, clientX: x, clientY: y, pointerType: 'mouse', ...init })
}
const moveTo = (x: number, y: number): Promise<void> => fireEvent.pointerMove(window, { clientX: x, clientY: y })
const release = (x: number, y: number): Promise<void> => fireEvent.pointerUp(window, { clientX: x, clientY: y })

describe('BaseEventCalendar — перенос и длительность', () => {
	describe('без isEditable', () => {
		it('нет ручек, подсказки и переноса; Space на событии — обычное нажатие', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ isEditable: undefined, view: 'week' })
			layout()
			expect(document.querySelector('.base-event-calendar__resize')).toBeNull()
			expect(meeting()).not.toHaveAttribute('aria-describedby')
			press(meeting(), [450, 610])
			await moveTo(550, 700)
			await release(550, 700)
			meeting().focus()
			await user.keyboard(' ')
			expect(document.querySelector('.base-event-calendar__event--grabbed')).toBeNull()
			expect(emitted()['event-change']).toBeUndefined()
			expect(emitted()['event-click']).toHaveLength(1)
		})
	})

	describe('мышь', () => {
		it('месяц: полоса переносится на другой день, сдвиг по дням; click после переноса подавлен', async () => {
			const { emitted } = renderCalendar()
			layout()
			press(meeting(), [450, 50])
			await moveTo(453, 52)
			expect(document.querySelector('.base-event-calendar__event--dragging')).toBeNull()
			await moveTo(50, 150)
			expect(eventByKey('meeting')).toHaveClass('base-event-calendar__event--dragging')
			await release(50, 150)
			expect(changes(emitted())).toEqual([
				{
					type: 'move',
					event: MEETING,
					start: at(5, 10),
					end: at(5, 11),
					allDay: false,
					oldStart: at(2, 10),
					oldEnd: at(2, 11),
				},
			])
			expect(document.querySelector('.base-event-calendar__event--dragging')).toBeNull()
			await fireEvent.click(meeting())
			expect(emitted()['event-click']).toBeUndefined()
			await new Promise(resolve => setTimeout(resolve))
			await fireEvent.click(meeting())
			expect(emitted()['event-click']).toHaveLength(1)
		})

		it('месяц: ручка многодневного события меняет конец, не короче дня; события не меняются', async () => {
			const { emitted } = renderCalendar()
			layout()
			const handles = document.querySelectorAll('[data-event-key="vacation"] .base-event-calendar__resize')
			expect(handles).toHaveLength(1)
			press(handles[0], [250, 150])
			await moveTo(450, 150)
			await release(450, 150)
			press(handles[0], [250, 150])
			await moveTo(50, 50)
			await release(50, 50)
			expect(changes(emitted()).map(({ type, start, end, allDay }) => ({ type, start, end, allDay }))).toEqual([
				{ type: 'resize', start: at(1), end: at(10), allDay: true },
				{ type: 'resize', start: at(1), end: at(2), allDay: true },
			])
			expect(document.querySelectorAll('[data-event-key="vacation"]')).toHaveLength(2)
		})

		it('неделя: блок переносится по дням и шагам, сохраняет allDay', async () => {
			const { emitted } = renderCalendar({ view: 'week' })
			layout()
			press(meeting(), [450, 620])
			await moveTo(550, 700)
			expect(eventByKey('meeting').closest('[data-day]')).toHaveAttribute('data-day', '2026-10-03')
			await release(550, 700)
			expect(changes(emitted())).toMatchObject([{ type: 'move', start: at(3, 11, 30), end: at(3, 12, 30), allDay: false }])
			expect(eventByKey('meeting').closest('[data-day]')).toHaveAttribute('data-day', '2026-10-02')
		})

		it('неделя: ручка блока — до конца шага под указателем, не короче шага', async () => {
			const { emitted } = renderCalendar({ view: 'week' })
			layout()
			const handle = meeting().querySelector('.base-event-calendar__resize') as HTMLElement
			press(handle, [450, 659])
			await moveTo(450, 750)
			await release(450, 750)
			press(handle, [450, 659])
			await moveTo(450, 0)
			await release(450, 0)
			expect(changes(emitted()).map(({ type, start, end }) => ({ type, start, end }))).toEqual([
				{ type: 'resize', start: at(2, 10), end: at(2, 13) },
				{ type: 'resize', start: at(2, 10), end: at(2, 10, 30) },
			])
		})

		it('«Весь день»: перенос по колонкам дней', async () => {
			const { emitted } = renderCalendar({ view: 'week' })
			layout()
			press(screen.getByRole('button', { name: VACATION_NAME }), [450, 10])
			await moveTo(650, 10)
			await release(650, 10)
			expect(changes(emitted())).toMatchObject([{ type: 'move', start: at(3), end: at(10), allDay: true }])
		})

		it('«Весь день»: ручка у события, которое кончается в неделе, — конец по колонкам дней', async () => {
			const trip: CalendarEvent = { id: 'trip', title: 'Поездка', start: '2026-10-01', end: '2026-10-03' }
			const { emitted } = renderCalendar({ view: 'week', events: [VACATION, trip] })
			layout()
			expect(document.querySelectorAll('[data-event-key="vacation"] .base-event-calendar__resize')).toHaveLength(0)
			press(eventByKey('trip').querySelector('.base-event-calendar__resize') as HTMLElement, [450, 10])
			await moveTo(650, 10)
			await release(650, 10)
			expect(changes(emitted())).toMatchObject([{ type: 'resize', start: at(1), end: at(5), allDay: true }])
		})

		it('то же место, Escape, pointercancel, точка мимо сетки — без event-change', async () => {
			const { emitted } = renderCalendar({ view: 'week' })
			layout()
			press(meeting(), [450, 620])
			await moveTo(450, 900)
			await moveTo(450, 620)
			await moveTo(-300, 620)
			await release(-300, 620)
			press(meeting(), [450, 620])
			await moveTo(450, 900)
			await fireEvent.keyDown(window, { key: 'Escape' })
			expect(document.querySelector('.base-event-calendar__event--dragging')).toBeNull()
			press(meeting(), [450, 620])
			await moveTo(450, 900)
			await fireEvent.pointerCancel(window)
			await release(450, 900)
			expect(changes(emitted())).toEqual([])
			await new Promise(resolve => setTimeout(resolve))
			await fireEvent.click(meeting())
			expect(emitted()['event-click']).toHaveLength(1)
		})

		it('касание, не левая кнопка и нажатие мимо сетки — перенос не начинается', async () => {
			const { emitted } = renderCalendar({ view: 'week' })
			layout()
			press(meeting(), [450, 620], { pointerType: 'touch' })
			press(meeting(), [450, 620], { button: 1 })
			press(meeting(), [-50, 620])
			await moveTo(650, 900)
			await release(650, 900)
			expect(changes(emitted())).toEqual([])
		})

		it('canMove false — черновик с пунктиром запрета, pointerup ничего не шлёт', async () => {
			const canMove = vi.fn(({ start }: EventCalendarChange) => start.getDate() !== 3)
			const { emitted } = renderCalendar({ view: 'week', canMove })
			layout()
			press(meeting(), [450, 620])
			await moveTo(550, 620)
			expect(eventByKey('meeting')).toHaveClass('base-event-calendar__event--blocked')
			expect(canMove).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'move', start: at(3, 10), event: MEETING }))
			await release(550, 620)
			expect(changes(emitted())).toEqual([])
		})

		it('новое нажатие и размонтирование снимают слежение за указателем', async () => {
			const { emitted, unmount } = renderCalendar({ view: 'week' })
			layout()
			press(meeting(), [450, 620])
			press(meeting(), [450, 620])
			await moveTo(550, 620)
			unmount()
			await release(550, 620)
			expect(changes(emitted())).toEqual([])
		})
	})

	describe('клавиатура', () => {
		it('неделя: Space берёт, стрелки двигают, Enter кладёт — event-change и объявления', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ view: 'week' })
			expect(meeting()).toHaveAccessibleDescription('Space — перенести событие')
			meeting().focus()
			await user.keyboard(' ')
			expect(eventByKey('meeting')).toHaveClass('base-event-calendar__event--grabbed')
			expect(statusText()).toBe(
				'Событие «Встреча» взято: 2 октября, 10:00–11:00. Стрелки переносят, Shift со стрелками меняет длительность, Enter кладёт, Escape отменяет',
			)
			expect(emitted()['event-click']).toBeUndefined()
			await user.keyboard('{ArrowDown}')
			expect(statusText()).toBe('2 октября, 10:30–11:30')
			await waitFor(() => expect(eventByKey('meeting')).toHaveFocus())
			await user.keyboard('{ArrowRight}')
			expect(statusText()).toBe('3 октября, 10:30–11:30')
			await waitFor(() => expect(eventByKey('meeting')).toHaveFocus())
			await user.keyboard('{ArrowUp}{ArrowLeft}{ArrowDown} ')
			expect(eventByKey('meeting')).toHaveClass('base-event-calendar__event--grabbed')
			await user.keyboard('{Enter}')
			expect(changes(emitted())).toMatchObject([{ type: 'move', start: at(2, 10, 30), end: at(2, 11, 30), oldStart: at(2, 10) }])
			expect(statusText()).toBe('Событие «Встреча» перенесено: 2 октября, 10:30–11:30')
			expect(emitted()['event-click']).toBeUndefined()
			expect(document.querySelector('.base-event-calendar__event--grabbed')).toBeNull()
		})

		it('Shift + стрелки меняют конец, не короче шага — resize', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ view: 'week' })
			meeting().focus()
			await user.keyboard(' {Shift>}{ArrowDown}{/Shift}')
			expect(statusText()).toBe('2 октября, 10:00–11:30')
			await user.keyboard('{Shift>}{ArrowUp}{ArrowUp}{ArrowUp}{/Shift}')
			expect(statusText()).toBe('2 октября, 10:00–10:30')
			await user.keyboard('{Enter}')
			expect(changes(emitted())).toMatchObject([{ type: 'resize', start: at(2, 10), end: at(2, 10, 30) }])
		})

		it('Escape и Enter без изменений — отмена с фокусом на событии; Tab — без возврата фокуса', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ view: 'week' })
			meeting().focus()
			await user.keyboard(' {ArrowDown}{Escape}')
			expect(statusText()).toBe('Перенос отменён, событие «Встреча» на прежнем месте')
			await waitFor(() => expect(meeting()).toHaveFocus())
			await user.keyboard(' {Enter}')
			expect(statusText()).toBe('Перенос отменён, событие «Встреча» на прежнем месте')
			await user.keyboard(' {ArrowDown}a{Tab}')
			expect(document.querySelector('.base-event-calendar__event--grabbed')).toBeNull()
			expect(meeting()).not.toHaveFocus()
			expect(changes(emitted())).toEqual([])
			expect(emitted()['event-click']).toBeUndefined()
		})

		it('месяц: ←/→ — день, ↑/↓ — неделя; за показанный период не выходит', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar()
			meeting().focus()
			await user.keyboard(' {ArrowUp}')
			expect(statusText()).toMatch(/^Событие «Встреча» взято/)
			await user.keyboard('{ArrowDown}{ArrowRight}{ArrowLeft}{ArrowLeft}{Enter}')
			expect(changes(emitted())).toMatchObject([{ type: 'move', start: at(8, 10), end: at(8, 11) }])
		})

		it('«Весь день»: только ←/→; Shift — длительность в днях', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ view: 'week' })
			screen.getByRole('button', { name: VACATION_NAME }).focus()
			await user.keyboard(' {ArrowUp}{ArrowDown}')
			expect(statusText()).toMatch(/^Событие «Отпуск» взято: 1 октября — 7 октября/)
			await user.keyboard('{ArrowRight}')
			expect(statusText()).toBe('2 октября — 8 октября')
			await user.keyboard('{Shift>}{ArrowLeft}{/Shift}{Enter}')
			expect(changes(emitted())).toMatchObject([{ type: 'move', start: at(2), end: at(8), allDay: true }])
		})

		it('canMove false — шаг не делается, BLOCKED', async () => {
			const user = userEvent.setup()
			const canMove = ({ start }: EventCalendarChange): boolean => ![0, 6].includes(start.getDay())
			const { emitted } = renderCalendar({ view: 'week', canMove })
			meeting().focus()
			await user.keyboard(' {ArrowRight}')
			expect(statusText()).toBe('Сюда событие «Встреча» положить нельзя')
			await user.keyboard('{Enter}')
			expect(changes(emitted())).toEqual([])
		})

		it('другие клавиши событие не берут: Enter — обычное нажатие; черновик среди событий с тем же началом', async () => {
			const user = userEvent.setup()
			const long: CalendarEvent = { id: 'long', title: 'Долгая', start: '2026-10-02T10:00', end: '2026-10-02T13:00' }
			const short: CalendarEvent = { id: 'short', title: 'Короткая', start: '2026-10-02T10:00', end: '2026-10-02T10:30' }
			const { emitted } = renderCalendar({ view: 'day', events: [MEETING, long, short] })
			meeting().focus()
			await user.keyboard('a{Enter}')
			expect(document.querySelector('.base-event-calendar__event--grabbed')).toBeNull()
			expect(emitted()['event-click']).toHaveLength(1)
			await user.keyboard(' ')
			const keys = Array.from(document.querySelectorAll<HTMLElement>('[data-event-key]')).map(element => element.dataset.eventKey)
			expect(keys).toEqual(['long', 'meeting', 'short'])
		})

		it('ввод IME не берёт событие; поповер «+N ещё» и список — без переноса', async () => {
			const user = userEvent.setup()
			renderCalendar({ view: 'list' })
			const item = screen.getByRole('button', { name: MEETING_NAME })
			await fireEvent.keyDown(item, { key: ' ', isComposing: true })
			item.focus()
			await user.keyboard(' ')
			expect(document.querySelector('.base-event-calendar__event--grabbed')).toBeNull()
			expect(item).not.toHaveAttribute('aria-describedby')
		})

		it('повтор: время повтора, oldStart — начало повтора; ключ с кавычкой — фокус возвращается', async () => {
			const user = userEvent.setup()
			const daily: CalendarEvent = {
				id: 'a"b',
				title: 'Планёрка',
				start: '2026-09-28T09:00',
				end: '2026-09-28T09:30',
				rrule: 'FREQ=DAILY',
			}
			const { emitted } = renderCalendar({ view: 'day', events: [daily] })
			const target = screen.getByRole('button', { name: 'Планёрка, 2 октября, 09:00–09:30' })
			target.focus()
			await user.keyboard(' {ArrowDown}')
			await waitFor(() => expect(document.activeElement).toHaveAttribute('data-event-key', target.dataset.eventKey))
			await user.keyboard('{Enter}')
			expect(changes(emitted())).toMatchObject([
				{ type: 'move', event: daily, start: at(2, 9, 30), oldStart: at(2, 9), oldEnd: at(2, 9, 30) },
			])
		})
	})
})
