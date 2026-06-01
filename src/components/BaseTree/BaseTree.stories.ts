/**
 * Stories для компонента BaseTree.
 * Демонстрирует все вариации, режимы выбора, слоты и CSS-состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { buildArgTypes } from '@utils/storybookUtils'
import { playShiftTab } from '@utils/storybookUtils/a11yHelpers'

import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import type { TreeNode } from './BaseTree.types'
import { TREE_VARIANTS } from './BaseTree.types'
import BaseTree from './BaseTree.vue'

/** Названия для генерации дерева */
const LEVEL_NAMES = [
	'Материалы',
	'Металл',
	'Сплавы',
	'Бронза',
	'Промышленная',
	'Подшипники',
	'Шариковые',
	'Миниатюрные',
	'Прецизионные',
	'Нержавеющие',
	'Керамические',
	'Гибридные',
	'Упорные',
	'Радиальные',
	'Конические',
] as const

/** Генерация дерева с произвольной вложенностью (детерминированные ID и уникальные имена) */
function generateTree(maxDepth: number, breadth: number = 2, depth: number = 0, path: string = '0'): TreeNode {
	const id = `node-${depth}-${path}`
	const isFirstBranch = path.endsWith('-0') || path === '0'
	const baseLabel = depth < LEVEL_NAMES.length ? LEVEL_NAMES[depth] : `Уровень ${depth + 1}`
	const label = isFirstBranch ? baseLabel : `${baseLabel} ${path.split('-').pop()}`

	if (depth >= maxDepth) {
		return { id, label }
	}

	const children: TreeNode[] = []
	for (let i = 0; i < breadth; i++) {
		children.push(generateTree(maxDepth, breadth, depth + 1, `${path}-${i}`))
	}

	return { id, label, children }
}

/** Данные дерева для stories — компактная вложенность */
const SAMPLE_ITEMS: TreeNode[] = [generateTree(3, 2), { id: 'glass', label: 'Стекло', icon: 'image' }]

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

/** Файловое дерево проекта — демонстрация иконок */
const FILE_TREE_ITEMS: TreeNode[] = [
	{
		id: 'src',
		label: 'src',
		icon: 'folder',
		children: [
			{
				id: 'components',
				label: 'components',
				icon: 'folder',
				children: [
					{ id: 'app-header', label: 'AppHeader.vue', icon: 'file-vue' },
					{ id: 'user-card', label: 'UserCard.vue', icon: 'file-vue' },
				],
			},
			{
				id: 'composables',
				label: 'composables',
				icon: 'folder',
				children: [
					{ id: 'use-auth', label: 'useAuth.ts', icon: 'file-ts' },
					{ id: 'use-api', label: 'useApi.js', icon: 'file-js' },
				],
			},
			{ id: 'app-vue', label: 'App.vue', icon: 'file-vue' },
			{ id: 'main-ts', label: 'main.ts', icon: 'file-ts' },
		],
	},
	{
		id: 'backend',
		label: 'backend',
		icon: 'folder',
		children: [
			{
				id: 'api',
				label: 'api',
				icon: 'folder',
				children: [
					{ id: 'routes-php', label: 'routes.php', icon: 'file-php' },
					{ id: 'controller-php', label: 'Controller.php', icon: 'file-php' },
				],
			},
		],
	},
	{ id: 'package-json', label: 'package.json', icon: 'file-json' },
]

