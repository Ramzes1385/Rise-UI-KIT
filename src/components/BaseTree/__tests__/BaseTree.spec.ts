/**
 * Unit-тесты для BaseTree.
 * Проверяют рендер, пропсы, CSS-модификаторы и слоты.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'

import type { TreeNode } from '../model/BaseTree.types'
import BaseTree from '../ui/BaseTree.vue'

/** Простые узлы без вложенности */
const FLAT_ITEMS: TreeNode[] = [
	{ id: 'item-1', label: 'Первый' },
	{ id: 'item-2', label: 'Второй' },
	{ id: 'item-3', label: 'Третий' },
]

/** Узлы с вложенностью */
const NESTED_ITEMS: TreeNode[] = [
	{
		id: 'parent',
		label: 'Родитель',
		children: [
			{ id: 'child-1', label: 'Ребёнок 1' },
			{ id: 'child-2', label: 'Ребёнок 2' },
		],
	},
	{ id: 'leaf', label: 'Лист' },
]

/** Узлы с иконками */
const ICON_ITEMS: TreeNode[] = [
	{ id: 'home', label: 'Главная', icon: 'home' },
	{ id: 'search', label: 'Поиск', icon: 'search' },
]

/** Узлы с отключёнными элементами */
const DISABLED_ITEMS: TreeNode[] = [
	{ id: 'ok', label: 'Доступный' },
	{ id: 'no', label: 'Отключённый', isDisabled: true },
]

/** Слот для рендера текста узлов */
const DEFAULT_SLOT = `<template #label="{ node }">{{ node.label }}</template>`

