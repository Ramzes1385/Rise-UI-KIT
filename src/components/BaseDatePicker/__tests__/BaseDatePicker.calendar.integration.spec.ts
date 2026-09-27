/**
 * Интеграционные тесты связки BaseDatePicker → DatePickerPanel → BaseCalendar.
 * Рендерятся реальные дочерние компоненты (без stub'ов и моков): проверяется, что
 * календарные настройки date picker действительно доходят до BaseCalendar
 * (регрессия 1.2.2 — панель передавала удалённые плоские props, которые уходили в $attrs).
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import BaseDatePicker from '../ui/BaseDatePicker.vue'

/** Открыть панель кликом по полю ввода */
async function openPanel(): Promise<HTMLElement> {
	await fireEvent.click(screen.getByPlaceholderText('Выберите дату'))
	const panel = document.body.querySelector<HTMLElement>('.date-picker-panel')
	if (!panel) throw new Error('Панель date picker не открылась')
	return panel
}

/** Найти кнопку дня текущего месяца по числу */
function getCurrentMonthDay(panel: HTMLElement, day: number): HTMLButtonElement {
	const buttons = Array.from(
		panel.querySelectorAll<HTMLButtonElement>('.base-calendar__day:not(.base-calendar__day--other)'),
	)
	const button = buttons.find(item => item.textContent?.trim() === String(day))
	if (!button) throw new Error(`День ${day} не найден в сетке`)
	return button
}

describe('BaseDatePicker + реальный BaseCalendar', () => {
	it('minDate: дата раньше minDate недоступна для выбора', async () => {
		const { emitted } = render(BaseDatePicker, {
			props: {
				modelValue: new Date(2026, 8, 25),
				minDate: new Date(2026, 8, 20),
			},
		})

		const panel = await openPanel()
		const beforeMin = getCurrentMonthDay(panel, 10)

		expect(beforeMin).toBeDisabled()
		expect(getCurrentMonthDay(panel, 20)).toBeEnabled()

		await fireEvent.click(beforeMin)
		expect(emitted()['update:modelValue']).toBeUndefined()
	})

	it('maxDate и disabledWeekdays блокируют соответствующие дни', async () => {
		render(BaseDatePicker, {
			props: {
				modelValue: new Date(2026, 8, 10),
				maxDate: new Date(2026, 8, 20),
				// 13.09.2026 — воскресенье
				disabledWeekdays: [0],
			},
		})

		const panel = await openPanel()

		expect(getCurrentMonthDay(panel, 25)).toBeDisabled()
		expect(getCurrentMonthDay(panel, 13)).toBeDisabled()
		expect(getCurrentMonthDay(panel, 14)).toBeEnabled()
	})

	it('showTime: показывает блок времени и сохраняет время значения при выборе другого дня', async () => {
		const { emitted } = render(BaseDatePicker, {
			props: {
				modelValue: new Date(2026, 8, 25, 14, 30),
				showTime: true,
			},
		})

		const panel = await openPanel()
		const timeInputs = panel.querySelectorAll<HTMLInputElement>('.base-calendar__time input')
		expect(timeInputs).toHaveLength(2)
		expect(timeInputs[0].value).toBe('14')
		expect(timeInputs[1].value).toBe('30')

		await fireEvent.click(getCurrentMonthDay(panel, 10))

		const updates = emitted()['update:modelValue'] as [Date][]
		const selected = updates.at(-1)![0]
		expect(selected.getDate()).toBe(10)
		expect(selected.getHours()).toBe(14)
		expect(selected.getMinutes()).toBe(30)
	})

	it('showWeekNumber: показывает номера недель', async () => {
		render(BaseDatePicker, {
			props: { modelValue: new Date(2026, 8, 25), showWeekNumber: true },
		})

		const panel = await openPanel()
		expect(panel.querySelectorAll('.base-calendar__week-num')).toHaveLength(6)
	})

	it('календарь внутри панели не дублирует навигацию панели', async () => {
		render(BaseDatePicker, {
			props: { modelValue: new Date(2026, 8, 25) },
		})

		const panel = await openPanel()

		// Навигация по месяцам/годам — только кнопки шапки панели
		expect(panel.querySelectorAll('.base-calendar__nav-btn')).toHaveLength(0)
		expect(panel.querySelectorAll('.base-calendar__title-btn')).toHaveLength(0)
		expect(panel.querySelectorAll('.date-picker-panel__nav-btn')).toHaveLength(4)
	})
})

