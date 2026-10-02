import { ref } from 'vue'
import { useTreeState } from '../useTreeState'
import { describe, expect, it, vi } from 'vitest'
import type { BaseTreeEmits, TreeNode, TreeSelectionMode } from '@components/BaseTree/types/BaseTree.types'

const ITEMS: TreeNode[] = [
	{
		id: 'docs',
		label: 'Документы',
		children: [
			{ id: 'a', label: 'A' },
			{ id: 'b', label: 'B', children: [{ id: 'b1', label: 'B1' }] },
		],
	},
	{ id: 'img', label: 'Картинки' },
]

type Setup = {
	mode?: TreeSelectionMode
	expanded?: string[]
	selected?: string[]
	expandAll?: boolean
	items?: TreeNode[] | undefined
	hasItems?: boolean
}

function setup(opts: Setup = {}) {
	const items = ref<TreeNode[] | undefined>(opts.hasItems === false ? undefined : (opts.items ?? ITEMS))
	const selectionMode = ref<TreeSelectionMode>(opts.mode ?? 'single')
	const expandedIds = ref<string[] | undefined>(opts.expanded)
	const selectedIds = ref<string[] | undefined>(opts.selected)
	const isDefaultExpandAll = ref(opts.expandAll ?? false)
	const emit = vi.fn()
	const api = useTreeState({
		items,
		selectionMode,
		expandedIds,
		selectedIds,
		isDefaultExpandAll,
		emit: emit as unknown as BaseTreeEmits,
	})
	return { items, selectionMode, selectedIdsProp: selectedIds, isDefaultExpandAll, emit, ...api }
}

const tick = () => Promise.resolve()

