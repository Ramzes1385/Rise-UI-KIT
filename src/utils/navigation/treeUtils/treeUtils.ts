/** Утилиты: обход и сбор данных из древовидных структур */

import type { TreeNode } from '@components/BaseTree/types/BaseTree.types'
import type { TreeIndex, TreeSelectionState, TreeWalkEntry, TreeWalkVisit } from './types/treeUtils.types'

function pushReversed<T>(stack: T[], items: T[]): void {
	for (let position = items.length - 1; position >= 0; position--) stack.push(items[position])
}

/**
 * Обход в глубину без рекурсии, родитель раньше потомков. Повторный id (цикл в children или дубль) пропускается
 * вместе с поддеревом; возвращает такие id. `seen` — id, которые считаются уже пройденными
 */
function walkTree(nodes: TreeNode[], visit: TreeWalkVisit, seen: Set<string> = new Set()): string[] {
	const repeated: string[] = []
	const stack: TreeWalkEntry[] = []
	pushReversed(
		stack,
		nodes.map((node): TreeWalkEntry => [node, undefined]),
	)
	for (let entry = stack.pop(); entry; entry = stack.pop()) {
		const [node, parentId] = entry
		if (seen.has(node.id)) {
			repeated.push(node.id)
			continue
		}
		seen.add(node.id)
		visit(node, parentId)
		pushReversed(
			stack,
			(node.children ?? []).map((child): TreeWalkEntry => [child, node.id]),
		)
	}
	return repeated
}

/** Собрать id потомков в массив: обход без рекурсии, повторные id пропускаются */
export function collectDescendantIdsInto(children: TreeNode[], ids: string[]): void {
	walkTree(children, node => {
		ids.push(node.id)
	})
}

/** Кэш потомков: id узла с детьми → id всех его потомков. Узел не попадает в свой список даже при цикле */
export function buildDescendantsCache(nodes: TreeNode[], cache: Map<string, string[]>): void {
	walkTree(nodes, node => {
		if (!node.children?.length) return
		const ids: string[] = []
		walkTree(node.children, child => ids.push(child.id), new Set([node.id]))
		cache.set(node.id, ids)
	})
}

/** id узлов с детьми в порядке обхода */
export function collectExpandableIds(nodes: TreeNode[]): string[] {
	const ids: string[] = []
	walkTree(nodes, node => {
		if (node.children?.length) ids.push(node.id)
	})
	return ids
}

/** Индекс дерева за один обход: узел по id, родитель по id, порядок обхода и повторные id */
export function buildTreeIndex(nodes: TreeNode[]): TreeIndex {
	const index: TreeIndex = { nodes: new Map(), parents: new Map(), order: [], repeated: [] }
	index.repeated = walkTree(nodes, (node, parentId) => {
		index.nodes.set(node.id, node)
		if (parentId !== undefined) index.parents.set(node.id, parentId)
		index.order.push(node.id)
	})
	return index
}

/**
 * Дети узла без повторов: ребёнок, которого индекс знает под другим родителем (цикл или дубль id), пропускается.
 * Ребёнок, которого индекс ещё не знает (children изменили на месте), остаётся
 */
export function getTreeChildren(index: TreeIndex, node: TreeNode): TreeNode[] {
	return (node.children ?? []).filter(child => !index.nodes.has(child.id) || index.parents.get(child.id) === node.id)
}

function getEnabledChildren(index: TreeIndex, node: TreeNode): TreeNode[] {
	return getTreeChildren(index, node).filter(child => !child.isDisabled)
}

function collectEnabledDescendants(index: TreeIndex, node: TreeNode): string[] {
	const ids: string[] = []
	const stack: TreeNode[] = []
	pushReversed(stack, getEnabledChildren(index, node))
	for (let current = stack.pop(); current; current = stack.pop()) {
		ids.push(current.id)
		pushReversed(stack, getEnabledChildren(index, current))
	}
	return ids
}

function propagateDown(index: TreeIndex, selected: Set<string>): void {
	for (const id of index.order) {
		const node = index.nodes.get(id) as TreeNode
		if (node.isDisabled || !selected.has(id)) continue
		for (const child of getEnabledChildren(index, node)) selected.add(child.id)
	}
}

function propagateUp(index: TreeIndex, selected: Set<string>): Set<string> {
	const indeterminate = new Set<string>()
	for (let position = index.order.length - 1; position >= 0; position--) {
		const node = index.nodes.get(index.order[position]) as TreeNode
		const children = node.isDisabled ? [] : getEnabledChildren(index, node)
		if (!children.length) continue
		const checked = children.filter(child => selected.has(child.id)).length
		if (checked === children.length) selected.add(node.id)
		else if (checked || children.some(child => indeterminate.has(child.id))) indeterminate.add(node.id)
	}
	return indeterminate
}

/**
 * Согласовать выбор режима multiple: выбранный узел выбирает доступных потомков, выбор всех доступных детей
 * выбирает родителя, часть — частичный выбор. Отключённые узлы и их поддеревья в каскаде не участвуют и
 * сохраняют своё состояние. Порядок исходных id сохраняется, добавленные — в конце
 */
export function normalizeTreeSelection(index: TreeIndex, ids: string[]): TreeSelectionState {
	const selected = new Set(ids)
	propagateDown(index, selected)
	const indeterminate = propagateUp(index, selected)
	return { selected: [...selected], indeterminate }
}

/**
 * Переключить выбор узла в режиме multiple с каскадом: узел и его доступные потомки получают одно состояние,
 * доступные предки пересчитываются снизу вверх. `ids` — согласованный выбор (normalizeTreeSelection)
 */
export function toggleTreeSelection(index: TreeIndex, ids: string[], id: string): string[] {
	const selected = new Set(ids)
	const node = index.nodes.get(id)
	const affected = node ? [id, ...collectEnabledDescendants(index, node)] : [id]
	const isSelecting = !selected.has(id)
	for (const affectedId of affected) {
		if (isSelecting) selected.add(affectedId)
		else selected.delete(affectedId)
	}
	for (let parentId = index.parents.get(id); parentId !== undefined; parentId = index.parents.get(parentId)) {
		if (!(index.nodes.get(parentId) as TreeNode).isDisabled) selected.delete(parentId)
	}
	return normalizeTreeSelection(index, [...selected]).selected
}
