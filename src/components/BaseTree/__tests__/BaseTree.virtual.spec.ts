/**
 * Unit-тесты виртуальной прокрутки BaseTree: плоский список видимых узлов с уровнем и позицией, узел в порядке Tab
 * остаётся в DOM, переход стрелками и Home/End к неотрисованному узлу. jsdom не считает раскладку: высота области
 * подменяется.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { nextTick } from 'vue'
import BaseTree from '../ui/BaseTree.vue'
import type { TreeNode } from '../model/BaseTree.types'

/** 200 папок, у первой — два файла */
const ITEMS: TreeNode[] = Array.from({ length: 200 }, (_, index) => ({
	id: `folder-${index}`,
	label: `Папка ${index + 1}`,
	children:
		index === 0
			? [
					{ id: 'file-a', label: 'Акт.pdf' },
					{ id: 'file-b', label: 'Счёт.pdf' },
				]
			: undefined,
}))

beforeAll(() => {
	Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
		configurable: true,
		get(this: HTMLElement) {
			return this.classList.contains('base-tree') ? 100 : 0
		},
	})
})

afterAll(() => {
	delete (HTMLElement.prototype as { clientHeight?: number }).clientHeight
})

async function setup(props: Record<string, unknown> = {}) {
	const result = render(BaseTree, { props: { items: ITEMS, ariaLabel: 'Документы', isVirtual: true, ...props } })
	await nextTick()
	return { ...result, tree: screen.getByRole('tree', { name: 'Документы' }) }
}

describe('BaseTree: виртуальная прокрутка', () => {
	it('плоский список видимых узлов с уровнем и позицией; высота области', async () => {
		const { tree } = await setup({ expandedIds: ['folder-0'] })
		expect(tree).toHaveClass('base-tree--virtual')
		expect(tree).toHaveStyle({ height: '400px' })
		expect(tree.querySelector('[role="group"]')).not.toBeInTheDocument()
		const items = screen.getAllByRole('treeitem')
		// 100px области по 36px — узлы 0–2 и 5 узлов запаса снизу
		expect(items).toHaveLength(8)
		expect(items[1]).toHaveAccessibleName('Акт.pdf')
		expect(items[1]).toHaveAttribute('aria-level', '2')
		expect(items[1]).toHaveAttribute('aria-setsize', '2')
		expect(items[3]).toHaveAttribute('aria-posinset', '2')
		expect(items[3]).toHaveAttribute('aria-setsize', '200')
		expect(items[1].closest('.base-tree__node')).toHaveStyle({ '--base-tree-depth': '1' })
		expect(tree.querySelector('.base-tree__virtual')).toHaveStyle({ height: `${202 * 36}px` })
	})

	it('узел в порядке Tab остаётся в DOM при прокрутке', async () => {
		const { tree } = await setup({ height: '50vh' })
		expect(tree).toHaveStyle({ height: '50vh' })
		tree.scrollTop = 3600
		await fireEvent.scroll(tree)
		const items = screen.getAllByRole('treeitem')
		expect(items[0]).toHaveAccessibleName('Папка 1')
		expect(items[0]).toHaveAttribute('tabindex', '0')
		expect(items[1]).toHaveAccessibleName('Папка 96')
	})

	it('End и Home прокручивают к неотрисованному узлу и ставят на него фокус; стрелки — по отрисованным', async () => {
		await setup()
		const first = screen.getByRole('treeitem', { name: 'Папка 1' })
		first.focus()
		await fireEvent.keyDown(first, { key: 'ArrowDown' })
		expect(screen.getByRole('treeitem', { name: 'Папка 2' })).toHaveFocus()
		await fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'End' })
		await nextTick()
		await nextTick()
		expect(screen.getByRole('treeitem', { name: 'Папка 200' })).toHaveFocus()
		expect(screen.queryByRole('treeitem', { name: 'Папка 1' })).not.toBeInTheDocument()
		await fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Home' })
		await nextTick()
		await nextTick()
		expect(screen.getByRole('treeitem', { name: 'Папка 1' })).toHaveFocus()
	})
})