describe('useTreeState', () => {
	it('по умолчанию ничего не раскрыто и не выбрано', () => {
		const ctx = setup()
		expect(ctx.expandedIds.value).toEqual([])
		expect(ctx.selectedIds.value).toEqual([])
		expect(ctx.emit).not.toHaveBeenCalled()
	})

	it('toggleNode раскрывает и сворачивает узел с событиями', () => {
		const ctx = setup()
		ctx.toggleNode('docs')
		expect(ctx.expandedSet.value.has('docs')).toBe(true)
		expect(ctx.emit).toHaveBeenCalledWith('update:expandedIds', ['docs'])
		expect(ctx.emit).toHaveBeenCalledWith('toggle', 'docs', true)

		ctx.toggleNode('docs')
		expect(ctx.expandedSet.value.has('docs')).toBe(false)
		expect(ctx.emit).toHaveBeenLastCalledWith('toggle', 'docs', false)
	})

	it('управляемые expandedIds и selectedIds берутся из props', () => {
		const ctx = setup({ expanded: ['b'], selected: ['a'] })
		expect(ctx.expandedIds.value).toEqual(['b'])
		expect(ctx.selectedSet.value.has('a')).toBe(true)

		ctx.toggleNode('docs')
		expect(ctx.emit).toHaveBeenCalledWith('update:expandedIds', ['b', 'docs'])
	})

	it('expandNodes раскрывает только свёрнутые узлы одним update:expandedIds', () => {
		const ctx = setup({ expanded: ['docs'] })
		ctx.expandNodes(['docs', 'b', 'img'])

		const updates = ctx.emit.mock.calls.filter(call => call[0] === 'update:expandedIds')
		expect(updates).toEqual([['update:expandedIds', ['docs', 'b', 'img']]])
		expect(ctx.emit).toHaveBeenCalledWith('toggle', 'b', true)
		expect(ctx.emit).toHaveBeenCalledWith('toggle', 'img', true)
		expect(ctx.emit).not.toHaveBeenCalledWith('toggle', 'docs', true)
	})

	it('expandNodes без новых узлов ничего не сообщает', () => {
		const ctx = setup({ expanded: ['docs'] })
		ctx.expandNodes(['docs'])
		expect(ctx.emit).not.toHaveBeenCalled()
	})

	it('режим none: выбор не меняется', () => {
		const ctx = setup({ mode: 'none' })
		ctx.selectNode('a')
		expect(ctx.selectedIds.value).toEqual([])
		expect(ctx.emit).not.toHaveBeenCalled()
	})

	it('режим single: выбирает один узел, повторный выбор снимает его', () => {
		const ctx = setup()
		ctx.selectNode('a')
		expect(ctx.selectedIds.value).toEqual(['a'])
		expect(ctx.emit).toHaveBeenCalledWith('select', 'a', true)

		ctx.selectNode('b')
		expect(ctx.selectedIds.value).toEqual(['b'])

		ctx.selectNode('b')
		expect(ctx.selectedIds.value).toEqual([])
		expect(ctx.emit).toHaveBeenLastCalledWith('select', 'b', false)
	})

	it('режим multiple: выбор узла выбирает всех потомков; снятие ребёнка снимает выбор с предков', () => {
		const ctx = setup({ mode: 'multiple' })
		ctx.selectNode('docs')
		expect([...ctx.selectedIds.value].sort()).toEqual(['a', 'b', 'b1', 'docs'])
		expect(ctx.emit).toHaveBeenCalledWith('select', 'docs', true)

		ctx.selectNode('img')
		ctx.selectNode('b')
		expect([...ctx.selectedIds.value].sort()).toEqual(['a', 'img'])
		expect(ctx.indeterminateSet.value.has('docs')).toBe(true)
		expect(ctx.emit).toHaveBeenLastCalledWith('select', 'b', false)
		expect(ctx.emit).toHaveBeenCalledWith('update:selectedIds', ['a', 'img'])
	})

	it('режим multiple: лист без потомков добавляется к выбранным', () => {
		const ctx = setup({ mode: 'multiple', selected: ['a'] })
		ctx.selectNode('img')
		expect(ctx.emit).toHaveBeenCalledWith('update:selectedIds', ['a', 'img'])
	})

	it('кэш потомков пересобирается при смене items', async () => {
		const ctx = setup({ mode: 'multiple' })
		ctx.items.value = [{ id: 'img', label: 'Картинки', children: [{ id: 'png', label: 'PNG' }] }]
		await tick()

		ctx.selectNode('img')
		expect([...ctx.selectedIds.value].sort()).toEqual(['img', 'png'])
	})

	it('isDefaultExpandAll раскрывает все узлы с детьми — сразу и при включении позже', async () => {
		const ctx = setup({ expandAll: true })
		expect([...ctx.expandedIds.value].sort()).toEqual(['b', 'docs'])
		expect(ctx.emit).toHaveBeenCalledWith('update:expandedIds', expect.arrayContaining(['b', 'docs']))

		const later = setup()
		later.isDefaultExpandAll.value = true
		await tick()
		expect([...later.expandedIds.value].sort()).toEqual(['b', 'docs'])

		later.isDefaultExpandAll.value = false
		await tick()
		expect([...later.expandedIds.value].sort()).toEqual(['b', 'docs'])
	})

	it('режим multiple: выбор всех детей выбирает родителя, часть — частичный выбор; отключённый узел не выбирается', () => {
		const ctx = setup({
			mode: 'multiple',
			items: [
				{
					id: 'p',
					label: 'P',
					children: [
						{ id: 'x', label: 'X' },
						{ id: 'y', label: 'Y' },
						{ id: 'off', label: 'Off', isDisabled: true },
					],
				},
			],
		})
		ctx.selectNode('x')
		expect(ctx.indeterminateSet.value).toEqual(new Set(['p']))
		ctx.selectNode('y')
		expect(ctx.emit).toHaveBeenLastCalledWith('select', 'y', true)
		expect(ctx.selectedIds.value).toEqual(['x', 'y', 'p'])
		expect(ctx.indeterminateSet.value.size).toBe(0)

		ctx.emit.mockClear()
		ctx.selectNode('off')
		expect(ctx.emit).not.toHaveBeenCalled()
	})

	it('режим multiple: противоречивый проп показывается согласованным', () => {
		const ctx = setup({ mode: 'multiple', selected: ['b'] })
		expect(ctx.selectedIds.value).toEqual(['b', 'b1'])
		expect(ctx.selectedSet.value.has('b1')).toBe(true)
		expect(ctx.indeterminateSet.value).toEqual(new Set(['docs']))
	})

	it('items: undefined — пустое дерево без ошибок', () => {
		const ctx = setup({ hasItems: false, mode: 'multiple', expandAll: true })
		expect(ctx.roots.value).toEqual([])
		expect(ctx.expandedIds.value).toEqual([])
		expect(ctx.selectedIds.value).toEqual([])
		ctx.selectNode('a')
		expect(ctx.selectedIds.value).toEqual(['a'])
	})

	it('childrenOf: дети без повторных id; повтор — предупреждение в консоли', () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const a: TreeNode = { id: 'a', label: 'A', children: [] }
		const b: TreeNode = { id: 'b', label: 'B', children: [a] }
		a.children = [b]
		const ctx = setup({ items: [a], expandAll: true })
		const [node] = ctx.items.value as TreeNode[]
		const [child] = node.children as TreeNode[]

		expect(ctx.childrenOf(node)).toEqual([child])
		expect(ctx.childrenOf(child)).toEqual([])
		expect(ctx.expandedIds.value).toEqual(['a', 'b'])
		expect(warnSpy).toHaveBeenCalledTimes(1)
		expect(warnSpy.mock.calls[0][0]).toContain(': a.')
		warnSpy.mockRestore()
	})

	it('roots: корень без повторов; предупреждение о том же наборе повторов — один раз (п. 6, 9 проверки)', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const a: TreeNode = { id: 'a', label: 'A' }
		const ctx = setup({ items: [a, { id: 'a', label: 'Дубль' }] })
		expect(ctx.roots.value).toEqual([a])
		expect(warnSpy).toHaveBeenCalledTimes(1)

		ctx.items.value = [a, { id: 'a', label: 'Дубль' }, { id: 'c', label: 'C' }]
		await tick()
		expect(warnSpy).toHaveBeenCalledTimes(1)

		ctx.items.value = [a, { id: 'c', label: 'C' }, { id: 'c', label: 'Дубль C' }]
		await tick()
		expect(warnSpy).toHaveBeenCalledTimes(2)
		expect(warnSpy.mock.calls[1][0]).toContain(': c.')

		ctx.items.value = [a]
		await tick()
		ctx.items.value = [a, { id: 'c', label: 'C' }, { id: 'c', label: 'Дубль C' }]
		await tick()
		expect(warnSpy).toHaveBeenCalledTimes(3)
		warnSpy.mockRestore()
	})

	it('isDefaultExpandAll: узлы, пришедшие позже, раскрываются; свёрнутые пользователем — нет', async () => {
		const ctx = setup({ items: [], expandAll: true })
		expect(ctx.emit).not.toHaveBeenCalled()

		ctx.items.value = ITEMS
		await tick()
		expect(ctx.expandedIds.value).toEqual(['docs', 'b'])

		ctx.toggleNode('b')
		ctx.emit.mockClear()
		ctx.items.value = [...ITEMS, { id: 'new', label: 'Новая', children: [{ id: 'n1', label: 'N1' }] }]
		await tick()
		expect(ctx.expandedIds.value).toEqual(['docs', 'new'])
		expect(ctx.emit).toHaveBeenCalledWith('update:expandedIds', ['docs', 'new'])

		ctx.emit.mockClear()
		ctx.items.value = [...ctx.items.value!]
		await tick()
		expect(ctx.emit).not.toHaveBeenCalled()
	})

	it('без isDefaultExpandAll новые узлы не раскрываются', async () => {
		const ctx = setup({ items: [] })
		ctx.items.value = ITEMS
		await tick()
		expect(ctx.expandedIds.value).toEqual([])
		expect(ctx.emit).not.toHaveBeenCalled()
	})

	it('смена режима на single оставляет один выбранный id и сообщает об этом; none и один id — без события', async () => {
		const ctx = setup({ mode: 'multiple' })
		ctx.selectNode('b')
		ctx.emit.mockClear()

		ctx.selectionMode.value = 'single'
		await tick()
		expect(ctx.emit).toHaveBeenCalledWith('update:selectedIds', ['b'])
		expect(ctx.selectedIds.value).toEqual(['b'])

		ctx.emit.mockClear()
		ctx.selectionMode.value = 'none'
		await tick()
		ctx.selectionMode.value = 'single'
		await tick()
		expect(ctx.emit).not.toHaveBeenCalled()
		expect(ctx.selectedIds.value).toEqual(['b'])
	})

	it('режим single с несколькими id в пропе показывает только первый', () => {
		const ctx = setup({ selected: ['a', 'img'] })
		expect(ctx.selectedIds.value).toEqual(['a'])
		expect(ctx.selectedSet.value.has('img')).toBe(false)
	})

	it('режим none: выбор из пропа сохраняется как передан', async () => {
		const ctx = setup({ mode: 'multiple', selected: ['a', 'img'] })
		ctx.selectionMode.value = 'none'
		await tick()
		expect(ctx.selectedIds.value).toEqual(['a', 'img'])
		expect(ctx.emit).not.toHaveBeenCalled()
	})

	it('реактивные items: правка children на месте пересобирает индекс — новый ребёнок выбранной папки выбран', async () => {
		const ctx = setup({ mode: 'multiple', items: [{ id: 'p', label: 'P', children: [{ id: 'x', label: 'X' }] }] })
		ctx.selectNode('x')
		expect(ctx.selectedIds.value).toEqual(['x', 'p'])

		ctx.items.value?.[0].children?.push({ id: 'y', label: 'Y' })
		await tick()
		expect(ctx.selectedIds.value).toEqual(['x', 'p', 'y'])
		ctx.selectNode('y')
		expect(ctx.selectedIds.value).toEqual(['x'])
		expect(ctx.indeterminateSet.value.has('p')).toBe(true)
	})
})
