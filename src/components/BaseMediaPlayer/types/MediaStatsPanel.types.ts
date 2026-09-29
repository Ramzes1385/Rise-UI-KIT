export interface MediaStatsRow {
	/** Название показателя */
	label: string
	/** Значение */
	value: string
}

export interface MediaStatsPanelProps {
	/** Показатели плеера */
	rows: MediaStatsRow[]
}

export interface MediaStatsPanelEmits {
	/** Закрыть панель */
	(event: 'close'): void
	/** Скопировать сведения */
	(event: 'copy'): void
}
