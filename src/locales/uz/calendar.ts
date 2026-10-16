import type { UiKitLocale } from '../types/locales.types'

/** Запасные названия месяцев и дней и фразы относительного времени: для браузеров без данных Intl узбекского (корневые данные урезанного ICU); значения — данные CLDR */
export const uzCalendar: Pick<UiKitLocale, 'calendarNames' | 'relativeTime'> = {
	calendarNames: {
		months: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'],
		monthsShort: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'],
		weekdays: ['yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba'],
		weekdaysShort: ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'],
		patterns: {
			dayMonthYear: '{day}-{month}, {year}',
			dayMonth: '{day}-{month}',
			monthYear: '{month}, {year}',
			numeric: '{day}/{month}/{year}',
			withWeekday: '{weekday}, {date}',
		},
	},
	relativeTime: {
		now: 'hozir',
		yesterday: 'kecha',
		tomorrow: 'ertaga',
		past: { minute: '{n} daqiqa oldin', hour: '{n} soat oldin', day: '{n} kun oldin' },
		future: { minute: '{n} daqiqadan keyin', hour: '{n} soatdan keyin', day: '{n} kundan keyin' },
	},
}
