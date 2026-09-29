import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Вид индикатора: `spinner` — вращающаяся дуга, `dots` — три точки, `pulse` — точка с расходящимся кольцом, `bars` — столбики.
 */
export type LoaderVariant = 'spinner' | 'dots' | 'pulse' | 'bars'

export interface BaseLoaderProps extends BaseComponentProps<LoaderVariant, 'root' | 'animation' | 'spinner' | 'label'> {
	/** Показывать подпись `label` под индикатором. */
	hasLabel?: boolean
	/** Текст подписи. Он же — доступное имя статуса (без завершающего многоточия), даже если подпись скрыта. */
	label?: string
	/** Подложка на весь родительский контейнер с индикатором по центру. Родителю нужен `position: relative`. */
	isOverlay?: boolean
}

export type BaseLoaderEmits = Record<string, never>

export interface BaseLoaderSlots {
	default?: () => unknown
}

export type LoaderProps = PropsWithDefaults<BaseLoaderProps, 'sizeScale'>
