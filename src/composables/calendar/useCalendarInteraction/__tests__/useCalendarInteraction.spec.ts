import { mount } from '@vue/test-utils'
import { useCalendar } from '../../useCalendar'
import { defineComponent, h, nextTick, ref } from 'vue'
import { useCalendarPopover } from '../../useCalendarPopover'
import { useCalendarInteraction } from '../useCalendarInteraction'
import type { CalendarHighlight, CalendarSelectionMode, CalendarWeekday } from '@components/BaseCalendar/types/BaseCalendar.types'

interface SetupOptions {
	selectionMode?: CalendarSelectionMode
	modelValue?: Date | null
	showTime?: boolean
	isDisabled?: boolean
	showDatePopover?: boolean
	disabledDates?: Date[]
	highlights?: CalendarHighlight[]
	today?: Date
}

function setup(config: SetupOptions = {}) {
	const emit = vi.fn()
	const isAm = ref(true)
	let calendar!: ReturnType<typeof useCalendar>
	let popover!: ReturnType<typeof useCalendarPopover>
	let interaction!: ReturnType<typeof useCalendarInteraction>

	mount(
		defineComponent({
			setup() {
				calendar = useCalendar({
					selectionMode: () => config.selectionMode ?? 'single',
					modelValue: () => config.modelValue ?? null,
					modelValueEnd: () => null,
					selectedDates: () => [],
					minDate: () => null,
					maxDate: () => null,
					disabledDates: () => config.disabledDates ?? [],
					disabledWeekdays: () => [],
					disableFrom: () => null,
					disableTo: () => null,
					highlights: () => config.highlights ?? [],
					weekends: () => null,
					firstDayOfWeek: () => 1 as CalendarWeekday,
					locale: () => 'ru-RU',
					initialMonth: () => 4,
					initialYear: () => 2026,
					today: () => config.today,
				})
				popover = useCalendarPopover(calendar)
				interaction = useCalendarInteraction({
					calendar,
					popover,
					getSelectionMode: () => config.selectionMode ?? 'single',
					getShowTime: () => config.showTime ?? false,
					getIsDisabled: () => config.isDisabled ?? false,
					getShowDatePopover: () => config.showDatePopover ?? false,
					isAm,
					emit,
				})
				return () => h('div')
			},
		}),
	)
	return { calendar, popover, interaction, emit, isAm }
}

const day = (d: number, h = 0, m = 0) => new Date(2026, 4, d, h, m)

