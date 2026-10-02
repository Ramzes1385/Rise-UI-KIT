import { describe, it, expect } from 'vitest'
import type { TreeNode } from '@components/BaseTree/types/BaseTree.types'
import {
	buildDescendantsCache,
	buildTreeIndex,
	collectDescendantIdsInto,
	collectExpandableIds,
	getTreeChildren,
	getTreeRoots,
	normalizeTreeSelection,
	toggleTreeSelection,
} from '../treeUtils'

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
			children: [{ id: 'c', label: 'C', children: [{ id: 'd', label: 'D' }] }],
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

	describe('циклы, дубли и большие деревья', () => {
		function cyclic(): TreeNode[] {
			const a: TreeNode = { id: 'a', label: 'A', children: [] }
			const b: TreeNode = { id: 'b', label: 'B', children: [a] }
			a.children = [b, { id: 'c', label: 'C' }]
			return [a]
		}

		function chain(depth: number): TreeNode {
			const rootNode: TreeNode = { id: 'n0', label: 'n0' }
			let current = rootNode
			for (let level = 1; level < depth; level++) {
				const next: TreeNode = { id: `n${level}`, label: `n${level}` }
				current.children = [next]
				current = next
			}
			return rootNode
		}

		it('цикл в children не зацикливает обход: повтор пропускается', () => {
			const ids: string[] = []
			collectDescendantIdsInto(cyclic(), ids)
			expect(ids).toEqual(['a', 'b', 'c'])
			expect(collectExpandableIds(cyclic())).toEqual(['a', 'b'])
		})

		it('кэш потомков при цикле: узел не попадает в свой список', () => {
			const cache = new Map<string, string[]>()
			buildDescendantsCache(cyclic(), cache)
			expect(cache.get('a')).toEqual(['b', 'c'])
			expect(cache.get('b')).toEqual(['a', 'c'])
		})

		it('глубина 20 000 и 200 000 детей одного узла — без переполнения стека', () => {
			expect(collectExpandableIds([chain(20000)])).toHaveLength(19999)
			const wide: TreeNode = { id: 'wide', label: 'wide', children: [] }
			for (let position = 0; position < 200000; position++) wide.children?.push({ id: `w${position}`, label: 'w' })
			const ids: string[] = []
			collectDescendantIdsInto([wide], ids)
			expect(ids).toHaveLength(200001)
		})
	})

	describe('buildTreeIndex и getTreeChildren', () => {
		it('узел и родитель по id, порядок обхода, повторы — цикл и дубль', () => {
			const a: TreeNode = { id: 'a', label: 'A', children: [] }
			const items: TreeNode[] = [a, { id: 'x', label: 'X', children: [{ id: 'b', label: 'Дубль' }] }]
			a.children = [{ id: 'b', label: 'B', children: [a] }]

			const index = buildTreeIndex(items)
			expect(index.order).toEqual(['a', 'b', 'x'])
			expect(index.parents.get('b')).toBe('a')
			expect(index.parents.has('a')).toBe(false)
			expect(index.nodes.get('b')?.label).toBe('B')
			expect(index.repeated).toEqual(['a', 'b'])
		})

		it('дети без повторов; ребёнок, которого индекс не знает, остаётся; лист — без детей', () => {
			const a: TreeNode = { id: 'a', label: 'A', children: [] }
			const b: TreeNode = { id: 'b', label: 'B', children: [a] }
			a.children = [b]
			const index = buildTreeIndex([a])
			expect(getTreeChildren(index, a)).toEqual([b])
			expect(getTreeChildren(index, b)).toEqual([])

			b.children?.push({ id: 'new', label: 'Новый' })
			expect(getTreeChildren(index, b).map(node => node.id)).toEqual(['new'])
			expect(getTreeChildren(index, { id: 'leaf', label: 'Лист' })).toEqual([])
		})
	})

	describe('повторы по ссылке на узел (п. 6–8 проверки)', () => {
		it('getTreeRoots: дубль id на корне и узел, уже встреченный потомком, пропускаются', () => {
			const b: TreeNode = { id: 'b', label: 'B' }
			const a: TreeNode = { id: 'a', label: 'A', children: [b] }
			const twin: TreeNode = { id: 'a', label: 'Дубль A' }
			const items = [a, twin, b]
			expect(getTreeRoots(buildTreeIndex(items), items)).toEqual([a])
		})

		it('getTreeRoots: тот же объект дважды на корне показывается один раз', () => {
			const a: TreeNode = { id: 'a', label: 'A' }
			const items = [a, a]
			expect(getTreeRoots(buildTreeIndex(items), items)).toEqual([a])
		})

		it('getTreeChildren: дубль id среди детей одного родителя пропускается', () => {
			const first: TreeNode = { id: 'b', label: 'B' }
			const parent: TreeNode = { id: 'p', label: 'P', children: [first, { id: 'b', label: 'Дубль B' }, first] }
			expect(getTreeChildren(buildTreeIndex([parent]), parent)).toEqual([first])
		})

		it('без повторов — тот же массив: стабильная ссылка не перерисовывает узлы', () => {
			const parent: TreeNode = { id: 'p', label: 'P', children: [{ id: 'c', label: 'C' }] }
			const items = [parent]
			const index = buildTreeIndex(items)
			expect(getTreeRoots(index, items)).toBe(items)
			expect(getTreeChildren(index, parent)).toBe(parent.children)
			expect(getTreeChildren(index, { id: 'leaf', label: 'Лист' })).toBe(getTreeChildren(index, { id: 'leaf2', label: 'Лист 2' }))
		})
	})

	describe('выбор с каскадом (multiple)', () => {
		const ITEMS: TreeNode[] = [
			{
				id: 'root',
				label: 'Корень',
				children: [
					{
						id: 'a',
						label: 'A',
						children: [
							{ id: 'a1', label: 'A1' },
							{ id: 'a2', label: 'A2' },
						],
					},
					{ id: 'b', label: 'B' },
					{ id: 'locked', label: 'Закрыто', isDisabled: true, children: [{ id: 'l1', label: 'L1' }] },
					{ id: 'only-locked', label: 'Только закрытые', children: [{ id: 'z', label: 'Z', isDisabled: true }] },
				],
			},
		]
		const index = buildTreeIndex(ITEMS)

		it('выбранный узел выбирает доступных потомков, отключённое поддерево не трогает', () => {
			const { selected, indeterminate } = normalizeTreeSelection(index, ['root'])
			expect(selected).toEqual(['root', 'a', 'b', 'only-locked', 'a1', 'a2'])
			expect(indeterminate.size).toBe(0)
		})

		it('выбор всех доступных детей выбирает родителя; часть — частичный выбор до корня', () => {
			expect(normalizeTreeSelection(index, ['a1', 'a2']).selected).toEqual(['a1', 'a2', 'a'])

			const partial = normalizeTreeSelection(index, ['a1'])
			expect(partial.selected).toEqual(['a1'])
			expect([...partial.indeterminate]).toEqual(['a', 'root'])
		})

		it('узел, у которого все дети отключены, выбирается сам; выбранный отключённый узел сохраняется и не каскадирует', () => {
			const { selected, indeterminate } = normalizeTreeSelection(index, ['locked', 'only-locked', 'unknown'])
			expect(selected).toEqual(['locked', 'only-locked', 'unknown'])
			expect([...indeterminate]).toEqual(['root'])
		})

		it('toggle: включение — узел и доступные потомки, родители пересчитываются', () => {
			const afterA = toggleTreeSelection(index, [], 'a')
			expect(afterA).toEqual(['a', 'a1', 'a2'])
			const all = toggleTreeSelection(index, toggleTreeSelection(index, afterA, 'b'), 'only-locked')
			expect(all).toEqual(['a', 'a1', 'a2', 'b', 'only-locked', 'root'])
		})

		it('toggle: снятие одного ребёнка снимает выбор с предков, отключённые не трогает', () => {
			const all = normalizeTreeSelection(index, ['root', 'locked']).selected
			expect(toggleTreeSelection(index, all, 'a2')).toEqual(['locked', 'b', 'only-locked', 'a1'])
		})

		it('toggle: под отключённым предком — его состояние не меняется', () => {
			expect(toggleTreeSelection(index, ['locked'], 'l1')).toEqual(['locked', 'l1'])
			expect(toggleTreeSelection(index, ['locked', 'l1'], 'l1')).toEqual(['locked'])
		})

		it('toggle: id не из дерева переключается сам по себе', () => {
			expect(toggleTreeSelection(index, [], 'ghost')).toEqual(['ghost'])
		})
	})
})
