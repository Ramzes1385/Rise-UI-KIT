import { setLocale } from '@/locales/state'
import { computed, nextTick, ref } from 'vue'
import { useDatePickerRange } from '../../model/range/useDatePickerRange'
import type { BaseDatePickerCalendarConfig } from '../../types/BaseDatePickerCalendar.types'
import type { DatePickerRangeResolved, UseDatePickerRangeOptions } from '../../types/DatePickerRange.types'

const CONFIG: BaseDatePickerCalendarConfig = {
	minDate: null,
	maxDate: null,
	disabledDates: [],
	disabledWeekdays: [],
	disableFrom: null,
	disableTo: null,
	highlights: [],
	weekends: null,
	firstDayOfWeek: 1,
	locale: 'ru-RU',
	showTime: false,
	showSeconds: false,
	is24Hour: true,
	showWeekNumber: false,
}

function setup(resolved: Partial<DatePickerRangeResolved> = {}, config: Partial<BaseDatePickerCalendarConfig> = {}) {
	const activeValue = ref<Date | null>(null)
	const activeValueEnd = ref<Date | null>(null)
	const actions = {
		handleClear: vi.fn(),
		handleModelUpdate: vi.fn((value: Date | null) => {
			activeValue.value = value
		}),
		handleModelEndUpdate: vi.fn((value: Date | null) => {
			activeValueEnd.value = value
		}),
		handleRangeSelect: vi.fn(),
	}
	const emit = vi.fn()
	const options: UseDatePickerRangeOptions = {
		resolvedProps: computed(() => ({
			selectionMode: 'range',
			presets: true,
			minDays: null,
			maxDays: null,
			isReadonly: false,
			isDisabled: false,
			...resolved,
		})),
		calendarConfig: computed(() => ({ ...CONFIG, ...config })),
		isOpen: ref(true),
		activeValue: computed(() => activeValue.value),
		activeValueEnd: computed(() => activeValueEnd.value),
		displayValue: computed(() => (activeValue.value ? 'значение' : '')),
		actions,
		emit,
	}
	return { range: useDatePickerRange(options), actions, emit, activeValue, activeValueEnd }
}

afterEach(() => {
	setLocale('ru')
})

describe('useDatePickerRange', () => {
	it('в режиме single периодов нет', () => {
		const single = setup({ selectionMode: 'single' })
		expect(single.range.presetItems.value).toEqual([])
		expect(single.range.isFieldEditable.value).toBe(false)
	})

	it('поле редактируется только в режиме range без isReadonly и isDisabled', () => {
		expect(setup().range.isFieldEditable.value).toBe(true)
		expect(setup({ isReadonly: true }).range.isFieldEditable.value).toBe(false)
		expect(setup({ isDisabled: true }).range.isFieldEditable.value).toBe(false)
	})

	it('выбор неизвестного или отключённого периода игнорируется', () => {
		const { range, actions, emit } = setup({ presets: true, maxDays: 2 })
		range.handlePresetSelect('нет-такого')
		range.handlePresetSelect('last7days')
		expect(actions.handleRangeSelect).not.toHaveBeenCalled()
		expect(emit).not.toHaveBeenCalled()
		range.handlePresetSelect('today')
		expect(actions.handleRangeSelect).toHaveBeenCalledTimes(1)
		expect(emit).toHaveBeenCalledWith('preset-select', 'today', expect.any(Date), expect.any(Date))
	})

	it('набранный текст показывается в поле, отмена возвращает значение', () => {
		const { range } = setup()
		expect(range.fieldText.value).toBe('')
		range.handleTextInput('01.1')
		expect(range.hasDraft.value).toBe(true)
		expect(range.fieldText.value).toBe('01.1')
		range.handleTextCancel()
		expect(range.hasDraft.value).toBe(false)
		expect(range.fieldText.value).toBe('')
	})

	it('commit без набранного текста ничего не делает', () => {
		const { range, actions, emit } = setup()
		range.handleTextCommit()
		expect(actions.handleRangeSelect).not.toHaveBeenCalled()
		expect(emit).not.toHaveBeenCalled()
	})

	it('commit применяет период через handleRangeSelect, а одну дату — через handleModelUpdate', () => {
		const { range, actions } = setup()
		range.handleTextInput('01.10.2026 — 02.10.2026')
		range.handleTextCommit()
		expect(actions.handleRangeSelect).toHaveBeenCalledWith(new Date(2026, 9, 1), new Date(2026, 9, 2))
		expect(range.hasDraft.value).toBe(false)
		range.handleTextInput('05.10.2026')
		range.handleTextCommit()
		expect(actions.handleModelUpdate).toHaveBeenCalledWith(new Date(2026, 9, 5))
		expect(actions.handleModelEndUpdate).toHaveBeenCalledWith(null)
	})

	it('commit пустого текста очищает значение', () => {
		const { range, actions } = setup()
		range.handleTextInput('  ')
		range.handleTextCommit()
		expect(actions.handleClear).toHaveBeenCalledTimes(1)
		expect(range.hasDraft.value).toBe(false)
	})

	it('commit текста, равного значению в поле, только снимает черновик', () => {
		const { range, actions, emit, activeValue } = setup()
		activeValue.value = new Date(2026, 9, 1)
		range.handleTextInput('значение')
		range.handleTextCommit()
		expect(range.hasDraft.value).toBe(false)
		expect(emit).not.toHaveBeenCalled()
		expect(actions.handleRangeSelect).not.toHaveBeenCalled()
	})

	it('ошибка остаётся вместе с черновиком и уходит при вводе, отмене и смене значения', async () => {
		const { range, emit, activeValue } = setup({ minDays: 3 })
		range.handleTextInput('01.10.2026 — 02.10.2026')
		range.handleTextCommit()
		expect(emit).toHaveBeenCalledWith('input-invalid', 'min-days', '01.10.2026 — 02.10.2026')
		expect(range.inputError.value).toBe('Период короче допустимого: минимум 3 дня')
		expect(range.hasDraft.value).toBe(true)
		range.handleTextInput('01.10.2026 — 0')
		expect(range.inputError.value).toBe('')
		range.handleTextCommit()
		expect(range.inputError.value).toContain('Не удалось разобрать период')
		activeValue.value = new Date(2026, 9, 9)
		await nextTick()
		expect(range.inputError.value).toBe('')
		expect(range.hasDraft.value).toBe(false)
	})

	it('тексты ошибок берутся из словаря текущего языка', () => {
		setLocale('en')
		const { range } = setup({ maxDays: 1 }, { locale: 'en-US' })
		range.handleTextInput('10/01/2026 - 10/05/2026')
		range.handleTextCommit()
		expect(range.inputError.value).toBe('The period is too long: at most 1 day')
		range.handleTextInput('x')
		range.handleTextCommit()
		expect(range.inputError.value).toBe('Could not read the period. Example: 11/25/2000 — 12/03/2000')
	})

	it('недоступная единственная дата отклоняется, а minDays для неё не проверяется', () => {
		const { range, actions, emit } = setup({ minDays: 5 }, { disabledWeekdays: [4] })
		range.handleTextInput('01.10.2026')
		range.handleTextCommit()
		expect(emit).toHaveBeenCalledWith('input-invalid', 'unavailable', '01.10.2026')
		expect(range.inputError.value).toBe('Эти даты недоступны для выбора')
		range.handleTextInput('02.10.2026')
		range.handleTextCommit()
		expect(actions.handleModelUpdate).toHaveBeenCalledWith(new Date(2026, 9, 2))
	})
})