describe('useCalendarInteraction', () => {
	describe('одиночный выбор', () => {
		it('выбирает день и эмитит date-click и update:modelValue', () => {
			const { calendar, interaction, emit } = setup()
			interaction.handleDayClick(day(10))

			expect(emit).toHaveBeenCalledWith('date-click', day(10))
			expect(emit).toHaveBeenCalledWith('update:modelValue', day(10))
			expect(calendar.internalValue.value).toEqual(day(10))
		})

		it('с выбором времени сохраняет время к выбранному дню', () => {
			const { interaction, emit } = setup({ showTime: true, modelValue: day(1, 14, 30) })
			interaction.handleDayClick(day(12))
			expect(emit).toHaveBeenCalledWith('update:modelValue', day(12, 14, 30))
		})

		it('не реагирует на выключенный день и выключенный календарь', () => {
			const disabledDay = setup({ disabledDates: [day(10)] })
			disabledDay.interaction.handleDayClick(day(10))
			expect(disabledDay.emit).not.toHaveBeenCalledWith('date-click', expect.anything())

			const disabled = setup({ isDisabled: true })
			disabled.interaction.handleDayClick(day(11))
			expect(disabled.emit).not.toHaveBeenCalledWith('date-click', expect.anything())
		})
	})

	describe('поповер дня', () => {
		it('открывается у дня с событием и закрывается повторным кликом', () => {
			const { popover, interaction } = setup({ highlights: [{ date: day(10), label: 'Встреча' }] })
			interaction.handleDayClick(day(10))
			expect(popover.popoverDate.value).toEqual(day(10))
			expect(popover.popoverStyle.value).toEqual({ top: '100%', left: '50%', transform: 'translateX(-50%)' })

			interaction.handleDayClick(day(10))
			expect(popover.popoverDate.value).toBeNull()
		})

		it('при включённом поповере переходит на другой день', () => {
			const { popover, interaction } = setup({ showDatePopover: true })
			interaction.handleDayClick(day(10))
			interaction.handleDayClick(day(11))
			expect(popover.popoverDate.value).toEqual(day(11))
		})

		it('не открывается у дня без событий', () => {
			const { popover, interaction } = setup()
			interaction.handleDayClick(day(10))
			expect(popover.popoverDate.value).toBeNull()
		})
	})

	describe('выбор диапазона', () => {
		it('первый клик задаёт начало, второй — конец и эмитит range-select', () => {
			const { interaction, emit } = setup({ selectionMode: 'range' })
			interaction.handleDayClick(day(5))
			expect(emit).toHaveBeenCalledWith('update:modelValue', day(5))
			expect(emit).toHaveBeenCalledWith('update:modelValueEnd', null)

			interaction.handleDayClick(day(9))
			expect(emit).toHaveBeenCalledWith('update:modelValueEnd', day(9))
			expect(emit).toHaveBeenCalledWith('range-select', day(5), day(9))
		})

		it('клик раньше начала меняет границы местами', () => {
			const { interaction, emit } = setup({ selectionMode: 'range' })
			interaction.handleDayClick(day(9))
			emit.mockClear()
			interaction.handleDayClick(day(5))

			expect(emit).toHaveBeenCalledWith('update:modelValue', day(5))
			expect(emit).toHaveBeenCalledWith('update:modelValueEnd', day(9))
			expect(emit).toHaveBeenCalledWith('range-select', day(5), day(9))
		})

		it('клик после готового диапазона начинает новый', () => {
			const { calendar, interaction, emit } = setup({ selectionMode: 'range' })
			interaction.handleDayClick(day(5))
			interaction.handleDayClick(day(9))
			emit.mockClear()
			interaction.handleDayClick(day(20))

			expect(calendar.internalValue.value).toEqual(day(20))
			expect(calendar.internalValueEnd.value).toBeNull()
			expect(emit).not.toHaveBeenCalledWith('range-select', expect.anything(), expect.anything())
		})
	})

	it('множественный выбор добавляет и снимает дни', () => {
		const { interaction, emit } = setup({ selectionMode: 'multiple' })
		interaction.handleDayClick(day(3))
		expect(emit).toHaveBeenLastCalledWith('update:selectedDates', [day(3)])
		interaction.handleDayClick(day(7))
		expect(emit).toHaveBeenLastCalledWith('update:selectedDates', [day(3), day(7)])
		interaction.handleDayClick(day(3))
		expect(emit).toHaveBeenLastCalledWith('update:selectedDates', [day(7)])
	})

	describe('время и AM/PM', () => {
		it('AM/PM следует за часами значения', () => {
			const { interaction, isAm } = setup({ modelValue: day(1, 14, 30) })
			expect(interaction.isAmResolved.value).toBe(false)
			expect(isAm.value).toBe(false)
		})

		it('переключатель AM/PM сдвигает часы на 12 и обновляет значение', async () => {
			const { calendar, interaction, emit, isAm } = setup({ modelValue: day(1, 9, 15) })
			interaction.toggleAmPm()
			expect(calendar.hours.value).toBe(21)
			expect(emit).toHaveBeenLastCalledWith('update:modelValue', day(1, 21, 15))
			await nextTick()
			expect(isAm.value).toBe(false)

			interaction.toggleAmPm()
			expect(calendar.hours.value).toBe(9)
		})

		it('внешнее изменение v-model:is-am работает как переключатель', async () => {
			const { calendar, isAm } = setup({ modelValue: day(1, 9, 0) })
			isAm.value = false
			await nextTick()
			expect(calendar.hours.value).toBe(21)

			isAm.value = false
			await nextTick()
			expect(calendar.hours.value).toBe(21)
		})

		it('смена времени без выбранной даты ничего не эмитит', () => {
			const { interaction, emit } = setup()
			interaction.handleTimeChange()
			expect(emit).not.toHaveBeenCalledWith('update:modelValue', expect.anything())
		})
	})

	it('кнопка «Сегодня» выбирает текущую дату', () => {
		vi.useFakeTimers({ toFake: ['Date'] })
		vi.setSystemTime(new Date(2026, 8, 15, 10, 0))
		try {
			const { calendar, interaction, emit } = setup()
			interaction.handleTodayClick()
			expect(calendar.currentMonth.value).toBe(8)
			expect(emit).toHaveBeenCalledWith('update:modelValue', new Date(2026, 8, 15, 10, 0))
			expect(emit).toHaveBeenCalledWith('date-click', new Date(2026, 8, 15, 10, 0))
		} finally {
			vi.useRealTimers()
		}
	})

	it('кнопка «Сегодня» выбирает заданную дату today, а не часы', () => {
		const { calendar, interaction, emit } = setup({ today: new Date(2025, 4, 15, 10, 30) })
		interaction.handleTodayClick()
		expect(calendar.currentMonth.value).toBe(4)
		expect(calendar.currentYear.value).toBe(2025)
		expect(emit).toHaveBeenCalledWith('update:modelValue', new Date(2025, 4, 15, 10, 30))
		expect(emit).toHaveBeenCalledWith('date-click', new Date(2025, 4, 15, 10, 30))
	})

	it('сообщает о смене месяца, года и вида', async () => {
		const { calendar, emit } = setup()
		calendar.currentMonth.value = 6
		calendar.currentYear.value = 2027
		calendar.currentView.value = 'years'
		await nextTick()

		expect(emit).toHaveBeenCalledWith('month-change', 6)
		expect(emit).toHaveBeenCalledWith('year-change', 2027)
		expect(emit).toHaveBeenCalledWith('view-change', 'years')
	})
})
