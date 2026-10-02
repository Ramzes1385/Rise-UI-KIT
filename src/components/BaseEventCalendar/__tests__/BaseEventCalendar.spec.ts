import '@testing-library/jest-dom/vitest'
import { h } from 'vue'
import { setLocale } from '@/locales/state'
import { createUiKitPlugin } from '@/plugin'
import userEvent from '@testing-library/user-event'
import BaseEventCalendar from '../ui/BaseEventCalendar.vue'
import { render, screen, within } from '@testing-library/vue'
import type { CalendarEvent } from '@utils/calendar/eventUtils'
import type { BaseEventCalendarProps } from '../types/BaseEventCalendar.types'
const EVENTS: CalendarEvent[] = [
	{ id: 'vacation', title: 'Отпуск', start: '2026-10-01', end: '2026-10-08' },
	{ id: 'meeting', title: 'Встреча', start: '2026-10-02T10:00', end: '2026-10-02T11:00', category: 'work', color: 'red' },
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

const root = (container: Element): HTMLElement => container.querySelector('.base-event-calendar') as HTMLElement

describe('BaseEventCalendar unit', () => {
	afterEach(() => setLocale('ru'))

	describe('оформление', () => {
		it('добавляет модификатор варианта, кроме default, и класс вида', () => {
			const { container } = renderCalendar({ variant: 'soft' })
			expect(root(container)).toHaveClass('base-event-calendar--soft', 'base-event-calendar--month')
		})

		it('пишет --size-scale только при масштабе, отличном от 100', () => {
			const { container } = renderCalendar({ sizeScale: 125 })
			expect(root(container).style.getPropertyValue('--size-scale')).toBe('1.25')
		})

		it('customClass — к корню, панели и событиям', () => {
			const { container } = renderCalendar({ customClass: { root: 'my-root', toolbar: 'my-toolbar', event: 'my-event' } })
			expect(root(container)).toHaveClass('my-root')
			expect(container.querySelector('.base-event-calendar__toolbar')).toHaveClass('my-toolbar')
			expect(screen.getByRole('button', { name: 'Встреча, 2 октября, 10:00–11:00' })).toHaveClass('my-event')
		})

		it('цвет события — переменная --event-color, без цвета — без переменной', () => {
			renderCalendar()
			expect(screen.getByRole('button', { name: 'Встреча, 2 октября, 10:00–11:00' }).style.getPropertyValue('--event-color')).toBe(
				'red',
			)
			expect(
				screen.getAllByRole('button', { name: 'Отпуск, 1 октября — 7 октября' })[0].style.getPropertyValue('--event-color'),
			).toBe('')
		})

		it('регион с именем «Календарь событий»', () => {
			renderCalendar()
			expect(screen.getByRole('region', { name: 'Календарь событий' })).toBeInTheDocument()
		})

		it('значения по умолчанию из плагина (kitDefaults)', () => {
			renderCalendar({}, { global: { plugins: [createUiKitPlugin({ defaults: { BaseEventCalendar: { view: 'list' } } })] } })
			expect(screen.queryByRole('grid')).not.toBeInTheDocument()
			expect(screen.getByRole('list', { name: 'пятница, 2 октября 2026 г.' })).toBeInTheDocument()
		})
	})

	describe('панель', () => {
		it('заголовки периода всех видов', () => {
			const titles = (['month', 'week', 'day', 'list'] as const).map(view => {
				const { container, unmount } = renderCalendar({ view })
				const title = container.querySelector('.base-event-calendar__title')?.textContent
				unmount()
				return title?.replace(/\s/g, ' ')
			})
			expect(titles).toEqual(['Октябрь 2026 г.', '28 сент. – 4 окт. 2026 г.', 'Пятница, 2 октября 2026 г.', 'Октябрь 2026 г.'])
		})

		it('переключатель видов — все виды по умолчанию, один вид — без переключателя', () => {
			const { unmount } = renderCalendar()
			const group = screen.getByRole('radiogroup', { name: 'Вид календаря' })
			expect(within(group).getAllByRole('radio')).toHaveLength(4)
			expect(within(group).getByRole('radio', { name: 'Месяц' })).toBeChecked()
			expect(within(group).getByRole('radio', { name: 'Список' })).not.toBeChecked()
			unmount()
			renderCalendar({ views: ['week'], view: 'week' })
			expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
		})

		it('role="status" пуст при монтировании', () => {
			renderCalendar()
			expect(screen.getByRole('status')).toHaveTextContent('')
		})

		it('слот toolbar заменяет панель и получает заголовок, вид, дату, период и действия', () => {
			const toolbar = vi.fn(() => h('span', 'своя панель'))
			renderCalendar({ view: 'week' }, { slots: { toolbar } })
			expect(screen.getByText('своя панель')).toBeInTheDocument()
			expect(screen.queryByRole('button', { name: 'Сегодня' })).not.toBeInTheDocument()
			expect(toolbar).toHaveBeenCalledWith(
				expect.objectContaining({
					title: expect.stringMatching(/^28\sсент\.\s–\s4\sокт\.\s2026\sг\.$/),
					view: 'week',
					date: new Date(2026, 9, 2),
					period: { view: 'week', start: new Date(2026, 8, 28), end: new Date(2026, 9, 5) },
					today: expect.any(Function),
					prev: expect.any(Function),
					next: expect.any(Function),
					setView: expect.any(Function),
				}),
			)
		})
	})

	describe('месяц', () => {
		it('сетка: заголовки дней по языку, 6 недель, data-day, выбранная дата, сегодня', () => {
			const { container } = renderCalendar({ today: '2026-10-05' })
			const grid = screen.getByRole('grid', { name: 'Октябрь 2026 г.' })
			expect(
				within(grid)
					.getAllByRole('columnheader')
					.map(cell => cell.textContent),
			).toEqual(['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'])
			expect(within(grid).getAllByRole('row')).toHaveLength(7)
			const cells = within(grid).getAllByRole('gridcell')
			expect(cells).toHaveLength(42)
			expect(cells[0]).toHaveAttribute('data-day', '2026-09-28')
			expect(cells[0]).toHaveClass('base-event-calendar__day--outside')
			expect(cells.filter(cell => cell.tabIndex === 0)).toEqual([container.querySelector('[data-day="2026-10-02"]')])
			const selected = screen.getByRole('gridcell', { name: 'пятница, 2 октября 2026 г.' })
			expect(selected).toHaveAttribute('aria-selected', 'true')
			expect(selected).not.toHaveAttribute('aria-current')
			const today = container.querySelector('[data-day="2026-10-05"]')
			expect(today).toHaveAttribute('aria-current', 'date')
			expect(today).toHaveAttribute('aria-selected', 'false')
			expect(today).toHaveClass('base-event-calendar__day--today')
			expect(today).not.toHaveClass('base-event-calendar__day--outside')
		})

		it('firstDayOfWeek: 0 — неделя с воскресенья', () => {
			renderCalendar({ firstDayOfWeek: 0 })
			expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent('вс')
			expect(screen.getAllByRole('gridcell')[0]).toHaveAttribute('data-day', '2026-09-27')
		})

		it('язык en: неделя с воскресенья, английские подписи', () => {
			setLocale('en')
			renderCalendar()
			expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent('Sun')
			expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument()
			expect(screen.getByRole('grid', { name: 'October 2026' })).toBeInTheDocument()
			expect(screen.getByRole('button', { name: /^Встреча, October 2, / })).toBeInTheDocument()
		})

		it('полосы: многодневное режется по неделям, события со временем — время и название; «+3 ещё» в переполненном дне', () => {
			const { container } = renderCalendar()
			const vacation = screen.getAllByRole('button', { name: 'Отпуск, 1 октября — 7 октября' })
			expect(vacation).toHaveLength(2)
			expect(vacation[0]).toHaveClass('base-event-calendar__event--continuing')
			expect(vacation[0]).not.toHaveClass('base-event-calendar__event--continued')
			expect(vacation[0].style.getPropertyValue('--span')).toBe('4')
			expect(vacation[1]).toHaveClass('base-event-calendar__event--continued')
			expect(vacation[1]).not.toHaveClass('base-event-calendar__event--continuing')
			const meeting = screen.getByRole('button', { name: 'Встреча, 2 октября, 10:00–11:00' })
			expect(meeting).toHaveClass('base-event-calendar__event--timed')
			expect(meeting).toHaveTextContent('10:00Встреча')
			expect(meeting.style.getPropertyValue('--lane')).toBe('1')
			expect(screen.queryByRole('button', { name: /^Обед/ })).not.toBeInTheDocument()
			const more = screen.getByRole('button', { name: 'Все события дня: 2 октября' })
			expect(more).toHaveTextContent('+3 ещё')
			expect(container.querySelectorAll('.base-event-calendar__more-button')).toHaveLength(1)
			const week = container.querySelector('[data-day="2026-10-02"]')?.closest('[role="row"]') as HTMLElement
			expect(week.style.getPropertyValue('--lanes')).toBe('2')
			expect(week.style.getPropertyValue('--more')).toBe('1')
		})

		it('без переполнения — все ряды, без «+N»', () => {
			const { container } = renderCalendar({ maxEventsPerDay: 5 })
			expect(screen.getByRole('button', { name: 'B, 2 октября, 14:00–15:00' })).toBeInTheDocument()
			expect(container.querySelector('.base-event-calendar__more-button')).toBeNull()
			const week = container.querySelector('[data-day="2026-10-02"]')?.closest('[role="row"]') as HTMLElement
			expect(week.style.getPropertyValue('--lanes')).toBe('5')
			expect(week.style.getPropertyValue('--more')).toBe('0')
		})

		it('maxEventsPerDay: 0 — все события дня за «+N»', () => {
			renderCalendar({ maxEventsPerDay: 0 })
			expect(screen.queryByRole('button', { name: /^Встреча/ })).not.toBeInTheDocument()
			expect(screen.getByRole('button', { name: 'Все события дня: 2 октября' })).toHaveTextContent('+5 ещё')
		})

		it('tabindex 0 — только у событий и «+N» выбранного дня', () => {
			renderCalendar()
			const [thisWeek, nextWeek] = screen.getAllByRole('button', { name: 'Отпуск, 1 октября — 7 октября' })
			expect(thisWeek).toHaveAttribute('tabindex', '0')
			expect(nextWeek).toHaveAttribute('tabindex', '-1')
			expect(screen.getByRole('button', { name: /^Встреча/ })).toHaveAttribute('tabindex', '0')
			expect(screen.getByRole('button', { name: 'Все события дня: 2 октября' })).toHaveAttribute('tabindex', '0')
		})

		it('выбранный день без событий дня — события и «+N» соседних дней не в порядке Tab', () => {
			renderCalendar({ date: '2026-10-03' })
			expect(screen.getByRole('button', { name: /^Встреча/ })).toHaveAttribute('tabindex', '-1')
			expect(screen.getAllByRole('button', { name: /^Отпуск/ })[0]).toHaveAttribute('tabindex', '0')
			expect(screen.getByRole('button', { name: 'Все события дня: 2 октября' })).toHaveAttribute('tabindex', '-1')
		})

		it('«+N ещё» открывает поповер со всеми событиями дня', async () => {
			const user = userEvent.setup()
			renderCalendar()
			await user.click(screen.getByRole('button', { name: 'Все события дня: 2 октября' }))
			const dialog = await screen.findByRole('dialog')
			expect(within(dialog).getByText('пятница, 2 октября 2026 г.')).toBeInTheDocument()
			expect(
				within(dialog)
					.getAllByRole('button')
					.map(button => button.getAttribute('aria-label')),
			).toEqual([
				'Отпуск, 1 октября — 7 октября',
				'Встреча, 2 октября, 10:00–11:00',
				'Обед, 2 октября, 10:30–12:00',
				'A, 2 октября, 13:00–14:00',
				'B, 2 октября, 14:00–15:00',
			])
			expect(within(dialog).getByRole('button', { name: /^Обед/ })).toHaveTextContent('10:30Обед')
			expect(within(dialog).getByRole('button', { name: /^Отпуск/ })).toHaveTextContent(/^Отпуск$/)
		})
	})

	describe('неделя и день', () => {
		it('заголовки дней, строка «Весь день», колонки дней и сегодня', () => {
			const { container } = renderCalendar({ view: 'week' })
			const headers = [...container.querySelectorAll('.base-event-calendar__header-day')]
			expect(headers.map(header => header.textContent?.trim())).toEqual([
				'пн, 28 сент.',
				'вт, 29 сент.',
				'ср, 30 сент.',
				'чт, 1 окт.',
				'пт, 2 окт.',
				'сб, 3 окт.',
				'вс, 4 окт.',
			])
			expect(headers[4]).toHaveClass('base-event-calendar__header-day--today')
			const columns = screen.getAllByRole('group')
			expect(columns.map(column => column.getAttribute('aria-label'))).toEqual(headers.map(header => header.textContent?.trim()))
			expect(columns[4]).toHaveClass('base-event-calendar__column--today')
			expect(columns[0]).not.toHaveClass('base-event-calendar__column--work-hours')
			expect(container.querySelector('.base-event-calendar__all-day-label')).toHaveTextContent('Весь день')
			const vacation = within(container.querySelector('.base-event-calendar__all-day-events') as HTMLElement).getByRole('button')
			expect(vacation).toHaveAccessibleName('Отпуск, 1 октября — 7 октября')
			expect(vacation).toHaveTextContent(/^Отпуск$/)
			expect(vacation).toHaveClass('base-event-calendar__event--continuing')
			expect(vacation).not.toHaveClass('base-event-calendar__event--continued')
			expect(vacation.style.left).toBe('42.8571%')
			expect(vacation.style.width).toBe('57.1429%')
			expect(vacation.style.getPropertyValue('--lane')).toBe('0')
		})

		it('событие короче полутора шагов шкалы — компактное', () => {
			const events: CalendarEvent[] = [
				{ id: 's', title: 'Звонок', start: '2026-10-02T09:00', end: '2026-10-02T09:30' },
				{ id: 'e', title: 'Ровно', start: '2026-10-02T12:00', end: '2026-10-02T12:45' },
				{ id: 'l', title: 'Час', start: '2026-10-02T15:00', end: '2026-10-02T16:00' },
			]
			const compact = (slotDuration?: number): boolean[] => {
				const { unmount } = renderCalendar({ view: 'day', events, slotDuration })
				const result = within(screen.getByRole('group'))
					.getAllByRole('button')
					.map(button => button.classList.contains('base-event-calendar__event--compact'))
				unmount()
				return result
			}
			expect(compact()).toEqual([true, false, false])
			expect(compact(60)).toEqual([true, true, true])
			expect(compact(1)).toEqual([false, false, false])
			expect(compact(240)).toEqual([true, true, true])
		})

		it('события со временем: место по времени и колонки пересечений', () => {
			renderCalendar({ view: 'day' })
			const friday = screen.getByRole('group', { name: 'пт, 2 окт.' })
			const meeting = within(friday).getByRole('button', { name: 'Встреча, 2 октября, 10:00–11:00' })
			expect(meeting).toHaveTextContent('Встреча10:00–11:00')
			expect(meeting.style).toMatchObject({ top: '41.6667%', height: '4.1667%', left: '0%', width: '50%' })
			const lunch = within(friday).getByRole('button', { name: /^Обед/ })
			expect(lunch.style).toMatchObject({ left: '50%', width: '50%' })
			expect(within(friday).getByRole('button', { name: /^A,/ }).style.width).toBe('100%')
		})

		it('событие через полночь режется по дням', () => {
			renderCalendar({ view: 'week', events: [{ id: 'n', title: 'Ночь', start: '2026-10-02T22:00', end: '2026-10-03T02:00' }] })
			const name = 'Ночь, 2 октября, 22:00 — 3 октября, 02:00'
			const friday = within(screen.getByRole('group', { name: 'пт, 2 окт.' })).getByRole('button', { name })
			const saturday = within(screen.getByRole('group', { name: 'сб, 3 окт.' })).getByRole('button', { name })
			expect(friday.style).toMatchObject({ top: '91.6667%', height: '8.3333%' })
			expect(saturday.style).toMatchObject({ top: '0%', height: '8.3333%' })
		})

		it('без событий на весь день строка остаётся, рядов — один', () => {
			const { container } = renderCalendar({ view: 'day', events: [] })
			const grid = container.querySelector('.base-event-calendar__time-grid') as HTMLElement
			expect(grid.style.getPropertyValue('--days')).toBe('1')
			expect(grid.style.getPropertyValue('--all-day-lanes')).toBe('1')
			expect(container.querySelector('.base-event-calendar__all-day-events')?.children).toHaveLength(0)
		})

		it('шкала: шаг slotDuration, подписи только у целых часов, шаг ограничен 5–60', () => {
			const slots = (slotDuration: number): HTMLElement[] => {
				const { container, unmount } = renderCalendar({ view: 'day', slotDuration })
				const result = [...container.querySelectorAll<HTMLElement>('.base-event-calendar__axis-slot')]
				unmount()
				return result
			}
			const half = slots(30)
			expect(half).toHaveLength(48)
			expect(half[0]).toHaveTextContent('00:00')
			expect(half[1]).toHaveTextContent('')
			expect(half[20]).toHaveTextContent('10:00')
			expect(slots(1)).toHaveLength(288)
			expect(slots(240)).toHaveLength(24)
		})

		it('рабочие часы: полоса по умолчанию пн–пт, класс колонки, свои дни', () => {
			const { unmount } = renderCalendar({ view: 'week', workHours: { start: '09:00', end: '18:00' } })
			const columns = screen.getAllByRole('group')
			expect(columns.every(column => column.classList.contains('base-event-calendar__column--work-hours'))).toBe(true)
			const bands = columns.map(column => column.querySelector<HTMLElement>('.base-event-calendar__work'))
			expect(bands.map(Boolean)).toEqual([true, true, true, true, true, false, false])
			expect(bands[0]?.style).toMatchObject({ top: '37.5%', height: '37.5%' })
			unmount()
			renderCalendar({ view: 'week', workHours: { start: '10:00', end: '14:30', days: [6] } })
			expect(screen.getAllByRole('group').map(column => Boolean(column.querySelector('.base-event-calendar__work')))).toEqual([
				false,
				false,
				false,
				false,
				false,
				true,
				false,
			])
		})

		it.each([
			{ start: '18:00', end: '09:00' },
			{ start: '9', end: '18:00' },
			{ start: '09:00', end: 'вечер' },
		])('неверные рабочие часы ($start–$end) — без полосы', workHours => {
			renderCalendar({ view: 'day', workHours })
			expect(screen.getByRole('group')).toHaveClass('base-event-calendar__column--work-hours')
			expect(screen.getByRole('group').querySelector('.base-event-calendar__work')).toBeNull()
		})

		it('линия «Сейчас» — только в колонке сегодня; hasNowIndicator: false — без линии', () => {
			const { container, unmount } = renderCalendar({ view: 'week' })
			const lines = container.querySelectorAll<HTMLElement>('.base-event-calendar__now')
			expect(lines).toHaveLength(1)
			expect(lines[0].closest('[role="group"]')).toHaveAccessibleName('пт, 2 окт.')
			expect(lines[0]).toHaveTextContent('Сейчас')
			expect(lines[0].style.top).toBe('52.0833%')
			unmount()
			const other = renderCalendar({ view: 'week', hasNowIndicator: false })
			expect(other.container.querySelector('.base-event-calendar__now')).toBeNull()
			other.unmount()
			const nextWeek = renderCalendar({ view: 'week', date: '2026-10-12' })
			expect(nextWeek.container.querySelector('.base-event-calendar__now')).toBeNull()
		})
	})

	describe('список', () => {
		it('дни месяца с событиями; многодневное — в каждом дне; время или «Весь день»', () => {
			const { container } = renderCalendar({ view: 'list' })
			const lists = screen.getAllByRole('list')
			expect(lists).toHaveLength(7)
			expect(lists[0]).toHaveAccessibleName('четверг, 1 октября 2026 г.')
			const friday = screen.getByRole('list', { name: 'пятница, 2 октября 2026 г.' })
			expect(within(friday).getAllByRole('listitem')).toHaveLength(5)
			expect(within(friday).getByRole('button', { name: /^Отпуск/ })).toHaveTextContent('Весь деньОтпуск')
			expect(within(friday).getByRole('button', { name: /^Встреча/ })).toHaveTextContent('10:00–11:00Встреча')
			expect(container.querySelectorAll('.base-event-calendar__agenda-date')[1]).toHaveTextContent('пятница, 2 октября 2026 г.')
		})

		it('пусто — «Нет событий» или слот empty', () => {
			const { unmount } = renderCalendar({ view: 'list', events: [] })
			expect(screen.getByText('Нет событий')).toBeInTheDocument()
			expect(screen.queryByRole('list')).not.toBeInTheDocument()
			unmount()
			renderCalendar({ view: 'list', events: [], date: '2026-12-01' }, { slots: { empty: () => h('p', 'Свободный месяц') } })
			expect(screen.getByText('Свободный месяц')).toBeInTheDocument()
		})
	})

	describe('доступные имена событий', () => {
		it.each([
			[{ id: 1, title: 'Встреча', start: '2026-10-02T10:00', end: '2026-10-02T11:00' }, 'Встреча, 2 октября, 10:00–11:00'],
			[{ id: 2, title: 'Отпуск', start: '2026-10-02' }, 'Отпуск, 2 октября, весь день'],
			[{ id: 3, title: 'Отпуск', start: '2026-10-01', end: '2026-10-08' }, 'Отпуск, 1 октября — 7 октября'],
			[{ id: 4, title: 'Ночь', start: '2026-10-02T22:00', end: '2026-10-03T02:00' }, 'Ночь, 2 октября, 22:00 — 3 октября, 02:00'],
			[{ id: 5, title: 'До полуночи', start: '2026-10-02T22:00', end: '2026-10-03T00:00' }, 'До полуночи, 2 октября, 22:00–00:00'],
		])('%o → %s', (event, name) => {
			renderCalendar({ view: 'list', events: [event] })
			expect(screen.getAllByRole('button', { name })[0]).toBeInTheDocument()
		})

		it('en — те же шаблоны', () => {
			setLocale('en')
			renderCalendar({
				view: 'list',
				events: [
					{ id: 1, title: 'Meeting', start: '2026-10-02T10:00', end: '2026-10-02T11:00' },
					{ id: 2, title: 'Day off', start: '2026-10-03' },
					{ id: 3, title: 'Trip', start: '2026-10-05', end: '2026-10-07' },
				],
			})
			const names = screen.getAllByRole('button').map(button => button.getAttribute('aria-label') ?? '')
			expect(names.some(name => name.startsWith('Meeting, October 2, '))).toBe(true)
			expect(names).toContain('Day off, October 3, all day')
			expect(names).toContain('Trip, October 5 – October 6')
		})
	})

	describe('слоты', () => {
		const eventSlot = (name: string) => (props: { event: CalendarEvent; time: string; view: string }) =>
			h('span', { class: 'slot' }, `${name}:${props.view}:${props.event.title}:${props.time}`)

		it('приоритет слотов события: event-<id> → category-<категория> → event, во всех видах', () => {
			const slots = { event: eventSlot('event'), 'event-a': eventSlot('id'), 'category-work': eventSlot('category') }
			const texts = (view: BaseEventCalendarProps['view']): string[] => {
				const { container, unmount } = renderCalendar({ view, maxEventsPerDay: 9 }, { slots })
				const result = [...container.querySelectorAll('.slot')].map(element => element.textContent ?? '')
				unmount()
				return result
			}
			expect(texts('month')).toEqual(
				expect.arrayContaining(['event:month:Отпуск:', 'category:month:Встреча:10:00–11:00', 'id:month:A:13:00–14:00']),
			)
			expect(texts('week')).toEqual(
				expect.arrayContaining(['event:week:Отпуск:', 'category:week:Встреча:10:00–11:00', 'id:week:A:13:00–14:00']),
			)
			expect(texts('day')).toEqual(expect.arrayContaining(['event:day:Обед:10:30–12:00']))
			expect(texts('list')).toEqual(expect.arrayContaining(['id:list:A:13:00–14:00', 'event:list:B:14:00–15:00']))
		})

		it('категория без своего слота и событие без слотов — обычный вид', () => {
			renderCalendar({ view: 'list' }, { slots: { 'event-a': eventSlot('id') } })
			expect(screen.getByRole('button', { name: /^Встреча/ })).toHaveTextContent('10:00–11:00Встреча')
			expect(screen.getByRole('button', { name: /^A,/ })).toHaveTextContent('id:list:A:13:00–14:00')
		})

		it('слоты события в поповере «+N»', async () => {
			const user = userEvent.setup()
			renderCalendar({}, { slots: { event: eventSlot('event') } })
			await user.click(screen.getByRole('button', { name: 'Все события дня: 2 октября' }))
			const dialog = await screen.findByRole('dialog')
			expect(within(dialog).getByRole('button', { name: /^B,/ })).toHaveTextContent('event:month:B:14:00–15:00')
		})

		it('day-<ГГГГ-ММ-ДД> важнее day; данные слота дня', () => {
			const day = vi.fn((props: { date: Date }) => h('b', `d${props.date.getDate()}`))
			const exact = vi.fn(() => h('i', 'мой день'))
			const { container } = renderCalendar({ today: '2026-10-01' }, { slots: { day, 'day-2026-10-02': exact } })
			expect(container.querySelector('[data-day="2026-10-02"] .base-event-calendar__day-number')).toHaveTextContent('мой день')
			expect(container.querySelector('[data-day="2026-10-03"] .base-event-calendar__day-number')).toHaveTextContent('d3')
			expect(exact).toHaveBeenCalledWith(
				expect.objectContaining({
					date: new Date(2026, 9, 2),
					isToday: false,
					isOutside: false,
					events: expect.arrayContaining([expect.objectContaining({ key: 'meeting' })]),
				}),
			)
			expect(day).toHaveBeenCalledWith(expect.objectContaining({ date: new Date(2026, 9, 1), isToday: true }))
			expect(day).toHaveBeenCalledWith(expect.objectContaining({ date: new Date(2026, 8, 28), isOutside: true, events: [] }))
		})

		it('без слотов дня — число дня', () => {
			const { container } = renderCalendar()
			expect(container.querySelector('[data-day="2026-10-02"] .base-event-calendar__day-number')).toHaveTextContent(/^2$/)
		})

		it('time-slot, header-day и all-day', () => {
			const timeSlot = vi.fn((props: { label: string }) => h('em', `t${props.label}`))
			const headerDay = vi.fn((props: { label: string; isToday: boolean }) => h('em', `${props.isToday ? '*' : ''}${props.label}`))
			const { container } = renderCalendar(
				{ view: 'day', slotDuration: 60 },
				{ slots: { 'time-slot': timeSlot, 'header-day': headerDay, 'all-day': () => h('em', 'Целый день') } },
			)
			expect(container.querySelectorAll('.base-event-calendar__axis-slot')[9]).toHaveTextContent('t09:00')
			expect(timeSlot).toHaveBeenCalledWith(expect.objectContaining({ time: new Date(2000, 0, 1, 9), label: '09:00' }))
			expect(container.querySelector('.base-event-calendar__header-day')).toHaveTextContent('*пт, 2 окт.')
			expect(headerDay).toHaveBeenCalledWith(
				expect.objectContaining({ date: new Date(2026, 9, 2), label: 'пт, 2 окт.', isToday: true }),
			)
			expect(container.querySelector('.base-event-calendar__all-day-label')).toHaveTextContent('Целый день')
		})
	})

	describe('повторы', () => {
		it('rrule и exdates разворачиваются в показанном периоде', () => {
			const events: CalendarEvent[] = [
				{
					id: 'standup',
					title: 'Стендап',
					start: '2026-09-07T09:00',
					end: '2026-09-07T09:15',
					rrule: 'FREQ=WEEKLY;BYDAY=MO,WE',
					exdates: ['2026-10-07T09:00'],
				},
			]
			const { unmount } = renderCalendar({ events })
			const names = screen.getAllByRole('button', { name: /^Стендап/ }).map(button => button.getAttribute('aria-label'))
			expect(names).toContain('Стендап, 5 октября, 09:00–09:15')
			expect(names).toContain('Стендап, 30 сентября, 09:00–09:15')
			expect(names).not.toContain('Стендап, 7 октября, 09:00–09:15')
			expect(names).toHaveLength(11)
			unmount()
			renderCalendar({ events, view: 'week', date: '2026-10-05' })
			expect(screen.getAllByRole('button', { name: /^Стендап/ })).toHaveLength(1)
		})
	})
})
