import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Вид индикатора: `spinner` — вращающаяся дуга, `dots` — три точки, `pulse` — точка с расходящимся кольцом, `bars` — столбики.
 */
export type LoaderVariant = 'spinner' | 'dots' | 'pulse' | 'bars'

export interface BaseLoaderProps extends BaseComponentProps<LoaderVariant, 'root' | 'animation' | 'spinner' | 'label'> {
	/** Показывать подпись `label` под индикатором. */
	hasLabel?: boolean
	/**
	 * Текст подписи. Он же — доступное имя статуса и текст, который озвучивается при появлении (без завершающего многоточия),
	 * даже если подпись скрыта.
	 */
	label?: string
	/**
	 * Подложка на весь родительский контейнер с индикатором по центру. Родителю нужен `position: relative`.
	 * Пока подложка показана, соседние элементы лоадера в том же родителе получают `inert` и `aria-busy="true"`.
	 */
	isOverlay?: boolean
}

export type BaseLoaderEmits = Record<string, never>

/** Слотов нет: содержимое строится из props */
export type BaseLoaderSlots = Record<never, never>

export type LoaderProps = PropsWithDefaults<BaseLoaderProps, 'sizeScale'>

/**
 * Элемент, накрытый оверлеями: прежнее значение `aria-busy` возвращается, когда снят последний оверлей из `owners`.
 * Несколько оверлеев в одном родителе делят одну запись — сосед остаётся `inert`, пока виден хотя бы один из них.
 */
export interface LoaderCoveredElement {
	busy: string | null
	owners: Set<HTMLElement>
}
