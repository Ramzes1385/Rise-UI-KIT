/** Дни недели в расписании часов работы: с понедельника по воскресенье */
export const IMAGE_MAP_WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

/** День недели */
export type ImageMapWeekday = (typeof IMAGE_MAP_WEEKDAYS)[number]

/**
 * Интервал работы `'ЧЧ:ММ-ЧЧ:ММ'` по часам объекта: `'10:00-22:00'`.
 * Конец не позже начала — работа через полночь: `'22:00-02:00'` — с 22:00 до 02:00 следующего дня.
 * `'00:00-24:00'` — весь день; интервал, который продолжается следующим днём, сливается с ним.
 */
export type ImageMapTimeRange = string

/**
 * Часы работы объекта (`hours`). Время — по часам объекта: пояс `timeZone`, затем `timeZone` карты, затем пояс браузера.
 * Пример: `{ timeZone: 'Europe/Moscow', week: { mon: ['10:00-22:00'], sat: ['11:00-23:00'] }, exceptions: { '2026-12-31': ['10:00-18:00'] } }`.
 * Расчёт — по часам на стене: в день перевода часов интервал считается по новому времени.
 */
export interface ImageMapHours {
	/** Часовой пояс IANA: `'Europe/Moscow'`, `'Asia/Yekaterinburg'`. Неизвестный — предупреждение и пояс браузера */
	timeZone?: string
	/** Расписание недели: день → интервалы. Дня нет или `[]` — выходной */
	week: Partial<Record<ImageMapWeekday, ImageMapTimeRange[]>>
	/** Исключения по датам `'ГГГГ-ММ-ДД'` (дата по часам объекта): интервалы дня вместо обычных; `[]` — закрыто весь день */
	exceptions?: Record<string, ImageMapTimeRange[]>
}

/** Строка недельного расписания в окне объекта */
export interface ImageMapHoursDay {
	/** Короткое название дня на языке кита: «пн», «Mon» */
	day: string
	/** Интервалы дня через запятую, «Круглосуточно» или «Выходной» */
	text: string
	/** Сегодня по часам объекта */
	isToday: boolean
}

/** Состояние часов работы объекта сейчас: в подсказке, окне, списке объектов и слотах */
export interface ImageMapHoursState {
	/** Объект открыт сейчас */
	isOpen: boolean
	/** Открыто без перерыва неделю вперёд */
	isAlwaysOpen: boolean
	/** Готовый текст: «Открыто до 21:00», «Закрыто, откроется в 10:00», «Открыто круглосуточно» */
	text: string
	/** Неделя с понедельника по обычному расписанию (сегодня — с учётом исключения) */
	schedule: ImageMapHoursDay[]
}

/** Значение фильтра `type: 'open-now'`, когда он включён: `{ [id фильтра]: ['open'] }` в `v-model:filters` */
export const IMAGE_MAP_OPEN_NOW_VALUE = 'open'
