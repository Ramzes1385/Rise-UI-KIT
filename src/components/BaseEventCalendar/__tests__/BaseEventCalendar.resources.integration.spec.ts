import '@testing-library/jest-dom/vitest'
import { h, nextTick } from 'vue'
import userEvent from '@testing-library/user-event'
import BaseEventCalendar from '../ui/BaseEventCalendar.vue'
import type { CalendarEvent } from '@utils/calendar/eventUtils'
import { fireEvent, render, screen, within } from '@testing-library/vue'
import type {
	BaseEventCalendarProps,
	EventCalendarChange,
	EventCalendarResource,
	EventCalendarSelection,
} from '../types/BaseEventCalendar.types'

const RESOURCES: EventCalendarResource[] = [
	{ id: 'a', title: 'Комната A', color: 'rgb(1, 2, 3)' },
	{ id: 'b', title: 'Комната B' },
	{ id: 3, title: 'Комната C', color: 'rgb(7, 8, 9)' },
]

const MEETING: CalendarEvent = { id: 'meeting', title: 'Встреча', start: '2026-10-02T10:00', end: '2026-10-02T11:00', resourceId: 'a' }
const CALL: CalendarEvent = {
	id: 'call',
	title: 'Звонок',
	start: '2026-10-01T09:00',
	end: '2026-10-01T09:30',
	resourceId: 'b',
	color: 'rgb(4, 5, 6)',
}
const REVIEW: CalendarEvent = { id: 'review', title: 'Ревью', start: '2026-09-30T14:00', end: '2026-09-30T15:00', resourceId: '3' }
const ORPHAN: CalendarEvent = { id: 'orphan', title: 'Без ресурса', start: '2026-10-02T12:00', end: '2026-10-02T13:00' }
const STRANGER: CalendarEvent = {
	id: 'stranger',
	title: 'Чужая комната',
	start: '2026-10-02T15:00',
	end: '2026-10-02T16:00',
	resourceId: 'z',
}
const HOLIDAY: CalendarEvent = { id: 'holiday', title: 'Выезд', start: '2026-09-28', end: '2026-09-30', resourceId: 'b' }
const EVENTS = [MEETING, CALL, REVIEW, ORPHAN, STRANGER, HOLIDAY]

const CELL = 100

function renderCalendar(props: Partial<BaseEventCalendarProps> = {}, slots: Record<string, unknown> = {}) {
	return render(BaseEventCalendar, {
		props: { date: '2026-10-02', today: '2026-10-02T12:30', view: 'week', events: EVENTS, resources: RESOURCES, ...props },
		slots,
	})
}

function rect(left: number, top: number, height: number): DOMRect {
	return {
		left,
		top,
		width: CELL,
		height,
		right: left + CELL,
		bottom: top + height,
		x: left,
		y: top,
		toJSON: () => ({}),
	} as DOMRect
}

function layout(): void {
	columns().forEach((element, index) => {
		element.getBoundingClientRect = () => rect(index * CELL, 0, 1440)
	})
}

const at = (day: number, hours = 0, minutes = 0): Date => new Date(2026, day > 20 ? 8 : 9, day, hours, minutes)
const columns = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('.base-event-calendar__column')]
const column = (key: string): HTMLElement => document.querySelector(`[data-column="${key}"]`) as HTMLElement
const statusText = (): string => (screen.getByRole('status').textContent ?? '').replace(/\s/g, ' ')
const eventByKey = (key: string): HTMLElement | null => document.querySelector(`[data-event-key="${key}"]`)
const changes = (emitted: Record<string, unknown[][]>): EventCalendarChange[] =>
	(emitted['event-change'] ?? []).map(([change]) => change as EventCalendarChange)
const selections = (emitted: Record<string, unknown[][]>, name: 'select' | 'create'): EventCalendarSelection[] =>
	(emitted[name] ?? []).map(([range]) => range as EventCalendarSelection)

function press(target: Element, [x, y]: [number, number]): void {
	fireEvent.pointerDown(target, { button: 0, clientX: x, clientY: y, pointerType: 'mouse' })
}
const moveTo = (x: number, y: number): Promise<void> => fireEvent.pointerMove(window, { clientX: x, clientY: y })
const release = (x: number, y: number): Promise<void> => fireEvent.pointerUp(window, { clientX: x, clientY: y })

