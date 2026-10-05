import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseCalendar from '../ui/BaseCalendar.vue'
import userEvent from '@testing-library/user-event'
import { CALENDAR_PARTS } from '../types/BaseCalendar.types'
import { render, screen, waitFor } from '@testing-library/vue'

const DATE = new Date(2025, 4, 14)
const allUi = Object.fromEntries(['root', ...CALENDAR_PARTS].map(part => [part, `u-${part}`]))
const motionStubs = { Transition: false, TransitionGroup: false }
const FULL = {
	modelValue: DATE,
	highlights: [{ date: DATE, label: 'Встреча' }],
	showDatePopover: true,
	timeConfig: { showTime: true, showSeconds: true, is24Hour: false },
	displayConfig: { showWeekNumber: true, showTodayButton: true },
}

const grids = (container: Element) => [...container.querySelectorAll('.base-calendar__grid')]

afterEach(() => {
	document.documentElement.removeAttribute('data-rise-motion')
})

describe('BaseCalendar: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseCalendar, { props: { modelValue: DATE } })

		expect(container.querySelector('.base-calendar__title')).toHaveAttribute('class', 'base-calendar__title')
		expect(container.querySelector('.base-calendar__days')).toHaveAttribute('class', 'base-calendar__days')
		expect(container.querySelector('.base-calendar__weekday')).toHaveAttribute('class', 'base-calendar__weekday')
		expect(container.querySelector('.base-calendar__grid')).toHaveAttribute('class', 'base-calendar__grid')
		expect(container.querySelector('.base-calendar__day-wrapper')).toHaveAttribute('class', 'base-calendar__day-wrapper')
	})

	it('классы всех частей добавляются к классам кита, модификаторы и customClass сохраняются', async () => {
		const user = userEvent.setup()
		const { container } = render(BaseCalendar, {
			props: { ...FULL, variant: 'outline', customClass: { root: 'own-root', grid: 'own-grid' }, ui: allUi },
		})
		await user.click(screen.getByRole('button', { name: /14 мая 2025/ }))

		expect(container.querySelector('.base-calendar')).toHaveClass('u-root', 'base-calendar--outline', 'own-root')
		expect(container.querySelector('.base-calendar__grid')).toHaveClass('u-grid', 'own-grid')
		expect(container.querySelector('.base-calendar__day--selected')).toHaveClass('u-day')
		const days = CALENDAR_PARTS.filter(part => !['months', 'month-btn', 'years', 'year-btn'].includes(part))
		for (const part of days) expect(container.querySelector(`.base-calendar__${part}`)).toHaveClass(`u-${part}`)

		await user.click(screen.getByRole('button', { name: /май 2025/i }))
		expect(container.querySelector('.base-calendar__months')).toHaveClass('u-months')
		expect(container.querySelector('.base-calendar__month-btn--current')).toHaveClass('u-month-btn')

		await user.click(screen.getByRole('button', { name: '2025' }))
		expect(container.querySelector('.base-calendar__years')).toHaveClass('u-years')
		expect(container.querySelector('.base-calendar__year-btn--current')).toHaveClass('u-year-btn')
	})

	it('шапка без навигации — заголовок и модификатор --simple получают классы ui', () => {
		const { container } = render(BaseCalendar, {
			props: { modelValue: DATE, displayConfig: { showNavigation: false }, ui: { header: 'u-header', title: 'u-title' } },
		})

		expect(container.querySelector('.base-calendar__header')).toHaveClass('u-header', 'base-calendar__header--simple')
		expect(container.querySelector('.base-calendar__title')).toHaveClass('u-title')
	})

	it('классы из defaults.BaseCalendar.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseCalendar, {
			props: { modelValue: DATE, ui: { title: 'own-title' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseCalendar: { ui: { root: 'app-root', title: 'app-title' } } } })] },
		})

		expect(container.querySelector('.base-calendar')).toHaveClass('base-calendar', 'app-root')
		expect(container.querySelector('.base-calendar__title')).toHaveAttribute('class', 'base-calendar__title app-title own-title')
	})
})

