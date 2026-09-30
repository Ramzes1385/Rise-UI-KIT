import { ref } from 'vue'
import type meta from '../../BaseTree.stories'
import BaseTree from '../../../ui/BaseTree.vue'
import { waitFor, expect } from 'storybook/test'
import { nodeLabel, treeNode } from '../../shared'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type { TreeNode } from '../../../types/BaseTree.types'
import { storySource, useStorySetup } from '@/stories/helpers'

function folderIds(nodes: readonly TreeNode[]): string[] {
	return nodes.flatMap(node => (node.children?.length ? [node.id, ...folderIds(node.children)] : []))
}

const hidden = ['expandedIds', 'onUpdate:expandedIds']

const template = `
	<div class="story-col story-narrow">
		<div class="story-row">
			<BaseButton variant="outline" @click="expandAll">Развернуть всё</BaseButton>
			<BaseButton variant="outline" @click="collapseAll">Свернуть всё</BaseButton>
		</div>
		<BaseTree v-bind="args" v-model:expanded-ids="expanded" style="width: 100%;" />
	</div>
`

const script = `
const expanded = ref<string[]>([])

function folderIds(nodes: readonly TreeNode[]): string[] {
	return nodes.flatMap(node => (node.children?.length ? [node.id, ...folderIds(node.children)] : []))
}

function expandAll() {
	expanded.value = folderIds(items)
}

function collapseAll() {
	expanded.value = []
}
`

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
			source: storySource({ template, imports: ['BaseButton', 'BaseTree', 'type TreeNode'], vue: ['ref'], script, omit: hidden }),
		},
	},
	render: args => ({
		components: { BaseTree, BaseButton },
		setup: useStorySetup(args, {
			slots: hidden,
			setup: () => {
				const expanded = ref<string[]>([])
				const expandAll = () => {
					expanded.value = folderIds(args.items)
				}
				const collapseAll = () => {
					expanded.value = []
				}
				return { expanded, expandAll, collapseAll }
			},
		}),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Развернуть всё' }))
		await waitFor(() => expect(nodeLabel(canvasElement, 'useApi.ts')).toBeVisible())
		await userEvent.click(canvas.getByRole('button', { name: 'Свернуть всё' }))
		await waitFor(() => expect(nodeLabel(canvasElement, 'useApi.ts')).not.toBeVisible())
		await expect(treeNode(canvasElement, 'src')).not.toHaveClass('base-tree__node--expanded')
	},
}
