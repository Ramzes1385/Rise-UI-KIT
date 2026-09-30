import type { KanbanCard } from './BaseKanban.types'

/**
 * Пропсы содержимого карточки по умолчанию: обложка, метки, название, описание и строка с номером, приоритетом,
 * сроком, счётчиками и исполнителями; `today` — дата для сроков, `isDone` — карточка в колонке завершённых
 */
export interface KanbanCardContentProps {
	card: KanbanCard
	today: Date
	isDone: boolean
}

/**
 * Поле названия карточки: добавление внизу колонки (`isRepeating` — после Enter поле очищается для следующей
 * карточки, `submitLabel` — подпись кнопки) и переименование на месте карточки
 */
export interface KanbanTextEditorProps {
	value: string
	label: string
	submitLabel?: string
	isRepeating?: boolean
	sizeScale?: number
}

/** События поля: Enter или кнопка — `submit`, Escape или крестик — `cancel`, фокус ушёл из поля — `leave` */
export interface KanbanTextEditorEmits {
	(event: 'submit', value: string): void
	(event: 'cancel'): void
	(event: 'leave', value: string): void
}
