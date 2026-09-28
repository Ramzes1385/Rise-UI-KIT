import { ref } from 'vue'
import type meta from '../BaseTree.stories'
import BaseTree from '../../ui/BaseTree.vue'
import { waitFor, expect } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { FILES, nodeLabel, treeNode } from '../shared'
import { useArgsWithoutSlots } from '@/stories/helpers'
import type { TreeNode } from '../../types/BaseTree.types'

function folderIds(nodes: readonly TreeNode[]): string[] {
	return nodes.flatMap(node => (node.children?.length ? [node.id, ...folderIds(node.children)] : []))
}

export const Controlled: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'selectionMode'] },
		docs: {
			description: {
				story: [
					'Управляемое раскрытие: `v-model:expanded-ids` — кнопки «Развернуть всё» и «Свернуть всё» задают список раскрытых',
					'папок, а клик по дереву меняет его.',
				].join('\n'),
			},
			source: {
				code: [
					'<BaseButton variant="outline" @click="expanded = allFolderIds">Развернуть всё</BaseButton>',
					'<BaseButton variant="outline" @click="expanded = []">Свернуть всё</BaseButton>',
					'<BaseTree v-model:expanded-ids="expanded" :items="items" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTree, BaseButton },
		setup: () => {
			const expanded = ref<string[]>([])
			return {
				props: useArgsWithoutSlots(args, ['expandedIds', 'onUpdate:expandedIds']),
				expanded,
				expandAll: () => {
					expanded.value = folderIds(FILES)
				},
				collapseAll: () => {
					expanded.value = []
				},
			}
		},
		template: `
			<div class="story-col story-narrow">
				<div class="story-row">
					<BaseButton variant="outline" @click="expandAll">Развернуть всё</BaseButton>
					<BaseButton variant="outline" @click="collapseAll">Свернуть всё</BaseButton>
				</div>
				<BaseTree v-bind="props" v-model:expanded-ids="expanded" style="width: 100%;" />
			</div>
		`,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Развернуть всё' }))
		await waitFor(() => expect(nodeLabel(canvasElement, 'useApi.ts')).toBeVisible())
		await userEvent.click(canvas.getByRole('button', { name: 'Свернуть всё' }))
		await waitFor(() => expect(nodeLabel(canvasElement, 'useApi.ts')).not.toBeVisible())
		await expect(treeNode(canvasElement, 'src')).not.toHaveClass('base-tree__node--expanded')
	},
}
