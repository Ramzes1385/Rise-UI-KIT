import { listTitles } from '../../shared'
import type meta from '../../BaseList.stories'
import BaseList from '../../../ui/BaseList.vue'
import { expect, waitFor } from 'storybook/test'
import type { ListStoryArgs } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import type { ListItem, ListMove } from '../../../types/BaseList.types'

const items: ListItem[] = [
	{ id: 'pinned', title: 'Закреплённая заметка', description: 'Всегда первая', icon: 'inbox' },
	{ id: 'draft', title: 'Черновик письма', icon: 'folder' },
	{ id: 'ideas', title: 'Идеи для выпуска', icon: 'folder' },
]

const canMove = (move: ListMove): boolean => move.item.id !== 'pinned' && move.to !== 0

const models = { notes: 'items' }

const template = `<div class="story-narrow"><BaseList v-bind="args" v-model:items="notes" :can-move="canMove" /></div>`

export const CanMove: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`can-move` запрещает место: закреплённую заметку нельзя сдвинуть, а на первое место нельзя поставить другую.',
					'Строка остаётся на месте, `update:items` и `move` не приходят, скринридер слышит «Строку … нельзя переместить сюда».',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseList', 'type ListMove'],
				models,
				script: `const canMove = (move: ListMove): boolean => move.item.id !== 'pinned' && move.to !== 0`,
			}),
		},
	},
	args: { items, selectionMode: 'none', isSortable: true, label: 'Заметки' },
	render: args => ({
		components: { BaseList },
		setup: useStorySetup(args, { models, data: { canMove } }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		await userEvent.tab()
		await userEvent.keyboard('{ArrowDown}')
		await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}')
		await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Строку «Черновик письма» нельзя переместить сюда'))
		await expect(listTitles(canvasElement)).toEqual(['Закреплённая заметка', 'Черновик письма', 'Идеи для выпуска'])
		await expect((args as ListStoryArgs).onMove).not.toHaveBeenCalled()
	},
}