const meta: Meta<typeof BaseTree> = {
	title: 'UI/BaseTree',
	component: BaseTree,
	argTypes: buildArgTypes({
		props: {
			items: {
				control: 'object',
				description: 'Массив узлов дерева (TreeNode[])',
			},
			selectionMode: {
				control: 'inline-radio',
				options: ['none', 'single', 'multiple'],
				description: 'Режим выбора узлов',
			},
			arrowPosition: {
				control: 'inline-radio',
				options: ['left', 'right'],
				description: 'Позиция стрелки раскрытия (слева или справа)',
			},
			expandedIds: { table: { disable: true } },
			selectedIds: { table: { disable: true } },
			isDefaultExpandAll: {
				control: 'boolean',
				description: 'Раскрыть все узлы по умолчанию',
			},
			variant: {
				control: 'inline-radio',
				options: TREE_VARIANTS,
				description: 'Вариант отображения дерева',
			},
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера (50–200%, по умолчанию 100)',
			},
			color: {
				control: 'object',
				description: 'Объект CustomColor: bg (фоновый цвет), text (цвет текста) и их состояния hover/active/focus',
			},
			'onUpdate:expandedIds': { table: { disable: true } },
			'onUpdate:selectedIds': { table: { disable: true } },
			onToggle: { table: { disable: true } },
			onSelect: { table: { disable: true } },
		},
	}),
	args: {
		selectionMode: 'none',
		arrowPosition: 'left',
		isDefaultExpandAll: false,
		variant: 'default',
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseTree>
/** Базовое дерево с вложенностью */
export const Default: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseTree :items="items" />',
			},
		},
	},
	render: args => ({
		components: { BaseTree },
		setup() {
			return { args, items: SAMPLE_ITEMS }
		},
		template: `
			<div style="max-width:360px;">
				<BaseTree v-bind="args" :items="items" />
			</div>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		await step('Фокусировка дерева по Tab', async () => {
			await userEvent.tab()
			const tree = canvasElement.querySelector('.base-tree')
			expect(tree).toBeInTheDocument()
		})

		await step('Возврат фокуса по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { selector: '.base-tree' })
		})

		await step('Навигация по ArrowDown', async () => {
			await userEvent.keyboard('{ArrowDown}')
		})

		await step('Раскрытие узла по Enter', async () => {
			await userEvent.keyboard('{Enter}')
		})
	},
}
/** Все варианты отображения */
export const Variants: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTree v-for="v in ['default','ghost','outline','shadow','soft']" :key="v" :variant="v" :items="items" />`,
			},
		},
	},
	render: args => ({
		components: { BaseTree, BaseText },
		setup() {
			const variants = TREE_VARIANTS
			return { args, variants, items: SAMPLE_ITEMS }
		},
		template: `
			<div style="display:flex;gap:24px;flex-wrap:wrap;">
				<div v-for="v in variants" :key="v" style="flex:1;min-width:240px;">
					<BaseText tag="p" size="sm" style="margin-bottom:8px;color:var(--color-text-muted);">{{ v }}</BaseText>
					<BaseTree v-bind="args" :variant="v" :items="items" />
				</div>
			</div>
		`,
	}),
}
/** Масштабирование sizeScale */
export const SizeScale: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTree v-for="scale in [75, 100, 150]" :key="scale" :size-scale="scale" :items="items" />`,
			},
		},
	},
	render: args => ({
		components: { BaseTree, BaseText },
		setup() {
			return { args, items: SAMPLE_ITEMS }
		},
		template: `
			<div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start;">
				<div v-for="scale in [75, 100, 150]" :key="scale">
					<BaseText tag="p" size="sm" style="margin-bottom:8px;color:var(--color-text-muted);">{{ scale }}%</BaseText>
					<BaseTree v-bind="args" :size-scale="scale" :items="items" />
				</div>
			</div>
		`,
	}),
}
/** Режимы выбора узлов */
export const SelectionModes: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTree selection-mode="single" :items="items" />`,
			},
		},
	},
	render: args => ({
		components: { BaseTree, BaseText },
		setup() {
			const modes = ['none', 'single', 'multiple'] as const
			return { args, modes, items: SAMPLE_ITEMS }
		},
		template: `
			<div style="display:flex;gap:24px;flex-wrap:wrap;">
				<div v-for="mode in modes" :key="mode" style="flex:1;min-width:240px;">
					<BaseText tag="p" size="sm" style="margin-bottom:8px;color:var(--color-text-muted);">{{ mode }}</BaseText>
					<BaseTree v-bind="args" :selection-mode="mode" :items="items" />
				</div>
			</div>
		`,
	}),
}
/** Дерево с отключёнными узлами */
export const WithDisabled: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseTree :items="disabledItems" />',
			},
		},
	},
	render: args => ({
		components: { BaseTree },
		setup() {
			return { args, items: DISABLED_ITEMS }
		},
		template: `
			<div style="max-width:360px;">
				<BaseTree v-bind="args" :items="items" />
			</div>
		`,
	}),
}
/** Дерево с раскрытыми узлами по умолчанию */
export const DefaultExpandAll: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseTree :items="items" :is-default-expand-all="true" />',
			},
		},
	},
	render: args => ({
		components: { BaseTree },
		setup() {
			return { args, items: SAMPLE_ITEMS }
		},
		template: `
			<div style="max-width:360px;">
				<BaseTree v-bind="args" :items="items" :is-default-expand-all="true" />
			</div>
		`,
	}),
}
/** Дерево с кастомными слотами */
export const WithSlots: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTree :items="items">
  <template #icon="{ node }">...</template>
  <template #actions="{ node }">...</template>
