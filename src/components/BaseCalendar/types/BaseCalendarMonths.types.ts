/** Props компонента BaseCalendarMonths */
export interface BaseCalendarMonthsProps {
	/** Названия месяцев */
	monthNames: string[]
	/** Текущий месяц (0-11) */
	currentMonth: number
	/** Отключён ли выбор месяцев */
	isDisabled: boolean
	/** Объект CSS-классов для кастомизации элементов месяцев */
	classes: Record<string, string | undefined>
}

export interface BaseCalendarMonthsEmits {
	(event: 'select', index: number): void
}
