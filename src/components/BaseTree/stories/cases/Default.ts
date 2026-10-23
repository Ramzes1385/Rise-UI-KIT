import type meta from '../BaseTree.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { nodeHeader, treeNode, nodeLabel } from '../shared'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Песочница: клик по папке раскрывает её, раскрытые узлы попадают в `expandedIds` (видно в Controls).' },
		},
	},
	play: async ({ canvasElement, userEvent, args }) => {
		await userEvent.click(nodeHeader(canvasElement, 'components'))
		await expect(treeNode(canvasElement, 'components')).toHaveClass('base-tree__node--expanded')
		await waitFor(() => expect(nodeLabel(canvasElement, 'UserCard.vue')).toBeVisible())
		await expect(args.onToggle).toHaveBeenLastCalledWith('components', true)
	},
}
