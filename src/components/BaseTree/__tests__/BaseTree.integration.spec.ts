import '@testing-library/jest-dom/vitest'
import BaseTree from '../ui/BaseTree.vue'
import userEvent from '@testing-library/user-event'
import type { TreeNode } from '../types/BaseTree.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const NESTED_ITEMS: TreeNode[] = [
	{
		id: 'metall',
		label: 'Металл',
		children: [
			{ id: 'steel', label: 'Сталь' },
			{ id: 'copper', label: 'Медь' },
		],
	},
	{ id: 'wood', label: 'Дерево' },
]

const CASCADE_ITEMS: TreeNode[] = [
	{
		id: 'root',
		label: 'Корень',
		children: [
			{
				id: 'child-a',
				label: 'Ребёнок A',
				children: [
					{ id: 'grandchild-1', label: 'Внук 1' },
					{ id: 'grandchild-2', label: 'Внук 2' },
				],
			},
			{ id: 'child-b', label: 'Ребёнок B' },
		],
	},
]

const DISABLED_ITEMS: TreeNode[] = [
	{
		id: 'group',
		label: 'Группа',
		children: [
			{ id: 'ok', label: 'Доступный' },
			{ id: 'no', label: 'Отключённый', isDisabled: true },
		],
	},
]

const DEFAULT_SLOT = `<template #label="{ node }">{{ node.label }}</template>`

function nodeLabel(text: string): HTMLElement {
	return screen.getByText(text, { selector: '.base-tree__label' })
}

function treeItem(name: string): HTMLElement {
	return screen.getByRole('treeitem', { name, hidden: true })
}

