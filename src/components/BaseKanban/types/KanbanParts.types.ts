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
