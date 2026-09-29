import type { KanbanCard } from './BaseKanban.types'

/** Пропсы содержимого карточки по умолчанию: название, описание и метки */
export interface KanbanCardContentProps {
	card: KanbanCard
}
