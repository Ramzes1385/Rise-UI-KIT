import { expect } from 'storybook/test'
import type meta from '../BaseTree.stories'
import BaseTree from '../../ui/BaseTree.vue'
import { BaseEmpty } from '@components/BaseEmpty'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Empty: StoryObj<typeof meta> = {
	args: { items: [] },
	parameters: {
		docs: {
			description: {
				story: [
					'Пустой список: дерево ничего не выводит. Пустое состояние показывает страница — например, `BaseEmpty`',
					'вместо дерева, пока узлов нет.',
				].join('\n'),
			},
			source: {
				code: [
					'<BaseTree v-if="items.length" :items="items" />',
					'<BaseEmpty v-else variant="soft" icon="folder" title="Папка пуста" description="Загрузите первый файл" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTree, BaseEmpty },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: `
			<div class="story-narrow">
				<BaseTree v-if="props.items.length" v-bind="props" />
				<BaseEmpty v-else variant="soft" icon="folder" title="Папка пуста" description="Загрузите первый файл" />
			</div>
		`,
	}),
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByRole('heading', { name: 'Папка пуста' })).toBeVisible()
		await expect(canvasElement.querySelectorAll('.base-tree__header')).toHaveLength(0)
	},
}
