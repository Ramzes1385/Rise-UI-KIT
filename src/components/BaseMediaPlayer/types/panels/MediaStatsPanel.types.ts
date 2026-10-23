import type { MediaElementRef, MediaState } from '../playback/MediaCore.types'

export interface MediaStatsRow {
	/** Название показателя */
	label: string
	/** Значение */
	value: string
}

/** Запись лога событий: событие медиаэлемента (`waiting`, `seeked`) или плеера (`update:volume`, `ad`) */
export interface MediaEventLogEntry {
	/** Номер записи — ключ списка */
	id: number
	/** Время на часах: «12:34:56.789» */
	clock: string
	/** Позиция записи в момент события: «0:05» */
	position: string
	/** Имя события */
	type: string
	/** Подробности: адрес, размер кадра, код ошибки, значение */
	detail: string
}

export interface MediaEventLogOptions {
	media: MediaElementRef
	state: Readonly<MediaState>
}

export const MEDIA_DEBUG_TABS = ['metrics', 'events'] as const

/** Вкладка панели отладки: показатели или лог событий */
export type MediaDebugTab = (typeof MEDIA_DEBUG_TABS)[number]

export interface MediaStatsPanelProps {
	/** Показатели плеера */
	rows: MediaStatsRow[]
	/** Лог событий, новые сверху */
	events: MediaEventLogEntry[]
}

export interface MediaStatsPanelEmits {
	/** Закрыть панель */
	(event: 'close'): void
	/** Скопировать отчёт: окружение, показатели и события */
	(event: 'copy'): void
}