describe('BaseTree integration', () => {
	describe('раскрытие/сворачивание', () => {
		it('должен раскрывать узел по клику на заголовок', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseTree, {
				props: { items: NESTED_ITEMS },
				slots: { label: DEFAULT_SLOT },
			})

			const header = screen.getByText('Металл')
			await user.click(header)

			const expandedNodes = container.querySelectorAll('.base-tree__node--expanded')
			expect(expandedNodes.length).toBeGreaterThanOrEqual(1)
		})

		it('должен сворачивать узел по повторному клику', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseTree, {
				props: { items: NESTED_ITEMS },
				slots: { label: DEFAULT_SLOT },
			})

			const header = screen.getByText('Металл')
			await user.click(header)

			await waitFor(() => {
				expect(container.querySelectorAll('.base-tree__node--expanded').length).toBeGreaterThanOrEqual(1)
			})

			await user.click(header)
			const metallNode = container.querySelector('.base-tree__node')
			expect(metallNode?.classList.contains('base-tree__node--expanded')).toBe(false)
		})

		it('должен эмитить toggle при раскрытии узла', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTree, {
				props: { items: NESTED_ITEMS },
				slots: { label: DEFAULT_SLOT },
			})

			const header = screen.getByText('Металл')
			await user.click(header)

			const toggleEvents = emitted()['toggle'] as unknown[]
			expect(toggleEvents).toBeTruthy()
			expect((toggleEvents[0] as unknown[])[0]).toBe('metall')
		})

		it('не должен эмитить toggle при клике на лист без детей в режиме none', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTree, {
				props: { items: NESTED_ITEMS, selectionMode: 'none' },
				slots: { label: DEFAULT_SLOT },
			})

			const header = screen.getByText('Дерево')
			await user.click(header)

			expect(emitted()['toggle']).toBeFalsy()
		})
	})

	describe('выбор узлов', () => {
		it('должен выбирать узел в режиме single по клику на заголовок', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTree, {
				props: { items: NESTED_ITEMS, selectionMode: 'single' },
				slots: { label: DEFAULT_SLOT },
			})

			const header = screen.getByText('Дерево')
			await user.click(header)

			const selectEvents = emitted()['select'] as unknown[]
			expect(selectEvents).toBeTruthy()
			expect((selectEvents[0] as unknown[])[0]).toBe('wood')
		})

		it('должен выбирать несколько узлов в режиме multiple', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseTree, {
				props: { items: NESTED_ITEMS, selectionMode: 'multiple' },
				slots: { label: DEFAULT_SLOT },
			})

			await user.click(nodeLabel('Металл'))
			await user.click(nodeLabel('Дерево'))

			const selectedNodes = container.querySelectorAll('.base-tree__node--selected')
			expect(selectedNodes.length).toBeGreaterThanOrEqual(2)
		})

		it('должен заменять выбор в режиме single', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseTree, {
				props: { items: NESTED_ITEMS, selectionMode: 'single' },
				slots: { label: DEFAULT_SLOT },
			})

			await user.click(screen.getByText('Металл'))
			await user.click(screen.getByText('Дерево'))

			const selectedNodes = container.querySelectorAll('.base-tree__node--selected')
			expect(selectedNodes).toHaveLength(1)
		})

		it('не должен раскрывать узел при клике в режиме single', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseTree, {
				props: { items: NESTED_ITEMS, selectionMode: 'single' },
				slots: { label: DEFAULT_SLOT },
			})

			await user.click(screen.getByText('Металл'))

			const metallNode = container.querySelector('.base-tree__node')
			expect(metallNode?.classList.contains('base-tree__node--expanded')).toBe(false)
		})

		it('должен выбирать узел и не раскрывать в режиме single', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTree, {
				props: { items: NESTED_ITEMS, selectionMode: 'single' },
				slots: { label: DEFAULT_SLOT },
			})

			await user.click(screen.getByText('Металл'))

			const selectEvents = emitted()['select'] as unknown[]
			expect(selectEvents).toBeTruthy()
			expect((selectEvents[0] as unknown[])[0]).toBe('metall')
		})
	})

	describe('каскадный выбор в multiple', () => {
		it('должен выбирать всех потомков при выборе родителя', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTree, {
				props: { items: CASCADE_ITEMS, selectionMode: 'multiple' },
				slots: { label: DEFAULT_SLOT },
			})

			await user.click(nodeLabel('Корень'))

			const events = emitted()['update:selectedIds'] as unknown[]
			expect(events).toBeTruthy()
			const lastValue = (events[events.length - 1] as unknown[])[0] as string[]
			expect(lastValue).toContain('root')
			expect(lastValue).toContain('child-a')
			expect(lastValue).toContain('child-b')
			expect(lastValue).toContain('grandchild-1')
			expect(lastValue).toContain('grandchild-2')
		})

		it('должен снимать всех потомков при снятии родителя', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTree, {
				props: { items: CASCADE_ITEMS, selectionMode: 'multiple' },
				slots: { label: DEFAULT_SLOT },
			})

			await user.click(nodeLabel('Корень'))

			const afterSelect = emitted()['update:selectedIds'] as unknown[]
			const selectedIds = (afterSelect[afterSelect.length - 1] as unknown[])[0] as string[]
			expect(selectedIds).toContain('root')
			expect(selectedIds).toContain('child-a')

			await user.click(nodeLabel('Корень'))

			const afterDeselect = emitted()['update:selectedIds'] as unknown[]
			const deselectedIds = (afterDeselect[afterDeselect.length - 1] as unknown[])[0] as string[]
			expect(deselectedIds).not.toContain('root')
			expect(deselectedIds).not.toContain('child-a')
			expect(deselectedIds).not.toContain('grandchild-1')
		})
	})

	describe('arrowPosition', () => {
		it('должен раскрывать узел по клику на стрелку слева', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseTree, {
				props: { items: NESTED_ITEMS, arrowPosition: 'left' },
				slots: { label: DEFAULT_SLOT },
			})

			const arrow = container.querySelector('.base-tree__arrow')
			await user.click(arrow!)

			const expandedNodes = container.querySelectorAll('.base-tree__node--expanded')
			expect(expandedNodes.length).toBeGreaterThanOrEqual(1)
		})

		it('должен раскрывать узел по клику на стрелку справа', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseTree, {
				props: { items: NESTED_ITEMS, arrowPosition: 'right' },
				slots: { label: DEFAULT_SLOT },
			})

			const arrow = container.querySelector('.base-tree__arrow--right')
			await user.click(arrow!)

			const expandedNodes = container.querySelectorAll('.base-tree__node--expanded')
			expect(expandedNodes.length).toBeGreaterThanOrEqual(1)
		})
	})

	describe('слот label', () => {
		it('должен рендерить кастомную метку с состоянием выбора', async () => {
			const user = userEvent.setup()
			render(BaseTree, {
				props: { items: NESTED_ITEMS, selectionMode: 'single' },
				slots: {
					label: `<template #label="{ node, isSelected }">
						<span>{{ isSelected ? '✓' : '' }} {{ node.label }}</span>
					</template>`,
				},
			})

			expect(screen.getByText('Дерево')).toBeInTheDocument()

			await user.click(screen.getByText('Дерево'))
		})
	})

	describe('отключённые узлы', () => {
		it('не должен раскрывать отключённый узел', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseTree, {
				props: { items: DISABLED_ITEMS },
				slots: { label: DEFAULT_SLOT },
			})

			await user.click(screen.getByText('Группа'))

			const disabledNode = container.querySelector('.base-tree__node--disabled')
			expect(disabledNode).toBeInTheDocument()
			expect(disabledNode?.classList.contains('base-tree__node--expanded')).toBe(false)
		})

		it('не должен выбирать отключённый узел', async () => {
			const { container } = render(BaseTree, {
				props: {
					items: DISABLED_ITEMS,
					selectionMode: 'single',
					expandedIds: ['group'],
				},
				slots: { label: DEFAULT_SLOT },
			})

			const disabledNode = container.querySelector('.base-tree__node--disabled')
			expect(disabledNode).toBeInTheDocument()
			expect(disabledNode?.classList.contains('base-tree__node--selected')).toBe(false)
		})
	})

	describe('v-model expandedIds', () => {
		it('должен эмитить update:expandedIds при раскрытии', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTree, {
				props: { items: NESTED_ITEMS },
				slots: { label: DEFAULT_SLOT },
			})

			await user.click(screen.getByText('Металл'))

			const events = emitted()['update:expandedIds'] as unknown[]
			expect(events).toBeTruthy()
			const lastValue = (events[events.length - 1] as unknown[])[0] as string[]
			expect(lastValue).toContain('metall')
		})
	})

	describe('v-model selectedIds', () => {
		it('должен эмитить update:selectedIds при выборе', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTree, {
				props: { items: NESTED_ITEMS, selectionMode: 'single' },
				slots: { label: DEFAULT_SLOT },
			})

			await user.click(screen.getByText('Дерево'))

			const events = emitted()['update:selectedIds'] as unknown[]
			expect(events).toBeTruthy()
			const lastValue = (events[events.length - 1] as unknown[])[0] as string[]
			expect(lastValue).toContain('wood')
		})
	})

	describe('порядок Tab', () => {
		it('в порядке Tab один узел — первый видимый; следующий Tab уходит из дерева', async () => {
			const user = userEvent.setup()
			render(BaseTree, { props: { items: NESTED_ITEMS, isDefaultExpandAll: true }, slots: { label: DEFAULT_SLOT } })

			const tabbable = screen.getAllByRole('treeitem').filter(item => item.tabIndex === 0)
			expect(tabbable).toEqual([treeItem('Металл')])

			await user.tab()
			expect(treeItem('Металл')).toHaveFocus()
			await user.tab()
			expect(document.body).toHaveFocus()
		})

		it('в порядке Tab — выбранный узел, если он виден', () => {
			render(BaseTree, {
				props: { items: NESTED_ITEMS, selectionMode: 'single', selectedIds: ['wood'] },
				slots: { label: DEFAULT_SLOT },
			})

			expect(treeItem('Дерево')).toHaveAttribute('tabindex', '0')
			expect(treeItem('Металл')).toHaveAttribute('tabindex', '-1')
		})

		it('дерево запоминает узел с фокусом: Shift+Tab возвращает на него', async () => {
			const user = userEvent.setup()
			render(BaseTree, { props: { items: NESTED_ITEMS }, slots: { label: DEFAULT_SLOT } })

			await user.tab()
			await user.keyboard('{ArrowDown}')
			expect(treeItem('Дерево')).toHaveFocus()
			await user.tab()
			await user.tab({ shift: true })

			expect(treeItem('Дерево')).toHaveFocus()
			expect(treeItem('Металл')).toHaveAttribute('tabindex', '-1')
		})

		it('клик ставит фокус на узел и переносит на него порядок Tab', async () => {
			const user = userEvent.setup()
			render(BaseTree, { props: { items: NESTED_ITEMS }, slots: { label: DEFAULT_SLOT } })

			await user.click(nodeLabel('Дерево'))

			expect(treeItem('Дерево')).toHaveFocus()
			expect(treeItem('Дерево')).toHaveAttribute('tabindex', '0')
		})

		it('узлы свёрнутой после раскрытия ветки скрыты и не получают tabindex 0', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseTree, { props: { items: NESTED_ITEMS }, slots: { label: DEFAULT_SLOT } })

			await user.click(nodeLabel('Металл'))
			await user.click(nodeLabel('Металл'))

			expect(container.querySelector('.base-tree__children')).toHaveStyle({ visibility: 'hidden' })
			expect(screen.queryByRole('treeitem', { name: 'Сталь' })).not.toBeInTheDocument()
			const steel = nodeLabel('Сталь').closest('[role="treeitem"]')
			expect(steel).toHaveAttribute('tabindex', '-1')
		})

		it('флажок в режиме multiple — только вид: вне порядка Tab и дерева доступности, отметку несёт aria-checked', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseTree, {
				props: { items: NESTED_ITEMS, selectionMode: 'multiple' },
				slots: { label: DEFAULT_SLOT },
			})

			const wraps = container.querySelectorAll('.base-tree__checkbox-wrap')
			expect(wraps).toHaveLength(2)
			for (const wrap of wraps) {
				expect(wrap).toHaveAttribute('inert')
				expect(wrap).toHaveAttribute('aria-hidden', 'true')
			}
			expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
			expect(treeItem('Металл')).toHaveAttribute('aria-checked', 'false')

			await user.click(treeItem('Металл').querySelector('.base-tree__checkbox') as HTMLElement)
			expect(treeItem('Металл')).toHaveAttribute('aria-checked', 'true')
			expect(treeItem('Дерево')).toHaveAttribute('aria-checked', 'false')
		})
	})

	describe('роли и состояния (APG Tree View)', () => {
		it('корень — tree с именем, узлы — treeitem с уровнем и позицией, дети — group', () => {
			const { container } = render(BaseTree, {
				props: { items: NESTED_ITEMS, isDefaultExpandAll: true, ariaLabel: 'Материалы' },
				slots: { label: DEFAULT_SLOT },
			})

			expect(screen.getByRole('tree', { name: 'Материалы' })).toBe(container.querySelector('.base-tree'))
			expect(treeItem('Металл')).toHaveAttribute('aria-level', '1')
			expect(treeItem('Металл')).toHaveAttribute('aria-setsize', '2')
			expect(treeItem('Металл')).toHaveAttribute('aria-posinset', '1')
			expect(treeItem('Металл')).toHaveAttribute('aria-expanded', 'true')
			expect(treeItem('Дерево')).toHaveAttribute('aria-posinset', '2')
			expect(treeItem('Дерево')).not.toHaveAttribute('aria-expanded')
			expect(treeItem('Медь')).toHaveAttribute('aria-level', '2')
			expect(treeItem('Медь')).toHaveAttribute('aria-setsize', '2')
			expect(treeItem('Медь')).toHaveAttribute('aria-posinset', '2')
			expect(screen.getByRole('group')).toContainElement(treeItem('Сталь'))
		})

		it('имя узла — только подпись: кнопки слота actions в него не входят', () => {
			render(BaseTree, {
				props: { items: [{ id: 'doc', label: 'Договор' }] },
				slots: { actions: '<button type="button">Скачать</button>' },
			})

			expect(screen.getByRole('treeitem', { name: 'Договор' })).toBeInTheDocument()
		})

		it('без выбора у узлов нет aria-selected и aria-checked', () => {
			render(BaseTree, { props: { items: NESTED_ITEMS }, slots: { label: DEFAULT_SLOT } })

			expect(treeItem('Металл')).not.toHaveAttribute('aria-selected')
			expect(treeItem('Металл')).not.toHaveAttribute('aria-checked')
		})

		it('в режиме single aria-selected="true" только у выбранного узла, у остальных атрибута нет', async () => {
			const user = userEvent.setup()
			render(BaseTree, { props: { items: NESTED_ITEMS, selectionMode: 'single' }, slots: { label: DEFAULT_SLOT } })

			await user.click(nodeLabel('Дерево'))

			expect(treeItem('Дерево')).toHaveAttribute('aria-selected', 'true')
			expect(treeItem('Металл')).not.toHaveAttribute('aria-selected')
		})
	})

	describe('клавиатура', () => {
		const FOOD: TreeNode[] = [
			{
				id: 'fruits',
				label: 'Фрукты',
				children: [
					{ id: 'apple', label: 'Яблоко' },
					{ id: 'banana', label: 'Банан' },
					{
						id: 'citrus',
						label: 'Цитрусы',
						children: [
							{ id: 'orange', label: 'Апельсин' },
							{ id: 'lemon', label: 'Лимон' },
						],
					},
				],
			},
			{ id: 'vegetables', label: 'Овощи', children: [{ id: 'carrot', label: 'Морковь' }] },
			{ id: 'berries', label: 'Ягоды', isDisabled: true, children: [{ id: 'cherry', label: 'Вишня' }] },
			{ id: 'bread', label: 'Батон' },
		]

		async function focusFirst(user: ReturnType<typeof userEvent.setup>): Promise<void> {
			await user.tab()
			expect(treeItem('Фрукты')).toHaveFocus()
		}

		it('↓ и ↑ ходят по видимым узлам, отключённый узел тоже получает фокус; на краях фокус остаётся', async () => {
			const user = userEvent.setup()
			render(BaseTree, { props: { items: FOOD }, slots: { label: DEFAULT_SLOT } })
			await focusFirst(user)

			await user.keyboard('{ArrowUp}')
			expect(treeItem('Фрукты')).toHaveFocus()
			await user.keyboard('{ArrowDown}')
			expect(treeItem('Овощи')).toHaveFocus()
			await user.keyboard('{ArrowDown}')
			expect(treeItem('Ягоды')).toHaveFocus()
			await user.keyboard('{ArrowDown}{ArrowDown}')
			expect(treeItem('Батон')).toHaveFocus()
			await user.keyboard('{ArrowUp}')
			expect(treeItem('Ягоды')).toHaveFocus()
			expect(screen.getAllByRole('treeitem').filter(item => item.tabIndex === 0)).toEqual([treeItem('Ягоды')])
		})

		it('Home и End — первый и последний видимый узел', async () => {
			const user = userEvent.setup()
			render(BaseTree, { props: { items: FOOD }, slots: { label: DEFAULT_SLOT } })
			await focusFirst(user)

			await user.keyboard('{End}')
			expect(treeItem('Батон')).toHaveFocus()
			await user.keyboard('{Home}')
			expect(treeItem('Фрукты')).toHaveFocus()
		})

		it('→ раскрывает закрытый узел, на раскрытом — к первому ребёнку, на листе ничего не делает', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTree, { props: { items: FOOD }, slots: { label: DEFAULT_SLOT } })
			await focusFirst(user)

			await user.keyboard('{ArrowRight}')
			expect(treeItem('Фрукты')).toHaveAttribute('aria-expanded', 'true')
			expect(treeItem('Фрукты')).toHaveFocus()
			await user.keyboard('{ArrowRight}')
			expect(treeItem('Яблоко')).toHaveFocus()
			await user.keyboard('{ArrowRight}')
			expect(treeItem('Яблоко')).toHaveFocus()
			expect(emitted().toggle).toEqual([['fruits', true]])
		})

		it('← с ребёнка ведёт к родителю, на раскрытом узле сворачивает его; у свёрнутого корня ничего не делает', async () => {
			const user = userEvent.setup()
			render(BaseTree, { props: { items: FOOD, isDefaultExpandAll: true }, slots: { label: DEFAULT_SLOT } })
			treeItem('Лимон').focus()

			await user.keyboard('{ArrowLeft}')
			expect(treeItem('Цитрусы')).toHaveFocus()
			await user.keyboard('{ArrowLeft}')
			expect(treeItem('Цитрусы')).toHaveAttribute('aria-expanded', 'false')
			expect(treeItem('Цитрусы')).toHaveFocus()
			await user.keyboard('{ArrowLeft}')
			expect(treeItem('Фрукты')).toHaveFocus()
			await user.keyboard('{ArrowLeft}{ArrowLeft}')
			expect(treeItem('Фрукты')).toHaveAttribute('aria-expanded', 'false')
			expect(treeItem('Фрукты')).toHaveFocus()
		})

		it('← на раскрытом узле сворачивает его и оставляет фокус', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTree, { props: { items: FOOD }, slots: { label: DEFAULT_SLOT } })
			await focusFirst(user)

			await user.keyboard('{ArrowRight}{ArrowLeft}')

			expect(treeItem('Фрукты')).toHaveAttribute('aria-expanded', 'false')
			expect(treeItem('Фрукты')).toHaveFocus()
			expect(emitted().toggle).toEqual([
				['fruits', true],
				['fruits', false],
			])
		})

		it('стрелки не раскрывают и не сворачивают отключённый узел', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTree, { props: { items: FOOD }, slots: { label: DEFAULT_SLOT } })
			await focusFirst(user)

			await user.keyboard('{ArrowDown}{ArrowDown}{ArrowRight}')
			expect(treeItem('Ягоды')).toHaveFocus()
			expect(treeItem('Ягоды')).toHaveAttribute('aria-expanded', 'false')
			await user.keyboard('{Enter}{ }')
			expect(emitted().toggle).toBeUndefined()
		})

		it('открытый отключённый узел: → ведёт к ребёнку, ← с ребёнка — обратно к узлу, а не сворачивает его', async () => {
			const user = userEvent.setup()
			render(BaseTree, { props: { items: FOOD, expandedIds: ['berries'] }, slots: { label: DEFAULT_SLOT } })
			treeItem('Ягоды').focus()

			await user.keyboard('{ArrowRight}')
			expect(treeItem('Вишня')).toHaveFocus()
			await user.keyboard('{ArrowLeft}{ArrowLeft}')
			expect(treeItem('Ягоды')).toHaveFocus()
			expect(treeItem('Ягоды')).toHaveAttribute('aria-expanded', 'true')
		})

		it('`*` раскрывает всех соседей узла одним событием, кроме отключённых', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTree, { props: { items: FOOD }, slots: { label: DEFAULT_SLOT } })
			await focusFirst(user)

			await user.keyboard('*')

			expect(emitted()['update:expandedIds']).toEqual([[['fruits', 'vegetables']]])
			expect(treeItem('Овощи')).toHaveAttribute('aria-expanded', 'true')
			expect(treeItem('Ягоды')).toHaveAttribute('aria-expanded', 'false')
			expect(treeItem('Фрукты')).toHaveFocus()

			await user.keyboard('*')
			expect(emitted()['update:expandedIds']).toHaveLength(1)
		})

		it('буквы ведут к узлу по началу подписи: повтор буквы — к следующему, несколько букв — к слову', async () => {
			vi.useFakeTimers()
			render(BaseTree, { props: { items: FOOD, expandedIds: ['fruits'] }, slots: { label: DEFAULT_SLOT } })
			treeItem('Фрукты').focus()

			await fireEvent.keyDown(treeItem('Фрукты'), { key: 'б' })
			expect(treeItem('Банан')).toHaveFocus()
			await fireEvent.keyDown(treeItem('Банан'), { key: 'б' })
			expect(treeItem('Батон')).toHaveFocus()
			vi.advanceTimersByTime(600)

			await fireEvent.keyDown(treeItem('Батон'), { key: 'Я' })
			expect(treeItem('Яблоко')).toHaveFocus()
			vi.advanceTimersByTime(600)

			for (const key of ['я', 'г']) await fireEvent.keyDown(document.activeElement as HTMLElement, { key })
			expect(treeItem('Ягоды')).toHaveFocus()
			vi.advanceTimersByTime(600)

			await fireEvent.keyDown(treeItem('Ягоды'), { key: 'щ' })
			await fireEvent.keyDown(treeItem('Ягоды'), { key: 'ф', ctrlKey: true })
			expect(treeItem('Ягоды')).toHaveFocus()
			vi.useRealTimers()
		})

		it('пробел во время поиска по буквам — часть запроса, а не выбор', async () => {
			vi.useFakeTimers()
			const items: TreeNode[] = [
				{ id: 'juice-orange', label: 'Сок апельсиновый' },
				{ id: 'juice-apple', label: 'Сок яблочный' },
			]
			const { emitted } = render(BaseTree, { props: { items, selectionMode: 'single' }, slots: { label: DEFAULT_SLOT } })
			treeItem('Сок апельсиновый').focus()

			for (const key of ['с', 'о', 'к', ' ', 'я']) await fireEvent.keyDown(document.activeElement as HTMLElement, { key })

			expect(treeItem('Сок яблочный')).toHaveFocus()
			expect(emitted().select).toBeUndefined()
			vi.useRealTimers()
		})

		it('Enter без выбора раскрывает и сворачивает папку', async () => {
			const user = userEvent.setup()
			render(BaseTree, { props: { items: FOOD }, slots: { label: DEFAULT_SLOT } })
			await focusFirst(user)

			await user.keyboard('{Enter}')
			expect(treeItem('Фрукты')).toHaveAttribute('aria-expanded', 'true')
			await user.keyboard('{Enter}')
			expect(treeItem('Фрукты')).toHaveAttribute('aria-expanded', 'false')
		})

		it('Enter и пробел в режиме single выбирают узел', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTree, { props: { items: FOOD, selectionMode: 'single' }, slots: { label: DEFAULT_SLOT } })
			await focusFirst(user)

			await user.keyboard('{End}{Enter}')
			expect(treeItem('Батон')).toHaveAttribute('aria-selected', 'true')
			await user.keyboard('{ArrowUp}{ArrowUp}{ }')
			expect(treeItem('Овощи')).toHaveAttribute('aria-selected', 'true')
			expect(emitted().select).toEqual([
				['bread', true],
				['vegetables', true],
			])
		})

		it('пробел в режиме multiple переключает отметку узла и его поддерева', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTree, { props: { items: FOOD, selectionMode: 'multiple' }, slots: { label: DEFAULT_SLOT } })
			await focusFirst(user)

			await user.keyboard('{ArrowDown}{ }')
			expect(treeItem('Овощи')).toHaveAttribute('aria-checked', 'true')
			expect(emitted()['update:selectedIds']).toEqual([[['vegetables', 'carrot']]])
			await user.keyboard('{ }')
			expect(treeItem('Овощи')).toHaveAttribute('aria-checked', 'false')
		})

		it('клавиши из слота actions дерево не перехватывает', async () => {
			const user = userEvent.setup()
			render(BaseTree, {
				props: { items: FOOD },
				slots: { label: DEFAULT_SLOT, actions: '<button type="button">Ещё</button>' },
			})
			const [firstAction] = screen.getAllByRole('button', { name: 'Ещё' })
			firstAction.focus()

			await user.keyboard('{ArrowDown}')

			expect(firstAction).toHaveFocus()
		})
	})

	describe('ссылки (to и href)', () => {
		const LINKS: TreeNode[] = [
			{ id: 'intro', label: 'Введение', to: '/intro' },
			{
				id: 'components',
				label: 'Компоненты',
				to: '/components',
				children: [{ id: 'button', label: 'Кнопка', to: '/components/button' }],
			},
			{ id: 'github', label: 'GitHub', href: 'https://github.com', target: '_blank' },
			{ id: 'draft', label: 'Черновик', to: '/draft', isDisabled: true },
		]

		function trackLinkClicks(): ReturnType<typeof vi.fn> {
			const clicks = vi.fn()
			for (const link of document.querySelectorAll('.base-tree__link')) {
				link.addEventListener('click', event => {
					event.preventDefault()
					clicks(link.getAttribute('href'))
				})
			}
			return clicks
		}

		it('подпись узла с to/href — ссылка BaseLink вне порядка Tab; у отключённого узла ссылки нет', () => {
			render(BaseTree, { props: { items: LINKS } })

			const intro = screen.getByRole('link', { name: 'Введение' })
			expect(intro).toHaveAttribute('href', '/intro')
			expect(intro).toHaveAttribute('tabindex', '-1')
			expect(screen.getByRole('link', { name: /GitHub/ })).toHaveAttribute('rel', 'noopener noreferrer')
			expect(screen.queryByRole('link', { name: 'Черновик' })).not.toBeInTheDocument()
			expect(screen.getByRole('treeitem', { name: 'Черновик' })).toBeInTheDocument()
		})

		it('Enter на узле-ссылке переходит по ней и не раскрывает узел', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTree, { props: { items: LINKS } })
			const clicks = trackLinkClicks()

			await user.tab()
			await user.keyboard('{ArrowDown}{Enter}')

			expect(clicks).toHaveBeenCalledWith('/components')
			expect(screen.getByRole('treeitem', { name: 'Компоненты' })).toHaveAttribute('aria-expanded', 'false')
			expect(emitted().toggle).toBeUndefined()
		})

		it('клик по ссылке в режиме single выбирает узел; повторный клик выбор не снимает', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTree, { props: { items: LINKS, selectionMode: 'single' } })
			const clicks = trackLinkClicks()

			await user.click(screen.getByRole('link', { name: 'Введение' }))
			await user.click(screen.getByRole('link', { name: 'Введение' }))

			expect(clicks).toHaveBeenCalledTimes(2)
			expect(emitted().select).toEqual([['intro', true]])
			expect(screen.getByRole('treeitem', { name: 'Введение' })).toHaveAttribute('aria-selected', 'true')
		})

		it('нажатие мышью на ссылку оставляет фокус на узле', async () => {
			const user = userEvent.setup()
			render(BaseTree, { props: { items: LINKS } })
			trackLinkClicks()

			await user.click(screen.getByRole('link', { name: 'Введение' }))
			expect(screen.getByRole('treeitem', { name: 'Введение' })).toHaveFocus()

			const middle = new MouseEvent('mousedown', { button: 1, bubbles: true, cancelable: true })
			screen.getByRole('link', { name: /GitHub/ }).dispatchEvent(middle)
			expect(middle.defaultPrevented).toBe(false)
			expect(screen.getByRole('treeitem', { name: 'Введение' })).toHaveFocus()
		})

		it('Enter на отключённом узле-ссылке ничего не делает', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTree, { props: { items: LINKS, selectionMode: 'single' } })
			screen.getByRole('treeitem', { name: 'Черновик' }).focus()

			await user.keyboard('{Enter}')

			expect(emitted().select).toBeUndefined()
		})
	})

	describe('слоты label-<id>', () => {
		it('метка одного узла по id на любой глубине, у остальных — слот label', () => {
			render(BaseTree, {
				props: { items: NESTED_ITEMS, expandedIds: ['metall'] },
				slots: {
					label: DEFAULT_SLOT,
					'label-copper': '<template #label-copper="{ node, depth }">{{ node.label }} · уровень {{ depth }}</template>',
				},
			})
			expect(screen.getByText('Медь · уровень 1')).toBeInTheDocument()
			expect(screen.getByText('Сталь')).toBeInTheDocument()
			expect(screen.getByText('Дерево')).toBeInTheDocument()
		})
	})

	describe('каскад с частичным выбором (APG Tree View, multiple)', () => {
		const PROJECT: TreeNode[] = [
			{
				id: 'src',
				label: 'Исходники',
				children: [
					{ id: 'main', label: 'Главный' },
					{ id: 'util', label: 'Утилиты' },
					{ id: 'secret', label: 'Секрет', isDisabled: true },
				],
			},
			{ id: 'readme', label: 'Описание' },
		]

		function lastSelected(emitted: Record<string, unknown[]>): string[] {
			const events = emitted['update:selectedIds'] as unknown[][]
			return events[events.length - 1][0] as string[]
		}

		function checkboxInput(item: HTMLElement): HTMLInputElement {
			return item.querySelector('.base-tree__checkbox input') as HTMLInputElement
		}

		it('пробел на папке отмечает доступных детей, отключённого не трогает; снятие ребёнка — mixed у родителя', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTree, {
				props: { items: PROJECT, selectionMode: 'multiple', isDefaultExpandAll: true },
				slots: { label: DEFAULT_SLOT },
			})
			await user.tab()
			expect(treeItem('Исходники')).toHaveFocus()

			await user.keyboard('{ }')
			expect(lastSelected(emitted())).toEqual(['src', 'main', 'util'])
			expect(treeItem('Исходники')).toHaveAttribute('aria-checked', 'true')
			expect(treeItem('Главный')).toHaveAttribute('aria-checked', 'true')
			expect(treeItem('Секрет')).toHaveAttribute('aria-checked', 'false')

			await user.keyboard('{ArrowDown}{ArrowDown}{ }')
			expect(treeItem('Утилиты')).toHaveFocus()
			expect(lastSelected(emitted())).toEqual(['main'])
			expect(treeItem('Исходники')).toHaveAttribute('aria-checked', 'mixed')
			expect(checkboxInput(treeItem('Исходники')).indeterminate).toBe(true)
			expect(treeItem('Утилиты')).toHaveAttribute('aria-checked', 'false')

			await user.keyboard('{ }')
			expect(lastSelected(emitted())).toEqual(['main', 'util', 'src'])
			expect(treeItem('Исходники')).toHaveAttribute('aria-checked', 'true')
			expect(checkboxInput(treeItem('Исходники')).indeterminate).toBe(false)
		})

		it('пробел на узле с частичным выбором отмечает всё поддерево', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTree, {
				props: { items: PROJECT, selectionMode: 'multiple', selectedIds: ['util'] },
				slots: { label: DEFAULT_SLOT },
			})
			expect(treeItem('Исходники')).toHaveAttribute('aria-checked', 'mixed')

			await user.tab()
			expect(treeItem('Исходники')).toHaveFocus()
			await user.keyboard('{ }')
			expect(lastSelected(emitted())).toEqual(['util', 'src', 'main'])
			expect(emitted().select).toEqual([['src', true]])
		})

		it('флажок отключённого узла заблокирован, пробел на нём ничего не меняет', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTree, {
				props: { items: PROJECT, selectionMode: 'multiple', expandedIds: ['src'] },
				slots: { label: DEFAULT_SLOT },
			})
			expect(checkboxInput(treeItem('Секрет'))).toBeDisabled()
			await user.tab()
			await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ }')
			expect(treeItem('Секрет')).toHaveFocus()
			expect(emitted()['update:selectedIds']).toBeUndefined()
		})

		it('смена режима на single оставляет один выбранный узел', async () => {
			const { emitted, rerender } = render(BaseTree, {
				props: { items: PROJECT, selectionMode: 'multiple', selectedIds: ['src', 'main', 'util'] },
				slots: { label: DEFAULT_SLOT },
			})
			await rerender({ selectionMode: 'single' })
			expect(lastSelected(emitted())).toEqual(['src'])
			expect(treeItem('Исходники')).toHaveAttribute('aria-selected', 'true')
		})
	})

	describe('слот actions и порядок Tab', () => {
		const ACTIONS = '<button type="button">Ещё</button><button type="button" tabindex="-1">Скрытая</button>'

		function actionsOf(name: string): HTMLButtonElement {
			return treeItem(name).querySelector('.base-tree__actions button') as HTMLButtonElement
		}

		it('Tab с узла попадает в действия этого узла; действия других узлов вне порядка Tab', async () => {
			const user = userEvent.setup()
			render(BaseTree, { props: { items: NESTED_ITEMS }, slots: { label: DEFAULT_SLOT, actions: ACTIONS } })

			expect(actionsOf('Металл')).not.toHaveAttribute('tabindex')
			expect(actionsOf('Дерево')).toHaveAttribute('tabindex', '-1')
			expect(treeItem('Металл').querySelectorAll('button')[1]).toHaveAttribute('tabindex', '-1')

			await user.tab()
			expect(treeItem('Металл')).toHaveFocus()
			await user.tab()
			expect(actionsOf('Металл')).toHaveFocus()
			await user.tab()
			expect(document.body).toHaveFocus()

			await user.tab({ shift: true })
			await user.tab({ shift: true })
			await user.keyboard('{ArrowDown}')
			expect(treeItem('Дерево')).toHaveFocus()
			expect(actionsOf('Металл')).toHaveAttribute('tabindex', '-1')
			expect(actionsOf('Дерево')).not.toHaveAttribute('tabindex')
			expect(actionsOf('Дерево')).not.toHaveAttribute('data-rise-tree-tabindex')
			expect(treeItem('Дерево').querySelectorAll('button')[1]).toHaveAttribute('tabindex', '-1')
			await user.tab()
			expect(actionsOf('Дерево')).toHaveFocus()
		})

		it('клик, Enter и пробел по кнопке действий не выбирают и не раскрывают узел', async () => {
			const user = userEvent.setup()
			const onAction = vi.fn()
			const { emitted } = render(BaseTree, {
				props: { items: NESTED_ITEMS, selectionMode: 'single' },
				slots: { label: DEFAULT_SLOT, actions: ACTIONS },
				attrs: { onClickCapture: onAction },
			})

			await user.click(actionsOf('Металл'))
			await user.keyboard('{Enter}{ }')

			expect(onAction).toHaveBeenCalledTimes(3)
			expect(emitted().select).toBeUndefined()
			expect(emitted().toggle).toBeUndefined()
			expect(treeItem('Металл')).toHaveAttribute('tabindex', '0')
		})

		it('фокус на кнопке действий делает её узел текущим в порядке Tab', async () => {
			render(BaseTree, { props: { items: NESTED_ITEMS }, slots: { label: DEFAULT_SLOT, actions: ACTIONS } })

			actionsOf('Дерево').focus()
			await waitFor(() => expect(treeItem('Дерево')).toHaveAttribute('tabindex', '0'))
			expect(actionsOf('Дерево')).not.toHaveAttribute('tabindex')
		})
	})

	describe('данные: items позже, undefined, циклы, отключённый родитель', () => {
		it('isDefaultExpandAll раскрывает узлы, пришедшие позже', async () => {
			const { rerender } = render(BaseTree, { props: { items: [], isDefaultExpandAll: true }, slots: { label: DEFAULT_SLOT } })
			await rerender({ items: NESTED_ITEMS })
			expect(treeItem('Металл')).toHaveAttribute('aria-expanded', 'true')
			expect(treeItem('Сталь')).toBeVisible()
		})

		it('items: undefined — пустое дерево без ошибок', () => {
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
			render(BaseTree, { props: { items: undefined as unknown as TreeNode[], isDefaultExpandAll: true, selectionMode: 'multiple' } })
			expect(screen.getByRole('tree')).toBeInTheDocument()
			expect(screen.queryAllByRole('treeitem')).toHaveLength(0)
			warnSpy.mockRestore()
		})

		it('цикл в children не зацикливает раскрытие: повтор не показан, в консоли предупреждение', () => {
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
			const loop: TreeNode = { id: 'loop', label: 'Петля', children: [] }
			loop.children = [{ id: 'inner', label: 'Внутри', children: [loop] }]

			render(BaseTree, { props: { items: [loop], isDefaultExpandAll: true }, slots: { label: DEFAULT_SLOT } })

			expect(screen.getAllByRole('treeitem')).toHaveLength(2)
			expect(treeItem('Внутри')).not.toHaveAttribute('aria-expanded')
			expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('loop'))
			warnSpy.mockRestore()
		})

		it('дети раскрытого отключённого узла выбираются кликом', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTree, {
				props: {
					items: [{ id: 'off', label: 'Закрыто', isDisabled: true, children: [{ id: 'open', label: 'Открыто' }] }],
					selectionMode: 'single',
					expandedIds: ['off'],
				},
				slots: { label: DEFAULT_SLOT },
			})
			await user.click(nodeLabel('Открыто'))
			expect(emitted()['update:selectedIds']).toEqual([[['open']]])
		})
	})
})
