import type { BaseComponentProps } from '../../../types/base.types'

/**
 * Вид индикатора: `spinner` — вращающаяся дуга, `dots` — три точки, `pulse` — точка с расходящимся кольцом, `bars` — столбики.
 */
export type LoaderVariant = 'spinner' | 'dots' | 'pulse' | 'bars'

/**
 * Пропсы компонента BaseLoader
 */
export interface BaseLoaderProps extends BaseComponentProps<LoaderVariant, 'root' | 'animation' | 'spinner' | 'label'> {
	/** Показывать подпись `label` под индикатором. */
	hasLabel?: boolean
	/** Текст подписи. Он же — доступное имя статуса (без завершающего многоточия), даже если подпись скрыта. */
	label?: string
	/** Подложка на весь родительский контейнер с индикатором по центру. Родителю нужен `position: relative`. */
	isOverlay?: boolean
}

/**
 * События компонента BaseLoader
 */
export type BaseLoaderEmits = Record<string, never>

/**
 * Слоты компонента BaseLoader
 */
export interface BaseLoaderSlots {
	default?: () => unknown
}
