/** Props компонента BaseCalendarMonths */
export interface BaseCalendarMonthsProps {
	/** Названия месяцев */
	monthNames: string[]
	/** Текущий месяц (0-11) */
	currentMonth: number
	/** Отключён ли выбор месяцев */
	isDisabled: boolean
	/** Масштаб размера */
	sizeScale: number
	/** Объект CSS-классов для кастомизации элементов месяцев */
	classes: Record<string, string>
}

/** Emits компонента BaseCalendarMonths */
export interface BaseCalendarMonthsEmits {
	(event: 'select', index: number): void
}