describe('BaseDatePicker: клавиатура и фокус', () => {
	it('Enter в поле открывает панель-диалог и переводит фокус на выбранную дату', async () => {
		const user = userEvent.setup()
		render(BaseDatePicker, { props: { modelValue: new Date(2026, 8, 25) } })

		await user.tab()
		expect(screen.getByPlaceholderText('Выберите дату')).toHaveFocus()
		await user.keyboard('{Enter}')

		const dialog = screen.getByRole('dialog', { name: 'Выберите дату' })
		await waitFor(() => expect(getCurrentMonthDay(dialog, 25)).toHaveFocus())
	})

	it('↓ открывает панель, а прочие клавиши — нет', async () => {
		const user = userEvent.setup()
		render(BaseDatePicker, { props: { modelValue: new Date(2026, 8, 25) } })

		await user.tab()
		await user.keyboard('a')
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

		await user.keyboard('{ArrowDown}')
		expect(screen.getByRole('dialog', { name: 'Выберите дату' })).toBeInTheDocument()
	})

	it('выбор даты с клавиатуры закрывает панель и возвращает фокус в поле', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseDatePicker, { props: { modelValue: new Date(2026, 8, 25) } })

		await user.tab()
		await user.keyboard('{Enter}')
		const dialog = screen.getByRole('dialog', { name: 'Выберите дату' })
		await waitFor(() => expect(getCurrentMonthDay(dialog, 25)).toHaveFocus())

		getCurrentMonthDay(dialog, 10).focus()
		await user.keyboard('{Enter}')

		const updates = emitted()['update:modelValue'] as [Date][]
		expect(updates.at(-1)![0].getDate()).toBe(10)
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		expect(screen.getByPlaceholderText('Выберите дату')).toHaveFocus()
	})

	it('Escape закрывает панель и возвращает фокус из панели в поле', async () => {
		const user = userEvent.setup()
		render(BaseDatePicker, { props: { modelValue: new Date(2026, 8, 25) } })

		const panel = await openPanel()
		getCurrentMonthDay(panel, 12).focus()
		await user.keyboard('{Escape}')

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		expect(screen.getByPlaceholderText('Выберите дату')).toHaveFocus()
	})

	it('кнопки-иконки поля имеют доступные имена', () => {
		render(BaseDatePicker, { props: { modelValue: new Date(2026, 8, 25), isClearable: true } })

		expect(screen.getByRole('button', { name: 'Открыть календарь' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Очистить' })).toBeInTheDocument()
	})
})

describe('BaseDatePicker: поле и панель после редизайна', () => {
	it('ручной ввод запрещён нативным readonly, но поле не оформлено как readonly-поле BaseInput', () => {
		const { container } = render(BaseDatePicker, { props: { modelValue: new Date(2026, 8, 25) } })

		expect(screen.getByPlaceholderText('Выберите дату')).toHaveAttribute('readonly')
		expect(container.querySelector('.base-input')).not.toHaveClass('base-input--readonly')
	})

	it('isReadonly=false снимает readonly с поля', () => {
		render(BaseDatePicker, { props: { modelValue: new Date(2026, 8, 25), isReadonly: false } })

		expect(screen.getByPlaceholderText('Выберите дату')).not.toHaveAttribute('readonly')
	})

	it('кнопка календаря сообщает о диалоге и его состоянии: aria-haspopup и aria-expanded', async () => {
		render(BaseDatePicker, { props: { modelValue: new Date(2026, 8, 25) } })
		const button = screen.getByRole('button', { name: 'Открыть календарь' })

		expect(button).toHaveAttribute('aria-haspopup', 'dialog')
		expect(button).toHaveAttribute('aria-expanded', 'false')

		await openPanel()
		expect(button).toHaveAttribute('aria-expanded', 'true')
	})

	it('по умолчанию поле — вариант default, календарь в панели — ghost (без своей рамки)', async () => {
		const { container } = render(BaseDatePicker, { props: { modelValue: new Date(2026, 8, 25) } })

		expect(container.querySelector('.base-input')?.className).not.toMatch(/base-input--(outline|ghost|soft|filled|underline|shadow)/)
		const panel = await openPanel()
		expect(panel.querySelector('.base-calendar')).toHaveClass('base-calendar--ghost')
	})

	it('isMultiMonth: в поле шириной 560px помещаются два месяца, с номерами недель — один', async () => {
		const { container, unmount } = render(BaseDatePicker, { props: { modelValue: new Date(2026, 8, 25), isMultiMonth: true } })
		Object.defineProperty(container.querySelector('.base-date-picker')!, 'clientWidth', { value: 560, configurable: true })

		let panel = await openPanel()
		expect(panel.querySelectorAll('.base-calendar')).toHaveLength(2)
		unmount()

		const second = render(BaseDatePicker, { props: { modelValue: new Date(2026, 8, 25), isMultiMonth: true, showWeekNumber: true } })
		Object.defineProperty(second.container.querySelector('.base-date-picker')!, 'clientWidth', { value: 560, configurable: true })

		panel = await openPanel()
		expect(panel.querySelectorAll('.base-calendar')).toHaveLength(1)
	})
})