describe('BaseCalendar: движение', () => {
	it('«Следующий месяц» — уходящая сетка едет вперёд, скрыта от вспомогательных технологий и без id', async () => {
		const user = userEvent.setup()
		const { container } = render(BaseCalendar, {
			props: { modelValue: DATE },
			slots: { day: '<template #day="{ date }"><span :id="`day-${date.getDate()}`">{{ date.getDate() }}</span></template>' },
			global: { stubs: motionStubs },
		})
		await user.click(screen.getByRole('button', { name: 'Следующий месяц' }))

		const [leaving, entering] = grids(container)
		expect(leaving).toHaveClass('base-calendar-slide-next-leave-active')
		expect(leaving).toHaveAttribute('aria-hidden', 'true')
		expect(leaving).toHaveAttribute('inert')
		expect(leaving!.querySelector('[id]')).toBeNull()
		expect(entering).toHaveClass('base-calendar-slide-next-enter-active')
		expect(entering!.querySelector('#day-1')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /июнь 2025/i })).toBeInTheDocument()
		await waitFor(() => expect(grids(container)).toHaveLength(1))
	})

	it('«Предыдущий месяц» — направление назад', async () => {
		const user = userEvent.setup()
		const { container } = render(BaseCalendar, { props: { modelValue: DATE }, global: { stubs: motionStubs } })
		await user.click(screen.getByRole('button', { name: 'Предыдущий месяц' }))

		expect(grids(container)[0]).toHaveClass('base-calendar-slide-prev-leave-active')
		expect(grids(container)[1]).toHaveClass('base-calendar-slide-prev-enter-active')
		await waitFor(() => expect(grids(container)).toHaveLength(1))
	})

	it('смена вида — перекрёстное появление, а не сдвиг; листание годов в месяцах — сдвиг', async () => {
		const user = userEvent.setup()
		const { container } = render(BaseCalendar, { props: { modelValue: DATE }, global: { stubs: motionStubs } })
		await user.click(screen.getByRole('button', { name: /май 2025/i }))

		expect(container.querySelector('.base-calendar__days')).toHaveClass('base-calendar-view-leave-active')
		expect(container.querySelector('.base-calendar__months')).toHaveClass('base-calendar-view-enter-active')
		await waitFor(() => expect(container.querySelector('.base-calendar__days')).toBeNull())

		await user.click(screen.getByRole('button', { name: 'Следующий год' }))
		const months = container.querySelectorAll('.base-calendar__months')
		expect(months).toHaveLength(2)
		expect(months[1]).toHaveClass('base-calendar-slide-next-enter-active')
		expect(screen.getAllByRole('button', { name: /^январь$/i })).toHaveLength(1)
	})

	it('пресет none — сетка меняется сразу, без уходящей копии', async () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		const user = userEvent.setup()
		const { container } = render(BaseCalendar, { props: { modelValue: DATE }, global: { stubs: motionStubs } })
		await nextTick()
		await user.click(screen.getByRole('button', { name: 'Следующий месяц' }))

		expect(grids(container)).toHaveLength(1)
		expect(grids(container)[0]!.className).not.toContain('slide')
		expect(screen.getByRole('button', { name: /, 1 июня 2025/ })).toBeInTheDocument()
	})
})

describe('BaseCalendar: части вне вида «дни»', () => {
	it('выбор месяца возвращает к дням, секунды вводятся в своё поле', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseCalendar, { props: { ...FULL, ui: { 'month-btn': 'u-month' } } })
		const seconds = screen.getByRole('spinbutton', { name: 'Секунды' })

		await user.clear(seconds)
		await user.type(seconds, '30')
		await user.tab()
		expect(seconds).toHaveValue(30)

		const hours = screen.getByRole('spinbutton', { name: 'Часы' })
		await user.clear(hours)
		await user.type(hours, '11')
		await user.tab()
		expect(hours).toHaveValue(11)

		await user.click(screen.getByRole('button', { name: 'AM' }))
		await user.clear(hours)
		await user.type(hours, '3')
		await user.tab()
		expect(hours).toHaveValue(3)

		await user.click(screen.getByRole('button', { name: /май 2025/i }))
		await user.click(screen.getByRole('button', { name: /^март$/i }))
		expect(emitted()['month-change']).toBeTruthy()
		expect(screen.getByRole('button', { name: /март 2025/i })).toBeInTheDocument()
	})
})
