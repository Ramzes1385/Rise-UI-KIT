/** Props компонента BaseCalendarTime */
export interface BaseCalendarTimeProps {
	/** Часы (0-23) */
	hours: number
	/** Минуты (0-59) */
	minutes: number
	/** Секунды (0-59) */
	seconds: number
	/** 24-часовой формат */
	is24Hour: boolean
	/** Показывать секунды */
	showSeconds: boolean
	/** AM или PM */
	isAm: boolean
	/** Отключено ли время */
	isDisabled: boolean
	/** Масштаб размера */
	sizeScale: number
	/** Объект CSS-классов для кастомизации элементов времени */
	classes: Record<string, string | undefined>
}

/** Emits компонента BaseCalendarTime */
export interface BaseCalendarTimeEmits {
	(event: 'update:hours', value: number): void
	(event: 'update:minutes', value: number): void
	(event: 'update:seconds', value: number): void
	(event: 'toggleAmPm'): void
	(event: 'timeChange'): void
}
