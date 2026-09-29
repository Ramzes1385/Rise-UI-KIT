import { expect } from 'storybook/test'
import type meta from '../../BaseTree.stories'
import { nodeHeader, treeNode } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет через `color`: `bg.base` — фон дерева, `bg.hover` — строка под курсором, `text.base` / `text.hover` —',
					'текст узлов. Чекбоксы и содержимое слотов цвет не наследуют.',
				].join('\n'),
			},
		},
	},
	args: {
		variant: 'outline',
		selectionMode: 'multiple',
		expandedIds: ['src', 'composables'],
		selectedIds: ['composables', 'use-auth', 'use-api'],
		color: { bg: { base: '#fefce8', hover: '#fef9c3' }, text: { base: '#713f12', hover: '#422006' } },
	},
	play: async ({ canvasElement }) => {
		const tree = canvasElement.querySelector('.base-tree') as HTMLElement
		await expect(getComputedStyle(tree).backgroundColor).toBe('rgb(254, 252, 232)')
		await expect(getComputedStyle(nodeHeader(canvasElement, 'public')).color).toBe('rgb(113, 63, 18)')
		const checkbox = treeNode(canvasElement, 'useAuth.ts').querySelector('.base-tree__checkbox') as HTMLElement
		await expect(getComputedStyle(checkbox).getPropertyValue('--custom-bg')).toBe('')
	},
}
