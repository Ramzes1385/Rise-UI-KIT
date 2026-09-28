import { treeNode } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseTree.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const ArrowRight: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Стрелка раскрытия справа (`arrowPosition="right"`): слева остаются только иконки, как в навигационных меню.',
			},
		},
	},
	args: { arrowPosition: 'right', expandedIds: ['src', 'components'] },
	play: async ({ canvasElement, userEvent }) => {
		const arrow = treeNode(canvasElement, 'public').querySelector('.base-tree__arrow--right') as HTMLElement
		await userEvent.click(arrow)
		await expect(treeNode(canvasElement, 'public')).toHaveClass('base-tree__node--expanded')
	},
}
