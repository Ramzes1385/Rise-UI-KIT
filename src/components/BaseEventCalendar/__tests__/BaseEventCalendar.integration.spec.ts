import '@testing-library/jest-dom/vitest'
import { h, nextTick } from 'vue'
import userEvent from '@testing-library/user-event'
import BaseEventCalendar from '../ui/BaseEventCalendar.vue'
import { render, screen, within } from '@testing-library/vue'
import type { CalendarEvent } from '@utils/calendar/eventUtils'
import type { BaseEventCalendarProps, EventCalendarToolbarSlotProps } from '../types/BaseEventCalendar.types'

const EVENTS: CalendarEvent[] = [
	{ id: 'vacation', title: 'Отпуск', start: '2026-10-01', end: '2026-10-08' },
	{ id: 'meeting', title: 'Встреча', start: '2026-10-02T10:00', end: '2026-10-02T11:00' },
	{ id: 'lunch', title: 'Обед', start: '2026-10-02T10:30', end: '2026-10-02T12:00' },
	{ id: 'a', title: 'A', start: '2026-10-02T13:00' },
	{ id: 'b', title: 'B', start: '2026-10-02T14:00' },
]

function renderCalendar(props: Partial<BaseEventCalendarProps> = {}, options: Record<string, unknown> = {}) {
	return render(BaseEventCalendar, {
		props: { date: '2026-10-02', today: '2026-10-02T12:30', events: EVENTS, ...props },
		...options,
	})
}

