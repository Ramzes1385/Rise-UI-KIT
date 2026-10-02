import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import BaseEventCalendar from '../ui/BaseEventCalendar.vue'
import type { CalendarEvent } from '@utils/calendar/eventUtils'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import type { BaseEventCalendarProps, EventCalendarChange } from '../types/BaseEventCalendar.types'

const VACATION: CalendarEvent = { id: 'vacation', title: 'Отпуск', start: '2026-10-01', end: '2026-10-08' }
const MEETING: CalendarEvent = { id: 'meeting', title: 'Встреча', start: '2026-10-02T10:00', end: '2026-10-02T11:00' }

const CANCELLED = 'Перенос отменён, событие «Встреча» на прежнем месте'

function renderCalendar(props: Partial<BaseEventCalendarProps> = {}) {
	return render(BaseEventCalendar, {
		props: { date: '2026-10-02', today: '2026-10-02T12:30', events: [VACATION, MEETING], isEditable: true, ...props },
	})
}

const at = (day: number, hours = 0, minutes = 0): Date => new Date(2026, 9, day, hours, minutes)
const statusText = (): string => (screen.getByRole('status').textContent ?? '').replace(/\s/g, ' ')
const eventByKey = (key: string): HTMLElement => document.querySelector(`[data-event-key="${key}"]`) as HTMLElement
const grabbed = (): Element | null => document.querySelector('.base-event-calendar__event--grabbed')
const changes = (emitted: Record<string, unknown[][]>): EventCalendarChange[] =>
	(emitted['event-change'] ?? []).map(([change]) => change as EventCalendarChange)
const isWorkday = ({ start }: EventCalendarChange): boolean => ![0, 6].includes(start.getDay())
const pause = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 10))

describe('BaseEventCalendar — клавиатурный перенос: фокус и запрещённые дни', () => {
	describe('уход фокуса', () => {
		it('фокус ушёл мышью мимо событий — взятое событие отпускается, клик по нему снова открывает событие', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ view: 'week' })
			eventByKey('meeting').focus()
			await user.keyboard(' {ArrowDown}')
			expect(grabbed()).not.toBeNull()
			await user.click(screen.getByRole('status'))
			await waitFor(() => expect(grabbed()).toBeNull())
			expect(statusText()).toBe(CANCELLED)
			expect(changes(emitted())).toEqual([])
			await user.click(eventByKey('meeting'))
			expect(emitted()['event-click']).toHaveLength(1)
		})

		it('фокус ушёл на другое событие — взятое отпускается, стрелки на другом событии его не двигают', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ view: 'week' })
			eventByKey('meeting').focus()
			await user.keyboard(' ')
			eventByKey('vacation').focus()
			await waitFor(() => expect(grabbed()).toBeNull())
			await user.keyboard('{ArrowRight}{ArrowRight}{Enter}')
			expect(changes(emitted())).toEqual([])
			expect(eventByKey('meeting')).toHaveAttribute('data-event-key', 'meeting')
		})

		it('клавиша на другом событии без ухода фокуса — взятое отпускается без возврата фокуса; Space берёт новое', async () => {
			const { emitted } = renderCalendar({ view: 'week' })
			eventByKey('meeting').focus()
			await fireEvent.keyDown(eventByKey('meeting'), { key: ' ' })
			expect(eventByKey('meeting')).toHaveClass('base-event-calendar__event--grabbed')
			await fireEvent.keyDown(eventByKey('vacation'), { key: 'ArrowRight' })
			expect(grabbed()).toBeNull()
			expect(statusText()).toBe(CANCELLED)
			await fireEvent.keyDown(eventByKey('vacation'), { key: ' ' })
			expect(eventByKey('vacation')).toHaveClass('base-event-calendar__event--grabbed')
			expect(statusText()).toMatch(/^Событие «Отпуск» взято/)
			expect(changes(emitted())).toEqual([])
		})

		it('шаг в другой день месяца пересоздаёт событие, но фокус на нём — событие остаётся взятым', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar()
			eventByKey('meeting').focus()
			await user.keyboard(' {ArrowRight}')
			await waitFor(() => expect(eventByKey('meeting')).toHaveFocus())
			await pause()
			expect(eventByKey('meeting')).toHaveClass('base-event-calendar__event--grabbed')
			await user.keyboard('{Enter}')
			expect(changes(emitted())).toMatchObject([{ type: 'move', start: at(3, 10), end: at(3, 11) }])
		})

		it('фокус вернулся раньше проверки — событие остаётся взятым; после Enter и без взятого уход фокуса ничего не меняет', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ view: 'week' })
			eventByKey('meeting').focus()
			await user.keyboard(' {ArrowDown}')
			eventByKey('vacation').focus()
			eventByKey('meeting').focus()
			await pause()
			expect(eventByKey('meeting')).toHaveClass('base-event-calendar__event--grabbed')
			eventByKey('vacation').focus()
			eventByKey('meeting').focus()
			await user.keyboard('{Enter}')
			const dropped = 'Событие «Встреча» перенесено: 2 октября, 10:30–11:30'
			expect(statusText()).toBe(dropped)
			await pause()
			eventByKey('vacation').focus()
			await pause()
			expect(statusText()).toBe(dropped)
			expect(changes(emitted())).toMatchObject([{ type: 'move', start: at(2, 10, 30), end: at(2, 11, 30) }])
		})
	})

	describe('canMove: запрещённые дни перешагиваются', () => {
		it('месяц: пятница → понедельник при запрете выходных, обратно — снова пятница', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ canMove: isWorkday })
			eventByKey('meeting').focus()
			await user.keyboard(' {ArrowRight}')
			expect(statusText()).toBe('5 октября, 10:00–11:00')
			await waitFor(() => expect(eventByKey('meeting')).toHaveFocus())
			await user.keyboard('{ArrowLeft}')
			expect(statusText()).toBe('2 октября, 10:00–11:00')
			await waitFor(() => expect(eventByKey('meeting')).toHaveFocus())
			await user.keyboard('{ArrowRight}{Enter}')
			expect(changes(emitted())).toMatchObject([{ type: 'move', start: at(5, 10), end: at(5, 11) }])
		})

		it('неделя: разрешённого дня до конца показанного периода нет — шаг не делается, BLOCKED', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ view: 'week', canMove: isWorkday })
			eventByKey('meeting').focus()
			await user.keyboard(' {ArrowRight}')
			expect(statusText()).toBe('Сюда событие «Встреча» положить нельзя')
			await user.keyboard('{Enter}')
			expect(changes(emitted())).toEqual([])
		})

		it('неделя: ↓ перешагивает запрещённое время', async () => {
			const user = userEvent.setup()
			const canMove = ({ start }: EventCalendarChange): boolean => start.getHours() !== 10 || start.getMinutes() === 0
			const { emitted } = renderCalendar({ view: 'week', canMove })
			eventByKey('meeting').focus()
			await user.keyboard(' {ArrowDown}')
			expect(statusText()).toBe('2 октября, 11:00–12:00')
			await user.keyboard('{Enter}')
			expect(changes(emitted())).toMatchObject([{ type: 'move', start: at(2, 11), end: at(2, 12) }])
		})

		it('всё запрещено на сотни шагов вперёд — шаг не делается, BLOCKED', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ view: 'week', slotDuration: 5, canMove: () => false })
			eventByKey('meeting').focus()
			await user.keyboard(' {ArrowDown}')
			expect(statusText()).toBe('Сюда событие «Встреча» положить нельзя')
			await user.keyboard('{Enter}')
			expect(changes(emitted())).toEqual([])
		})
	})
})
