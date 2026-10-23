import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { BaseCalendar } from '@components/BaseCalendar'
import { fireEvent, render, screen } from '@testing-library/vue'
import DatePickerPanel from '../../ui/DatePickerPanel/DatePickerPanel.vue'

const BASE_CALENDAR_PROP_NAMES = Object.keys((BaseCalendar as unknown as { props: Record<string, unknown> }).props)

const STUBS = {
	BaseCalendar: {
		template: '<div class="base-calendar" :data-month="initialMonth" :data-year="initialYear" />',
		props: BASE_CALENDAR_PROP_NAMES,
	},
	BaseIcon: { template: '<i class="base-icon" />' },
	BaseText: { template: '<span class="base-text"><slot /></span>', props: ['tag', 'weight', 'sizeScale'] },
	teleport: true,
}

const DEFAULT_PROPS = {
	isOpen: true,
	modelValue: new Date(2026, 0, 15),
	modelValueEnd: null,
	selectedDates: [],
	selectionMode: 'single' as const,
	calendarVariant: 'default' as const,
	minDate: null,
	maxDate: null,
	disabledDates: [],
	disabledWeekdays: [],
	disableFrom: null,
	disableTo: null,
	highlights: [],
	weekends: null,
	firstDayOfWeek: 1 as const,
	locale: 'ru-RU',
	sizeScale: 100,
	showTime: false,
	showSeconds: false,
	is24Hour: true,
	showWeekNumber: false,
	monthsCount: 1,
	panelStyle: { top: '100px', left: '50px' },
	theme: null,
}

const NAV_LABELS = ['Предыдущий год', 'Предыдущий месяц', 'Следующий месяц', 'Следующий год']

function renderPanel() {
	return render(DatePickerPanel, { props: DEFAULT_PROPS, global: { stubs: STUBS } })
}

describe('DatePickerPanel — подсказки навигации из BaseTooltip', () => {
	it('у кнопок навигации нет title, имя задаёт aria-label, тип button', () => {
		renderPanel()

		for (const label of NAV_LABELS) {
			const button = screen.getByRole('button', { name: label })
			expect(button).not.toHaveAttribute('title')
			expect(button).toHaveAttribute('aria-label', label)
			expect(button).toHaveAttribute('type', 'button')
			expect(button).toHaveClass('base-button', 'date-picker-panel__nav-btn')
		}
	})

	it('кнопки «год» сохраняют модификатор --double', () => {
		renderPanel()

		expect(screen.getByRole('button', { name: 'Предыдущий год' })).toHaveClass('date-picker-panel__nav-btn--double')
		expect(screen.getByRole('button', { name: 'Следующий год' })).toHaveClass('date-picker-panel__nav-btn--double')
		expect(screen.getByRole('button', { name: 'Предыдущий месяц' })).not.toHaveClass('date-picker-panel__nav-btn--double')
	})

	it.each(NAV_LABELS)('наведение на «%s» показывает подсказку с текстом кнопки', async label => {
		const user = userEvent.setup()
		renderPanel()

		expect(screen.queryByRole('tooltip')).toBeNull()
		await user.hover(screen.getByRole('button', { name: label }))
		expect(await screen.findByRole('tooltip')).toHaveTextContent(label)
	})

	it('фокус на кнопке показывает подсказку', async () => {
		renderPanel()
		const button = screen.getByRole('button', { name: 'Следующий месяц' })

		button.focus()
		await fireEvent.focusIn(button)
		expect(button).toHaveFocus()
		expect(await screen.findByRole('tooltip')).toHaveTextContent('Следующий месяц')
	})

	it('клик по кнопкам по-прежнему листает календарь', async () => {
		const user = userEvent.setup()
		const { container } = renderPanel()
		const calendar = () => container.querySelector('.base-calendar') as HTMLElement

		await user.click(screen.getByRole('button', { name: 'Следующий месяц' }))
		expect(calendar()).toHaveAttribute('data-month', '1')
		await user.click(screen.getByRole('button', { name: 'Предыдущий месяц' }))
		await user.click(screen.getByRole('button', { name: 'Предыдущий месяц' }))
		expect(calendar()).toHaveAttribute('data-month', '11')
		expect(calendar()).toHaveAttribute('data-year', '2025')
		await user.click(screen.getByRole('button', { name: 'Следующий год' }))
		expect(calendar()).toHaveAttribute('data-year', '2026')
		await user.click(screen.getByRole('button', { name: 'Предыдущий год' }))
		expect(calendar()).toHaveAttribute('data-year', '2025')
	})
})
