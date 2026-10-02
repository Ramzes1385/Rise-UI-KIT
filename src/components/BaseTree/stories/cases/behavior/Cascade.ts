import { expect } from 'storybook/test'
import { nodeHeader } from '../../shared'
import type meta from '../../BaseTree.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import type { TreeNode } from '../../../types/BaseTree.types'

const PROJECT: TreeNode[] = [
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
			{ id: 'main-ts', label: 'main.ts', icon: 'file-ts' },
			{ id: 'env', label: '.env.production — нет доступа', icon: 'file', isDisabled: true },
		],
	},
	{
		id: 'public',
		label: 'public',
		icon: 'folder',
		children: [{ id: 'favicon', label: 'favicon.svg', icon: 'file-svg' }],
	},
]

export const Cascade: StoryObj<typeof meta> = {
	args: { items: PROJECT, selectionMode: 'multiple', expandedIds: ['src', 'components'], selectedIds: ['app-header'] },
	parameters: {
		docs: {
			description: {
				story: [
					'Каскад в режиме `multiple`: папка отмечает доступные вложенные узлы, отметка всех детей отмечает папку,',
					'часть — частичный выбор (флажок с чертой, `aria-checked="mixed"`, в `selectedIds` папки нет).',
					'Отключённый узел каскад не трогает и в подсчёт не входит. Пробел на узле переключает отметку.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvasElement, userEvent }) => {
		const src = nodeHeader(canvasElement, 'src')
		const components = nodeHeader(canvasElement, 'components')
		await expect(src).toHaveAttribute('aria-checked', 'mixed')
		await expect(components).toHaveAttribute('aria-checked', 'mixed')

		const appHeader = nodeHeader(canvasElement, 'AppHeader.vue')
		await expect(appHeader).toHaveAttribute('tabindex', '0')
		appHeader.focus()
		await userEvent.keyboard('{ArrowDown}{ }')
		await expect(nodeHeader(canvasElement, 'UserCard.vue')).toHaveAttribute('aria-checked', 'true')
		await expect(components).toHaveAttribute('aria-checked', 'true')
		await expect(src).toHaveAttribute('aria-checked', 'mixed')

		await userEvent.keyboard('{ArrowDown}{ }')
		await expect(nodeHeader(canvasElement, 'main.ts')).toHaveFocus()
		await expect(src).toHaveAttribute('aria-checked', 'true')
		await expect(nodeHeader(canvasElement, '.env.production — нет доступа')).toHaveAttribute('aria-checked', 'false')

		await userEvent.keyboard('{ArrowUp}{ }')
		await expect(nodeHeader(canvasElement, 'UserCard.vue')).toHaveAttribute('aria-checked', 'false')
		await expect(components).toHaveAttribute('aria-checked', 'mixed')
		await expect(src).toHaveAttribute('aria-checked', 'mixed')
	},
}
