import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Вид ячеек отсчёта: `default` — с рамкой, `soft` — на приглушённом фоне, `outline` — заметная рамка без фона,
 * `ghost` — только цифры и подписи
 */
export const COUNTDOWN_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/** Единицы отсчёта от большей к меньшей */
export const COUNTDOWN_UNITS = ['days', 'hours', 'minutes', 'seconds'] as const

/** Единица отсчёта: дни, часы, минуты, секунды */
export type CountdownUnit = (typeof COUNTDOWN_UNITS)[number]

/** Раскладка: `blocks` — ячейки «число и подпись», `inline` — строкой, как часы: «2 дн. 03:12:45» */
export type CountdownLayout = 'blocks' | 'inline'

/** Оставшееся время по единицам и всего в миллисекундах */
export interface CountdownParts {
	days: number
	hours: number
	minutes: number
	seconds: number
	/** Всего осталось, мс */
	total: number
	/** Отсчёт закончился */
	isFinished: boolean
}

/**
 * Пропсы компонента BaseCountdown
 */
export interface BaseCountdownProps extends BaseComponentProps<(typeof COUNTDOWN_VARIANTS)[number], 'root' | 'unit' | 'value' | 'caption'> {
	/**
	 * Дата и время окончания: `Date`, метка времени в мс или строка ISO 8601.
	 * Строка со смещением (`2026-10-05T12:00:00Z`, `…+03:00`) — точный момент, одинаковый во всех поясах:
	 * так лучше передавать время с сервера. Строка без смещения — местное время устройства:
	 * `2026-10-05T12:00` — 12:00 по часам пользователя, `2026-10-05` — местная полночь (не UTC, как у `Date.parse`)
	 */
	to: Date | number | string
	/**
	 * Какие единицы показывать, от большей к меньшей. Старшая вбирает остаток: без `days` часы идут дальше 24,
	 * младшая округляется вверх: без секунд 30 с показываются как 1 мин
	 */
	format?: readonly CountdownUnit[]
	/** Раскладка: ячейки или строка, как часы */
	layout?: CountdownLayout
	/** Что отсчитываем — имя таймера для скринридера: «До начала распродажи». По умолчанию «Осталось» */
	label?: string
	/**
	 * Скринридер сам объявляет оставшееся время — не чаще раза в минуту, и окончание.
	 * По умолчанию выключено: время читается, когда пользователь дойдёт до таймера
	 */
	isLive?: boolean
}

/**
 * События компонента BaseCountdown
 */
export interface BaseCountdownEmits {
	/** Отсчёт дошёл до нуля. Не вызывается, если дата уже прошла при монтировании */
	(event: 'finish'): void
}

/**
 * Слоты компонента BaseCountdown
 */
export interface BaseCountdownSlots {
	/**
	 * Своя разметка отсчёта вместо ячеек: оставшееся время по единицам. Только для вида: слот скрыт от скринридера
	 * (`aria-hidden`), время читает скрытый текст компонента. Ссылки и кнопки ставьте рядом с компонентом
	 * или в слот `finished`. До монтирования (рендер на сервере) части равны нулю, `isFinished` — `false`
	 */
	default?: (props: CountdownParts) => unknown
	/**
	 * Что показать после окончания вместо нулей: «Распродажа началась». Доступен скринридеру и заменяет
	 * текст «время вышло»; при `isLive` объявляется. Ссылки и кнопки в нём работают
	 */
	finished?: () => unknown
}
