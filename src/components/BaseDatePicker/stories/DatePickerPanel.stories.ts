/**
 * Stories для DatePickerPanel.
 * Каждая story содержит play-функцию для 100% coverage.
 *
 * ВНИМАНИЕ: DatePickerPanel использует <Teleport to="body"> и <Transition name="dropdown">,
 * поэтому элементы рендерятся за пределами canvasElement в document.body.
 * Для поиска используем document.body.querySelector.
 * Transition может задерживать рендер — используем waitFor с увеличенным timeout.
 */

import { expect, fn, userEvent, waitFor } from 'storybook/test'
import DatePickerPanel from '../ui/DatePickerPanel/DatePickerPanel.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

const PANEL_SELECTOR = '.date-picker-panel'
const WAIT_OPTIONS = { timeout: 5000 }

const meta: Meta<typeof DatePickerPanel> = {
	title: 'UI/BaseDatePicker/DatePickerPanel',
	component: DatePickerPanel,
	args: {
		isOpen: true,
		selectionMode: 'single',
		locale: 'ru-RU',
		sizeScale: 100,
		calendarVariant: 'default',
		firstDayOfWeek: 1,
		showTime: false,
		showSeconds: false,
		is24Hour: true,
		showWeekNumber: false,
		panelStyle: {},
		monthsCount: 1,
	},
}

