import { foldSearchText } from '@utils/data/textUtils'
import type { TreeIndex } from '@utils/navigation/treeUtils'
import type { TreeNode } from '@components/BaseTree/types/BaseTree.types'
import type { TreeSelectRow, TreeSelectRowsLevel, TreeSelectRowsSource, TreeSelectSearchScope } from '../types/BaseTreeSelect.types'

function findSearchScope(index: TreeIndex, query: string): TreeSelectSearchScope | null {
	const needle = foldSearchText(query.trim())
	if (!needle) return null
	const matches = new Set<string>()
	const ancestors = new Set<string>()
	for (const [id, node] of index.nodes) {
		if (!foldSearchText(node.label).includes(needle)) continue
		matches.add(id)
		for (let parentId = index.parents.get(id); parentId !== undefined; parentId = index.parents.get(parentId)) ancestors.add(parentId)
	}
	return { matches, ancestors }
}

function isShown(node: TreeNode, scope: TreeSelectSearchScope | null, isUnderMatch: boolean): boolean {
	return !scope || isUnderMatch || scope.matches.has(node.id) || scope.ancestors.has(node.id)
}

export function buildTreeSelectRows(source: TreeSelectRowsSource): TreeSelectRow[] {
	const scope = findSearchScope(source.index, source.query)
	const rows: TreeSelectRow[] = []
	const walk = (nodes: TreeNode[], { parentId, depth, isUnderMatch }: TreeSelectRowsLevel): void => {
		const shown = nodes.filter(node => isShown(node, scope, isUnderMatch))
		shown.forEach((node, position) => {
			const children = source.childrenOf(node)
			const isMatchBranch = isUnderMatch || Boolean(scope?.matches.has(node.id))
			const isForced = Boolean(scope?.ancestors.has(node.id))
			const isExpanded = children.length > 0 && (isForced || source.expandedSet.has(node.id))
			rows.push({
				node,
				parentId,
				depth,
				setSize: shown.length,
				posInSet: position + 1,
				hasChildren: children.length > 0,
				isExpanded,
			})
			if (isExpanded) walk(children, { parentId: node.id, depth: depth + 1, isUnderMatch: isMatchBranch })
		})
	}
	walk(source.roots, { parentId: null, depth: 0, isUnderMatch: false })
	return rows
}
