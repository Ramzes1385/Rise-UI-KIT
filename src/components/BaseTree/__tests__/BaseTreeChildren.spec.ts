/**
 * Unit-тесты для BaseTreeChildren и BaseTreeNode.
 * Проверяют выброс ошибки при отсутствии контекста и работу с дефолтным слотом.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render } from '@testing-library/vue'
import BaseTree from '../ui/BaseTree.vue'
import BaseTreeChildren from '../ui/BaseTreeChildren.vue'
import BaseTreeNode from '../ui/BaseTreeNode.vue'
import type { TreeNode } from '../model/BaseTree.types'

const NESTED_ITEMS: TreeNode[] = [
	{
		id: 'parent',
		label: 'Родитель',
		children: [{ id: 'child', label: 'Ребёнок' }],
	},
]

describe('BaseTreeChildren', () => {
	it('должен выбрасывать ошибку без контекста дерева', () => {
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

		expect(() =>
			render(BaseTreeChildren, {
				props: {
					children: [{ id: 'x', label: 'X' }],
					depth: 0,
					sizeScale: 100,
					isExpanded: true,
					wasExpanded: true,
				},
			}),
		).toThrow('BaseTreeChildren: TreeContext not found')

		errorSpy.mockRestore()
	})

	it('должен прокидывать дефолтный слот в дочерние узлы при разворачивании', () => {
		const { container } = render(BaseTree, {
			props: { items: NESTED_ITEMS, isDefaultExpandAll: true },
			slots: { label: `<template #label="{ node }">{{ node.label }}</template>` },
		})

		expect(container.textContent).toContain('Ребёнок')
	})
})

describe('BaseTreeNode', () => {
	it('должен выбрасывать ошибку без контекста дерева', () => {
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

		expect(() =>
			render(BaseTreeNode, {
				props: { node: { id: 'x', label: 'X' }, depth: 0, sizeScale: 100 },
			}),
		).toThrow('BaseTreeNode: TreeContext not found')
		errorSpy.mockRestore()
	})

	it('должен вызывать selectNode при клике по чекбоксу не-отключённого узла', async () => {
		const items: TreeNode[] = [{ id: 'a', label: 'A' }]

		const { container, emitted } = render(BaseTree, {
			props: { items, selectionMode: 'multiple' },
			slots: { label: `<template #label="{ node }">{{ node.label }}</template>` },
		})

		const checkbox = container.querySelector('.base-tree__checkbox input') as HTMLInputElement
		await fireEvent.click(checkbox)

		expect(emitted()['update:selectedIds']).toBeTruthy()
	})
})