describe('BaseEventCalendar — ресурсы', () => {
	describe('колонки', () => {
		it('неделя: ресурсы над днями — 7×N колонок с data-column, data-resource и data-day', () => {
			renderCalendar()
			const all = columns()
			expect(all).toHaveLength(21)
			expect(all[0]).toHaveAttribute('data-column', 'a|2026-09-28')
			expect(all[0]).toHaveAttribute('data-resource', 'a')
			expect(all[0]).toHaveAttribute('data-day', '2026-09-28')
			expect(all[7]).toHaveAttribute('data-column', 'b|2026-09-28')
			expect(all[20]).toHaveAttribute('data-column', '3|2026-10-04')
			expect(all[20]).toHaveAttribute('data-resource', '3')
			expect(document.querySelectorAll('.base-event-calendar__header-day')).toHaveLength(21)
		})

		it('строка ресурсов: название над колонками ресурса, первая колонка ресурса отмечена', () => {
			renderCalendar()
			const headers = [...document.querySelectorAll<HTMLElement>('.base-event-calendar__resource')]
			expect(headers.map(header => header.textContent?.trim())).toEqual(['Комната A', 'Комната B', 'Комната C'])
			expect(headers[0].style.getPropertyValue('--span')).toBe('7')
			const starts = [...document.querySelectorAll('.base-event-calendar__column--resource-start')]
			expect(starts.map(element => element.getAttribute('data-column'))).toEqual(['a|2026-09-28', 'b|2026-09-28', '3|2026-09-28'])
			expect(document.querySelectorAll('.base-event-calendar__header-day--resource-start')).toHaveLength(3)
		})

		it('день: по колонке на ресурс', () => {
			renderCalendar({ view: 'day' })
			expect(columns().map(element => element.getAttribute('data-column'))).toEqual(['a|2026-10-02', 'b|2026-10-02', '3|2026-10-02'])
			expect(document.querySelectorAll('.base-event-calendar__resource')).toHaveLength(3)
			expect(document.querySelectorAll('.base-event-calendar__resource')[0]).toHaveStyle({ '--span': '1' })
		})

		it('без ресурсов: колонка на день, data-column = день, без data-resource и строки ресурсов', () => {
			renderCalendar({ resources: undefined })
			const all = columns()
			expect(all).toHaveLength(7)
			expect(all[0]).toHaveAttribute('data-column', '2026-09-28')
			expect(all[0]).not.toHaveAttribute('data-resource')
			expect(all[0]).toHaveAccessibleName(all[0].getAttribute('aria-label') ?? '')
			expect(all[0].getAttribute('aria-label')).not.toContain('Комната')
			expect(document.querySelector('.base-event-calendar__resource-head')).toBeNull()
			expect(document.querySelector('.base-event-calendar__column--resource-start')).toBeNull()
			expect(screen.getByText('Без ресурса')).toBeInTheDocument()
		})

		it('месяц и список: ресурсы не влияют — видны все события, имена без ресурса', () => {
			const { unmount } = renderCalendar({ view: 'month' })
			expect(document.querySelector('.base-event-calendar__resource')).toBeNull()
			for (const title of ['Встреча', 'Без ресурса', 'Чужая комната']) expect(screen.getAllByText(title).length).toBeGreaterThan(0)
			expect(screen.getAllByRole('button', { name: /^Встреча, / })[0].getAttribute('aria-label') ?? '').not.toMatch(/Комната/)
			unmount()
			renderCalendar({ view: 'list' })
			expect(document.querySelector('.base-event-calendar__resource')).toBeNull()
			expect(screen.getByText('Без ресурса')).toBeInTheDocument()
		})
	})

	describe('события в колонках', () => {
		it('событие — в колонке своего ресурса; id ресурса сравнивается строкой', () => {
			renderCalendar()
			expect(eventByKey('meeting')?.closest('[data-column]')).toHaveAttribute('data-column', 'a|2026-10-02')
			expect(eventByKey('call')?.closest('[data-column]')).toHaveAttribute('data-column', 'b|2026-10-01')
			expect(eventByKey('review')?.closest('[data-column]')).toHaveAttribute('data-column', '3|2026-09-30')
		})

		it('событие без ресурса или с неизвестным ресурсом в неделе и дне не показывается', () => {
			renderCalendar()
			expect(screen.queryByText('Без ресурса')).toBeNull()
			expect(screen.queryByText('Чужая комната')).toBeNull()
			expect(eventByKey('orphan')).toBeNull()
		})

		it('числовой resourceId события находит ресурс со строковым id', () => {
			renderCalendar({ events: [{ ...MEETING, resourceId: 3 }], resources: [{ id: '3', title: 'Строковая' }] })
			expect(eventByKey('meeting')?.closest('[data-column]')).toHaveAttribute('data-column', '3|2026-10-02')
		})

		it('«Весь день»: отдельные полосы на ресурс — колонка сдвинута на индекс ресурса × дней', () => {
			renderCalendar({ events: [HOLIDAY, { ...HOLIDAY, id: 'holiday-c', resourceId: 3 }] })
			const bars = [...document.querySelectorAll<HTMLElement>('.base-event-calendar__all-day-events [data-event-key]')]
			expect(bars).toHaveLength(2)
			const styles = bars.map(bar => [bar.style.left, bar.style.width])
			expect(styles).toEqual([
				[`${((7 / 21) * 100).toFixed(4)}%`, `${((2 / 21) * 100).toFixed(4)}%`],
				[`${((14 / 21) * 100).toFixed(4)}%`, `${((2 / 21) * 100).toFixed(4)}%`],
			])
		})

		it('цвет: свой цвет события → цвет ресурса → основной', () => {
			renderCalendar()
			expect(eventByKey('call')?.style.getPropertyValue('--event-color')).toBe('rgb(4, 5, 6)')
			expect(eventByKey('meeting')?.style.getPropertyValue('--event-color')).toBe('rgb(1, 2, 3)')
			expect(eventByKey('holiday')?.style.getPropertyValue('--event-color')).toBe('')
		})

		it('имя события — «<событие>, <ресурс>»', () => {
			renderCalendar()
			const name = eventByKey('meeting')?.getAttribute('aria-label') ?? ''
			expect(name).toMatch(/^Встреча, .+, Комната A$/)
		})
	})

	describe('слоты заголовка ресурса', () => {
		it('#resource для всех и #resource-<id> важнее — с ресурсом и его днями', () => {
			renderCalendar(
				{},
				{
					resource: ({ resource, days }: { resource: EventCalendarResource; days: Date[] }) =>
						h('span', { class: 'own' }, `${resource.title} · ${days.length}`),
					'resource-3': ({ resource, days }: { resource: EventCalendarResource; days: Date[] }) =>
						h('b', `особый ${resource.id} ${days[0].getDate()}`),
				},
			)
			const headers = [...document.querySelectorAll<HTMLElement>('.base-event-calendar__resource')]
			expect(headers.map(header => header.textContent)).toEqual(['Комната A · 7', 'Комната B · 7', 'особый 3 28'])
		})

		it('только #resource-<id> — у остальных название', () => {
			renderCalendar({}, { 'resource-b': () => h('i', 'B!') })
			const headers = [...document.querySelectorAll<HTMLElement>('.base-event-calendar__resource')]
			expect(headers.map(header => header.textContent?.trim())).toEqual(['Комната A', 'B!', 'Комната C'])
		})
	})

	describe('доступность и выделение клавиатурой', () => {
		it('имя колонки — «<ресурс>, <день>»; при is-selectable одна колонка в Tab — сегодня первого ресурса', () => {
			renderCalendar({ isSelectable: true })
			const today = column('a|2026-10-02')
			expect(today.getAttribute('aria-label')).toMatch(/^Комната A, /)
			expect(column('b|2026-10-02').getAttribute('aria-label')).toMatch(/^Комната B, /)
			expect(columns().filter(element => element.tabIndex === 0)).toEqual([today])
		})

		it('без is-selectable у колонок нет tabindex', () => {
			renderCalendar()
			expect(columns().every(element => !element.hasAttribute('tabindex'))).toBe(true)
		})

		it('фокус колонки объявляет «<ресурс>, <день>, <день и время>»', async () => {
			renderCalendar({ isSelectable: true })
			const today = column('a|2026-10-02')
			today.focus()
			await nextTick()
			const name = today.getAttribute('aria-label') ?? ''
			expect(statusText().startsWith(`${name}, `)).toBe(true)
			expect(statusText().length).toBeGreaterThan(name.length + 2)
		})

		it('→ с последнего дня ресурса A — первый день ресурса B; ← обратно; в Tab — последняя колонка в фокусе', async () => {
			const user = userEvent.setup()
			renderCalendar({ isSelectable: true })
			column('a|2026-10-02').focus()
			await user.keyboard('{ArrowRight}{ArrowRight}')
			expect(document.activeElement).toBe(column('a|2026-10-04'))
			await user.keyboard('{ArrowRight}')
			expect(document.activeElement).toBe(column('b|2026-09-28'))
			expect(statusText().startsWith(`${column('b|2026-09-28').getAttribute('aria-label')}, `)).toBe(true)
			expect(columns().filter(element => element.tabIndex === 0)).toEqual([column('b|2026-09-28')])
			await user.keyboard('{ArrowLeft}')
			expect(document.activeElement).toBe(column('a|2026-10-04'))
		})

		it('на краях периода ←/→ не двигают фокус', async () => {
			const user = userEvent.setup()
			renderCalendar({ isSelectable: true, date: '2026-09-28' })
			column('a|2026-09-28').focus()
			await user.keyboard('{ArrowLeft}')
			expect(document.activeElement).toBe(column('a|2026-09-28'))
			column('3|2026-10-04').focus()
			await user.keyboard('{ArrowRight}')
			expect(document.activeElement).toBe(column('3|2026-10-04'))
		})

		it('Shift+→ не переходит к другому ресурсу; Shift+← выделяет внутри ресурса', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ isSelectable: true, date: '2026-10-04' })
			column('a|2026-10-04').focus()
			await user.keyboard('{Shift>}{ArrowRight}{/Shift}')
			expect(document.activeElement).toBe(column('a|2026-10-04'))
			await user.keyboard('{Shift>}{ArrowLeft}{/Shift}')
			expect(document.activeElement).toBe(column('a|2026-10-03'))
			await user.keyboard('{Enter}')
			const [range] = selections(emitted(), 'select')
			expect(range.resourceId).toBe('a')
			expect(range.start.getDate()).toBe(3)
			expect(range.end.getDate()).toBe(4)
		})

		it('↑/↓ остаются в колонке ресурса; Enter в колонке ресурса B — create с resourceId b', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ isSelectable: true, view: 'day' })
			column('a|2026-10-02').focus()
			await user.keyboard('{ArrowRight}')
			expect(document.activeElement).toBe(column('b|2026-10-02'))
			await user.keyboard('{ArrowDown}{ArrowUp}{ArrowDown}')
			expect(document.activeElement).toBe(column('b|2026-10-02'))
			await user.keyboard('{Enter}')
			const [range] = selections(emitted(), 'create')
			expect(range).toMatchObject({ allDay: false, resourceId: 'b' })
			expect(range.start).toEqual(at(2, 8, 30))
		})

		it('выделение видно только в колонках своего ресурса', async () => {
			const user = userEvent.setup()
			renderCalendar({ isSelectable: true, view: 'day' })
			column('a|2026-10-02').focus()
			await user.keyboard('{Shift>}{ArrowDown}{/Shift}')
			expect(column('a|2026-10-02').querySelector('.base-event-calendar__selection')).not.toBeNull()
			expect(column('b|2026-10-02').querySelector('.base-event-calendar__selection')).toBeNull()
		})
	})

	describe('выделение мышью', () => {
		it('select с resourceId колонки; протянуть в колонку другого ресурса нельзя', async () => {
			const { emitted } = renderCalendar({ isSelectable: true, events: [] })
			layout()
			const start = column('b|2026-10-01')
			press(start, [1050, 600])
			await moveTo(1150, 660)
			await moveTo(1750, 900)
			await release(1750, 900)
			const [range] = selections(emitted(), 'select')
			expect(range).toEqual({ start: at(1, 10), end: at(2, 11, 30), allDay: false, resourceId: 'b' })
		})

		it('нажатие без движения в колонке ресурса — create с resourceId (числовой id сохраняется числом)', async () => {
			const { emitted } = renderCalendar({ isSelectable: true, events: [] })
			layout()
			press(column('3|2026-09-28'), [1450, 120])
			await release(1450, 120)
			expect(selections(emitted(), 'create')).toEqual([{ start: at(28, 2), end: at(28, 2, 30), allDay: false, resourceId: 3 }])
		})

		it('без ресурсов — create без поля resourceId', async () => {
			const { emitted } = renderCalendar({ isSelectable: true, events: [], resources: undefined })
			layout()
			press(column('2026-09-28'), [50, 120])
			await release(50, 120)
			const [range] = selections(emitted(), 'create')
			expect(range).toEqual({ start: at(28, 2), end: at(28, 2, 30), allDay: false })
			expect(range).not.toHaveProperty('resourceId')
		})

		it('колонка с ресурсом, которого нет в списке, — resourceId берётся из data-resource как есть', async () => {
			const { emitted } = renderCalendar({ isSelectable: true, events: [] })
			layout()
			const target = column('a|2026-09-28')
			target.dataset.resource = 'removed'
			press(target, [50, 120])
			await release(50, 120)
			expect(selections(emitted(), 'create')).toMatchObject([{ resourceId: 'removed' }])
		})
	})

	describe('перенос мышью', () => {
		it('в колонку другого ресурса — event-change move с resourceId и oldResourceId', async () => {
			const { emitted } = renderCalendar({ isEditable: true })
			layout()
			press(eventByKey('meeting') as HTMLElement, [450, 610])
			await moveTo(1150, 670)
			expect(eventByKey('meeting')?.closest('[data-column]')).toHaveAttribute('data-column', 'b|2026-10-02')
			await release(1150, 670)
			expect(changes(emitted())).toEqual([
				{
					type: 'move',
					event: MEETING,
					start: at(2, 11),
					end: at(2, 12),
					allDay: false,
					oldStart: at(2, 10),
					oldEnd: at(2, 11),
					resourceId: 'b',
					oldResourceId: 'a',
				},
			])
		})

		it('в другую колонку ресурса на то же время — тоже move', async () => {
			const { emitted } = renderCalendar({ isEditable: true, view: 'day' })
			layout()
			press(eventByKey('meeting') as HTMLElement, [50, 610])
			await moveTo(250, 610)
			await release(250, 610)
			expect(changes(emitted())).toMatchObject([{ type: 'move', start: at(2, 10), resourceId: 3, oldResourceId: 'a' }])
		})

		it('растягивание ресурс не меняет: resize с прежним resourceId', async () => {
			const { emitted } = renderCalendar({ isEditable: true })
			layout()
			const handle = (eventByKey('meeting') as HTMLElement).querySelector('.base-event-calendar__resize') as HTMLElement
			press(handle, [450, 660])
			await moveTo(1150, 720)
			await release(1150, 720)
			expect(changes(emitted())).toMatchObject([
				{ type: 'resize', start: at(2, 10), end: at(2, 12, 30), resourceId: 'a', oldResourceId: 'a' },
			])
		})

		it('canMove получает resourceId — запрет переноса в чужую комнату', async () => {
			const canMove = vi.fn((change: EventCalendarChange) => change.resourceId === change.oldResourceId)
			const { emitted } = renderCalendar({ isEditable: true, canMove })
			layout()
			press(eventByKey('meeting') as HTMLElement, [450, 610])
			await moveTo(1150, 610)
			expect(canMove).toHaveBeenLastCalledWith(expect.objectContaining({ resourceId: 'b', oldResourceId: 'a' }))
			await release(1150, 610)
			expect(emitted()['event-change']).toBeUndefined()
		})
	})

	describe('перенос клавиатурой', () => {
		it('день: Space, → — колонка следующего ресурса, Enter — event-change с ресурсами; объявление с ресурсом', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ isEditable: true, view: 'day' })
			;(eventByKey('meeting') as HTMLElement).focus()
			await user.keyboard(' ')
			await user.keyboard('{ArrowRight}')
			expect(eventByKey('meeting')?.closest('[data-column]')).toHaveAttribute('data-column', 'b|2026-10-02')
			expect(statusText()).toContain('Комната B')
			expect(statusText()).toContain('10:00–11:00')
			await user.keyboard('{Enter}')
			expect(changes(emitted())).toEqual([
				{
					type: 'move',
					event: MEETING,
					start: at(2, 10),
					end: at(2, 11),
					allDay: false,
					oldStart: at(2, 10),
					oldEnd: at(2, 11),
					resourceId: 'b',
					oldResourceId: 'a',
				},
			])
			expect(statusText()).toContain('Комната B')
		})

		it('день: на краю (последний ресурс) → не двигает событие; ← — к предыдущему ресурсу', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ isEditable: true, view: 'day' })
			;(eventByKey('review') as HTMLElement | null)?.focus()
			expect(eventByKey('review')).toBeNull()
			;(eventByKey('meeting') as HTMLElement).focus()
			await user.keyboard(' {ArrowRight}{ArrowRight}{ArrowRight}')
			expect(eventByKey('meeting')?.closest('[data-column]')).toHaveAttribute('data-column', '3|2026-10-02')
			await user.keyboard('{ArrowLeft}{Enter}')
			expect(changes(emitted())).toMatchObject([{ type: 'move', resourceId: 'b', oldResourceId: 'a' }])
		})

		it('неделя: → — следующий день; с последнего дня — первый день следующего ресурса; ↓ и Shift+↓ ресурс не меняют', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ isEditable: true })
			;(eventByKey('meeting') as HTMLElement).focus()
			await user.keyboard(' {ArrowRight}')
			expect(eventByKey('meeting')?.closest('[data-column]')).toHaveAttribute('data-column', 'a|2026-10-03')
			await user.keyboard('{ArrowRight}{ArrowRight}')
			expect(eventByKey('meeting')?.closest('[data-column]')).toHaveAttribute('data-column', 'b|2026-09-28')
			await user.keyboard('{ArrowDown}{Shift>}{ArrowDown}{/Shift}{Enter}')
			expect(changes(emitted())).toEqual([
				expect.objectContaining({
					type: 'move',
					start: at(28, 10, 30),
					end: at(28, 12),
					resourceId: 'b',
					oldResourceId: 'a',
				}),
			])
		})

		it('неделя: последний день последнего ресурса — → не двигает', async () => {
			const user = userEvent.setup()
			const event = { ...MEETING, start: '2026-10-04T10:00', end: '2026-10-04T11:00', resourceId: 3 }
			renderCalendar({ isEditable: true, events: [event] })
			;(eventByKey('meeting') as HTMLElement).focus()
			await user.keyboard(' {ArrowRight}')
			expect(eventByKey('meeting')?.closest('[data-column]')).toHaveAttribute('data-column', '3|2026-10-04')
		})

		it('«Весь день» с ресурсами: → переносит полосу в колонку следующего дня', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ isEditable: true, events: [HOLIDAY] })
			;(eventByKey('holiday') as HTMLElement).focus()
			await user.keyboard(' {ArrowRight}{Enter}')
			expect(changes(emitted())).toMatchObject([{ type: 'move', allDay: true, start: at(29), end: at(1), resourceId: 'b' }])
		})

		it('canMove запрещает чужую комнату — BLOCKED, событие на месте', async () => {
			const user = userEvent.setup()
			const canMove = (change: EventCalendarChange) => change.resourceId === change.oldResourceId
			const { emitted } = renderCalendar({ isEditable: true, view: 'day', canMove })
			;(eventByKey('meeting') as HTMLElement).focus()
			await user.keyboard(' {ArrowRight}')
			expect(statusText()).toMatch(/нельзя/)
			expect(eventByKey('meeting')?.closest('[data-column]')).toHaveAttribute('data-column', 'a|2026-10-02')
			await user.keyboard('{Enter}')
			expect(emitted()['event-change']).toBeUndefined()
		})

		it('месяц с ресурсами: перенос без полей ресурса', async () => {
			const user = userEvent.setup()
			const { emitted } = renderCalendar({ isEditable: true, view: 'month', events: [MEETING] })
			const [bar] = screen.getAllByRole('button', { name: /^Встреча, / })
			bar.focus()
			await user.keyboard(' {ArrowRight}{Enter}')
			const [change] = changes(emitted())
			expect(change).toMatchObject({ type: 'move', start: at(3, 10) })
			expect(change).not.toHaveProperty('resourceId')
		})
	})

	describe('много событий', () => {
		it('1 500 событий в месяце и в неделе с ресурсами монтируются', () => {
			const many: CalendarEvent[] = Array.from({ length: 1500 }, (_, index) => ({
				id: index,
				title: `Событие ${index}`,
				start: new Date(2026, 9, 1 + (index % 28), 8 + (index % 10)),
				resourceId: RESOURCES[index % 3].id,
			}))
			const { unmount } = renderCalendar({ view: 'month', events: many })
			expect(document.querySelectorAll('.base-event-calendar__day').length).toBeGreaterThan(27)
			unmount()
			renderCalendar({ events: many })
			const visible = document.querySelectorAll('.base-event-calendar__column [data-event-key]')
			expect(visible.length).toBeGreaterThan(100)
			expect(within(column('a|2026-10-01')).queryAllByText(/^Событие/).length).toBeGreaterThan(0)
		})
	})
})
