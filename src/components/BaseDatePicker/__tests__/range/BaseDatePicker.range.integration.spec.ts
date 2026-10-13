import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import userEvent from '@testing-library/user-event'
import BaseDatePicker from '../../ui/BaseDatePicker.vue'
import { DEFAULTS_KEY } from '@composables/base/useDefaults'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/vue'

const TODAY = new Date(2026, 9, 13, 12, 0)

function day(offset: number): Date {
	return new Date(2026, 9, 13 + offset)
}

function getPanel(): HTMLElement {
	const panel = document.body.querySelector<HTMLElement>('.date-picker-panel')
	if (!panel) throw new Error('Панель date picker не открылась')
	return panel
}

async function openPanel(label = 'Период'): Promise<HTMLElement> {
	await fireEvent.click(screen.getByLabelText(label))
	return getPanel()
}

function getPreset(panel: HTMLElement, name: string | RegExp): HTMLElement {
	return within(within(panel).getByRole('group', { name: 'Готовые периоды' })).getByRole('button', { name })
}

function getDay(panel: HTMLElement, dayNumber: number, calendarIndex = 0): HTMLButtonElement {
	const calendar = panel.querySelectorAll<HTMLElement>('.base-calendar')[calendarIndex]
	const buttons = Array.from(calendar.querySelectorAll<HTMLButtonElement>('.base-calendar__day:not(.base-calendar__day--other)'))
	const button = buttons.find(item => item.textContent?.trim() === String(dayNumber))
	if (!button) throw new Error(`День ${dayNumber} не найден`)
	return button
}

beforeEach(() => {
	vi.useFakeTimers({ toFake: ['Date'] })
	vi.setSystemTime(TODAY)
})

afterEach(() => {
	vi.useRealTimers()
	vi.restoreAllMocks()
})