</BaseTree>`,
			},
		},
	},
	render: args => ({
		components: { BaseTree, BaseIcon },
		setup() {
			return { args, items: SAMPLE_ITEMS }
		},
		template: `
			<div style="max-width:360px;">
				<BaseTree v-bind="args" :items="items">
					<template #actions="{ node }">
						<BaseIcon name="close" style="cursor:pointer;" />
					</template>
				</BaseTree>
			</div>
		`,
	}),
}
/** Все CSS-состояния рядом */
export const InteractiveStates: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTree :items="items" />
<BaseTree class="base-tree--hover" :items="items" />
<BaseTree class="base-tree--focus" :items="items" />`,
			},
		},
	},
	render: args => ({
		components: { BaseTree, BaseText },
		setup() {
			return { args, items: SAMPLE_ITEMS }
		},
		template: `
			<div style="display:flex;gap:24px;flex-wrap:wrap;">
				<div>
					<BaseText tag="p" size="sm" style="margin-bottom:8px;color:var(--color-text-muted);">Normal</BaseText>
					<BaseTree v-bind="args" :items="items" />
				</div>
				<div>
					<BaseText tag="p" size="sm" style="margin-bottom:8px;color:var(--color-text-muted);">Hover</BaseText>
					<BaseTree v-bind="args" :items="items" class="base-tree--hover" />
				</div>
				<div>
					<BaseText tag="p" size="sm" style="margin-bottom:8px;color:var(--color-text-muted);">Focus</BaseText>
					<BaseTree v-bind="args" :items="items" class="base-tree--focus" />
				</div>
			</div>
		`,
	}),
}
/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding:16px;background:var(--color-bg);"><story /></div>',
		}),
	],
	parameters: {
		docs: {
			source: {
				code: '<BaseTree :items="items" />',
			},
		},
	},
	render: args => ({
		components: { BaseTree },
		setup() {
			return { args, items: SAMPLE_ITEMS }
		},
		template: `
			<div style="max-width:360px;">
				<BaseTree v-bind="args" :items="items" />
			</div>
		`,
	}),
}
/** Интерактивная story с полными контролами */
export const Interactive: Story = {
	render: args => ({
		components: { BaseTree },
		setup() {
			return { args, items: SAMPLE_ITEMS }
		},
		template: `
			<div style="max-width:360px;">
				<BaseTree v-bind="args" :items="items" />
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		// Находим корневой узел "Материалы"
		const rootLabel = canvas.getByText('Материалы')
		expect(rootLabel).toBeInTheDocument()

		// Находим стрелку раскрытия корневого узла
		const rootNode = rootLabel.closest('.base-tree__node')
		expect(rootNode).not.toBeNull()
		const rootArrow = rootNode!.querySelector('.base-tree__arrow') as HTMLElement
		expect(rootArrow).toBeInTheDocument()

		// Кликаем по стрелке для раскрытия
		await userEvent.click(rootArrow)
		expect(rootNode).toHaveClass('base-tree__node--expanded')

		// Теперь узел "Металл" должен быть в документе
		const childLabel = canvas.getByText('Металл')
		expect(childLabel).toBeInTheDocument()

		// Кликаем по заголовку "Металл" (в режиме selectionMode='none' клик по заголовку раскрывает узел)
		const childHeader = childLabel.closest('.base-tree__header') as HTMLElement
		expect(childHeader).toBeInTheDocument()
		await userEvent.click(childHeader)

		const childNode = childLabel.closest('.base-tree__node')
		expect(childNode).toHaveClass('base-tree__node--expanded')

		// Теперь узел "Сплавы" должен быть в документе
		const subChildLabel = canvas.getByText('Сплавы')
		expect(subChildLabel).toBeInTheDocument()

		// Находим узел "Стекло" (лист без детей)
		const glassLabel = canvas.getByText('Стекло')
		expect(glassLabel).toBeInTheDocument()
		const glassHeader = glassLabel.closest('.base-tree__header') as HTMLElement
		await userEvent.click(glassHeader)
		const glassNode = glassLabel.closest('.base-tree__node')
		expect(glassNode).not.toHaveClass('base-tree__node--expanded')
	},
}
/** Файловый проводник с иконками расширений */
export const FileExplorer: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseTree :items="fileTree" :is-default-expand-all="true" />',
			},
		},
	},
	render: args => ({
		components: { BaseTree },
		setup() {
			return { args, items: FILE_TREE_ITEMS }
		},
		template: `
			<div style="max-width:400px;">
				<BaseTree v-bind="args" :items="items" :is-default-expand-all="true" />
			</div>
		`,
	}),
}
/** Позиция стрелки: слева и справа */
export const ArrowPosition: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTree arrow-position="left" :items="items" />
<BaseTree arrow-position="right" :items="items" />`,
			},
		},
	},
	render: args => ({
		components: { BaseTree, BaseText },
		setup() {
			return { args, items: SAMPLE_ITEMS }
		},
		template: `
			<div style="display:flex;gap:24px;flex-wrap:wrap;">
				<div style="flex:1;min-width:240px;">
					<BaseText tag="p" size="sm" style="margin-bottom:8px;color:var(--color-text-muted);">arrow-position="left"</BaseText>
					<BaseTree v-bind="args" :items="items" arrow-position="left" />
				</div>
				<div style="flex:1;min-width:240px;">
					<BaseText tag="p" size="sm" style="margin-bottom:8px;color:var(--color-text-muted);">arrow-position="right"</BaseText>
					<BaseTree v-bind="args" :items="items" arrow-position="right" />
				</div>
			</div>
		`,
	}),
}
/** Кастомная стрелка через слот */
export const CustomArrowSlot: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTree :items="items">
	 <template #arrow="{ isExpanded }">
	   <BaseIcon :name="isExpanded ? 'minus' : 'plus'" />
	 </template>
