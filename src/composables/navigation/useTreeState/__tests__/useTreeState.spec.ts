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
	items?: TreeNode[]
}

function setup(opts: Setup = {}) {
	const items = ref<TreeNode[]>(opts.items ?? ITEMS)
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
	return { items, selectionMode, isDefaultExpandAll, emit, ...api }
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

	it('режим multiple: выбор узла выбирает всех потомков, снятие — снимает их', () => {
		const ctx = setup({ mode: 'multiple' })
		ctx.selectNode('docs')
		expect([...ctx.selectedIds.value].sort()).toEqual(['a', 'b', 'b1', 'docs'])
		expect(ctx.emit).toHaveBeenCalledWith('select', 'docs', true)

		ctx.selectNode('img')
		ctx.selectNode('b')
		expect([...ctx.selectedIds.value].sort()).toEqual(['a', 'docs', 'img'])
		expect(ctx.emit).toHaveBeenLastCalledWith('select', 'b', false)
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
})
