import { reactive } from 'vue'
import { getLocale, setLocale } from '@/locales/state'
import { useCalendarResolvedProps } from '../useCalendarResolvedProps'
import type { BaseCalendarProps } from '@components/BaseCalendar/types/BaseCalendar.types'

describe('useCalendarResolvedProps', () => {
	afterEach(() => {
		setLocale('ru')
	})

	it('без пропсов подставляет значения по умолчанию и настройки языка кита', () => {
		const resolved = useCalendarResolvedProps({})

		expect(resolved.value).toEqual({
			modelValue: null,
			modelValueEnd: null,
			selectedDates: [],
			selectionMode: 'single',
			minDate: null,
			maxDate: null,
			disabledDates: [],
			disabledWeekdays: [],
			disableFrom: null,
			disableTo: null,
			highlights: [],
			weekends: null,
			firstDayOfWeek: getLocale().firstDayOfWeek,
			showTime: false,
			showSeconds: false,
			is24Hour: true,
			showWeekNumber: false,
			locale: getLocale().intl,
			variant: 'default',
			color: undefined,
			showDatePopover: false,
			sizeScale: 100,
			isDisabled: false,
			showNavigation: true,
			canSwitchView: true,
			showTodayButton: true,
			showYear: true,
			initialMonth: undefined,
			initialYear: undefined,
			customClass: undefined,
		})
	})

	it('берёт переданные пропсы и вложенные настройки', () => {
		const start = new Date(2026, 0, 5)
		const end = new Date(2026, 0, 9)
		const props: BaseCalendarProps = {
			modelValue: start,
			modelValueEnd: end,
			selectedDates: [start],
			selectionMode: 'range',
			constraints: {
				minDate: start,
				maxDate: end,
				disabledDates: [end],
				disabledWeekdays: [0],
				disableFrom: end,
				disableTo: start,
			},
			highlights: [{ date: start, label: 'Старт' }],
			weekends: { days: [0, 6], holidays: [] },
			firstDayOfWeek: 0,
			timeConfig: { showTime: true, showSeconds: true, is24Hour: false },
			displayConfig: { showWeekNumber: true, showNavigation: false, canSwitchView: false, showTodayButton: false, showYear: false },
			locale: 'en-US',
			variant: 'outline',
			color: { bg: { base: '#123456' } },
			showDatePopover: true,
			sizeScale: 120,
			isDisabled: true,
			initialMonth: 3,
			initialYear: 2030,
			customClass: 'my-calendar',
		}

		expect(useCalendarResolvedProps(props).value).toMatchObject({
			modelValue: start,
			modelValueEnd: end,
			selectedDates: [start],
			selectionMode: 'range',
			minDate: start,
			maxDate: end,
			disabledDates: [end],
			disabledWeekdays: [0],
			disableFrom: end,
			disableTo: start,
			weekends: { days: [0, 6], holidays: [] },
			firstDayOfWeek: 0,
			showTime: true,
			showSeconds: true,
			is24Hour: false,
			showWeekNumber: true,
			locale: 'en-US',
			variant: 'outline',
			color: { bg: { base: '#123456' } },
			showDatePopover: true,
			sizeScale: 120,
			isDisabled: true,
			showNavigation: false,
			canSwitchView: false,
			showTodayButton: false,
			showYear: false,
			initialMonth: 3,
			initialYear: 2030,
			customClass: 'my-calendar',
		})
	})

	it('пересчитывается при смене пропсов и языка кита', () => {
		const props = reactive<BaseCalendarProps>({})
		const resolved = useCalendarResolvedProps(props)
		setLocale('en')
		expect(resolved.value.locale).toBe(getLocale().intl)
		expect(resolved.value.firstDayOfWeek).toBe(getLocale().firstDayOfWeek)

		props.isDisabled = true
		expect(resolved.value.isDisabled).toBe(true)
	})
})
