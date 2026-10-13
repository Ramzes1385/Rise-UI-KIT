import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseEventCalendar from '../../ui/BaseEventCalendar.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { BaseEventCalendarProps } from '../../types/BaseEventCalendar.types'

const EVENTS = [{ id: 'meeting', title: 'Встреча', start: '2026-10-02T10:00', end: '2026-10-02T11:00' }]

function renderCalendar(props: Partial<BaseEventCalendarProps> = {}) {
	return render(BaseEventCalendar, {
		props: { date: '2026-10-02', today: '2026-10-02T10:30', events: EVENTS, ...props },
		global: { stubs: { Transition: false } },
	})
}

const views = (container: Element) => [...container.querySelectorAll('.base-event-calendar__view > *')]
const leaving = (container: Element) => container.querySelector('.base-event-calendar__view-leaving')
const button = (name: string) => screen.getByRole('button', { name })

describe('BaseEventCalendar: движение смены вида и периода', () => {
	afterEach(() => {
		document.documentElement.removeAttribute('data-rise-motion')
		vi.restoreAllMocks()
	})

	it('следующий период: сетка сменяется сдвигом вперёд, уходящая скрыта и без id, data-атрибутов и tabindex', async () => {
		const { container } = renderCalendar()
		await fireEvent.click(button('Следующий период'))

		const [old, current] = views(container)
		expect(old).toHaveClass('base-event-calendar__view-leaving', 'base-event-calendar__view-next-leave-active')
		expect(old).toHaveAttribute('aria-hidden', 'true')
		expect(old).toHaveAttribute('inert')
		expect(old.querySelector('[data-day], [data-event-key], [tabindex], [id]')).toBeNull()
		expect(current).toHaveClass('base-event-calendar__view-next-enter-active')
		expect(current.querySelector('[data-day="2026-11-02"]')).not.toBeNull()
		expect(screen.getByRole('grid')).toBe(current)
		await vi.waitFor(() => expect(leaving(container)).toBeNull())
	})

	it('предыдущий период — сдвиг назад, смена вида — затухание с масштабом', async () => {
		const { container } = renderCalendar()
		await fireEvent.click(button('Предыдущий период'))
		expect(views(container)[1]).toHaveClass('base-event-calendar__view-prev-enter-active')
		await vi.waitFor(() => expect(leaving(container)).toBeNull())

		await fireEvent.click(screen.getByRole('radio', { name: 'Список' }))
		expect(views(container)[0]).toHaveClass('base-event-calendar__view-change-leave-active')
		expect(views(container)[1]).toHaveClass('base-event-calendar__view-change-enter-active')
	})

	it('в пресете none сетка меняется сразу, без классов перехода', async () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		const { container } = renderCalendar()
		await fireEvent.click(button('Следующий период'))
		await nextTick()

		expect(views(container)).toHaveLength(1)
		expect(views(container)[0].className).not.toMatch(/enter|leave/)
	})

	it('фокус в уходящей сетке переходит на тот же день новой сетки', async () => {
		const { container } = renderCalendar()
		const outside = container.querySelector<HTMLElement>('[data-day="2026-11-01"]')!
		outside.focus()
		await nextTick()

		await vi.waitFor(() => expect(container.querySelector('[data-day="2026-11-01"]')).toHaveFocus())
		expect(container.querySelector('[data-day="2026-11-01"]')).not.toBe(outside)
	})

	it('фокус на элементе без ключа — на текущий день новой сетки; фокус вне сетки не переносится', async () => {
		const { container, rerender } = renderCalendar({ maxEventsPerDay: 0 })
		container.querySelector<HTMLElement>('.base-event-calendar__more-button')!.focus()
		await rerender({ date: '2026-11-02' })

		await vi.waitFor(() => expect(container.querySelector('[data-day="2026-11-02"]')).toHaveFocus())
		button('Следующий период').focus()
		await fireEvent.click(button('Следующий период'))
		expect(button('Следующий период')).toHaveFocus()
	})

	it('неделя: новый период сохраняет прокрутку шкалы, смена вида — к началу дня', async () => {
		vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockReturnValue(1440)
		vi.spyOn(Element.prototype, 'scrollTop', 'get').mockReturnValue(700)
		const scrollTop = vi.spyOn(Element.prototype, 'scrollTop', 'set')
		const { container } = renderCalendar({ view: 'week' })
		await vi.waitFor(() => expect(scrollTop).toHaveBeenLastCalledWith(480))
		await fireEvent.scroll(container.querySelector('.base-event-calendar__time-body')!)

		scrollTop.mockClear()
		await fireEvent.click(button('Следующий период'))
		expect(scrollTop).toHaveBeenLastCalledWith(700)

		await fireEvent.click(screen.getByRole('radio', { name: 'День' }))
		await vi.waitFor(() => expect(scrollTop).toHaveBeenLastCalledWith(480))
	})
})
