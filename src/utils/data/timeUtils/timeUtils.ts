/** Утилиты времени (BaseTimePicker): формат HH:MM, разбор ввода, список времени с шагом */

const MINUTES_IN_DAY = 24 * 60

/** Минуты от полуночи → `HH:MM` */
function minutesToTime(minutes: number): string {
	const hours = Math.floor(minutes / 60)
	return `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

/** `HH:MM` → минуты от полуночи; `undefined` — не время */
function timeToMinutes(time: string): number | undefined {
	const match = /^(\d{2}):(\d{2})$/.exec(time)
	if (!match) return undefined
	const hours = Number(match[1])
	const minutes = Number(match[2])
	if (hours > 23 || minutes > 59) return undefined
	return hours * 60 + minutes
}

/**
 * Разобрать набранное время: `9:30`, `9.30`, `09 30`, `930`, `0930`, `9` → `HH:MM`.
 * `null` — не время (часы больше 23, минуты больше 59, лишние символы)
 */
function parseTimeInput(text: string): string | null {
	const trimmed = text.trim()
	let hours: number
	let minutes: number
	const separated = /^(\d{1,2})[:.,\s-](\d{1,2})$/.exec(trimmed)
	if (separated) {
		hours = Number(separated[1])
		minutes = Number(separated[2])
	} else if (/^\d{1,4}$/.test(trimmed)) {
		// Без разделителя: 1–2 цифры — часы, 3–4 — часы и две последние цифры минут
		const digits = trimmed.length > 2 ? trimmed.padStart(4, '0') : trimmed.padStart(2, '0') + '00'
		hours = Number(digits.slice(0, 2))
		minutes = Number(digits.slice(2))
	} else {
		return null
	}
	if (hours > 23 || minutes > 59) return null
	return minutesToTime(hours * 60 + minutes)
}

/** Время с шагом в минутах от `min` до `max` включительно (по умолчанию весь день) */
function buildTimeOptions(step: number, min = '00:00', max = '23:59'): string[] {
	const safeStep = step > 0 ? step : 30
	const from = timeToMinutes(min) ?? 0
	const to = timeToMinutes(max) ?? MINUTES_IN_DAY - 1
	const result: string[] = []
	for (let minutes = from; minutes <= to; minutes += safeStep) result.push(minutesToTime(minutes))
	return result
}

/**
 * Начала времени, подходящие под набранное: `9` — 09:… и 9…, `14` — 14:…, `9:3` — 09:3…, `930` — 09:30.
 * Для фильтра списка BaseTimePicker
 */
function timePrefixes(query: string): string[] {
	const text = query.trim()
	const separated = /^(\d{1,2})[:.,\s-](\d{0,2})$/.exec(text)
	if (separated) return [`${separated[1].padStart(2, '0')}:${separated[2]}`]
	if (/^\d$/.test(text)) return [`0${text}`, text]
	if (/^\d{2}$/.test(text)) return [text]
	if (/^\d{3,4}$/.test(text)) {
		const digits = text.padStart(4, '0')
		return [`${digits.slice(0, 2)}:${digits.slice(2)}`]
	}
	return [text]
}

export { buildTimeOptions, minutesToTime, parseTimeInput, timePrefixes, timeToMinutes }
