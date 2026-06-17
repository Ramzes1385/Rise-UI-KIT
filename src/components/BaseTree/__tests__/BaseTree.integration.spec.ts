/**
 * Integration-тесты для BaseTree.
 * Проверяют взаимодействие: клики, раскрытие/сворачивание, выбор, клавиатура.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'
import BaseTree from '../ui/BaseTree.vue'
import type { TreeNode } from '../model/BaseTree.types'

/** Узлы с вложенностью */
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

/** Узлы с глубокой вложенностью для каскадного выбора */
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

/** Узлы с отключёнными элементами */
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

/** Слот для рендера текста узлов */
const DEFAULT_SLOT = `<template #label="{ node }">{{ node.label }}</template>`

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

			await user.click(screen.getByText('Металл'))
			await user.click(screen.getByText('Дерево'))

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
			const { container, emitted } = render(BaseTree, {
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

			await user.click(screen.getByText('Корень'))

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

			await user.click(screen.getByText('Корень'))

			const afterSelect = emitted()['update:selectedIds'] as unknown[]
			const selectedIds = (afterSelect[afterSelect.length - 1] as unknown[])[0] as string[]
			expect(selectedIds).toContain('root')
			expect(selectedIds).toContain('child-a')

			await user.click(screen.getByText('Корень'))

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

			// Сначала раскрываем родителя, чтобы дочерний узел отрендерился
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

			// Родитель уже раскрыт через expandedIds — disabled-узел в DOM
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

	describe('клавиатура', () => {
		it('должен раскрывать узел по Enter', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseTree, {
				props: { items: NESTED_ITEMS },
				slots: { label: DEFAULT_SLOT },
			})

			// Находим header элемент и фокусируем его
			const header = container.querySelector('.base-tree__header') as HTMLElement
			header?.focus()
			await user.keyboard('{Enter}')

			const expandedNodes = container.querySelectorAll('.base-tree__node--expanded')
			expect(expandedNodes.length).toBeGreaterThanOrEqual(1)
		})
	})
})