const cell = (key: string): HTMLElement => document.querySelector(`[data-day="${key}"]`) as HTMLElement
const lastDate = (emitted: Record<string, unknown[][]>): Date | undefined => emitted['update:date']?.at(-1)?.[0] as Date | undefined
const periods = (emitted: Record<string, unknown[][]>): string[] => [
	...new Set(
		(emitted['period-change'] ?? []).map(([period]) => {
			const { view, start } = period as { view: string; start: Date }
			return `${view} ${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
		}),
	),
]
const title = (): string => (document.querySelector('.base-event-calendar__title')?.textContent ?? '').replace(/\s/g, ' ')

describe('BaseEventCalendar integration', () => {
	it('«Сегодня» — первая остановка Tab', async () => {
		const user = userEvent.setup()
		renderCalendar()
		await user.tab()
		expect(screen.getByRole('button', { name: 'Сегодня' })).toHaveFocus()
	})

	describe('навигация панели', () => {
		it('месяц: ← → по месяцам, 31 января → 28 февраля; «Сегодня» — к today; статус озвучивает смену', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ date: '2026-01-31', today: '2026-10-02T09:00' })
			await user.click(screen.getByRole('button', { name: 'Следующий период' }))
			expect(lastDate(emitted())).toEqual(new Date(2026, 1, 28))
			expect(title()).toBe('Февраль 2026 г.')
			expect(screen.getByRole('status').textContent?.replace(/\s/g, ' ')).toBe('Февраль 2026 г., вид «Месяц»')
			await user.click(screen.getByRole('button', { name: 'Предыдущий период' }))
			await user.click(screen.getByRole('button', { name: 'Предыдущий период' }))
			expect(lastDate(emitted())).toEqual(new Date(2025, 11, 28))
			await user.click(screen.getByRole('button', { name: 'Сегодня' }))
			expect(lastDate(emitted())).toEqual(new Date(2026, 9, 2))
			expect(title()).toBe('Октябрь 2026 г.')
		})

		it('неделя — на 7 дней, день — на день', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ view: 'week' })
			await user.click(screen.getByRole('button', { name: 'Следующий период' }))
			expect(lastDate(emitted())).toEqual(new Date(2026, 9, 9))
			expect(title()).toBe('5–11 окт. 2026 г.')
			await user.click(screen.getByRole('radio', { name: 'День' }))
			await user.click(screen.getByRole('button', { name: 'Предыдущий период' }))
			expect(lastDate(emitted())).toEqual(new Date(2026, 9, 8))
			expect(title()).toBe('Четверг, 8 октября 2026 г.')
		})

		it('смена вида переключателем: update:view, period-change, статус', async () => {
			const user = userEvent.setup()
			const { emitted, rerender } = renderCalendar({ views: ['month', 'list'] })
			expect(emitted()['period-change']).toEqual([[{ view: 'month', start: new Date(2026, 8, 28), end: new Date(2026, 10, 9) }]])
			await user.click(screen.getByRole('radio', { name: 'Список' }))
			expect(emitted()['update:view']).toEqual([['list']])
			expect(emitted()['period-change'][1]).toEqual([{ view: 'list', start: new Date(2026, 9, 1), end: new Date(2026, 10, 1) }])
			expect(screen.getByRole('status').textContent?.replace(/\s/g, ' ')).toBe('Октябрь 2026 г., вид «Список»')
			await rerender({ view: 'list' })
			await user.click(screen.getByRole('radio', { name: 'Месяц' }))
			expect(emitted()['update:view']).toEqual([['list'], ['month']])
			expect(screen.getByRole('grid')).toBeInTheDocument()
		})

		it('действия слота toolbar: setView того же вида — без события, другого — update:view; next', async () => {
			let toolbar: EventCalendarToolbarSlotProps | undefined
			const { emitted } = renderCalendar(
				{},
				{
					slots: {
						toolbar: (props: EventCalendarToolbarSlotProps) => {
							toolbar = props
							return h('span', props.title)
						},
					},
				},
			)
			toolbar?.setView('month')
			await nextTick()
			expect(emitted()['update:view']).toBeUndefined()
			toolbar?.setView('day')
			await nextTick()
			expect(emitted()['update:view']).toEqual([['day']])
			toolbar?.next()
			await nextTick()
			expect(lastDate(emitted())).toEqual(new Date(2026, 9, 3))
			toolbar?.today()
			await nextTick()
			expect(lastDate(emitted())).toEqual(new Date(2026, 9, 2))
		})
		it('одно событие period-change при смене дня внутри периода (клавиша, щелчок, «Сегодня»)', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ date: '2026-10-20' })
			cell('2026-10-20').focus()
			await user.keyboard('{ArrowRight}')
			expect(lastDate(emitted())).toEqual(new Date(2026, 9, 21))
			await user.click(cell('2026-10-05'))
			await user.click(screen.getByRole('button', { name: 'Сегодня' }))
			expect(lastDate(emitted())).toEqual(new Date(2026, 9, 2))
			expect(emitted()['update:date']).toHaveLength(3)
			expect(emitted()['period-change']).toHaveLength(1)
		})

		it('v-model: смена пропсов date и view перерисовывает период без update-событий', async () => {
			const { rerender, emitted } = renderCalendar()
			await rerender({ date: new Date(2026, 11, 15, 18) })
			expect(title()).toBe('Декабрь 2026 г.')
			expect(cell('2026-12-15')).toHaveAttribute('tabindex', '0')
			await rerender({ view: 'day' })
			expect(title()).toBe('Вторник, 15 декабря 2026 г.')
			expect(emitted()['period-change'].at(-1)).toEqual([{ view: 'day', start: new Date(2026, 11, 15), end: new Date(2026, 11, 16) }])
			expect(emitted()['update:view']).toBeUndefined()
			expect(emitted()['update:date']).toBeUndefined()
		})
	})

	describe('клавиатура сетки месяца (APG Grid)', () => {
		it.each([
			['{ArrowLeft}', '2026-10-01'],
			['{ArrowRight}', '2026-10-03'],
			['{ArrowUp}', '2026-09-25'],
			['{ArrowDown}', '2026-10-09'],
			['{Home}', '2026-09-28'],
			['{End}', '2026-10-04'],
			['{PageUp}', '2026-09-02'],
			['{PageDown}', '2026-11-02'],
			['{Shift>}{PageUp}{/Shift}', '2025-10-02'],
			['{Shift>}{PageDown}{/Shift}', '2027-10-02'],
		])('%s со 2 октября → %s, фокус на новой ячейке', async (keys, key) => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar()
			cell('2026-10-02').focus()
			await user.keyboard(keys)
			const [year, month, day] = key.split('-').map(Number)
			expect(lastDate(emitted())).toEqual(new Date(year, month - 1, day))
			await nextTick()
			expect(cell(key)).toHaveFocus()
			expect(cell(key)).toHaveAttribute('tabindex', '0')
			expect(cell(key)).toHaveAttribute('aria-selected', 'true')
		})

		it('PageDown с 31-го — последний день короткого месяца', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ date: '2026-10-31' })
			cell('2026-10-31').focus()
			await user.keyboard('{PageDown}')
			expect(lastDate(emitted())).toEqual(new Date(2026, 10, 30))
		})

		it('Home и End учитывают firstDayOfWeek: 0', async () => {
			const user = userEvent.setup()
			renderCalendar({ firstDayOfWeek: 0 })
			cell('2026-10-02').focus()
			await user.keyboard('{Home}')
			await nextTick()
			expect(cell('2026-09-27')).toHaveFocus()
			await user.keyboard('{End}')
			await nextTick()
			expect(cell('2026-10-03')).toHaveFocus()
		})

		it('переход в другой месяц перестраивает сетку и переводит фокус', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ date: '2026-10-30' })
			cell('2026-10-30').focus()
			await user.keyboard('{ArrowDown}')
			await nextTick()
			await user.keyboard('{ArrowDown}')
			await nextTick()
			expect(title()).toBe('Ноябрь 2026 г.')
			expect(cell('2026-11-13')).toHaveFocus()
			expect(periods(emitted())).toEqual(['month 2026-09-28', 'month 2026-10-26'])
			expect(emitted()['period-change']).toHaveLength(2)
		})

		it('другие клавиши и клавиши на событии сетку не двигают', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar()
			cell('2026-10-02').focus()
			await user.keyboard('a')
			screen.getByRole('button', { name: /^Встреча/ }).focus()
			await user.keyboard('{ArrowRight}')
			expect(emitted()['update:date']).toBeUndefined()
		})

		it('щелчок по ячейке другого дня выбирает его; по выбранной — без события', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar()
			await user.click(cell('2026-10-02'))
			expect(emitted()['update:date']).toBeUndefined()
			await user.click(cell('2026-10-14'))
			expect(lastDate(emitted())).toEqual(new Date(2026, 9, 14))
			expect(cell('2026-10-14')).toHaveAttribute('aria-selected', 'true')
		})
	})

	describe('event-click', () => {
		it('мышью, Enter и Space — исходное событие, начало, конец, allDay', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar()
			const meeting = screen.getByRole('button', { name: /^Встреча/ })
			await user.click(meeting)
			meeting.focus()
			await user.keyboard('{Enter}')
			await user.keyboard(' ')
			expect(emitted()['event-click']).toEqual(
				Array.from({ length: 3 }, () => [
					{ event: EVENTS[1], start: new Date(2026, 9, 2, 10), end: new Date(2026, 9, 2, 11), allDay: false },
				]),
			)
			await user.click(screen.getAllByRole('button', { name: /^Отпуск/ })[1])
			expect(emitted()['event-click'][3]).toEqual([
				{ event: EVENTS[0], start: new Date(2026, 9, 1), end: new Date(2026, 9, 8), allDay: true },
			])
		})

		it('в поповере «+N», строке «Весь день», сетке времени и списке', async () => {
			const user = userEvent.setup()
			const first = renderCalendar()
			await user.click(screen.getByRole('button', { name: 'Все события дня: 2 октября' }))
			await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: /^B,/ }))
			expect(first.emitted()['event-click']).toEqual([[expect.objectContaining({ event: EVENTS[4] })]])
			first.unmount()

			const week = renderCalendar({ view: 'week' })
			const allDay = week.container.querySelector('.base-event-calendar__all-day-events') as HTMLElement
			await user.click(within(allDay).getByRole('button'))
			await user.click(screen.getByRole('button', { name: /^Обед/ }))
			expect(week.emitted()['event-click']).toEqual([
				[expect.objectContaining({ event: EVENTS[0], allDay: true })],
				[expect.objectContaining({ event: EVENTS[2], start: new Date(2026, 9, 2, 10, 30) })],
			])
			week.unmount()

			const list = renderCalendar({ view: 'list' })
			await user.click(within(screen.getByRole('list', { name: 'пятница, 2 октября 2026 г.' })).getByRole('button', { name: /^A,/ }))
			expect(list.emitted()['event-click']).toEqual([[expect.objectContaining({ event: EVENTS[3] })]])
		})

		it('у повтора — время этого повтора', async () => {
			const user = userEvent.setup()
			const event: CalendarEvent = { id: 'r', title: 'Йога', start: '2026-09-01T19:00', rrule: 'FREQ=WEEKLY' }
			const { emitted } = renderCalendar({ events: [event], view: 'list' })
			await user.click(screen.getByRole('button', { name: 'Йога, 6 октября, 19:00–20:00' }))
			expect(emitted()['event-click']).toEqual([
				[{ event, start: new Date(2026, 9, 6, 19), end: new Date(2026, 9, 6, 20), allDay: false }],
			])
		})
	})

	describe('поповер «+N»', () => {
		it('открывается и закрывается повторным нажатием и Escape', async () => {
			const user = userEvent.setup()
			renderCalendar()
			const more = screen.getByRole('button', { name: 'Все события дня: 2 октября' })
			await user.click(more)
			expect(await screen.findByRole('dialog')).toBeInTheDocument()
			await user.click(more)
			await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
			await user.click(more)
			expect(await screen.findByRole('dialog')).toBeInTheDocument()
			await user.keyboard('{Escape}')
			await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		})
	})

	describe('часы и прокрутка', () => {
		afterEach(() => {
			vi.useRealTimers()
			vi.restoreAllMocks()
		})

		it('без today и date — часы браузера: линия «Сейчас» сдвигается раз в минуту, таймер снимается при размонтировании', async () => {
			vi.useFakeTimers({ now: new Date(2026, 9, 2, 12, 0), toFake: ['Date', 'setInterval', 'clearInterval'] })
			const clear = vi.spyOn(globalThis, 'clearInterval')
			const { container, unmount } = render(BaseEventCalendar, { props: { view: 'day' } })
			expect(title()).toBe('Пятница, 2 октября 2026 г.')
			const line = (): HTMLElement => container.querySelector('.base-event-calendar__now') as HTMLElement
			expect(line().style.top).toBe('50%')
			vi.advanceTimersByTime(30 * 60_000)
			await nextTick()
			expect(line().style.top).toBe('52.0833%')
			unmount()
			expect(clear).toHaveBeenCalled()
		})

		it('неверные date и today — по часам браузера', () => {
			vi.useFakeTimers({ now: new Date(2026, 9, 2, 12, 0), toFake: ['Date', 'setInterval', 'clearInterval'] })
			renderCalendar({ date: 'не дата', today: 'тоже не дата' })
			expect(title()).toBe('Октябрь 2026 г.')
			expect(cell('2026-10-02')).toHaveAttribute('aria-current', 'date')
			expect(cell('2026-10-02')).toHaveAttribute('tabindex', '0')
		})

		it('today со временем — линия неподвижна', async () => {
			vi.useFakeTimers({ now: new Date(2026, 9, 2, 9, 0), toFake: ['Date', 'setInterval', 'clearInterval'] })
			const { container } = renderCalendar({ view: 'day' })
			vi.advanceTimersByTime(5 * 60_000)
			await nextTick()
			expect((container.querySelector('.base-event-calendar__now') as HTMLElement).style.top).toBe('52.0833%')
		})

		it('шкала прокручивается к началу рабочих часов или к 08:00 — при монтировании и смене вида', async () => {
			vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockReturnValue(1440)
			const scrollTop = vi.spyOn(Element.prototype, 'scrollTop', 'set')
			const user = userEvent.setup()
			const first = renderCalendar({ view: 'week', workHours: { start: '09:30', end: '18:00' } })
			await vi.waitFor(() => expect(scrollTop).toHaveBeenLastCalledWith(570))
			await user.click(screen.getByRole('radio', { name: 'Месяц' }))
			scrollTop.mockClear()
			await user.click(screen.getByRole('radio', { name: 'День' }))
			await vi.waitFor(() => expect(scrollTop).toHaveBeenLastCalledWith(570))
			scrollTop.mockClear()
			await user.click(screen.getByRole('radio', { name: 'Список' }))
			await nextTick()
			await nextTick()
			expect(scrollTop).not.toHaveBeenCalled()
			first.unmount()
			renderCalendar({ view: 'day' })
			await vi.waitFor(() => expect(scrollTop).toHaveBeenLastCalledWith(480))
			scrollTop.mockClear()
			renderCalendar({ view: 'day', workHours: { start: 'утро', end: '18:00' } })
			await vi.waitFor(() => expect(scrollTop).toHaveBeenLastCalledWith(480))
		})
	})
})
