import { expect } from 'storybook/test'
import type meta from '../BaseTree.stories'
import { nodeHeader, treeNode } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type { TreeNode } from '../../types/BaseTree.types'

const DOCUMENTS: TreeNode[] = [
	{
		id: 'docs',
		label: 'Документы',
		icon: 'folder',
		children: [
			{
				id: 'contracts',
				label: 'Договоры',
				icon: 'folder',
				children: [
					{ id: 'contract-1', label: 'Договор поставки.pdf', icon: 'file' },
					{ id: 'contract-2', label: 'Договор аренды.pdf', icon: 'file' },
				],
			},
			{ id: 'report', label: 'Отчёт за май.pdf', icon: 'file' },
		],
	},
	{
		id: 'archive',
		label: 'Архив — нет доступа',
		icon: 'folder',
		isDisabled: true,
		children: [{ id: 'archive-2019', label: '2019.zip', icon: 'file' }],
	},
	{
		id: 'photos',
		label: 'Фото',
		icon: 'folder',
		children: [{ id: 'photo-1', label: 'Офис.jpg', icon: 'file-img' }],
	},
]

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Отключённый узел (`isDisabled`) приглушён и помечен `aria-disabled`: клик и Enter не раскрывают и не выбирают его.',
					'Приглушена только его строка — остальное дерево работает как обычно.',
				].join('\n'),
			},
		},
	},
	args: { items: DOCUMENTS, expandedIds: undefined, selectionMode: 'single' },
	play: async ({ canvasElement, userEvent, args }) => {
		const header = nodeHeader(canvasElement, 'Архив — нет доступа')
		await expect(header).toHaveAttribute('aria-disabled', 'true')
		await userEvent.click(header)
		await expect(treeNode(canvasElement, 'Архив — нет доступа')).not.toHaveClass('base-tree__node--selected')
		await expect(args.onSelect).not.toHaveBeenCalled()
		await expect(args.onToggle).not.toHaveBeenCalled()
	},
}
