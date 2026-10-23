import { expect } from 'storybook/test'
import type meta from '../../BaseTree.stories'
import BaseTree from '../../../ui/BaseTree.vue'
import { BaseEmpty } from '@components/BaseEmpty'
import type { StoryObj } from '@storybook/vue3-vite'
import type { TreeNode } from '../../../types/BaseTree.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const items: TreeNode[] = []

const template = `
	<div class="story-narrow">
		<BaseTree v-if="items.length" v-bind="args" :items="items" />
		<BaseEmpty v-else variant="soft" icon="folder" title="Папка пуста" description="Загрузите первый файл" />
	</div>
`

export const Empty: StoryObj<typeof meta> = {
	args: { items },
	parameters: {
		docs: {
			description: {
				story: [
					'Пустой список: дерево ничего не выводит. Пустое состояние показывает страница — например, `BaseEmpty`',
					'вместо дерева, пока узлов нет.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseEmpty', 'BaseTree', 'type TreeNode'],
				script: `const items: TreeNode[] = ${literal(items)}`,
				omit: ['items'],
			}),
		},
	},
	render: args => ({
		components: { BaseTree, BaseEmpty },
		setup: useStorySetup(args, { data: { items: args.items }, slots: ['items'] }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByRole('heading', { name: 'Папка пуста' })).toBeVisible()
		await expect(canvasElement.querySelectorAll('.base-tree__header')).toHaveLength(0)
	},
}
