import type { TreeIndex } from '@utils/navigation/treeUtils'
import type { BaseCascaderNode, CascaderPath, CascaderSearchResult, CascaderValue } from '../../types/BaseCascader.types'

const KEY_SEPARATOR = '\u001F'

export function pathKey(path: CascaderPath): string {
	return path.join(KEY_SEPARATOR)
}

export function toPathList(value: CascaderValue | undefined, isMultiple: boolean): CascaderPath[] {
	const items: unknown[] = value ?? []
	const paths = items.some(item => Array.isArray(item))
		? items.filter((item): item is CascaderPath => Array.isArray(item) && item.length > 0)
		: [items as CascaderPath].filter(path => path.length > 0)
	return isMultiple ? paths : paths.slice(0, 1)
}

function resolveNode(
	node: BaseCascaderNode,
	childrenFor: (node: BaseCascaderNode) => BaseCascaderNode[] | undefined,
	ancestors: Set<string>,
): BaseCascaderNode {
	if (ancestors.has(node.id)) return { ...node, children: [] }
	const children = childrenFor(node)
	if (!children) return { ...node, children: undefined }
	ancestors.add(node.id)
	const resolved = { ...node, children: children.map(child => resolveNode(child, childrenFor, ancestors)) }
	ancestors.delete(node.id)
	return resolved
}

export function resolveCascaderTree(
	items: BaseCascaderNode[],
	childrenFor: (node: BaseCascaderNode) => BaseCascaderNode[] | undefined,
): BaseCascaderNode[] {
	return items.map(node => resolveNode(node, childrenFor, new Set()))
}

function pathTo(index: TreeIndex, id: string): CascaderPath {
	const path = [id]
	for (let parent = index.parents.get(id); parent !== undefined; parent = index.parents.get(parent)) path.unshift(parent)
	return path
}

export function searchCascader(index: TreeIndex, query: string, isSelectable: (node: BaseCascaderNode) => boolean): CascaderSearchResult[] {
	const needle = query.trim().toLowerCase()
	if (!needle) return []
	const results: CascaderSearchResult[] = []
	for (const id of index.order) {
		const node = index.nodes.get(id) as BaseCascaderNode
		const text = `${node.label} ${node.description ?? ''}`.toLowerCase()
		if (!text.includes(needle) || !isSelectable({ ...node, isDisabled: false })) continue
		const nodes = pathTo(index, id).map(step => index.nodes.get(step) as BaseCascaderNode)
		results.push({
			node,
			path: nodes.map(step => step.id),
			labels: nodes.map(step => step.label),
			isDisabled: nodes.some(step => step.isDisabled),
		})
	}
	return results
}

export function findEnabled(nodes: { isDisabled?: boolean }[], from: number, step: 1 | -1): number {
	for (let position = from; position >= 0 && position < nodes.length; position += step) {
		if (!nodes[position].isDisabled) return position
	}
	return -1
}
