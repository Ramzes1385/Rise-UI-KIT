import { inject } from 'vue'
import { TREE_CONTEXT_KEY } from '../types/BaseTree.types'

export function useBaseTreeChildren() {
	const treeContext = inject(TREE_CONTEXT_KEY, undefined)
	if (!treeContext) {
		throw new Error('BaseTreeChildren: TreeContext not found. Ensure BaseTreeChildren is rendered inside BaseTree.')
	}
	return { treeContext }
}