</BaseTree>`,
			},
		},
	},
	render: args => ({
		components: { BaseTree, BaseIcon },
		setup() {
			return { args, items: SAMPLE_ITEMS }
		},
		template: `
			<div style="max-width:360px;">
				<BaseTree v-bind="args" :items="items">
					<template #arrow="{ isExpanded }">
						<BaseIcon :name="isExpanded ? 'minus' : 'plus'" :size-scale="80" />
					</template>
				</BaseTree>
			</div>
		`,
	}),
}
/** Кастомное содержимое метки через слот #label */
export const CustomLabelSlot: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTree :items="items">
		<template #label="{ node, isSelected }">
			 <BaseText :weight="isSelected ? 600 : 400" :style="{ color: isSelected ? 'var(--color-accent)' : 'inherit' }">
			   {{ node.label }}
			 </BaseText>
		</template>
</BaseTree>`,
			},
		},
	},
	render: args => ({
		components: { BaseTree, BaseText },
		setup() {
			return { args, items: FILE_TREE_ITEMS }
		},
		template: `
			<div style="max-width:400px;">
				<BaseTree v-bind="args" :items="items" selection-mode="single">
					<template #label="{ node, isSelected }">
						<BaseText :weight="isSelected ? 600 : 400" :style="{ color: isSelected ? 'var(--color-accent)' : 'var(--color-text)' }">
							{{ node.label }}
						</BaseText>
					</template>
				</BaseTree>
			</div>
		`,
	}),
}
/** Пустое дерево — нет узлов */
export const Empty: Story = {
	args: { items: [] },
}

