import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления BaseChecklist: `default` — карточка в рамке, `soft` — на подложке без рамки,
 * `outline` — рамка без фона, `ghost` — без рамки и отступов (внутри панели или меню)
 */
export const CHECKLIST_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/** Шаг: название, пояснение и подпись кнопки действия (например, «Открыть настройки») */
export interface ChecklistItem {
	id: string
	title: string
	description?: string
	actionLabel?: string
}

/** Шаг для разметки: выполнен ли, следующий ли, id флажка и пояснения */
export interface ChecklistRow {
	item: ChecklistItem
	isDone: boolean
	isNext: boolean
	checkboxId: string
	describedBy: string | undefined
	descriptionId: string
	nextId: string
}

/**
 * Пропсы компонента BaseChecklist
 */
export interface BaseChecklistProps extends BaseComponentProps<(typeof CHECKLIST_VARIANTS)[number], 'root' | 'item'> {
	/** Шаги по порядку */
	items: readonly ChecklistItem[]
	/** Выполненные шаги (`v-model:completed`): id отмеченных */
	completed?: readonly string[]
	/** Заголовок; по умолчанию «Первые шаги» */
	title?: string
	/** Только просмотр: флажки и кнопки неактивны */
	isDisabled?: boolean
}

/**
 * События компонента BaseChecklist
 */
export interface BaseChecklistEmits {
	/** Отмечен или снят шаг: новый список выполненных */
	(event: 'update:completed', ids: string[]): void
	/** Нажата кнопка действия шага */
	(event: 'action', item: ChecklistItem): void
}

/**
 * Слоты компонента BaseChecklist
 */
export interface BaseChecklistSlots {
	/** Все шаги выполнены: вместо «Всё готово» */
	done?: () => unknown
}
