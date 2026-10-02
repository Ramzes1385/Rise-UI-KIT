import { computed, shallowRef } from 'vue'
import { resolveCascaderTree } from './cascaderTree'
import { buildTreeIndex, getTreeChildren, getTreeRoots } from '@utils/navigation/treeUtils'
import type { BaseCascaderEmits, BaseCascaderNode, CascaderLevels, CascaderProps } from '../../types/BaseCascader.types'

function withEntry<K, V>(map: ReadonlyMap<K, V>, key: K, value: V): Map<K, V> {
	return new Map(map).set(key, value)
}

function withoutEntry<K, V>(map: ReadonlyMap<K, V>, key: K): Map<K, V> {
	const next = new Map(map)
	next.delete(key)
	return next
}

export function useCascaderLevels(props: CascaderProps, emit: BaseCascaderEmits): CascaderLevels {
	const loaded = shallowRef<ReadonlyMap<string, BaseCascaderNode[]>>(new Map())
	const pending = shallowRef<ReadonlyMap<string, Promise<boolean>>>(new Map())
	const errors = shallowRef<ReadonlyMap<string, unknown>>(new Map())

	const tree = computed(() => resolveCascaderTree(props.items, node => node.children ?? loaded.value.get(node.id)))
	const index = computed(() => buildTreeIndex(tree.value))
	const isPendingLazy = (node: BaseCascaderNode): boolean => !node.children && !node.isLeaf && Boolean(props.load)

	function startLoad(node: BaseCascaderNode, load: NonNullable<CascaderProps['load']>): Promise<boolean> {
		errors.value = withoutEntry(errors.value, node.id)
		const promise = Promise.resolve()
			.then(() => load(node))
			.then(
				children => {
					loaded.value = withEntry(loaded.value, node.id, children)
					return true
				},
				(error: unknown) => {
					errors.value = withEntry(errors.value, node.id, error)
					emit('load-error', node, error)
					return false
				},
			)
			.finally(() => {
				pending.value = withoutEntry(pending.value, node.id)
			})
		pending.value = withEntry(pending.value, node.id, promise)
		return promise
	}

	return {
		index,
		roots: computed(() => getTreeRoots(index.value, tree.value)),
		childrenOf: node => getTreeChildren(index.value, node),
		hasChildren: node => !node.isDisabled && (Boolean(node.children?.length) || isPendingLazy(node)),
		ensureChildren(node) {
			const current = index.value.nodes.get(node.id) ?? node
			if (!props.load || !isPendingLazy(current)) return Promise.resolve(true)
			return pending.value.get(node.id) ?? startLoad(current, props.load)
		},
		isLoadingNode: id => pending.value.has(id),
		hasErrorNode: id => errors.value.has(id),
	}
}