export default meta
type Story = StoryObj<typeof DatePickerPanel>
/** Одиночный месяц */
export const SingleMonth: Story = {
	args: {
		monthsCount: 1,
		'onModel-update': fn(),
		'onRange-select': fn(),
	},
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			expect(document.body.querySelector(PANEL_SELECTOR)).toBeTruthy()
		}, WAIT_OPTIONS)

		// handlePrevRange
		const navBtns = document.body.querySelectorAll(
			'.date-picker-panel__nav-btn:not(.date-picker-panel__nav-btn--double)',
		)
		if (navBtns.length > 0) {
			await userEvent.click(navBtns[0] as HTMLElement)
		}

		// handleNextRange
		if (navBtns.length > 1) {
			await userEvent.click(navBtns[1] as HTMLElement)
		}

		// handlePrevYear
		const doubleBtns = document.body.querySelectorAll('.date-picker-panel__nav-btn--double')
		if (doubleBtns.length > 0) {
			await userEvent.click(doubleBtns[0] as HTMLElement)
		}

		// handleNextYear
		if (doubleBtns.length > 1) {
			await userEvent.click(doubleBtns[1] as HTMLElement)
		}

		// Клик по дню
		const dayBtns = document.body.querySelectorAll('button:not([disabled])')
		const dayBtn = Array.from(dayBtns).find(b => /^\d{1,2}$/.test(b.textContent?.trim() || ''))
		if (dayBtn) {
			await userEvent.click(dayBtn as HTMLElement)
		}
	},
}
/** Отображение нескольких месяцев */
export const MultiMonth: Story = {
	args: {
		monthsCount: 2,
	},
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			const calendars = document.body.querySelectorAll('.base-calendar')
			expect(calendars.length).toBe(2)
		}, WAIT_OPTIONS)
	},
}
/** Выбор диапазона дат */
export const RangeSelection: Story = {
	args: {
		selectionMode: 'range',
		monthsCount: 2,
		'onModel-update': fn(),
		'onModel-end-update': fn(),
		'onRange-select': fn(),
	},
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			expect(document.body.querySelector(PANEL_SELECTOR)).toBeTruthy()
		}, WAIT_OPTIONS)
	},
}
/** Закрытое состояние */
export const Closed: Story = {
	args: {
		isOpen: false,
	},
	play: async ({ canvasElement }) => {
		expect(document.body.querySelector(PANEL_SELECTOR)).toBeNull()
	},
}
/** safeMonthsCount с нечисловым значением */
export const MonthsCountInvalid: Story = {
	args: { isOpen: true, monthsCount: 'abc' as unknown as number },
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			expect(document.body.querySelector(PANEL_SELECTOR)).toBeTruthy()
		}, WAIT_OPTIONS)
		// Должен отрендерить 1 месяц (safeMonthsCount = 1)
		const calendars = document.body.querySelectorAll('.base-calendar')
		expect(calendars.length).toBe(1)
	},
}
/** safeMonthsCount = 0 → корректируется в 1 */
export const MonthsCountZero: Story = {
	args: { isOpen: true, monthsCount: 0 },
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			expect(document.body.querySelector(PANEL_SELECTOR)).toBeTruthy()
		}, WAIT_OPTIONS)
		const calendars = document.body.querySelectorAll('.base-calendar')
		expect(calendars.length).toBe(1)
	},
}
/** displayYear при переходе через год (3 месяца с декабря) */
export const DisplayYearCrossYear: Story = {
	args: { isOpen: true, monthsCount: 3, modelValue: new Date(2025, 11, 1) },
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			const title = document.body.querySelector('.date-picker-panel__year-title span')
			expect(title?.textContent).toContain('-')
		}, WAIT_OPTIONS)
	},
}
/** Прокси emit: model-update, model-end-update, selected-update, range-select */
export const ProxyEmits: Story = {
	args: {
		isOpen: true,
		monthsCount: 1,
		selectionMode: 'range',
		modelValue: new Date(2025, 5, 10),
		modelValueEnd: new Date(2025, 5, 20),
		'onModel-update': fn(),
		'onModel-end-update': fn(),
		'onSelected-update': fn(),
		'onRange-select': fn(),
	},
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			expect(document.body.querySelector(PANEL_SELECTOR)).toBeTruthy()
		}, WAIT_OPTIONS)
	},
}
/** selectedDates с данными (watch isOpen берет selectedDates[0]) */
export const WithSelectedDates: Story = {
	args: {
		isOpen: true,
		monthsCount: 1,
		selectionMode: 'multiple',
		selectedDates: [new Date(2025, 3, 10), new Date(2025, 3, 15)],
	},
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			expect(document.body.querySelector(PANEL_SELECTOR)).toBeTruthy()
		}, WAIT_OPTIONS)
	},
}
/** watch isOpen при modelValueEnd без modelValue */
export const InitWithEndDate: Story = {
	args: {
		isOpen: true,
		monthsCount: 1,
		modelValueEnd: new Date(2025, 8, 15),
	},
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			expect(document.body.querySelector(PANEL_SELECTOR)).toBeTruthy()
		}, WAIT_OPTIONS)
	},
}
/** handleMonthChange через emit от BaseCalendar */
export const MonthChangeEmit: Story = {
	args: { isOpen: true, monthsCount: 2, modelValue: new Date(2025, 5, 15) },
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			expect(document.body.querySelector(PANEL_SELECTOR)).toBeTruthy()
		}, WAIT_OPTIONS)

		// Триггерим month-change на первом BaseCalendar
		const calendars = document.body.querySelectorAll('.base-calendar')
		if (calendars.length > 0) {
			calendars[0].dispatchEvent(new CustomEvent('month-change', { bubbles: true, detail: [7] }))
		}
	},
}
/** handleYearChange через emit от BaseCalendar */
export const YearChangeEmit: Story = {
	args: { isOpen: true, monthsCount: 2, modelValue: new Date(2025, 5, 15) },
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			expect(document.body.querySelector(PANEL_SELECTOR)).toBeTruthy()
		}, WAIT_OPTIONS)

		const calendars = document.body.querySelectorAll('.base-calendar')
		if (calendars.length > 0) {
			calendars[0].dispatchEvent(new CustomEvent('year-change', { bubbles: true, detail: [2026] }))
		}
	},
}
/** handleMonthChange на втором календаре (itemIndex=1) */
export const MonthChangeSecondCalendar: Story = {
	args: { isOpen: true, monthsCount: 2, modelValue: new Date(2025, 5, 15) },
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			expect(document.body.querySelector(PANEL_SELECTOR)).toBeTruthy()
		}, WAIT_OPTIONS)

		const calendars = document.body.querySelectorAll('.base-calendar')
		if (calendars.length > 1) {
			calendars[1].dispatchEvent(new CustomEvent('month-change', { bubbles: true, detail: [8] }))
		}
	},
}
/** handleYearChange на втором календаре (itemIndex=1) */
export const YearChangeSecondCalendar: Story = {
	args: { isOpen: true, monthsCount: 2, modelValue: new Date(2025, 5, 15) },
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			expect(document.body.querySelector(PANEL_SELECTOR)).toBeTruthy()
		}, WAIT_OPTIONS)

		const calendars = document.body.querySelectorAll('.base-calendar')
		if (calendars.length > 1) {
			calendars[1].dispatchEvent(new CustomEvent('year-change', { bubbles: true, detail: [2027] }))
		}
	},
}
/** Реальный триггер handleMonthChange/handleYearChange через цепочку реактивности. Клики по nav-кнопкам панели меняют currentBaseDate → monthItems → initialMonth/initialYear → watch в useCalendar обновляет currentMonth/currentYear → emit('month-change')/('year-change') → handleMonthChange/handleYearChange срабатывают на ВСЕХ календарях (itemIndex=0 и 1). */
export const RealMonthYearChangeFlow: Story = {
	args: {
		isOpen: true,
		monthsCount: 2,
		modelValue: new Date(2025, 5, 15),
	},
	play: async () => {
		await waitFor(() => {
			expect(document.body.querySelector(PANEL_SELECTOR)).toBeTruthy()
		}, WAIT_OPTIONS)

		// Ждём рендер обоих календарей
		await waitFor(() => {
			const calendars = document.body.querySelectorAll('.base-calendar')
			expect(calendars.length).toBe(2)
		}, WAIT_OPTIONS)

		// handleNextRange → меняет currentBaseDate → BaseCalendar.initialMonth → emit month-change
		const nextRangeBtn = document.body.querySelector(
			'.date-picker-panel__nav-group--next .date-picker-panel__nav-btn:not(.date-picker-panel__nav-btn--double)',
		)
		if (nextRangeBtn instanceof HTMLElement) {
			await userEvent.click(nextRangeBtn)
		}
		await new Promise(resolve => setTimeout(resolve, 50))

		// handlePrevRange — обратный путь
		const prevRangeBtn = document.body.querySelector(
			'.date-picker-panel__nav-group--prev .date-picker-panel__nav-btn:not(.date-picker-panel__nav-btn--double)',
		)
		if (prevRangeBtn instanceof HTMLElement) {
			await userEvent.click(prevRangeBtn)
		}
		await new Promise(resolve => setTimeout(resolve, 50))

		// handleNextYear → меняет год → BaseCalendar.initialYear → emit year-change
		const nextYearBtn = document.body.querySelector(
			'.date-picker-panel__nav-group--next .date-picker-panel__nav-btn--double',
		)
		if (nextYearBtn instanceof HTMLElement) {
			await userEvent.click(nextYearBtn)
		}
		await new Promise(resolve => setTimeout(resolve, 50))

		// handlePrevYear — обратный путь
		const prevYearBtn = document.body.querySelector(
			'.date-picker-panel__nav-group--prev .date-picker-panel__nav-btn--double',
		)
		if (prevYearBtn instanceof HTMLElement) {
			await userEvent.click(prevYearBtn)
		}
		await new Promise(resolve => setTimeout(resolve, 50))
	},
}
/** monthsCount = NaN → safeMonthsCount = 1 (ветка !Number.isFinite) */
export const MonthsCountNaN: Story = {
	args: { isOpen: true, monthsCount: Number.NaN },
	play: async () => {
		await waitFor(() => {
			expect(document.body.querySelector(PANEL_SELECTOR)).toBeTruthy()
		}, WAIT_OPTIONS)
		const calendars = document.body.querySelectorAll('.base-calendar')
		expect(calendars.length).toBe(1)
	},
}
/** monthsCount = Infinity → safeMonthsCount = 1 (ветка !Number.isFinite) */
export const MonthsCountInfinity: Story = {
	args: { isOpen: true, monthsCount: Number.POSITIVE_INFINITY },
	play: async () => {
		await waitFor(() => {
			expect(document.body.querySelector(PANEL_SELECTOR)).toBeTruthy()
		}, WAIT_OPTIONS)
		const calendars = document.body.querySelectorAll('.base-calendar')
		expect(calendars.length).toBe(1)
	},
}
/** Триггер handleMonthChange через nav-кнопку handleNextRange (одиночный месяц) */
export const TriggerHandleMonthChange: Story = {
	args: {
		isOpen: true,
		monthsCount: 1,
		modelValue: new Date(2025, 5, 15),
	},
	play: async () => {
		await waitFor(() => {
			const calendars = document.body.querySelectorAll('.base-calendar')
			expect(calendars.length).toBe(1)
		}, WAIT_OPTIONS)

		const nextRangeBtn = document.body.querySelector(
			'.date-picker-panel__nav-group--next .date-picker-panel__nav-btn:not(.date-picker-panel__nav-btn--double)',
		)
		if (nextRangeBtn instanceof HTMLElement) {
			await userEvent.click(nextRangeBtn)
		}
		await new Promise(resolve => setTimeout(resolve, 200))
	},
}
/** Триггер handleYearChange через nav-кнопку handleNextYear (одиночный месяц) */
export const TriggerHandleYearChange: Story = {
	args: {
		isOpen: true,
		monthsCount: 1,
		modelValue: new Date(2025, 5, 15),
	},
	play: async () => {
		await waitFor(() => {
			const calendars = document.body.querySelectorAll('.base-calendar')
			expect(calendars.length).toBe(1)
		}, WAIT_OPTIONS)

		const nextYearBtn = document.body.querySelector(
			'.date-picker-panel__nav-group--next .date-picker-panel__nav-btn--double',
		)
		if (nextYearBtn instanceof HTMLElement) {
			await userEvent.click(nextYearBtn)
		}
		await new Promise(resolve => setTimeout(resolve, 200))
	},
}
/** Multiple-режим: клик по дню → handleSelectedUpdate */
export const TriggerSelectedUpdate: Story = {
	args: {
		isOpen: true,
		monthsCount: 1,
		selectionMode: 'multiple',
		selectedDates: [],
		'onSelected-update': fn(),
	},
	play: async () => {
		await waitFor(() => {
			expect(document.body.querySelector(PANEL_SELECTOR)).toBeTruthy()
		}, WAIT_OPTIONS)

		await waitFor(() => {
			const dayBtns = document.body.querySelectorAll('.base-calendar__day:not([disabled])')
			if (dayBtns.length === 0) throw new Error('Дни не найдены')
		}, WAIT_OPTIONS)

		const dayBtns = document.body.querySelectorAll('.base-calendar__day:not([disabled])')
		const dayBtn = Array.from(dayBtns).find(b => /^\d+$/.test(b.textContent?.trim() ?? ''))
		if (dayBtn instanceof HTMLElement) {
			await userEvent.click(dayBtn)
		}
	},
}
/** Range-режим: два клика → handleModelEndUpdate + handleRangeSelect */
export const TriggerRangeSelect: Story = {
	args: {
		isOpen: true,
		monthsCount: 1,
		selectionMode: 'range',
		'onModel-update': fn(),
		'onModel-end-update': fn(),
		'onRange-select': fn(),
	},
	play: async () => {
		await waitFor(() => {
			expect(document.body.querySelector(PANEL_SELECTOR)).toBeTruthy()
		}, WAIT_OPTIONS)

		await waitFor(() => {
			const dayBtns = document.body.querySelectorAll('.base-calendar__day:not([disabled])')
			if (dayBtns.length < 5) throw new Error('Дни не найдены')
		}, WAIT_OPTIONS)

		const dayBtns = Array.from(document.body.querySelectorAll('.base-calendar__day:not([disabled])')).filter(b =>
			/^\d+$/.test(b.textContent?.trim() ?? ''),
		)

		if (dayBtns.length >= 2) {
			const first = dayBtns[5]
			const second = dayBtns[15]
			if (first instanceof HTMLElement) await userEvent.click(first)
			if (second instanceof HTMLElement) await userEvent.click(second)
		}
		await new Promise(resolve => setTimeout(resolve, 100))
	},
}