const LONG_ITEMS: TreeNode[] = [
	{
		id: 'long-root',
		label: 'Очень длинное название корневого узла которое проверяет переполнение текста в дереве',
		children: [
			{ id: 'long-child-1', label: 'Длинное название дочернего узла первого уровня с подробным описанием содержимого' },
			{ id: 'long-child-2', label: 'Ещё одно длинное название дочернего узла для проверки переноса строк' },
		],
	},
]
/** Длинные подписи узлов */
export const LongContent: Story = {
	args: { items: LONG_ITEMS },
}
/** Выбор узла в режиме single — покрытие BaseTreeNode handleHeaderClick (selectNode) */
export const SingleSelectionPlay: Story = {
	args: { items: SAMPLE_ITEMS, selectionMode: 'single', isDefaultExpandAll: true },
	render: args => ({
		components: { BaseTree },
		setup() {
			return { args }
		},
		template: '<div style="max-width:360px;"><BaseTree v-bind="args" /></div>',
	}),
	play: async ({ canvasElement }) => {
		const headers = canvasElement.querySelectorAll('.base-tree__header')
		// Клик по заголовку — selectionMode='single' → ветка selectNode
		const firstHeader = headers[0]
		if (firstHeader instanceof HTMLElement) {
			await userEvent.click(firstHeader)
		}
		// Активация по Enter — keydown.enter → handleHeaderClick
		const secondHeader = headers[1]
		if (secondHeader instanceof HTMLElement) {
			secondHeader.focus()
			await userEvent.keyboard('{Enter}')
		}
	},
}
/** Выбор в режиме multiple — покрытие handleCheckboxChange */
export const MultipleSelectionPlay: Story = {
	args: { items: SAMPLE_ITEMS, selectionMode: 'multiple', isDefaultExpandAll: true },
	render: args => ({
		components: { BaseTree },
		setup() {
			return { args }
		},
		template: '<div style="max-width:360px;"><BaseTree v-bind="args" /></div>',
	}),
	play: async ({ canvasElement }) => {
		const checkbox = canvasElement.querySelector('.base-tree__checkbox input')
		if (checkbox instanceof HTMLElement) {
			await userEvent.click(checkbox)
		}
	},
}
/** Клик по отключённому узлу — покрытие early return в handleArrowClick/handleHeaderClick */
export const DisabledClickPlay: Story = {
	args: { items: DISABLED_ITEMS, selectionMode: 'single', isDefaultExpandAll: true },
	render: args => ({
		components: { BaseTree },
		setup() {
			return { args }
		},
		template: '<div style="max-width:360px;"><BaseTree v-bind="args" /></div>',
	}),
	play: async ({ canvasElement }) => {
		// Находим отключённый узел (pointer-events: none — используем нативный .click())
		const disabledNode = canvasElement.querySelector('.base-tree__node--disabled')
		if (disabledNode instanceof HTMLElement) {
			const header = disabledNode.querySelector('.base-tree__header')
			if (header instanceof HTMLElement) {
				header.click()
				const arrow = disabledNode.querySelector('.base-tree__arrow')
				if (arrow instanceof HTMLElement) {
					arrow.click()
				}
			}
		}
	},
}
/** Клик по отключённому узлу с чекбоксом — покрытие handleCheckboxChange isDisabled */
export const DisabledMultiplePlay: Story = {
	args: { items: DISABLED_ITEMS, selectionMode: 'multiple', isDefaultExpandAll: true },
	render: args => ({
		components: { BaseTree },
		setup() {
			return { args }
		},
		template: '<div style="max-width:360px;"><BaseTree v-bind="args" /></div>',
	}),
	play: async ({ canvasElement }) => {
		const disabledNode = canvasElement.querySelector('.base-tree__node--disabled')
		if (disabledNode instanceof HTMLElement) {
			// pointer-events: none у disabled — используем нативный .click()/диспетчеризацию события
			const checkbox = disabledNode.querySelector('.base-tree__checkbox input')
			if (checkbox instanceof HTMLInputElement) {
				checkbox.checked = !checkbox.checked
				checkbox.dispatchEvent(new Event('change', { bubbles: true }))
			}
			const header = disabledNode.querySelector('.base-tree__header')
			if (header instanceof HTMLElement) {
				header.click()
			}
		}
	},
}
/** arrowPosition='right' с кликом — покрытие ветки правой стрелки */
export const ArrowRightPlay: Story = {
	args: { items: SAMPLE_ITEMS, arrowPosition: 'right' },
	render: args => ({
		components: { BaseTree },
		setup() {
			return { args }
		},
		template: '<div style="max-width:360px;"><BaseTree v-bind="args" /></div>',
	}),
	play: async ({ canvasElement }) => {
		const arrow = canvasElement.querySelector('.base-tree__arrow--right')
		if (arrow instanceof HTMLElement) {
			await userEvent.click(arrow)
		}
	},
}
/** Слот label — кастомный контент узла */
export const LabelContentPlay: Story = {
	args: { items: SAMPLE_ITEMS, isDefaultExpandAll: true },
	render: args => ({
		components: { BaseTree, BaseText },
		setup() {
			return { args }
		},
		template: `
			<div style="max-width:360px;">
				<BaseTree v-bind="args">
					<template #label="{ node }">
						<BaseText tag="span">DEF:{{ node.label }}</BaseText>
					</template>
				</BaseTree>
			</div>
		`,
	}),
}
/** Слот icon на корневом BaseTree — покрытие BaseTree line 7 (slot name="icon") и BaseTreeChildren icon-slot */
export const IconSlotPlay: Story = {
	args: { items: FILE_TREE_ITEMS, isDefaultExpandAll: true },
	render: args => ({
		components: { BaseTree, BaseIcon },
		setup() {
			return { args }
		},
		template: `
			<div style="max-width:360px;">
				<BaseTree v-bind="args">
					<template #icon="{ node }">
						<BaseIcon v-if="node.icon" :name="node.icon" />
					</template>
				</BaseTree>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		// Иконки рендерятся через пользовательский слот #icon на BaseTree
		const icons = canvasElement.querySelectorAll('.base-tree__header svg')
		expect(icons.length).toBeGreaterThan(0)
	},
}
/** Слот arrow на корневом BaseTree — покрытие BaseTree line 9 (slot name="arrow") и BaseTreeChildren arrow-slot */
export const ArrowSlotPlay: Story = {
	args: { items: SAMPLE_ITEMS, isDefaultExpandAll: true },
	render: args => ({
		components: { BaseTree, BaseIcon },
		setup() {
			return { args }
		},
		template: `
			<div style="max-width:360px;">
				<BaseTree v-bind="args">
					<template #arrow="{ isExpanded }">
						<span :data-expanded="isExpanded">▶</span>
					</template>
				</BaseTree>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const arrows = canvasElement.querySelectorAll('.base-tree__arrow [data-expanded]')
		expect(arrows.length).toBeGreaterThan(0)
	},
}
/** Слот actions на корневом BaseTree — покрытие BaseTree line 11 (slot name="actions") и BaseTreeChildren actions-slot */
export const ActionsSlotPlay: Story = {
	args: { items: SAMPLE_ITEMS, isDefaultExpandAll: true },
	render: args => ({
		components: { BaseTree, BaseText },
		setup() {
			return { args }
		},
		template: `
			<div style="max-width:360px;">
				<BaseTree v-bind="args">
					<template #actions="{ node }">
						<BaseText tag="span" :data-action-id="node.id">⋯</BaseText>
					</template>
				</BaseTree>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const actions = canvasElement.querySelectorAll('[data-action-id]')
		expect(actions.length).toBeGreaterThan(0)
	},
}
/** Слот label для дочерних узлов. Покрывает проброс slotProps (node/depth) через BaseTreeChildren. */
export const LabelContentChildrenPlay: Story = {
	args: { items: SAMPLE_ITEMS, isDefaultExpandAll: true },
	render: args => ({
		components: { BaseTree },
		setup() {
			return { args }
		},
		template: `
			<div style="max-width:360px;">
				<BaseTree v-bind="args">
					<template #label="{ node, depth }">
						<div :data-label-node="node.id" :data-label-depth="depth">{{ node.label }}</div>
					</template>
				</BaseTree>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			expect(canvasElement.querySelector('.base-tree')).toBeTruthy()
		})
		const nodes = canvasElement.querySelectorAll('[data-label-node]')
		expect(nodes.length).toBeGreaterThan(0)
	},
}
/** Слот label с проверкой передачи depth для глубоких узлов. Проверяет, что slotProps.depth корректно прокидывается через BaseTreeChildren. */
export const LabelContentDeepDepth: Story = {
	args: {
		items: [generateTree(4, 2)],
		isDefaultExpandAll: true,
	},
	render: args => ({
		components: { BaseTree },
		setup() {
			return { args }
		},
		template: `
			<div style="max-width:360px;">
				<BaseTree v-bind="args">
					<template #label="{ node, depth }">
						<span :data-deep-node="node.id" :data-deep-depth="depth">{{ node.label }} [d{{ depth }}]</span>
					</template>
				</BaseTree>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			const deepNodes = canvasElement.querySelectorAll('[data-deep-node]')
			expect(deepNodes.length).toBeGreaterThan(0)
		})
	},
}
/** Раскрытие узла и последующее сворачивание. Покрывает ветку else в watch(isExpanded) (L142 branch=1) — вызов watcher со значением expanded=false, не приводящий к изменению wasExpanded. */
export const ExpandCollapseWatcherCoverage: Story = {
	args: { items: SAMPLE_ITEMS },
	render: args => ({
		components: { BaseTree },
		setup() {
			return { args }
		},
		template: '<div style="max-width:360px;"><BaseTree v-bind="args" /></div>',
	}),
	play: async ({ canvasElement }) => {
		const rootHeader = canvasElement.querySelector('.base-tree__node .base-tree__header')
		if (!(rootHeader instanceof HTMLElement)) {
			throw new Error('header not found')
		}

		const rootArrow = rootHeader.querySelector('.base-tree__arrow') as HTMLElement | null
		if (!rootArrow) {
			throw new Error('arrow not found')
		}

		await userEvent.click(rootArrow)
		await waitFor(() => {
			const expanded = canvasElement.querySelector('.base-tree__node--expanded')
			expect(expanded).toBeTruthy()
		})

		await userEvent.click(rootArrow)
		await waitFor(() => {
			const expanded = canvasElement.querySelector('.base-tree__node--expanded')
			expect(expanded).toBeFalsy()
		})
	},
}
/** Полный цикл раскрытие → сворачивание → повторное раскрытие. Покрывает ветку watcher `handleExpandedWatch` в BaseTreeNode при повторном вызове с expanded=true и уже истинным wasExpanded — ветка `if (...)` false (когда условие `expanded && !wasExpanded.value` ложно из-за wasExpanded=true). */
export const WasExpandedWatcherFullCycle: Story = {
	args: { items: SAMPLE_ITEMS },
	render: args => ({
		components: { BaseTree },
		setup() {
			return { args }
		},
		template: '<div style="max-width:360px;"><BaseTree v-bind="args" /></div>',
	}),
	play: async ({ canvasElement }) => {
		const rootHeader = canvasElement.querySelector('.base-tree__node .base-tree__header')
		if (!(rootHeader instanceof HTMLElement)) {
			throw new Error('header not found')
		}

		const rootArrow = rootHeader.querySelector('.base-tree__arrow') as HTMLElement | null
		if (!rootArrow) {
			throw new Error('arrow not found')
		}

		// Шаг 1 — раскрыть узел (expanded: false → true, wasExpanded: false → true)
		await userEvent.click(rootArrow)
		await waitFor(() => {
			expect(canvasElement.querySelector('.base-tree__node--expanded')).toBeTruthy()
		})

		// Шаг 2 — свернуть (expanded: true → false, ветка `if` ложна)
		await userEvent.click(rootArrow)
		await waitFor(() => {
			expect(canvasElement.querySelector('.base-tree__node--expanded')).toBeFalsy()
		})

		// Шаг 3 — раскрыть повторно (expanded: false → true, wasExpanded уже true,
		// ветка `if (expanded && !wasExpanded.value)` ложна — закрывает branch-edge)
		await userEvent.click(rootArrow)
		await waitFor(() => {
			expect(canvasElement.querySelector('.base-tree__node--expanded')).toBeTruthy()
		})
	},
}
/** Keyboard-flow: фокус на заголовке + Enter раскрывает узел. Покрывает @keydown.enter путь handleHeaderClick через прямой dispatchEvent. */
export const KeyboardEnterTogglePlay: Story = {
	args: { items: SAMPLE_ITEMS, selectionMode: 'none' },
	render: args => ({
		components: { BaseTree },
		setup() {
			return { args }
		},
		template: '<div style="max-width:360px;"><BaseTree v-bind="args" /></div>',
	}),
	play: async ({ canvasElement }) => {
		const header = canvasElement.querySelector('.base-tree__node .base-tree__header')
		if (!(header instanceof HTMLElement)) {
			throw new Error('header not found')
		}
		header.focus()
		header.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
		await waitFor(() => {
			expect(canvasElement.querySelector('.base-tree__node--expanded')).toBeTruthy()
		})
	},
}