describe('BaseDatePicker: готовые периоды', () => {
	it('без presets панель диапазона не показывает группу периодов', async () => {
		render(BaseDatePicker, { props: { label: 'Период', selectionMode: 'range' } })
		const panel = await openPanel()
		expect(within(panel).queryByRole('group', { name: 'Готовые периоды' })).not.toBeInTheDocument()
		expect(panel).not.toHaveClass('date-picker-panel--presets')
	})

	it('presets=true: шесть встроенных периодов группой кнопок', async () => {
		render(BaseDatePicker, { props: { label: 'Период', selectionMode: 'range', presets: true } })
		const panel = await openPanel()
		const group = within(panel).getByRole('group', { name: 'Готовые периоды' })
		const labels = within(group)
			.getAllByRole('button')
			.map(button => button.textContent?.trim())
		expect(labels).toEqual(['Сегодня', 'Вчера', '7 дней', '30 дней', 'Этот месяц', 'Прошлый месяц'])
		expect(panel).toHaveClass('date-picker-panel--presets')
	})

	it('в режиме single готовых периодов нет, даже при presets=true', async () => {
		render(BaseDatePicker, { props: { label: 'Период', presets: true } })
		const panel = await openPanel()
		expect(within(panel).queryByRole('group', { name: 'Готовые периоды' })).not.toBeInTheDocument()
	})

	it('клик по периоду ставит диапазон, шлёт события и закрывает панель', async () => {
		const { emitted } = render(BaseDatePicker, { props: { label: 'Период', selectionMode: 'range', presets: true } })
		const panel = await openPanel()
		await fireEvent.click(getPreset(panel, '7 дней'))

		expect(emitted()['update:modelValue']).toEqual([[day(-6)]])
		expect(emitted()['update:modelValueEnd']).toEqual([[day(0)]])
		expect(emitted()['range-select']).toEqual([[day(-6), day(0)]])
		expect(emitted()['preset-select']).toEqual([['last7days', day(-6), day(0)]])
		expect(screen.getByLabelText('Период')).toHaveValue('07.10.2026 — 13.10.2026')
		await waitFor(() => expect(document.body.querySelector('.date-picker-panel')).not.toBeInTheDocument())
	})

	it.each([
		['Сегодня', day(0), day(0)],
		['Вчера', day(-1), day(-1)],
		['30 дней', day(-29), day(0)],
		['Этот месяц', new Date(2026, 9, 1), new Date(2026, 9, 31)],
		['Прошлый месяц', new Date(2026, 8, 1), new Date(2026, 8, 30)],
	])('период «%s» считает границы от сегодняшней даты', async (name, start, end) => {
		const { emitted } = render(BaseDatePicker, { props: { label: 'Период', selectionMode: 'range', presets: true } })
		const panel = await openPanel()
		await fireEvent.click(getPreset(panel, name))
		expect(emitted()['range-select']).toEqual([[start, end]])
	})

	it('активный период подсвечен и отмечен aria-pressed', async () => {
		render(BaseDatePicker, {
			props: { label: 'Период', selectionMode: 'range', presets: true, modelValue: day(-1), modelValueEnd: day(-1) },
		})
		const panel = await openPanel()
		const yesterday = getPreset(panel, 'Вчера')
		expect(yesterday).toHaveAttribute('aria-pressed', 'true')
		expect(yesterday).toHaveClass('date-picker-panel__preset--active')
		expect(getPreset(panel, 'Сегодня')).toHaveAttribute('aria-pressed', 'false')
	})

	it('период выбирается с клавиатуры: фокус на кнопке и Enter', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseDatePicker, { props: { label: 'Период', selectionMode: 'range', presets: true } })
		const panel = await openPanel()
		getPreset(panel, 'Сегодня').focus()
		await user.keyboard('{Enter}')
		expect(emitted()['preset-select']).toEqual([['today', day(0), day(0)]])
	})

	it('свой список: встроенный период строкой, свой — объектом (range и getRange)', async () => {
		const getRange = vi.fn((today: Date) => ({ start: new Date(today.getFullYear(), 0, 1), end: today }))
		render(BaseDatePicker, {
			props: {
				label: 'Период',
				selectionMode: 'range',
				presets: [
					'yesterday',
					{ id: 'week', label: 'Неделя', range: { start: day(-3), end: day(3) } },
					{ id: 'ytd', label: 'С начала года', getRange },
				],
			},
		})
		const panel = await openPanel()
		const labels = within(within(panel).getByRole('group', { name: 'Готовые периоды' }))
			.getAllByRole('button')
			.map(button => button.textContent?.trim())
		expect(labels).toEqual(['Вчера', 'Неделя', 'С начала года'])
		expect(getRange).toHaveBeenCalledWith(new Date(2026, 9, 13))
	})

	it('пропускает период без range и getRange, с неизвестным id и повторный — с предупреждением', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		render(BaseDatePicker, {
			props: {
				label: 'Период',
				selectionMode: 'range',
				presets: ['today', 'today', { id: 'empty', label: 'Пусто' }, 'unknown' as 'today'],
			},
		})
		const panel = await openPanel()
		expect(within(within(panel).getByRole('group', { name: 'Готовые периоды' })).getAllByRole('button')).toHaveLength(1)
		expect(warn).toHaveBeenCalledTimes(3)
		expect(warn.mock.calls[0][0]).toContain('период «today» пропущен')
	})

	it('период, нарушающий maxDays или minDate, отключён и не выбирается', async () => {
		const { emitted } = render(BaseDatePicker, {
			props: { label: 'Период', selectionMode: 'range', presets: true, maxDays: 3, minDate: day(-1) },
		})
		const panel = await openPanel()
		expect(getPreset(panel, '7 дней')).toBeDisabled()
		expect(getPreset(panel, 'Вчера')).toBeEnabled()
		expect(getPreset(panel, 'Прошлый месяц')).toBeDisabled()
		await fireEvent.click(getPreset(panel, '7 дней'))
		expect(emitted()['preset-select']).toBeUndefined()
	})

	it('minDays отключает однодневные периоды', async () => {
		render(BaseDatePicker, { props: { label: 'Период', selectionMode: 'range', presets: true, minDays: 2 } })
		const panel = await openPanel()
		expect(getPreset(panel, 'Сегодня')).toBeDisabled()
		expect(getPreset(panel, '7 дней')).toBeEnabled()
	})

	it('defaults плагина включают presets', async () => {
		render(BaseDatePicker, {
			props: { label: 'Период', selectionMode: 'range' },
			global: { provide: { [DEFAULTS_KEY]: { BaseDatePicker: { presets: true } } } },
		})
		const panel = await openPanel()
		expect(within(panel).getByRole('group', { name: 'Готовые периоды' })).toBeInTheDocument()
	})

	it('showTime оставляет панель открытой после выбора периода', async () => {
		const { emitted } = render(BaseDatePicker, { props: { label: 'Период', selectionMode: 'range', presets: true, showTime: true } })
		const panel = await openPanel()
		await fireEvent.click(getPreset(panel, 'Вчера'))
		expect(emitted()['preset-select']).toHaveLength(1)
		expect(getPanel()).toBeInTheDocument()
	})
})