describe('BaseTree unit', () => {
	describe('рендер', () => {
		it('должен рендерить корневой контейнер', () => {
			const { container } = render(BaseTree, {
				props: { items: FLAT_ITEMS },
				slots: { label: DEFAULT_SLOT },
			})

			expect(container.querySelector('.base-tree')).toBeInTheDocument()
		})

		it('должен рендерить все узлы верхнего уровня', () => {
			render(BaseTree, {
				props: { items: FLAT_ITEMS },
				slots: { label: DEFAULT_SLOT },
			})

			expect(screen.getByText('Первый')).toBeInTheDocument()
			expect(screen.getByText('Второй')).toBeInTheDocument()
			expect(screen.getByText('Третий')).toBeInTheDocument()
		})

		it('должен рендерить пустое дерево без ошибок', () => {
			const { container } = render(BaseTree, { props: { items: [] } })

			expect(container.querySelector('.base-tree')).toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		it('не должен добавлять модификатор для default', () => {
			const { container } = render(BaseTree, {
				props: { items: FLAT_ITEMS },
				slots: { label: DEFAULT_SLOT },
			})

			expect(container.firstElementChild?.classList.contains('base-tree--default')).toBe(false)
		})

		it('должен применять модификатор --ghost', () => {
			const { container } = render(BaseTree, {
				props: { items: FLAT_ITEMS, variant: 'ghost' },
				slots: { label: DEFAULT_SLOT },
			})

			expect(container.firstElementChild?.classList.contains('base-tree--ghost')).toBe(true)
		})

		it('должен применять модификатор --outline', () => {
			const { container } = render(BaseTree, {
				props: { items: FLAT_ITEMS, variant: 'outline' },
				slots: { label: DEFAULT_SLOT },
			})

			expect(container.firstElementChild?.classList.contains('base-tree--outline')).toBe(true)
		})

		it('должен применять модификатор --shadow', () => {
			const { container } = render(BaseTree, {
				props: { items: FLAT_ITEMS, variant: 'shadow' },
				slots: { label: DEFAULT_SLOT },
			})

			expect(container.firstElementChild?.classList.contains('base-tree--shadow')).toBe(true)
		})

		it('должен применять модификатор --soft', () => {
			const { container } = render(BaseTree, {
				props: { items: FLAT_ITEMS, variant: 'soft' },
				slots: { label: DEFAULT_SLOT },
			})

			expect(container.firstElementChild?.classList.contains('base-tree--soft')).toBe(true)
		})
	})

	describe('пропс selectionMode', () => {
		it('должен рендерить чекбоксы в режиме multiple', () => {
			const { container } = render(BaseTree, {
				props: { items: FLAT_ITEMS, selectionMode: 'multiple' },
				slots: { label: DEFAULT_SLOT },
			})

			const checkboxes = container.querySelectorAll('.base-tree__checkbox')
			expect(checkboxes.length).toBeGreaterThan(0)
		})

		it('не должен рендерить чекбоксы в режиме none', () => {
			const { container } = render(BaseTree, {
				props: { items: FLAT_ITEMS, selectionMode: 'none' },
				slots: { label: DEFAULT_SLOT },
			})

			const checkboxes = container.querySelectorAll('.base-tree__checkbox')
			expect(checkboxes).toHaveLength(0)
		})
	})

	describe('узлы с детьми', () => {
		it('должен рендерить стрелку раскрытия для узлов с детьми', () => {
			const { container } = render(BaseTree, {
				props: { items: NESTED_ITEMS },
				slots: { label: DEFAULT_SLOT },
			})

			const arrows = container.querySelectorAll('.base-tree__arrow')
			expect(arrows.length).toBeGreaterThan(0)
		})

		it('должен добавлять класс --leaf для листовых узлов', () => {
			const { container } = render(BaseTree, {
				props: { items: NESTED_ITEMS },
				slots: { label: DEFAULT_SLOT },
			})

			const leafNodes = container.querySelectorAll('.base-tree__node--leaf')
			expect(leafNodes.length).toBeGreaterThan(0)
		})
	})

	describe('отключённые узлы', () => {
		it('должен добавлять класс --disabled для отключённых узлов', () => {
			const { container } = render(BaseTree, {
				props: { items: DISABLED_ITEMS },
				slots: { label: DEFAULT_SLOT },
			})

			const disabledNode = container.querySelector('.base-tree__node--disabled')
			expect(disabledNode).toBeInTheDocument()
		})

		it('не должен выбирать отключённый узел при клике по заголовку', async () => {
			const { container, emitted } = render(BaseTree, {
				props: { items: DISABLED_ITEMS, selectionMode: 'single' },
				slots: { label: DEFAULT_SLOT },
			})

			const disabledHeader = container.querySelector('.base-tree__node--disabled .base-tree__header') as HTMLElement
			await fireEvent.click(disabledHeader)

			expect(emitted()['update:selectedIds']).toBeFalsy()
		})

		it('не должен раскрывать отключённый узел при клике по стрелке', async () => {
			const nodes: TreeNode[] = [
				{
					id: 'disabled-parent',
					label: 'Отключённый',
					isDisabled: true,
					children: [{ id: 'kid', label: 'Ребёнок' }],
				},
			]
			const { container, emitted } = render(BaseTree, {
				props: { items: nodes },
				slots: { label: DEFAULT_SLOT },
			})

			const arrow = container.querySelector('.base-tree__arrow') as HTMLElement
			await fireEvent.click(arrow)

			expect(emitted()['update:expandedIds']).toBeFalsy()
		})

		it('не должен выбирать отключённый узел через чекбокс в multiple', async () => {
			const { container, emitted } = render(BaseTree, {
				props: { items: DISABLED_ITEMS, selectionMode: 'multiple' },
				slots: { label: DEFAULT_SLOT },
			})

			const disabledCheckbox = container.querySelector(
				'.base-tree__node--disabled .base-tree__checkbox input',
			) as HTMLElement
			await fireEvent.click(disabledCheckbox)

			expect(emitted()['update:selectedIds']).toBeFalsy()
		})
	})

	describe('пропс isDefaultExpandAll', () => {
		it('должен раскрывать все узлы при isDefaultExpandAll=true', () => {
			const { container } = render(BaseTree, {
				props: { items: NESTED_ITEMS, isDefaultExpandAll: true },
				slots: { label: DEFAULT_SLOT },
			})

			const expandedNodes = container.querySelectorAll('.base-tree__node--expanded')
			expect(expandedNodes.length).toBeGreaterThan(0)
		})
	})

	describe('иконки', () => {
		it('должен рендерить иконку когда задан node.icon', () => {
			const { container } = render(BaseTree, {
				props: { items: ICON_ITEMS },
				slots: { label: DEFAULT_SLOT },
			})

			const icons = container.querySelectorAll('.base-tree__icon')
			expect(icons.length).toBeGreaterThan(0)
		})

		it('не должен рендерить иконку когда node.icon не задан', () => {
			const { container } = render(BaseTree, {
				props: { items: FLAT_ITEMS },
				slots: { label: DEFAULT_SLOT },
			})

			const icons = container.querySelectorAll('.base-tree__icon')
			expect(icons).toHaveLength(0)
		})
	})

	describe('пропс sizeScale', () => {
		it('должен применять CSS-переменную --size-scale', () => {
			const { container } = render(BaseTree, {
				props: { items: FLAT_ITEMS, sizeScale: 150 },
				slots: { label: DEFAULT_SLOT },
			})

			const root = container.querySelector('.base-tree')
			expect(root).toHaveStyle('--size-scale: 1.5')
		})
	})

	describe('пропс arrowPosition', () => {
		it('не должен добавлять класс --arrow-right при left', () => {
			const { container } = render(BaseTree, {
				props: { items: FLAT_ITEMS, arrowPosition: 'left' },
				slots: { label: DEFAULT_SLOT },
			})

			expect(container.firstElementChild?.classList.contains('base-tree--arrow-right')).toBe(false)
		})

		it('должен добавлять класс --arrow-right при right', () => {
			const { container } = render(BaseTree, {
				props: { items: FLAT_ITEMS, arrowPosition: 'right' },
				slots: { label: DEFAULT_SLOT },
			})

			expect(container.firstElementChild?.classList.contains('base-tree--arrow-right')).toBe(true)
		})

		it('должен рендерить стрелку с модификатором --right при arrowPosition=right', () => {
			const { container } = render(BaseTree, {
				props: { items: NESTED_ITEMS, arrowPosition: 'right' },
				slots: { label: DEFAULT_SLOT },
			})

			const rightArrows = container.querySelectorAll('.base-tree__arrow--right')
			expect(rightArrows.length).toBeGreaterThan(0)
		})
	})

	describe('слот label', () => {
		it('должен рендерить кастомное содержимое метки', () => {
			render(BaseTree, {
				props: { items: FLAT_ITEMS },
				slots: {
					label: `<template #label="{ node }">Custom: {{ node.label }}</template>`,
				},
			})

			expect(screen.getByText('Custom: Первый')).toBeInTheDocument()
			expect(screen.getByText('Custom: Второй')).toBeInTheDocument()
		})
	})

	describe('слот arrow', () => {
		it('должен рендерить кастомную стрелку', () => {
			render(BaseTree, {
				props: { items: NESTED_ITEMS },
				slots: {
					arrow: `<template #arrow="{ isExpanded }">{{ isExpanded ? '▼' : '▶' }}</template>`,
				},
			})

			const arrows = screen.getAllByText('▶')
			expect(arrows.length).toBeGreaterThan(0)
		})
	})

	describe('слот icon', () => {
		it('должен рендерить кастомную иконку', () => {
			render(BaseTree, {
				props: { items: ICON_ITEMS },
				slots: {
					icon: `<template #icon="{ node }">icon-{{ node.id }}</template>`,
				},
			})

			expect(screen.getByText('icon-home')).toBeInTheDocument()
			expect(screen.getByText('icon-search')).toBeInTheDocument()
		})
	})

	describe('слот actions', () => {
		it('должен рендерить кастомные действия для узлов', () => {
			render(BaseTree, {
				props: { items: FLAT_ITEMS },
				slots: {
					label: DEFAULT_SLOT,
					actions: `<template #actions="{ node }">act-{{ node.id }}</template>`,
				},
			})

			expect(screen.getByText('act-item-1')).toBeInTheDocument()
			expect(screen.getByText('act-item-2')).toBeInTheDocument()
			expect(screen.getByText('act-item-3')).toBeInTheDocument()
		})
	})

	describe('слот default', () => {
		it('должен прокидывать дефолтный слот в дочерние узлы при разворачивании', () => {
			render(BaseTree, {
				props: { items: NESTED_ITEMS, isDefaultExpandAll: true },
				slots: { label: DEFAULT_SLOT },
			})

			expect(screen.getByText('Ребёнок 1')).toBeInTheDocument()
			expect(screen.getByText('Ребёнок 2')).toBeInTheDocument()
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseTree, {
				props: { items: FLAT_ITEMS, customClass: 'custom-tree-root' },
				slots: { label: DEFAULT_SLOT },
			})

			expect(container.querySelector('.base-tree')?.classList.contains('custom-tree-root')).toBe(true)
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseTree, {
				props: {
					items: NESTED_ITEMS,
					customClass: {
						root: 'custom-tree-root',
						node: 'custom-tree-node',
						header: 'custom-tree-header',
						arrow: 'custom-tree-arrow',
						checkbox: 'custom-tree-checkbox',
						icon: 'custom-tree-icon',
						label: 'custom-tree-label',
						actions: 'custom-tree-actions',
						children: 'custom-tree-children',
					},
					selectionMode: 'multiple',
					isDefaultExpandAll: true,
				},
				slots: { label: DEFAULT_SLOT },
			})

			expect(container.querySelector('.base-tree')?.classList.contains('custom-tree-root')).toBe(true)
			expect(container.querySelector('.base-tree__node')?.classList.contains('custom-tree-node')).toBe(true)
			expect(container.querySelector('.base-tree__header')?.classList.contains('custom-tree-header')).toBe(true)
			expect(container.querySelector('.base-tree__arrow')?.classList.contains('custom-tree-arrow')).toBe(true)
			expect(container.querySelector('.base-tree__checkbox')?.classList.contains('custom-tree-checkbox')).toBe(true)
			expect(container.querySelector('.base-tree__label')?.classList.contains('custom-tree-label')).toBe(true)
			expect(container.querySelector('.base-tree__children')?.classList.contains('custom-tree-children')).toBe(true)
		})
	})
})
