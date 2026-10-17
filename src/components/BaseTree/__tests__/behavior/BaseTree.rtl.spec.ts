import '@testing-library/jest-dom/vitest'
import BaseTree from '../../ui/BaseTree.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import type { TreeNode } from '../../types/BaseTree.types'

const ITEMS: TreeNode[] = [
	{
		id: 'metal',
		label: 'Металл',
		children: [
			{ id: 'steel', label: 'Сталь' },
			{ id: 'copper', label: 'Медь' },
		],
	},
	{ id: 'wood', label: 'Дерево' },
]

const LABEL_SLOT = `<template #label="{ node }">{{ node.label }}</template>`

function treeItem(name: string): HTMLElement {
	return screen.getByRole('treeitem', { name, hidden: true })
}

describe('BaseTree в RTL', () => {
	beforeEach(() => document.documentElement.setAttribute('dir', 'rtl'))
	afterEach(() => document.documentElement.removeAttribute('dir'))

	it('← раскрывает узел и уходит к первому ребёнку, → сворачивает и возвращает к родителю', async () => {
		const user = userEvent.setup()
		render(BaseTree, { props: { items: ITEMS }, slots: { label: LABEL_SLOT } })
		treeItem('Металл').focus()

		await user.keyboard('{ArrowLeft}')
		expect(treeItem('Металл')).toHaveAttribute('aria-expanded', 'true')
		await user.keyboard('{ArrowLeft}')
		expect(treeItem('Сталь')).toHaveFocus()

		await user.keyboard('{ArrowRight}')
		expect(treeItem('Металл')).toHaveFocus()
		await user.keyboard('{ArrowRight}')
		expect(treeItem('Металл')).toHaveAttribute('aria-expanded', 'false')
	})
})
