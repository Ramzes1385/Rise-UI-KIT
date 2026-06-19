/** Утилиты: обход и сбор данных из древовидных структур */

import type { TreeNode } from '@components/BaseTree/model/BaseTree.types'

/** Собрать id потомков в массив без создания промежуточных массивов */
export function collectDescendantIdsInto(children: TreeNode[], ids: string[]): void {
	for (const child of children) {
		ids.push(child.id)
		if (child.children?.length) {
			collectDescendantIdsInto(child.children, ids)
		}
	}
}

/** Построить кэш потомков для всех узлов */
export function buildDescendantsCache(nodes: TreeNode[], cache: Map<string, string[]>): void {
	for (const node of nodes) {
		if (node.children?.length) {
			const ids: string[] = []
			collectDescendantIdsInto(node.children, ids)
			cache.set(node.id, ids)
			buildDescendantsCache(node.children, cache)
		}
	}
}

/** Собрать все идентификаторы узлов с детьми */
export function collectExpandableIds(nodes: TreeNode[]): string[] {
	const ids: string[] = []
	for (const node of nodes) {
		if (node.children?.length) {
			ids.push(node.id)
			ids.push(...collectExpandableIds(node.children))
		}
	}
	return ids
}
