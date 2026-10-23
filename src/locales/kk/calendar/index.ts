import type { UiKitLocale } from '../../types/locales.types'

/** Запасные названия месяцев и дней и фразы относительного времени: для браузеров без данных Intl казахского (урезанный ICU); значения — данные CLDR */
export const kkCalendar: Pick<UiKitLocale, 'calendarNames' | 'relativeTime'> = {
	calendarNames: {
		months: ['Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Мамыр', 'Маусым', 'Шілде', 'Тамыз', 'Қыркүйек', 'Қазан', 'Қараша', 'Желтоқсан'],
		monthsShort: ['қаң.', 'ақп.', 'нау.', 'сәу.', 'мам.', 'мау.', 'шіл.', 'там.', 'қыр.', 'қаз.', 'қар.', 'жел.'],
		weekdays: ['жексенбі', 'дүйсенбі', 'сейсенбі', 'сәрсенбі', 'бейсенбі', 'жұма', 'сенбі'],
		weekdaysShort: ['жс', 'дс', 'сс', 'ср', 'бс', 'жм', 'сб'],
		patterns: {
			dayMonthYear: '{year} ж. {day} {month}',
			dayMonth: '{day} {month}',
			monthYear: '{year} ж. {month}',
			numeric: '{day}.{month}.{year}',
			withWeekday: '{date}, {weekday}',
		},
	},
	relativeTime: {
		now: 'қазір',
		yesterday: 'кеше',
		tomorrow: 'ертең',
		past: { minute: '{n} минут бұрын', hour: '{n} сағат бұрын', day: '{n} күн бұрын' },
		future: { minute: '{n} минуттан кейін', hour: '{n} сағаттан кейін', day: '{n} күннен кейін' },
	},
}
