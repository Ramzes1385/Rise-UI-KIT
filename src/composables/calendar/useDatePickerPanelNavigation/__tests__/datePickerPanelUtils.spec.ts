import {
	baseForMonth,
	baseForYear,
	buildMonthItems,
	formatDisplayYear,
	monthStart,
	normalizeMonthsCount,
	resolveBaseDate,
} from '../datePickerPanelUtils'

function sources(values: { modelValue?: Date | null; modelValueEnd?: Date | null; selectedDates?: Date[] }) {
	return {
		isOpen: () => true,
		modelValue: () => values.modelValue,
		modelValueEnd: () => values.modelValueEnd,
		selectedDates: () => values.selectedDates,
		monthsCount: () => 1,
	}
}

describe('datePickerPanelUtils', () => {
	it('monthStart должен вернуть первое число со сдвигом на месяцы и годы', () => {
		const base = new Date(2024, 10, 15)
		expect(monthStart(base, 0)).toEqual(new Date(2024, 10, 1))
		expect(monthStart(base, 2)).toEqual(new Date(2025, 0, 1))
		expect(monthStart(base, -1, -1)).toEqual(new Date(2023, 9, 1))
	})

	it('resolveBaseDate должен брать значение, затем конец диапазона, затем первую выбранную дату', () => {
		expect(resolveBaseDate(sources({ modelValue: new Date(2024, 3, 9), modelValueEnd: new Date(2024, 5, 1) }))).toEqual(
			new Date(2024, 3, 1),
		)
		expect(resolveBaseDate(sources({ modelValueEnd: new Date(2024, 5, 20) }))).toEqual(new Date(2024, 5, 1))
		expect(resolveBaseDate(sources({ selectedDates: [new Date(2024, 7, 3)] }))).toEqual(new Date(2024, 7, 1))
	})

	it('resolveBaseDate без значений должен вернуть начало текущего месяца', () => {
		const now = new Date()
		expect(resolveBaseDate(sources({}))).toEqual(new Date(now.getFullYear(), now.getMonth(), 1))
	})

	it('normalizeMonthsCount должен вернуть целое не меньше 1', () => {
		expect(normalizeMonthsCount(3)).toBe(3)
		expect(normalizeMonthsCount(2.7)).toBe(2)
		expect(normalizeMonthsCount(0)).toBe(1)
		expect(normalizeMonthsCount(Number.POSITIVE_INFINITY)).toBe(1)
		expect(normalizeMonthsCount('3')).toBe(1)
	})

	it('formatDisplayYear должен показать диапазон лет, если месяцы переходят через год', () => {
		expect(formatDisplayYear(new Date(2024, 0, 1), 3)).toBe('2024')
		expect(formatDisplayYear(new Date(2024, 10, 1), 3)).toBe('2024 - 2025')
	})

	it('buildMonthItems должен построить месяцы подряд с ключами', () => {
		expect(buildMonthItems(new Date(2024, 11, 1), 2)).toEqual([
			{ key: '2024-11', month: 11, year: 2024 },
			{ key: '2025-0', month: 0, year: 2025 },
		])
	})

	it('baseForMonth должен сдвинуть базу так, чтобы календарь itemIndex показал выбранный месяц', () => {
		expect(baseForMonth(new Date(2024, 10, 1), 3, 1)).toEqual(new Date(2024, 2, 1))
		expect(baseForMonth(new Date(2024, 0, 1), 5, 0)).toEqual(new Date(2024, 5, 1))
	})

	it('baseForYear должен сдвинуть базу на разницу лет календаря itemIndex', () => {
		expect(baseForYear(new Date(2024, 11, 1), 2027, 1)).toEqual(new Date(2026, 11, 1))
		expect(baseForYear(new Date(2024, 3, 1), 2020, 0)).toEqual(new Date(2020, 3, 1))
	})
})
