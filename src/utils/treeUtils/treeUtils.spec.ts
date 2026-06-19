/**
 * Unit-тесты для treeUtils.
 * Покрывают: collectDescendantIdsInto, buildDescendantsCache, collectExpandableIds.
 */

import { describe, it, expect } from 'vitest'
import {
	buildDescendantsCache,
	collectDescendantIdsInto,
	collectExpandableIds,
} from './treeUtils'
import type { TreeNode } from '@components/BaseTree/model/BaseTree.types'

const leaf: TreeNode = { id: 'leaf1', label: 'Leaf' }
const childWithLeaf: TreeNode = { id: 'child1', label: 'Child', children: [leaf] }
const childNoChildren: TreeNode = { id: 'child2', label: 'Child No Kids' }
const root: TreeNode = { id: 'root', label: 'Root', children: [childWithLeaf, childNoChildren] }

const deepTree: TreeNode = {
	id: 'a',
	label: 'A',
	children: [
		{
			id: 'b',
			label: 'B',
			children: [
				{ id: 'c', label: 'C', children: [{ id: 'd', label: 'D' }] },
			],
		},
	],
}

describe('treeUtils', () => {
	describe('collectDescendantIdsInto', () => {
		it('собирает id всех потомков в массив', () => {
			const ids: string[] = []
			collectDescendantIdsInto(root.children!, ids)
			expect(ids).toEqual(['child1', 'leaf1', 'child2'])
		})

		it('не добавляет ничего для пустого массива детей', () => {
			const ids: string[] = []
			collectDescendantIdsInto([], ids)
			expect(ids).toEqual([])
		})

		it('рекурсивно обходит глубокое дерево', () => {
			const ids: string[] = []
			collectDescendantIdsInto([deepTree], ids)
			expect(ids).toEqual(['a', 'b', 'c', 'd'])
		})

		it('корректно обрабатывает узлы без children', () => {
			const ids: string[] = []
			collectDescendantIdsInto([leaf], ids)
			expect(ids).toEqual(['leaf1'])
		})

		it('корректно обрабатывает узлы с пустым массивом children', () => {
			const node: TreeNode = { id: 'empty', label: 'Empty', children: [] }
			const ids: string[] = []
			collectDescendantIdsInto([node], ids)
			expect(ids).toEqual(['empty'])
		})
	})

	describe('buildDescendantsCache', () => {
		it('строит кэш потомков для узлов с детьми', () => {
			const cache = new Map<string, string[]>()
			buildDescendantsCache([root], cache)
			expect(cache.get('root')).toEqual(['child1', 'leaf1', 'child2'])
			expect(cache.get('child1')).toEqual(['leaf1'])
		})

		it('не добавляет в кэш узлы без детей', () => {
			const cache = new Map<string, string[]>()
			buildDescendantsCache([root], cache)
			expect(cache.has('leaf1')).toBe(false)
			expect(cache.has('child2')).toBe(false)
		})

		it('не добавляет в кэш для пустого массива', () => {
			const cache = new Map<string, string[]>()
			buildDescendantsCache([], cache)
			expect(cache.size).toBe(0)
		})

		it('строит кэш для глубокого дерева', () => {
			const cache = new Map<string, string[]>()
			buildDescendantsCache([deepTree], cache)
			expect(cache.get('a')).toEqual(['b', 'c', 'd'])
			expect(cache.get('b')).toEqual(['c', 'd'])
			expect(cache.get('c')).toEqual(['d'])
			expect(cache.has('d')).toBe(false)
		})

		it('не добавляет в кэш узлы с пустым массивом children', () => {
			const node: TreeNode = { id: 'empty', label: 'Empty', children: [] }
			const cache = new Map<string, string[]>()
			buildDescendantsCache([node], cache)
			expect(cache.has('empty')).toBe(false)
		})
	})

	describe('collectExpandableIds', () => {
		it('собирает id узлов с детьми', () => {
			expect(collectExpandableIds([root])).toEqual(['root', 'child1'])
		})

		it('возвращает пустой массив для листьев', () => {
			expect(collectExpandableIds([leaf])).toEqual([])
		})

		it('возвращает пустой массив для пустого массива', () => {
			expect(collectExpandableIds([])).toEqual([])
		})

		it('рекурсивно собирает из глубокого дерева', () => {
			expect(collectExpandableIds([deepTree])).toEqual(['a', 'b', 'c'])
		})

		it('не включает узлы с пустым массивом children', () => {
			const node: TreeNode = { id: 'empty', label: 'Empty', children: [] }
			expect(collectExpandableIds([node])).toEqual([])
		})

		it('возвращает пустой массив если ни один узел не имеет детей', () => {
			const nodes: TreeNode[] = [
				{ id: 'a', label: 'A' },
				{ id: 'b', label: 'B' },
			]
			expect(collectExpandableIds(nodes)).toEqual([])
		})
	})
})
