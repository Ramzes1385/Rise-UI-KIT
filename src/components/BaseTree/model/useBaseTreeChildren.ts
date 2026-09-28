/** Composable: логика BaseTreeChildren — контекст дерева для вложенных узлов и скрытие свёрнутой ветки */
import { inject } from 'vue'
import { TREE_CONTEXT_KEY } from '../types/BaseTree.types'

/**
 * Свёрнутая ветка остаётся в DOM (ленивый рендер + сворачивание через grid 0fr), поэтому её узлы
 * были бы доступны по Tab и скринридеру. visibility:hidden убирает их из порядка фокуса и дерева
 * доступности, не меняя раскладку (высота контейнера и так нулевая)
 */
const COLLAPSED_STYLE = { visibility: 'hidden' } as const

export function useBaseTreeChildren() {
	const treeContext = inject(TREE_CONTEXT_KEY, undefined)
	/* istanbul ignore if -- defensive: BaseTreeChildren всегда рендерится внутри BaseTree, контекст предоставляется родителем */
	if (!treeContext) {
		throw new Error('BaseTreeChildren: TreeContext not found. Ensure BaseTreeChildren is rendered inside BaseTree.')
	}
	return { treeContext, collapsedStyle: COLLAPSED_STYLE }
}
