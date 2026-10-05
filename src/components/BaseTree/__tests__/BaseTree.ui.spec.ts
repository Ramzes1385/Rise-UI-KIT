import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseTree from '../ui/BaseTree.vue'
import { createUiKitPlugin } from '@/plugin'
import { TREE_PARTS } from '../types/BaseTree.types'
import type { TreeNode } from '../types/BaseTree.types'
import { fireEvent, render, screen } from '@testing-library/vue'

const ITEMS: TreeNode[] = [
	{
		id: 'docs',
		label: 'Документы',
		icon: 'folder',
		children: [
			{ id: 'act', label: 'Акт.pdf', href: 'https://example.com/act' },
			{ id: 'bill', label: 'Счёт.pdf' },
		],
	},
	{ id: 'notes', label: 'Заметки' },
]

const ACTIONS = '<template #actions><button type="button">Удалить</button></template>'

const allUi = Object.fromEntries(['root', ...TREE_PARTS].map(part => [part, `u-${part}`]))

function header(name: string): HTMLElement {
	return screen.getByRole('treeitem', { name, hidden: true })
}

function branch(container: Element): HTMLElement {
	return container.querySelector<HTMLElement>('.base-tree__children')!
}

describe('BaseTree: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseTree, { props: { items: ITEMS, expandedIds: ['docs'] } })

		expect(container.querySelector('.base-tree')).toHaveAttribute('class', 'base-tree')
		expect(header('Документы')).toHaveAttribute('class', 'base-tree__header')
		expect(container.querySelector('.base-tree__label')).toHaveAttribute('class', 'base-tree__label')
		expect(container.querySelector('.base-tree__actions')).toHaveAttribute('class', 'base-tree__actions')
		expect(container.querySelector('.base-tree__children-inner')).toHaveAttribute('class', 'base-tree__children-inner')
		expect(branch(container)).toHaveAttribute('class', 'base-tree__children base-tree__children--open')
	})

	it('классы всех частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const { container } = render(BaseTree, {
			props: {
				items: ITEMS,
				expandedIds: ['docs'],
				selectionMode: 'multiple',
				variant: 'outline',
				customClass: { root: 'own-root', header: 'own-header' },
				ui: allUi,
			},
			slots: { actions: ACTIONS },
		})

		expect(container.querySelector('.base-tree')).toHaveClass('base-tree', 'u-root', 'base-tree--outline', 'own-root')
		expect(header('Документы')).toHaveClass('base-tree__header', 'u-header', 'own-header')
		expect(container.querySelector('.base-tree__arrow')).toHaveClass('u-arrow', 'base-tree__arrow--expanded')
		expect(branch(container)).toHaveClass('u-children', 'base-tree__children--open')
		for (const part of TREE_PARTS.filter(name => name !== 'row'))
			expect(container.querySelector(`.base-tree__${part}`)).toHaveClass(`u-${part}`)
	})

	it('стрелка справа и строка виртуального списка получают классы частей', async () => {
		const { container } = render(BaseTree, {
			props: { items: ITEMS, isVirtual: true, arrowPosition: 'right', ui: { row: 'u-row', arrow: 'u-arrow' } },
		})
		await nextTick()

		expect(container.querySelector('.base-tree__row')).toHaveClass('base-tree__row', 'u-row')
		expect(container.querySelector('.base-tree__arrow')).toHaveClass('base-tree__arrow--right', 'u-arrow')
	})

	it('классы из defaults.BaseTree.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseTree, {
			props: { items: ITEMS, ui: { label: 'own-label' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseTree: { ui: { root: 'app-root', label: 'app-label' } } } })] },
		})

		expect(container.querySelector('.base-tree')).toHaveClass('base-tree', 'app-root')
		expect(container.querySelector('.base-tree__label')).toHaveAttribute('class', 'base-tree__label app-label own-label')
	})
})

describe('BaseTree: движение', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('первое раскрытие: ветка монтируется свёрнутой, после пересчёта стилей получает класс --open', async () => {
		const states: Array<{ isMounted: boolean; isOpen: boolean }> = []
		const { container } = render(BaseTree, { props: { items: ITEMS } })
		const spy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
			const children = this.querySelector('.base-tree__children')
			states.push({ isMounted: Boolean(children), isOpen: Boolean(children?.classList.contains('base-tree__children--open')) })
			return new DOMRect()
		})

		expect(branch(container)).toBeNull()
		await fireEvent.click(header('Документы'))
		await nextTick()

		expect(states).toEqual([{ isMounted: true, isOpen: false }])
		expect(branch(container)).toHaveClass('base-tree__children--open')
		expect(branch(container)).not.toHaveAttribute('inert')
		expect(header('Документы')).toHaveAttribute('aria-expanded', 'true')

		await fireEvent.click(header('Документы'))
		await fireEvent.click(header('Документы'))
		await nextTick()

		expect(spy).toHaveBeenCalledTimes(1)
		expect(branch(container)).toHaveClass('base-tree__children--open')
	})

	it('сворачивание — сразу без класса --open, ветка вне фокуса и дерева доступности', async () => {
		const { container } = render(BaseTree, { props: { items: ITEMS, isDefaultExpandAll: true } })

		expect(branch(container)).toHaveClass('base-tree__children--open')
		await fireEvent.click(header('Документы'))
		await nextTick()

		expect(branch(container)).not.toHaveClass('base-tree__children--open')
		expect(branch(container)).toHaveAttribute('inert')
		expect(branch(container)).toHaveAttribute('aria-hidden', 'true')
		expect(screen.queryByRole('treeitem', { name: 'Счёт.pdf' })).not.toBeInTheDocument()
	})
})