describe('BaseDatePicker: число месяцев', () => {
	it('monthsShown=2 показывает два месяца рядом независимо от ширины поля', async () => {
		render(BaseDatePicker, { props: { label: 'Период', selectionMode: 'range', monthsShown: 2, modelValue: day(0) } })
		const panel = await openPanel()
		expect(panel.querySelectorAll('.base-calendar')).toHaveLength(2)
		expect(panel).toHaveClass('date-picker-panel--multi')
	})

	it('monthsShown=1 оставляет один месяц, дробное значение округляется вниз', async () => {
		const { unmount } = render(BaseDatePicker, { props: { label: 'Период', selectionMode: 'range', monthsShown: 1 } })
		expect((await openPanel()).querySelectorAll('.base-calendar')).toHaveLength(1)
		unmount()
		render(BaseDatePicker, { props: { label: 'Период', selectionMode: 'range', monthsShown: 2.9 } })
		expect((await openPanel()).querySelectorAll('.base-calendar')).toHaveLength(2)
	})
})

describe('BaseDatePicker: minDays и maxDays в календаре', () => {
	it('после выбора начала отключает слишком близкие и слишком далёкие дни', async () => {
		render(BaseDatePicker, {
			props: { label: 'Период', selectionMode: 'range', modelValue: day(0), modelValueEnd: null, minDays: 3, maxDays: 5 },
		})
		const panel = await openPanel()
		for (const blocked of [12, 13, 14]) expect(getDay(panel, blocked)).toBeDisabled()
		for (const allowed of [9, 10, 11, 15, 16, 17]) expect(getDay(panel, allowed)).toBeEnabled()
		expect(getDay(panel, 18)).toBeDisabled()
		expect(getDay(panel, 8)).toBeDisabled()
	})

	it('учитывает minDate и disabledDates вместе с пределами', async () => {
		render(BaseDatePicker, {
			props: {
				label: 'Период',
				selectionMode: 'range',
				modelValue: day(0),
				modelValueEnd: null,
				maxDays: 10,
				minDate: day(-2),
				disabledDates: [day(5)],
			},
		})
		const panel = await openPanel()
		expect(getDay(panel, 11)).toBeEnabled()
		expect(getDay(panel, 10)).toBeDisabled()
		expect(getDay(panel, 18)).toBeDisabled()
		expect(getDay(panel, 22)).toBeEnabled()
		expect(getDay(panel, 23)).toBeDisabled()
	})

	it('maxDays без minDays не отключает близкие дни; только minDays не сужает границы', async () => {
		const { unmount } = render(BaseDatePicker, {
			props: { label: 'Период', selectionMode: 'range', modelValue: day(0), modelValueEnd: null, maxDays: 2 },
		})
		let panel = await openPanel()
		expect(getDay(panel, 13)).toBeEnabled()
		expect(getDay(panel, 14)).toBeEnabled()
		expect(getDay(panel, 15)).toBeDisabled()
		unmount()
		render(BaseDatePicker, {
			props: { label: 'Период', selectionMode: 'range', modelValue: day(0), modelValueEnd: null, minDays: 2 },
		})
		panel = await openPanel()
		expect(getDay(panel, 13)).toBeDisabled()
		expect(getDay(panel, 14)).toBeEnabled()
		expect(getDay(panel, 31)).toBeEnabled()
	})

	it('когда диапазон уже выбран целиком, ограничения не применяются к новому началу', async () => {
		render(BaseDatePicker, {
			props: { label: 'Период', selectionMode: 'range', modelValue: day(0), modelValueEnd: day(3), minDays: 3, maxDays: 5 },
		})
		const panel = await openPanel()
		expect(getDay(panel, 1)).toBeEnabled()
		expect(getDay(panel, 30)).toBeEnabled()
	})

	it('maxDays меньше minDays приравнивается к minDays', async () => {
		render(BaseDatePicker, {
			props: { label: 'Период', selectionMode: 'range', modelValue: day(0), modelValueEnd: null, minDays: 3, maxDays: 1 },
		})
		const panel = await openPanel()
		expect(getDay(panel, 12)).toBeDisabled()
		expect(getDay(panel, 14)).toBeDisabled()
		expect(getDay(panel, 11)).toBeEnabled()
		expect(getDay(panel, 15)).toBeEnabled()
		expect(getDay(panel, 16)).toBeDisabled()
	})

	it('клик по доступному дню завершает диапазон нужной длины', async () => {
		const { emitted } = render(BaseDatePicker, {
			props: { label: 'Период', selectionMode: 'range', modelValue: day(0), modelValueEnd: null, minDays: 3 },
		})
		const panel = await openPanel()
		await fireEvent.click(getDay(panel, 14))
		expect(emitted()['range-select']).toBeUndefined()
		await fireEvent.click(getDay(panel, 15))
		expect(emitted()['range-select']).toEqual([[day(0), day(2)]])
	})
})

describe('BaseDatePicker: ввод периода с клавиатуры', () => {
	const inputProps = { label: 'Период', selectionMode: 'range' as const, isReadonly: false }

	async function typeText(text: string, key = '{Enter}') {
		const user = userEvent.setup()
		const input = screen.getByLabelText('Период') as HTMLInputElement
		await user.clear(input)
		if (text) await user.type(input, text)
		if (key) await user.keyboard(key)
		return { user, input }
	}

	it('по умолчанию поле только для чтения и ввода нет', async () => {
		render(BaseDatePicker, { props: { label: 'Период', selectionMode: 'range' } })
		expect(screen.getByLabelText('Период')).toHaveAttribute('readonly')
	})

	it('Enter применяет «дата — дата»: события, значение в поле, без ошибки', async () => {
		const { emitted } = render(BaseDatePicker, { props: inputProps })
		const { input } = await typeText('01.10.2026 — 05.10.2026')
		expect(emitted()['update:modelValue']).toEqual([[new Date(2026, 9, 1)]])
		expect(emitted()['update:modelValueEnd']).toEqual([[new Date(2026, 9, 5)]])
		expect(emitted()['range-select']).toEqual([[new Date(2026, 9, 1), new Date(2026, 9, 5)]])
		expect(input).toHaveValue('01.10.2026 — 05.10.2026')
		expect(input).not.toHaveAttribute('aria-invalid', 'true')
	})

	it('понимает дефис, короткое тире и разные разделители дат', async () => {
		const { emitted } = render(BaseDatePicker, { props: inputProps })
		await typeText('1/10/2026-5-10-2026')
		await typeText('02.10.2026 - 06.10.2026')
		await typeText('03.10.2026 – 07.10.2026')
		expect(emitted()['range-select']).toEqual([
			[new Date(2026, 9, 1), new Date(2026, 9, 5)],
			[new Date(2026, 9, 2), new Date(2026, 9, 6)],
			[new Date(2026, 9, 3), new Date(2026, 9, 7)],
		])
	})

	it('меняет местами конец раньше начала', async () => {
		const { emitted } = render(BaseDatePicker, { props: inputProps })
		await typeText('10.10.2026 — 05.10.2026')
		expect(emitted()['range-select']).toEqual([[new Date(2026, 9, 5), new Date(2026, 9, 10)]])
	})

	it('одна дата или «дата — ...» задают только начало', async () => {
		const { emitted } = render(BaseDatePicker, { props: inputProps })
		await typeText('04.10.2026 — ...')
		expect(emitted()['update:modelValue']).toEqual([[new Date(2026, 9, 4)]])
		expect(emitted()['update:modelValueEnd']).toEqual([[null]])
		expect(emitted()['range-select']).toBeUndefined()
	})

	it('уход из поля применяет набранный текст', async () => {
		const { emitted } = render(BaseDatePicker, { props: inputProps })
		const { user } = await typeText('01.10.2026 — 02.10.2026', '')
		await user.tab()
		expect(emitted()['range-select']).toEqual([[new Date(2026, 9, 1), new Date(2026, 9, 2)]])
	})

	it('нечитаемый текст остаётся в поле с ошибкой и событием input-invalid', async () => {
		const { emitted } = render(BaseDatePicker, { props: inputProps })
		const { input } = await typeText('31.02.2026 — 03.03.2026')
		expect(emitted()['input-invalid']).toEqual([['format', '31.02.2026 — 03.03.2026']])
		expect(emitted()['range-select']).toBeUndefined()
		expect(input).toHaveValue('31.02.2026 — 03.03.2026')
		expect(await screen.findByText('Не удалось разобрать период. Пример: 25.11.2000 — 03.12.2000')).toBeInTheDocument()
		expect(input).toHaveAttribute('aria-invalid', 'true')
	})

	it('внешняя ошибка не затирается ошибкой ввода', async () => {
		render(BaseDatePicker, { props: { ...inputProps, error: 'Обязательное поле' } })
		await typeText('abc')
		expect(screen.getByText('Обязательное поле')).toBeInTheDocument()
	})

	it('отклоняет недоступные даты, слишком короткий и слишком длинный период', async () => {
		const { emitted } = render(BaseDatePicker, { props: { ...inputProps, minDate: new Date(2026, 9, 2), minDays: 2, maxDays: 4 } })
		await typeText('01.10.2026 — 03.10.2026')
		expect(await screen.findByText('Эти даты недоступны для выбора')).toBeInTheDocument()
		await typeText('03.10.2026 — 03.10.2026')
		expect(await screen.findByText('Период короче допустимого: минимум 2 дня')).toBeInTheDocument()
		await typeText('03.10.2026 — 09.10.2026')
		expect(await screen.findByText('Период длиннее допустимого: максимум 4 дня')).toBeInTheDocument()
		expect(emitted()['input-invalid']).toEqual([
			['unavailable', '01.10.2026 — 03.10.2026'],
			['min-days', '03.10.2026 — 03.10.2026'],
			['max-days', '03.10.2026 — 09.10.2026'],
		])
		expect(emitted()['range-select']).toBeUndefined()
	})

	it('одна дата проходит minDays, но не недоступную дату', async () => {
		const { emitted } = render(BaseDatePicker, { props: { ...inputProps, disabledWeekdays: [0], minDays: 3 } })
		await typeText('04.10.2026')
		expect(emitted()['input-invalid']).toEqual([['unavailable', '04.10.2026']])
		await typeText('05.10.2026')
		expect(emitted()['update:modelValue']).toEqual([[new Date(2026, 9, 5)]])
	})

	it('пустой текст очищает диапазон', async () => {
		const { emitted } = render(BaseDatePicker, {
			props: { ...inputProps, modelValue: new Date(2026, 9, 1), modelValueEnd: new Date(2026, 9, 5) },
		})
		await typeText('')
		expect(emitted().clear).toHaveLength(1)
		expect(emitted()['update:modelValue']).toEqual([[null]])
	})

	it('Escape отменяет набранный текст и возвращает значение', async () => {
		const { emitted } = render(BaseDatePicker, {
			props: { ...inputProps, modelValue: new Date(2026, 9, 1), modelValueEnd: new Date(2026, 9, 5) },
		})
		const { input } = await typeText('12', '{Escape}')
		expect(input).toHaveValue('01.10.2026 — 05.10.2026')
		expect(emitted()['range-select']).toBeUndefined()
	})

	it('текст, равный показанному значению, ничего не меняет', async () => {
		const { emitted } = render(BaseDatePicker, {
			props: { ...inputProps, modelValue: new Date(2026, 9, 1), modelValueEnd: new Date(2026, 9, 5) },
		})
		await typeText('01.10.2026 — 05.10.2026')
		expect(emitted()['range-select']).toBeUndefined()
		expect(emitted()['input-invalid']).toBeUndefined()
	})

	it('Enter без набранного текста открывает панель, как раньше', async () => {
		const user = userEvent.setup()
		render(BaseDatePicker, { props: inputProps })
		screen.getByLabelText('Период').focus()
		await user.keyboard('{Enter}')
		await waitFor(() => expect(getPanel()).toBeInTheDocument())
	})

	it('showTime читает время; без showTime время в тексте отклоняется', async () => {
		const { emitted, unmount } = render(BaseDatePicker, { props: { ...inputProps, showTime: true } })
		await typeText('01.10.2026, 09:30 — 02.10.2026, 18:45')
		expect(emitted()['range-select']).toEqual([[new Date(2026, 9, 1, 9, 30), new Date(2026, 9, 2, 18, 45)]])
		unmount()
		const second = render(BaseDatePicker, { props: inputProps })
		await typeText('01.10.2026, 09:30 — 02.10.2026')
		expect(second.emitted()['input-invalid']).toHaveLength(1)
	})

	it('в режиме single ввод вручную остаётся выключенным', async () => {
		const { emitted } = render(BaseDatePicker, { props: { label: 'Период', isReadonly: false } })
		const user = userEvent.setup()
		await user.type(screen.getByLabelText('Период'), '01.10.2026{Enter}')
		await nextTick()
		expect(emitted()['update:modelValue']).toBeUndefined()
		expect(emitted()['input-invalid']).toBeUndefined()
	})

	it('выбор в панели сбрасывает набранный текст и ошибку', async () => {
		render(BaseDatePicker, { props: { ...inputProps, modelValue: day(0), modelValueEnd: null } })
		const { input } = await typeText('abc')
		expect(input).toHaveAttribute('aria-invalid', 'true')
		const panel = await openPanel()
		await fireEvent.click(getDay(panel, 20))
		expect(input).not.toHaveAttribute('aria-invalid', 'true')
		expect(input).toHaveValue('13.10.2026 — ...')
	})
})
